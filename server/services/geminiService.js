import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('[Gemini] AI client initialized successfully.');
  } catch (e) {
    console.warn('⚠️ Could not initialize GoogleGenAI:', e.message);
  }
} else {
  console.warn('[Gemini] ⚠️ No valid GEMINI_API_KEY found. AI features require a real API key.');
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ERROR CODES – caught by aiController to set correct HTTP status codes
// ─────────────────────────────────────────────────────────────────────────────
export class GeminiUnavailableError extends Error {
  constructor(msg = 'AI analysis is currently unavailable. Please try again later.') {
    super(msg);
    this.name = 'GeminiUnavailableError';
    this.code = 'AI_UNAVAILABLE';
  }
}

export class GeminiInvalidResponseError extends Error {
  constructor(msg = 'AI returned an unreadable response. Please try again.') {
    super(msg);
    this.name = 'GeminiInvalidResponseError';
    this.code = 'AI_INVALID_RESPONSE';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA VALIDATION
// Validates that every required field is present and has the correct type.
// Throws GeminiInvalidResponseError with a descriptive message if not.
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_TOP_KEYS = [
  'overall_score', 'ats_score', 'recruiter_readiness',
  'section_scores', 'strengths', 'weaknesses',
  'missing_keywords', 'missing_sections', 'suggestions',
  'recruiter_impression',
];

const REQUIRED_SECTION_KEYS = [
  'contact', 'summary', 'education', 'skills', 'projects',
  'experience', 'certifications', 'formatting', 'grammar',
];

function validateAnalysisSchema(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiInvalidResponseError('Gemini response is not a JSON object.');
  }

  // Check all top-level keys
  for (const key of REQUIRED_TOP_KEYS) {
    if (!(key in parsed)) {
      throw new GeminiInvalidResponseError(`Gemini response is missing required field: "${key}".`);
    }
  }

  // Numeric scores
  for (const key of ['overall_score', 'ats_score', 'recruiter_readiness']) {
    if (typeof parsed[key] !== 'number' || isNaN(parsed[key])) {
      throw new GeminiInvalidResponseError(`Field "${key}" must be a number, got: ${JSON.stringify(parsed[key])}`);
    }
  }

  // section_scores object
  const ss = parsed.section_scores;
  if (!ss || typeof ss !== 'object' || Array.isArray(ss)) {
    throw new GeminiInvalidResponseError('"section_scores" must be an object.');
  }
  for (const key of REQUIRED_SECTION_KEYS) {
    if (!(key in ss) || typeof ss[key] !== 'number' || isNaN(ss[key])) {
      throw new GeminiInvalidResponseError(`section_scores.${key} must be a number, got: ${JSON.stringify(ss[key])}`);
    }
  }

  // Array fields
  for (const key of ['strengths', 'weaknesses', 'missing_keywords', 'missing_sections', 'suggestions']) {
    if (!Array.isArray(parsed[key])) {
      throw new GeminiInvalidResponseError(`Field "${key}" must be an array, got: ${typeof parsed[key]}`);
    }
    if (parsed[key].length === 0) {
      console.warn(`[Gemini] Warning: "${key}" array is empty — this is allowed but unusual.`);
    }
  }

  // recruiter_impression must be a non-empty string
  if (typeof parsed.recruiter_impression !== 'string' || parsed.recruiter_impression.trim().length === 0) {
    throw new GeminiInvalidResponseError('"recruiter_impression" must be a non-empty string.');
  }

  return true; // valid
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Parse Gemini raw text → validated object
// ─────────────────────────────────────────────────────────────────────────────
function parseAndValidateGeminiResponse(raw) {
  const cleanJson = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im,    '')
    .replace(/\s*```$/im,    '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (jsonErr) {
    throw new GeminiInvalidResponseError(`Gemini response is not valid JSON: ${jsonErr.message}`);
  }

  validateAnalysisSchema(parsed); // throws GeminiInvalidResponseError if invalid

  // Add legacy compat fields (for old frontend code that may still reference them)
  parsed.overallScore    = parsed.overall_score;
  parsed.grammarScore    = parsed.section_scores.grammar;
  parsed.formatScore     = parsed.section_scores.formatting;
  parsed.keywordScore    = parsed.section_scores.skills;
  parsed.resumeStrengths = parsed.strengths;
  parsed.missingSkills   = parsed.missing_keywords;

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Call Gemini with the given prompt, return response.text
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI features are currently unavailable. The server is not configured with a Gemini API key. Please contact the administrator.'
    );
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });
  const text = response.text || '';
  if (!text.trim()) {
    throw new GeminiInvalidResponseError('Gemini returned an empty response.');
  }
  return text;
}

/**
 * 1. AI Resume Content Generator
 */
export const generateResumeContent = async ({ education, skills, projects, experience, achievements, careerGoal }) => {
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI content generation is currently unavailable. The server is not configured with a Gemini API key.'
    );
  }

  const prompt = `
You are an expert executive resume writer and career strategist.
Generate professional, ATS-optimized resume content for a candidate with the following background:
- Career Goal: ${careerGoal || 'Software Engineer'}
- Education: ${education || 'B.Tech CS'}
- Skills: ${skills || 'React, Node.js, JavaScript, SQL'}
- Projects: ${projects || 'CareerSync Web Application'}
- Experience: ${experience || 'Software Developer Intern'}
- Achievements: ${achievements || 'Hackathon Winner'}

Return a structured JSON object with these exact keys:
{
  "professionalSummary": "A compelling 3-4 sentence summary highlighting key technical strengths.",
  "careerObjective": "A focused career goal statement.",
  "skillDescriptions": ["Detailed skill category 1", "Detailed skill category 2", "Detailed skill category 3"],
  "projectDescriptions": ["Impactful bullet point for project 1 using action verbs", "Impactful bullet point for project 2"],
  "professionalExperienceWording": ["Action-oriented responsibility statement 1", "Measurable result statement 2"],
  "achievementStatements": ["Quantifiable achievement statement 1", "Recognition statement 2"]
}
Only output valid JSON. No markdown fences.
`;

  try {
    const rawText = await callGemini(prompt);
    const cleanJson = rawText.replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('[Gemini] Resume content generation error:', err.message);
    if (err instanceof GeminiUnavailableError || err instanceof GeminiInvalidResponseError) {
      throw err;
    }
    throw new GeminiUnavailableError('Failed to generate resume content via AI. Please try again.');
  }
};

/**
 * 2. AI Resume Analyzer – Production Version
 *
 * STRICT POLICY:
 *  - NEVER returns fake/estimated/fallback scores.
 *  - Throws GeminiUnavailableError  if Gemini is not configured.
 *  - Throws GeminiInvalidResponseError if response fails schema validation after 1 retry.
 *  - Caller (aiController) is responsible for mapping these to HTTP status codes.
 */
export const analyzeResumeText = async (resumeText) => {
  // ── Guard: Gemini must be initialized ────────────────────────────────────
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI analysis is currently unavailable. The server is not configured with a Gemini API key. Please contact the administrator.'
    );
  }

  const safeText = (resumeText || '').slice(0, 12000); // stay within token limit

  if (!safeText.trim()) {
    throw new Error('Resume text is empty. Please upload a valid resume.');
  }

  const prompt = `
You are acting simultaneously as:
1. A Senior Technical Recruiter at a top Indian tech company (TCS, Infosys, Wipro, Google India, Amazon India).
2. An ATS (Applicant Tracking System) expert who deeply understands keyword matching.
3. A Career Mentor who gives honest, actionable, personalized feedback.

Carefully read the following resume text and analyze it thoroughly:

"""
${safeText}
"""

CRITICAL INSTRUCTIONS:
- Produce a GENUINELY PERSONALIZED analysis of THIS SPECIFIC RESUME.
- Every score, strength, weakness, and suggestion MUST be grounded in what you actually read above.
- Do NOT produce generic feedback. Reference actual content from the resume.
- Be honest and differentiated — a weak resume must receive low scores (3-5), a strong one gets 8-9.
- NEVER give everyone similar scores. Scores must reflect the actual quality of this specific resume.

SCORING CRITERIA (score 1–10 per section):
- contact: Is name, email, phone, location present and clearly formatted? Include LinkedIn/GitHub bonus.
- summary: Is there a compelling professional summary/objective? Is it specific to a role?
- education: Is institution, degree, year, and CGPA/GPA clearly mentioned?
- skills: Are skills listed, relevant, organized (grouped by category), and industry-standard?
- projects: Are projects described with tech stack AND measurable impact/outcome?
- experience: Is work/internship experience present with company, role, duration, and contributions?
- certifications: Are any certifications or relevant online courses mentioned?
- formatting: Is the resume clean, scannable, single-page friendly, and ATS-friendly?
- grammar: Is writing clear, professional, uses active voice, and is error-free?

SCORE CALCULATIONS:
- overall_score = honest weighted average of ALL 9 section scores (one decimal, e.g. 6.4)
- ats_score = weighted focus on: contact(20%) + skills(30%) + formatting(30%) + education(20%)
- recruiter_readiness = weighted focus on: summary(25%) + projects(25%) + experience(30%) + grammar(20%)

Return ONLY a valid JSON object. No markdown fences. No explanations. No extra text. Start directly with {:
{
  "overall_score": <number with one decimal, e.g. 6.4>,
  "ats_score": <number with one decimal>,
  "recruiter_readiness": <number with one decimal>,
  "section_scores": {
    "contact": <integer 1-10>,
    "summary": <integer 1-10>,
    "education": <integer 1-10>,
    "skills": <integer 1-10>,
    "projects": <integer 1-10>,
    "experience": <integer 1-10>,
    "certifications": <integer 1-10>,
    "formatting": <integer 1-10>,
    "grammar": <integer 1-10>
  },
  "strengths": [
    "<specific strength referencing actual content from this resume>",
    "<another specific strength>",
    "<another specific strength>"
  ],
  "weaknesses": [
    "<specific weakness referencing actual content from this resume>",
    "<another specific weakness>"
  ],
  "missing_keywords": [
    "<important keyword absent from this resume given the apparent target role>",
    "<another missing keyword>"
  ],
  "missing_sections": [
    "<name of a section completely absent from this resume>"
  ],
  "suggestions": [
    "<specific, actionable suggestion #1 that references actual content in this resume>",
    "<specific, actionable suggestion #2>",
    "<specific, actionable suggestion #3>",
    "<specific, actionable suggestion #4>",
    "<specific, actionable suggestion #5>"
  ],
  "recruiter_impression": "<2-3 candid sentences written as a recruiter reviewing THIS resume. Mention specific details you observed. Use first-person language like 'I noticed' or 'As a recruiter, I would'.>"
}`;

  // ── Attempt 1 ─────────────────────────────────────────────────────────────
  let attempt1Error = null;
  try {
    console.log('[Gemini] Resume analysis attempt 1…');
    const raw = await callGemini(prompt);
    const result = parseAndValidateGeminiResponse(raw);
    console.log('[Gemini] Attempt 1 succeeded. Overall score:', result.overall_score);
    return result;
  } catch (err) {
    if (err instanceof GeminiUnavailableError) throw err; // re-throw immediately
    attempt1Error = err;
    console.warn('[Gemini] Attempt 1 failed:', err.message);
  }

  // ── Retry (Attempt 2) ─────────────────────────────────────────────────────
  try {
    console.log('[Gemini] Resume analysis attempt 2 (retry)…');
    const raw2 = await callGemini(prompt);
    const result2 = parseAndValidateGeminiResponse(raw2);
    console.log('[Gemini] Attempt 2 succeeded. Overall score:', result2.overall_score);
    return result2;
  } catch (err2) {
    if (err2 instanceof GeminiUnavailableError) throw err2;
    console.error('[Gemini] Both attempts failed.');
    console.error('[Gemini] Attempt 1 error:', attempt1Error?.message);
    console.error('[Gemini] Attempt 2 error:', err2.message);

    // If Gemini responded but with bad JSON, raise invalid response error
    if (err2 instanceof GeminiInvalidResponseError || attempt1Error instanceof GeminiInvalidResponseError) {
      throw new GeminiInvalidResponseError(
        'AI returned an invalid response after two attempts. Please try again.'
      );
    }

    // Otherwise it was a network/API error
    throw new GeminiUnavailableError(
      'AI analysis failed due to a network or API error. Please try again later.'
    );
  }
};

/**
 * 3. AI Mock Interview Evaluator (Legacy single-eval object)
 */
export const evaluateMockInterview = async ({ category, subject, userAnswers }) => {
  const answersFormatted = userAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer || '(No answer provided)'}`
  ).join('\n\n');

  const prompt = `
You are a strict but fair technical interviewer evaluating a candidate's mock interview responses.

Interview Type: ${category}
Subject: ${subject}

Candidate's Answers:
${answersFormatted}

Evaluate critically and honestly. If the answers are vague, incomplete, or incorrect, reflect that in a LOW score (40–60). 
If answers are strong and demonstrate depth, give a HIGH score (80–95).
Never give a default score. The score must strictly reflect the actual quality of the provided answers.

Return ONLY a valid JSON object with these exact keys:
{
  "score": <integer between 30 and 100, based strictly on answer quality>,
  "confidence": "<Low | Moderate | High | Very High>",
  "technicalAccuracy": "<percentage like 62% or 88%, reflecting factual correctness>",
  "communication": "<one sentence describing clarity and structure of responses>",
  "weakPoints": "<specific areas where answers lacked depth or accuracy>",
  "strongPoints": "<specific things the candidate explained well>",
  "feedback": "<personalised 2-3 sentence coaching feedback referencing the actual answers>"
}
Only output valid JSON. No markdown, no explanation.
`;

  try {
    const rawText = await callGemini(prompt);
    const cleanJson = rawText.replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('[Gemini] Mock interview evaluation error:', err.message);
    if (err instanceof GeminiUnavailableError || err instanceof GeminiInvalidResponseError) {
      throw err;
    }
    throw new GeminiUnavailableError('Failed to evaluate mock interview via AI. Please try again.');
  }
};

/**
 * 4. AI Skill Gap Analyzer – Production Version
 *
 * STRICT POLICY:
 *  - Accepts full resume TEXT (not just a skills list).
 *  - NEVER returns hardcoded or fake data.
 *  - Throws GeminiUnavailableError if Gemini is not configured.
 *  - Throws GeminiInvalidResponseError on schema validation failure.
 *  - Retries once on transient failure.
 *
 * Input: { resumeText: string, targetRole: string }
 * Output: Full skill gap report (see schema in prompt below)
 */
export const analyzeSkillGapFromResume = async ({ resumeText, targetRole }) => {
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI skill gap analysis is currently unavailable. The server is not configured with a Gemini API key.'
    );
  }

  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Resume text is too short or empty. Please upload a valid resume.');
  }

  const prompt = `
You are a Senior Career Counselor and Technical Recruiter at a top-tier Indian IT company.

Analyze the following resume CAREFULLY and compare it against the target role: "${targetRole}".

Resume:
"""
${resumeText.slice(0, 8000)}
"""

Target Role: ${targetRole}

STRICT INSTRUCTIONS:
1. Your analysis must be completely personalized to THIS specific resume.
2. Different resumes must produce DIFFERENT reports.
3. Different target roles must produce DIFFERENT reports.
4. NEVER return generic recommendations. Reference specific content from the resume.
5. All percentage values must be integers between 0 and 100.
6. The match_percentage should honestly reflect how close this candidate is to the target role.
7. interview_readiness_stars must be between 1 and 5 (integer).
8. skill_category_scores: each category score must be an integer 0-100.
9. priority_learning_plan: each item must have priority ("HIGH", "MEDIUM", or "LOW"), topic, and reason.
10. recommended_projects: list 3-5 projects in increasing difficulty. Each must have name and reason.

Return ONLY a valid JSON object. No markdown. No explanation. Start directly with {:
{
  "match_percentage": <integer 0-100>,
  "interview_readiness_stars": <integer 1-5>,
  "interview_readiness_label": "<'Not Ready' | 'Needs Improvement' | 'Almost Ready' | 'Ready' | 'Highly Ready'>",
  "estimated_time_to_job_ready": "<e.g. '2-3 Months' or '4-6 Months', assuming 2-3 hours/day>",
  "current_skills": ["<skill from resume 1>", "<skill 2>", "<skill 3>"],
  "missing_skills": ["<critical missing skill 1>", "<missing skill 2>"],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_to_improve": ["<area 1>", "<area 2>", "<area 3>"],
  "skill_category_scores": {
    "Programming": <integer 0-100>,
    "Web Development": <integer 0-100>,
    "Database": <integer 0-100>,
    "Problem Solving": <integer 0-100>,
    "System Design": <integer 0-100>,
    "Communication": <integer 0-100>
  },
  "priority_learning_plan": [
    { "priority": "HIGH", "topic": "<topic>", "reason": "<specific reason based on this candidate>" },
    { "priority": "HIGH", "topic": "<topic>", "reason": "<reason>" },
    { "priority": "MEDIUM", "topic": "<topic>", "reason": "<reason>" },
    { "priority": "MEDIUM", "topic": "<topic>", "reason": "<reason>" },
    { "priority": "LOW", "topic": "<topic>", "reason": "<reason>" }
  ],
  "recommended_projects": [
    { "name": "<Project Name>", "reason": "<why this project helps this specific candidate>" },
    { "name": "<Project Name>", "reason": "<reason>" },
    { "name": "<Project Name>", "reason": "<reason>" },
    { "name": "<Project Name>", "reason": "<reason>" }
  ],
  "career_mentor_advice": "<2-4 sentences of personalized, actionable career advice referencing specific resume content>"
}`;

  // Schema validator
  function validateSchema(parsed) {
    if (!parsed || typeof parsed !== 'object') throw new GeminiInvalidResponseError('Skill gap response is not a JSON object.');
    if (typeof parsed.match_percentage !== 'number') throw new GeminiInvalidResponseError('"match_percentage" must be a number.');
    if (typeof parsed.interview_readiness_stars !== 'number') throw new GeminiInvalidResponseError('"interview_readiness_stars" must be a number.');
    if (typeof parsed.interview_readiness_label !== 'string') throw new GeminiInvalidResponseError('"interview_readiness_label" must be a string.');
    if (typeof parsed.estimated_time_to_job_ready !== 'string') throw new GeminiInvalidResponseError('"estimated_time_to_job_ready" must be a string.');
    const arrays = ['current_skills','missing_skills','strengths','areas_to_improve','priority_learning_plan','recommended_projects'];
    for (const f of arrays) {
      if (!Array.isArray(parsed[f])) throw new GeminiInvalidResponseError(`"${f}" must be an array.`);
    }
    if (!parsed.skill_category_scores || typeof parsed.skill_category_scores !== 'object') {
      throw new GeminiInvalidResponseError('"skill_category_scores" must be an object.');
    }
    if (typeof parsed.career_mentor_advice !== 'string' || !parsed.career_mentor_advice.trim()) {
      throw new GeminiInvalidResponseError('"career_mentor_advice" must be a non-empty string.');
    }
    for (const item of parsed.priority_learning_plan) {
      if (!item.priority || !item.topic || !item.reason) throw new GeminiInvalidResponseError('Each learning plan item needs priority, topic, and reason.');
    }
    for (const proj of parsed.recommended_projects) {
      if (!proj.name || !proj.reason) throw new GeminiInvalidResponseError('Each project needs name and reason.');
    }
    return true;
  }

  // Attempt 1
  let attempt1Error = null;
  try {
    console.log(`[Gemini Skill Gap] Analyzing resume for role: ${targetRole}…`);
    const raw = await callGemini(prompt);
    const clean = raw.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed = JSON.parse(clean);
    validateSchema(parsed);
    console.log(`[Gemini Skill Gap] Analysis complete. Match: ${parsed.match_percentage}%`);
    return parsed;
  } catch (err) {
    if (err instanceof GeminiUnavailableError) throw err;
    attempt1Error = err;
    console.warn('[Gemini Skill Gap] Attempt 1 failed:', err.message);
  }

  // Retry (Attempt 2)
  try {
    console.log('[Gemini Skill Gap] Retrying analysis…');
    const raw2 = await callGemini(prompt);
    const clean2 = raw2.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed2 = JSON.parse(clean2);
    validateSchema(parsed2);
    console.log(`[Gemini Skill Gap] Analysis complete on retry. Match: ${parsed2.match_percentage}%`);
    return parsed2;
  } catch (err2) {
    if (err2 instanceof GeminiUnavailableError) throw err2;
    console.error('[Gemini Skill Gap] Both attempts failed.');
    if (err2 instanceof GeminiInvalidResponseError || attempt1Error instanceof GeminiInvalidResponseError) {
      throw new GeminiInvalidResponseError('AI returned an invalid skill gap report after two attempts. Please try again.');
    }
    throw new GeminiUnavailableError('Skill gap analysis failed due to a network error. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. AI Mock Interview – Question Generator
//
// STRICT POLICY: NEVER returns hardcoded or fabricated questions.
// Throws GeminiUnavailableError if Gemini is not configured.
//
// mode: 'resume' | 'topic'
// For 'resume': resumeText must be provided (extracted from uploaded PDF).
// For 'topic':  topic and difficulty must be provided.
// Always generates exactly 5 questions.
// ─────────────────────────────────────────────────────────────────────────────
export const generateInterviewQuestions = async ({ mode, topic, difficulty, resumeText }) => {
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI interview is currently unavailable. The server is not configured with a Gemini API key.'
    );
  }

  let prompt;

  if (mode === 'resume') {
    if (!resumeText || resumeText.trim().length < 30) {
      throw new Error('Resume text is too short or empty. Please upload a valid resume.');
    }
    prompt = `
You are a Senior Technical Interviewer at a top Indian IT company (Google India, Amazon India, TCS, Infosys).

Read the following resume carefully and generate EXACTLY 5 interview questions tailored specifically to THIS candidate.

Resume:
"""
${resumeText.slice(0, 8000)}
"""

Difficulty Level: ${difficulty || 'Medium'}

STRICT INSTRUCTIONS:
- Every question MUST reference specific content from this resume (skills, projects, technologies, education, experience).
- Do NOT generate generic questions. Each question must be personalised to what you read.
- Difficulty "${difficulty}":
  * Easy: conceptual understanding, "explain X that you used in your project"
  * Medium: application and problem-solving, "how would you improve X in your project"
  * Hard: deep system design, optimization, edge cases, trade-offs

Return ONLY a valid JSON array of exactly 5 strings. No markdown. No extra text. Start directly with [:
["Question 1 text here?", "Question 2 text here?", "Question 3 text here?", "Question 4 text here?", "Question 5 text here?"]
`;
  } else {
    // Topic-based interview
    prompt = `
You are a Senior Technical Interviewer conducting a ${difficulty || 'Medium'} difficulty interview on the topic: "${topic}".

Generate EXACTLY 5 interview questions for a computer science student / fresher.

Difficulty Guidelines for "${difficulty}":
- Easy: Define concepts, explain terminology, basic syntax questions
- Medium: Application, problem-solving, compare/contrast, "how would you implement X"
- Hard: Deep internals, system design, optimization, edge cases, trade-offs, complex algorithms

STRICT INSTRUCTIONS:
- All 5 questions must be about "${topic}" specifically.
- Questions should be varied — do not repeat the same concept.
- Questions should be answerable in 2-5 minutes verbally by a student.
- Do NOT include answer hints, sample answers, or explanations.

Return ONLY a valid JSON array of exactly 5 strings. No markdown. No extra text. Start directly with [:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
`;
  }

  // Attempt 1
  let attempt1Error = null;
  try {
    console.log(`[Gemini Interview] Generating questions (mode=${mode}, difficulty=${difficulty})…`);
    const raw = await callGemini(prompt);
    const clean = raw.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed) || parsed.length !== 5) {
      throw new GeminiInvalidResponseError(`Expected array of 5 questions, got ${Array.isArray(parsed) ? parsed.length : typeof parsed}`);
    }
    if (!parsed.every(q => typeof q === 'string' && q.trim().length > 5)) {
      throw new GeminiInvalidResponseError('One or more questions are empty or too short.');
    }
    console.log('[Gemini Interview] Questions generated successfully.');
    return parsed;
  } catch (err) {
    if (err instanceof GeminiUnavailableError) throw err;
    attempt1Error = err;
    console.warn('[Gemini Interview] Question generation attempt 1 failed:', err.message);
  }

  // Retry (Attempt 2)
  try {
    console.log('[Gemini Interview] Retrying question generation…');
    const raw2 = await callGemini(prompt);
    const clean2 = raw2.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed2 = JSON.parse(clean2);
    if (!Array.isArray(parsed2) || parsed2.length !== 5) {
      throw new GeminiInvalidResponseError('Retry also returned wrong format.');
    }
    console.log('[Gemini Interview] Questions generated on retry.');
    return parsed2;
  } catch (err2) {
    if (err2 instanceof GeminiUnavailableError) throw err2;
    console.error('[Gemini Interview] Both question generation attempts failed.');
    console.error('Attempt 1:', attempt1Error?.message);
    console.error('Attempt 2:', err2.message);
    if (err2 instanceof GeminiInvalidResponseError || attempt1Error instanceof GeminiInvalidResponseError) {
      throw new GeminiInvalidResponseError('AI returned an invalid question set after two attempts. Please try again.');
    }
    throw new GeminiUnavailableError('AI interview question generation failed due to a network error. Please try again.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. AI Mock Interview – Answer Evaluator
//
// STRICT POLICY:
//  - NEVER returns fake scores.
//  - NEVER generates estimated/fallback evaluations.
//  - Throws GeminiUnavailableError if Gemini is not configured.
//  - Throws GeminiInvalidResponseError if response fails schema validation.
//
// Input: { mode, topic, difficulty, questionsAndAnswers }
// questionsAndAnswers: Array of { question: string, answer: string }
// Output: Full interview report with per-question breakdown + overall scores
// ─────────────────────────────────────────────────────────────────────────────
export const evaluateInterviewAnswers = async ({ mode, topic, difficulty, questionsAndAnswers }) => {
  if (!ai) {
    throw new GeminiUnavailableError(
      'AI evaluation is currently unavailable. The server is not configured with a Gemini API key.'
    );
  }

  const formatted = questionsAndAnswers.map((qa, i) =>
    `Question ${i + 1}: ${qa.question}\nStudent's Answer: ${qa.answer?.trim() || '(No answer provided — student left this blank)'}`
  ).join('\n\n');

  const prompt = `
You are a Senior Technical Interviewer and Hiring Manager evaluating a mock interview.

Interview Context:
- Mode: ${mode === 'resume' ? 'Resume-Based Interview' : `Topic-Based Interview: ${topic}`}
- Difficulty: ${difficulty || 'Medium'}

Student's Interview Transcript:
"""
${formatted}
"""

CRITICAL EVALUATION INSTRUCTIONS:
1. Evaluate EVERY answer honestly based on what was actually written.
2. If an answer is blank or "(No answer provided)", give a score of 0–5 out of 20 and explain the candidate did not attempt the question.
3. If an answer is vague or incorrect, give an appropriately LOW score (6–12 out of 20).
4. If an answer is strong, give a HIGH score (16–20 out of 20).
5. Scores must HONESTLY reflect the quality of the answer — never inflate.
6. The overall_score (out of 100) should be the sum of all 5 question scores.
7. All sub-scores (communication, technical, confidence, problem_solving, grammar, professionalism) must be out of 10.

Return ONLY a valid JSON object. No markdown fences. No explanations. Start directly with {:
{
  "overall_score": <integer 0-100>,
  "star_rating": <integer 1-5, based on overall_score: 0-20=1, 21-40=2, 41-60=3, 61-80=4, 81-100=5>,
  "communication_score": <integer 0-10>,
  "technical_score": <integer 0-10>,
  "confidence_score": <integer 0-10>,
  "problem_solving_score": <integer 0-10>,
  "grammar_score": <integer 0-10>,
  "professionalism_score": <integer 0-10>,
  "question_results": [
    {
      "question": "<the exact question text>",
      "student_answer": "<the student's answer, or 'No answer provided'>",
      "ideal_answer": "<a concise model answer a strong candidate would give>",
      "score": <integer 0-20>,
      "missing_keywords": ["<keyword 1>", "<keyword 2>"],
      "strengths": ["<strength 1>", "<strength 2>"],
      "areas_to_improve": ["<area 1>", "<area 2>"]
    }
  ],
  "overall_strengths": ["<strength observed across the whole interview>", "<strength 2>"],
  "areas_to_improve": ["<major area to improve>", "<area 2>", "<area 3>"],
  "topics_to_study": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "interviewer_note": "<2-3 candid recruiter-style sentences summarising the candidate's performance. Be honest. Mention specific answers. Use first-person like 'I noticed' or 'As an interviewer, I observed'.>"
}`;

  // Validate the evaluation response schema
  function validateEvalSchema(parsed) {
    if (!parsed || typeof parsed !== 'object') throw new GeminiInvalidResponseError('Evaluation is not a JSON object.');
    const numFields = ['overall_score','star_rating','communication_score','technical_score','confidence_score','problem_solving_score','grammar_score','professionalism_score'];
    for (const f of numFields) {
      if (typeof parsed[f] !== 'number') throw new GeminiInvalidResponseError(`Field "${f}" must be a number.`);
    }
    if (!Array.isArray(parsed.question_results) || parsed.question_results.length !== 5) {
      throw new GeminiInvalidResponseError(`question_results must be an array of 5 items, got ${Array.isArray(parsed.question_results) ? parsed.question_results.length : 'non-array'}.`);
    }
    for (let i = 0; i < parsed.question_results.length; i++) {
      const qr = parsed.question_results[i];
      if (!qr.question || !qr.ideal_answer) throw new GeminiInvalidResponseError(`question_results[${i}] missing required fields.`);
      if (typeof qr.score !== 'number') throw new GeminiInvalidResponseError(`question_results[${i}].score must be a number.`);
      if (!Array.isArray(qr.missing_keywords)) throw new GeminiInvalidResponseError(`question_results[${i}].missing_keywords must be an array.`);
      if (!Array.isArray(qr.strengths)) throw new GeminiInvalidResponseError(`question_results[${i}].strengths must be an array.`);
      if (!Array.isArray(qr.areas_to_improve)) throw new GeminiInvalidResponseError(`question_results[${i}].areas_to_improve must be an array.`);
    }
    const arrFields = ['overall_strengths','areas_to_improve','topics_to_study'];
    for (const f of arrFields) {
      if (!Array.isArray(parsed[f])) throw new GeminiInvalidResponseError(`Field "${f}" must be an array.`);
    }
    if (typeof parsed.interviewer_note !== 'string' || !parsed.interviewer_note.trim()) {
      throw new GeminiInvalidResponseError('"interviewer_note" must be a non-empty string.');
    }
    return true;
  }

  // Attempt 1
  let attempt1Error = null;
  try {
    console.log('[Gemini Interview] Evaluating answers (attempt 1)…');
    const raw = await callGemini(prompt);
    const clean = raw.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed = JSON.parse(clean);
    validateEvalSchema(parsed);
    console.log('[Gemini Interview] Evaluation complete. Overall score:', parsed.overall_score);
    return parsed;
  } catch (err) {
    if (err instanceof GeminiUnavailableError) throw err;
    attempt1Error = err;
    console.warn('[Gemini Interview] Evaluation attempt 1 failed:', err.message);
  }

  // Retry (Attempt 2)
  try {
    console.log('[Gemini Interview] Retrying evaluation…');
    const raw2 = await callGemini(prompt);
    const clean2 = raw2.replace(/^```json\s*/im,'').replace(/^```\s*/im,'').replace(/\s*```$/im,'').trim();
    const parsed2 = JSON.parse(clean2);
    validateEvalSchema(parsed2);
    console.log('[Gemini Interview] Evaluation complete on retry. Overall score:', parsed2.overall_score);
    return parsed2;
  } catch (err2) {
    if (err2 instanceof GeminiUnavailableError) throw err2;
    console.error('[Gemini Interview] Both evaluation attempts failed.');
    if (err2 instanceof GeminiInvalidResponseError || attempt1Error instanceof GeminiInvalidResponseError) {
      throw new GeminiInvalidResponseError('AI returned an invalid evaluation after two attempts. Please try again.');
    }
    throw new GeminiUnavailableError('AI interview evaluation failed due to a network error. Please try again.');
  }
};

