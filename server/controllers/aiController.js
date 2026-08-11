import {
  generateResumeContent,
  analyzeResumeText,
  analyzeSkillGapFromResume,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  GeminiUnavailableError,
  GeminiInvalidResponseError,
} from '../services/geminiService.js';

import { extractTextFromPDF } from '../services/pdfExtractService.js';
import { query, isConnected, memoryStore } from '../config/db.js';

/**
 * 1. AI Resume Content Generator
 */
export const handleGenerateResume = async (req, res, next) => {
  try {
    const { education, skills, projects, experience, achievements, careerGoal } = req.body;
    const generatedData = await generateResumeContent({ education, skills, projects, experience, achievements, careerGoal });
    return res.json({ success: true, data: generatedData });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. AI Resume Analyzer – Production Version
 *
 * Flow: Validate input → Extract PDF text → Send to Gemini → Validate schema → Return report
 *
 * Error mapping:
 *   400 – bad request (no file/text, wrong file type, file too large)
 *   422 – unprocessable PDF (corrupt, image-based, empty)
 *   503 – Gemini unavailable (no API key, network error, timeout)
 *   502 – Gemini returned invalid/malformed JSON after 2 attempts
 *   500 – unexpected server error
 */
export const handleAnalyzeResume = async (req, res, next) => {
  try {
    const student_id = req.user ? req.user.id : 1;
    let resumeText = (req.body.resumeText || '').trim();
    let parsedMeta = null;

    // ── Path A: PDF upload ─────────────────────────────────────────────────
    if (req.file) {
      // Validate MIME type
      const mime = req.file.mimetype || '';
      if (!mime.includes('pdf') && !req.file.originalname?.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          error: 'Only PDF files are accepted. Please upload a PDF resume.',
        });
      }

      // Validate file size (5 MB hard cap)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'File exceeds the 5 MB limit. Please upload a smaller PDF.',
        });
      }

      // Extract text from PDF
      try {
        const extracted = await extractTextFromPDF(req.file.path);
        resumeText = extracted.text;
        parsedMeta = {
          wordCount:        extracted.wordCount,
          detectedSections: extracted.detectedSections,
          preview:          extracted.preview,
        };
      } catch (extractErr) {
        console.error('[Resume Analyzer] PDF extraction failed:', extractErr.message);
        return res.status(422).json({
          success: false,
          error: extractErr.message || 'Unable to read resume PDF. Please upload a valid text-based PDF.',
        });
      }
    }

    // ── Path B: must have text by now ──────────────────────────────────────
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF or paste your resume text before analysing.',
      });
    }

    // ── Run Gemini analysis ────────────────────────────────────────────────
    // analyzeResumeText throws GeminiUnavailableError or GeminiInvalidResponseError
    // on failure — it NEVER returns fake scores.
    let analysisResult;
    try {
      analysisResult = await analyzeResumeText(resumeText);
    } catch (aiErr) {
      console.error('[Resume Analyzer] AI analysis error:', aiErr.name, aiErr.message);

      if (aiErr instanceof GeminiUnavailableError) {
        return res.status(503).json({
          success: false,
          error: aiErr.message,
          code: 'AI_UNAVAILABLE',
        });
      }

      if (aiErr instanceof GeminiInvalidResponseError) {
        return res.status(502).json({
          success: false,
          error: aiErr.message,
          code: 'AI_INVALID_RESPONSE',
        });
      }

      // Unknown AI error
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during AI analysis. Please try again.',
        code: 'AI_ERROR',
      });
    }

    // ── Persist to DB (non-blocking — DB errors never break the response) ──
    try {
      if (isConnected && req.user) {
        await query(
          `INSERT INTO resume_analysis (student_id, grammar_score, format_score, keyword_score, overall_score, suggestions, missing_skills)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            student_id,
            analysisResult.section_scores.grammar,
            analysisResult.section_scores.formatting,
            analysisResult.section_scores.skills,
            analysisResult.overall_score,
            JSON.stringify(analysisResult.suggestions),
            JSON.stringify(analysisResult.missing_keywords),
          ]
        );
      } else if (req.user) {
        memoryStore.resume_analysis.push({
          analysis_id:   memoryStore.resume_analysis.length + 1,
          student_id,
          resume_id:     1,
          grammar_score: analysisResult.section_scores.grammar,
          format_score:  analysisResult.section_scores.formatting,
          keyword_score: analysisResult.section_scores.skills,
          overall_score: analysisResult.overall_score,
          suggestions:   analysisResult.suggestions,
          missing_skills: analysisResult.missing_keywords,
          created_at:    new Date(),
        });
      }
    } catch (dbErr) {
      console.warn('[Resume Analyzer] DB save skipped:', dbErr.message);
    }

    // ── Return validated analysis + optional parsed metadata ───────────────
    return res.status(200).json({
      success: true,
      analysis: analysisResult,
      extractedText: resumeText.slice(0, 3000),
      parsedMeta,
    });

  } catch (error) {
    console.error('[Resume Analyzer] Unhandled error:', error.message);
    next(error);
  }
};




/**
 * 3. Start AI Mock Interview – Question Generation
 *
 * mode: 'resume' | 'topic'
 * For 'resume': req.file must contain the uploaded PDF resume
 * For 'topic':  req.body.topic and req.body.difficulty must be provided
 *
 * STRICT POLICY: NEVER returns hardcoded questions. All questions come from Gemini.
 */
export const handleStartMockInterview = async (req, res, next) => {
  try {
    const { mode, topic, difficulty } = req.body;

    // ── Validate mode ────────────────────────────────────────────────────────
    if (!mode || !['resume', 'topic'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid interview mode. Must be "resume" or "topic".',
      });
    }

    if (mode === 'topic' && !topic) {
      return res.status(400).json({
        success: false,
        error: 'A topic must be selected for topic-based interviews.',
      });
    }

    // ── For resume mode: extract PDF text ────────────────────────────────────
    let resumeText = '';
    if (mode === 'resume') {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload a PDF resume to start a resume-based interview.',
        });
      }
      try {
        const { extractTextFromPDF } = await import('../services/pdfExtractService.js');
        const extracted = await extractTextFromPDF(req.file.path);
        resumeText = extracted.text;
      } catch (extractErr) {
        return res.status(422).json({
          success: false,
          error: extractErr.message || 'Unable to read resume PDF. Please upload a valid text-based PDF.',
        });
      }
    }

    // ── Generate questions via Gemini ─────────────────────────────────────────
    let questions;
    try {
      questions = await generateInterviewQuestions({
        mode,
        topic: topic || null,
        difficulty: difficulty || 'Medium',
        resumeText: resumeText || null,
      });
    } catch (aiErr) {
      console.error('[Interview Start] AI error:', aiErr.name, aiErr.message);
      if (aiErr instanceof GeminiUnavailableError) {
        return res.status(503).json({ success: false, error: aiErr.message, code: 'AI_UNAVAILABLE' });
      }
      if (aiErr instanceof GeminiInvalidResponseError) {
        return res.status(502).json({ success: false, error: aiErr.message, code: 'AI_INVALID_RESPONSE' });
      }
      return res.status(500).json({ success: false, error: 'Unable to generate interview questions. Please try again.', code: 'AI_ERROR' });
    }

    return res.status(200).json({
      success: true,
      interview: { mode, topic: topic || null, difficulty: difficulty || 'Medium', questions },
    });
  } catch (error) {
    console.error('[Interview Start] Unhandled error:', error.message);
    next(error);
  }
};

/**
 * 4. Evaluate AI Mock Interview Answers – Production Version
 *
 * STRICT POLICY: NEVER returns fake scores.
 * All evaluation comes from Gemini. Throws typed errors on failure.
 */
export const handleEvaluateMockInterview = async (req, res, next) => {
  try {
    const student_id = req.user ? req.user.id : 1;
    const { mode, topic, difficulty, questionsAndAnswers } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length !== 5) {
      return res.status(400).json({
        success: false,
        error: 'Exactly 5 questions and answers are required for evaluation.',
      });
    }
    for (let i = 0; i < questionsAndAnswers.length; i++) {
      if (!questionsAndAnswers[i].question) {
        return res.status(400).json({
          success: false,
          error: `Question ${i + 1} is missing the question text.`,
        });
      }
    }

    // ── Call Gemini evaluator ────────────────────────────────────────────────
    let evaluation;
    try {
      evaluation = await evaluateInterviewAnswers({
        mode: mode || 'topic',
        topic: topic || 'General',
        difficulty: difficulty || 'Medium',
        questionsAndAnswers,
      });
    } catch (aiErr) {
      console.error('[Interview Evaluate] AI error:', aiErr.name, aiErr.message);
      if (aiErr instanceof GeminiUnavailableError) {
        return res.status(503).json({ success: false, error: aiErr.message, code: 'AI_UNAVAILABLE' });
      }
      if (aiErr instanceof GeminiInvalidResponseError) {
        return res.status(502).json({ success: false, error: aiErr.message, code: 'AI_INVALID_RESPONSE' });
      }
      return res.status(500).json({ success: false, error: 'Unable to evaluate the interview. Please try again.', code: 'AI_ERROR' });
    }

    // ── Persist to DB (non-blocking) ─────────────────────────────────────────
    try {
      if (isConnected && req.user) {
        await query(
          `INSERT INTO mock_interviews (student_id, category, subject, score, feedback, confidence, technical_accuracy, communication, weak_points, strong_points)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            student_id,
            mode || 'topic',
            topic || 'General',
            evaluation.overall_score,
            evaluation.interviewer_note,
            String(evaluation.confidence_score),
            `${evaluation.technical_score}/10`,
            `${evaluation.communication_score}/10`,
            JSON.stringify(evaluation.areas_to_improve),
            JSON.stringify(evaluation.overall_strengths),
          ]
        );
      } else if (req.user) {
        memoryStore.mock_interviews.push({
          interview_id:       memoryStore.mock_interviews.length + 1,
          student_id,
          category:           mode || 'topic',
          subject:            topic || 'General',
          score:              evaluation.overall_score,
          feedback:           evaluation.interviewer_note,
          confidence:         String(evaluation.confidence_score),
          technical_accuracy: `${evaluation.technical_score}/10`,
          communication:      `${evaluation.communication_score}/10`,
          weak_points:        JSON.stringify(evaluation.areas_to_improve),
          strong_points:      JSON.stringify(evaluation.overall_strengths),
          created_at:         new Date(),
        });
      }
    } catch (dbErr) {
      console.warn('[Interview Evaluate] DB save skipped:', dbErr.message);
    }

    return res.status(200).json({ success: true, evaluation });
  } catch (error) {
    console.error('[Interview Evaluate] Unhandled error:', error.message);
    next(error);
  }
};

/**
 * 5. AI Skill Gap Analysis – Production Version
 *
 * Flow: Validate PDF upload → Extract text → Call analyzeSkillGapFromResume → Persist → Return
 *
 * STRICT POLICY: NEVER returns fake data. All analysis from Gemini.
 */
export const handleSkillGapAnalysis = async (req, res, next) => {
  try {
    const student_id = req.user ? req.user.id : 1;
    const { targetRole } = req.body;

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please select a target role before analyzing.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF resume to analyze the skill gap.',
      });
    }

    // ── Extract resume text from PDF ───────────────────────────────────────
    let resumeText;
    try {
      const { extractTextFromPDF } = await import('../services/pdfExtractService.js');
      const extracted = await extractTextFromPDF(req.file.path);
      resumeText = extracted.text;
    } catch (extractErr) {
      console.error('[Skill Gap] PDF extraction failed:', extractErr.message);
      return res.status(422).json({
        success: false,
        error: extractErr.message || 'Unable to read resume PDF. Please upload a valid text-based PDF.',
      });
    }

    // ── Call Gemini Skill Gap Analysis ─────────────────────────────────────
    let gapResult;
    try {
      gapResult = await analyzeSkillGapFromResume({
        resumeText,
        targetRole: targetRole.trim(),
      });
    } catch (aiErr) {
      console.error('[Skill Gap] AI error:', aiErr.name, aiErr.message);
      if (aiErr instanceof GeminiUnavailableError) {
        return res.status(503).json({ success: false, error: aiErr.message, code: 'AI_UNAVAILABLE' });
      }
      if (aiErr instanceof GeminiInvalidResponseError) {
        return res.status(502).json({ success: false, error: aiErr.message, code: 'AI_INVALID_RESPONSE' });
      }
      return res.status(500).json({
        success: false,
        error: 'Unable to analyze your resume. Please try again.',
        code: 'AI_ERROR',
      });
    }

    // ── Persist to DB (non-blocking) ───────────────────────────────────────
    try {
      if (isConnected && req.user) {
        await query(
          `INSERT INTO skill_gap (student_id, desired_role, missing_skills, roadmap, recommended_projects)
           VALUES (?, ?, ?, ?, ?)`,
          [
            student_id,
            targetRole.trim(),
            JSON.stringify(gapResult.missing_skills || []),
            JSON.stringify(gapResult.priority_learning_plan || []),
            JSON.stringify(gapResult.recommended_projects || []),
          ]
        );
      } else if (req.user) {
        memoryStore.skill_gap.push({
          gap_id:              memoryStore.skill_gap.length + 1,
          student_id,
          desired_role:        targetRole.trim(),
          match_percentage:    gapResult.match_percentage,
          missing_skills:      JSON.stringify(gapResult.missing_skills || []),
          roadmap:             JSON.stringify(gapResult.priority_learning_plan || []),
          recommended_projects:JSON.stringify(gapResult.recommended_projects || []),
          created_at:          new Date(),
        });
      }
    } catch (dbErr) {
      console.warn('[Skill Gap] DB save skipped:', dbErr.message);
    }

    return res.status(200).json({ success: true, result: gapResult, targetRole: targetRole.trim() });
  } catch (error) {
    console.error('[Skill Gap] Unhandled error:', error.message);
    next(error);
  }
};

/**
 * 5b. Get Skill Gap Analysis History for the logged-in student
 */
export const handleGetSkillGapHistory = async (req, res, next) => {
  try {
    const student_id = req.user ? req.user.id : null;
    if (!student_id) return res.status(401).json({ success: false, error: 'Authentication required.' });

    let history = [];
    if (isConnected) {
      const rows = await query(
        `SELECT gap_id, desired_role, missing_skills, created_at FROM skill_gap
         WHERE student_id = ? ORDER BY created_at DESC LIMIT 10`,
        [student_id]
      );
      history = rows.map(r => ({
        id:           r.gap_id,
        targetRole:   r.desired_role,
        createdAt:    r.created_at,
      }));
    } else {
      history = memoryStore.skill_gap
        .filter(r => r.student_id === student_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(r => ({
          id:          r.gap_id,
          targetRole:  r.desired_role,
          matchPct:    r.match_percentage || null,
          createdAt:   r.created_at,
        }));
    }

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('[Skill Gap History] Error:', error.message);
    next(error);
  }
};
