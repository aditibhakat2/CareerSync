import path from 'path';
import { query, isConnected, memoryStore } from '../config/db.js';

/**
 * 1. Get All Jobs with Search, Filters & Sorting
 */
export const getJobs = async (req, res, next) => {
  try {
    const { search, location, company, skills, experience, job_type, remote_option, sort } = req.query;

    if (isConnected) {
      let sql = `
        SELECT j.*, c.company_name, c.company_logo, c.website
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.status = 'Active'
      `;
      const params = [];

      if (search) {
        sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.required_skills LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      if (location) { sql += ` AND j.location LIKE ?`; params.push(`%${location}%`); }
      if (company)  { sql += ` AND c.company_name LIKE ?`; params.push(`%${company}%`); }
      if (skills)   { sql += ` AND j.required_skills LIKE ?`; params.push(`%${skills}%`); }
      if (experience) { sql += ` AND j.experience LIKE ?`; params.push(`%${experience}%`); }
      if (job_type)   { sql += ` AND j.job_type = ?`; params.push(job_type); }
      if (remote_option) { sql += ` AND j.remote_option = ?`; params.push(remote_option); }

      if (sort === 'salary') {
        sql += ` ORDER BY j.salary DESC`;
      } else if (sort === 'deadline') {
        sql += ` ORDER BY j.deadline ASC`;
      } else {
        sql += ` ORDER BY j.created_at DESC`;
      }

      const jobs = await query(sql, params);
      return res.json({ success: true, count: jobs.length, jobs });
    } else {
      // Memory Store Fallback
      let result = memoryStore.jobs.map(j => {
        const comp = memoryStore.companies.find(c => c.company_id === j.company_id) || {};
        return { ...j, company_name: comp.company_name, company_logo: comp.company_logo, website: comp.website };
      }).filter(j => j.status === 'Active');

      if (search) {
        const term = search.toLowerCase();
        result = result.filter(j =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          j.required_skills.toLowerCase().includes(term)
        );
      }
      if (location) result = result.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
      if (company)  result = result.filter(j => j.company_name.toLowerCase().includes(company.toLowerCase()));
      if (skills)   result = result.filter(j => j.required_skills.toLowerCase().includes(skills.toLowerCase()));
      if (experience) result = result.filter(j => j.experience.toLowerCase().includes(experience.toLowerCase()));
      if (job_type)   result = result.filter(j => j.job_type === job_type);
      if (remote_option) result = result.filter(j => j.remote_option === remote_option);

      return res.json({ success: true, count: result.length, jobs: result });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Single Job Details
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConnected) {
      const sql = `
        SELECT j.*, c.company_name, c.company_logo, c.website, c.description AS company_description, c.address AS company_address, c.hr_name
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.job_id = ?
      `;
      const rows = await query(sql, [id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Job posting not found.' });
      }
      return res.json({ success: true, job: rows[0] });
    } else {
      const j = memoryStore.jobs.find(job => job.job_id === parseInt(id));
      if (!j) return res.status(404).json({ success: false, message: 'Job posting not found.' });
      const comp = memoryStore.companies.find(c => c.company_id === j.company_id) || {};
      return res.json({
        success: true,
        job: {
          ...j,
          company_name: comp.company_name,
          company_logo: comp.company_logo,
          website: comp.website,
          company_description: comp.description,
          company_address: comp.address,
          hr_name: comp.hr_name
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get Application Questions for a Job
 */
export const getApplicationQuestions = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (isConnected) {
      const questions = await query(
        `SELECT question_id, question_text, is_required, sort_order
         FROM application_questions WHERE job_id = ? ORDER BY sort_order ASC`,
        [jobId]
      );
      return res.json({ success: true, questions: questions || [] });
    } else {
      const questions = memoryStore.application_questions
        .filter(q => q.job_id === parseInt(jobId))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(q => ({
          question_id: q.question_id,
          question_text: q.question_text,
          is_required: q.is_required,
          sort_order: q.sort_order
        }));
      return res.json({ success: true, questions });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Apply to a Job – Real Application Flow
 *
 * Accepts: multipart/form-data
 *   - applicationResume (file, PDF, required)
 *   - job_id (string)
 *   - answers (JSON string: Array<{ question_id, question_text, answer }>)
 *   - cover_letter (optional text)
 *
 * Validation:
 *   - Must be a student
 *   - Resume must be uploaded
 *   - Resume must be a PDF
 *   - Resume must not exceed 5 MB
 *   - All required questions must be answered (non-empty)
 *   - Cannot apply twice to the same job
 */
export const applyJob = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { job_id, answers: answersRaw, cover_letter } = req.body;

    // ── Validate job_id ──────────────────────────────────────────────────────
    if (!job_id) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    // ── Validate resume upload ────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume (PDF) to submit the application.',
      });
    }

    // Validate PDF mimetype
    const mime = req.file.mimetype || '';
    const ext  = path.extname(req.file.originalname || '').toLowerCase();
    if (!mime.includes('pdf') && ext !== '.pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF resumes are accepted. Please upload a valid PDF file.',
      });
    }

    // Validate file size ≤ 5 MB
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Resume file size must be 5 MB or less. Please compress your PDF and try again.',
      });
    }

    // ── Parse & validate answers ──────────────────────────────────────────────
    let answers = [];
    try {
      answers = answersRaw ? JSON.parse(answersRaw) : [];
    } catch {
      answers = [];
    }

    // Fetch required questions and validate
    let requiredQuestions = [];
    if (isConnected) {
      requiredQuestions = await query(
        `SELECT question_id, question_text FROM application_questions WHERE job_id = ? AND is_required = TRUE`,
        [job_id]
      ) || [];
    } else {
      requiredQuestions = memoryStore.application_questions.filter(
        q => q.job_id === parseInt(job_id) && q.is_required
      );
    }

    const answeredIds = new Set(answers.map(a => String(a.question_id)));
    const unanswered = requiredQuestions.filter(q => {
      const ans = answers.find(a => String(a.question_id) === String(q.question_id));
      return !ans || !ans.answer || ans.answer.trim() === '';
    });

    if (unanswered.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please answer all required questions before submitting. Missing: ${unanswered.map(q => `"${q.question_text}"`).join(', ')}`,
      });
    }

    // ── Build resume file path ────────────────────────────────────────────────
    const resumeFilePath = `/uploads/applications/${req.file.filename}`;
    const answersJSON = JSON.stringify(answers);

    if (isConnected) {
      // Check duplicate
      const existing = await query(
        'SELECT application_id FROM applications WHERE student_id = ? AND job_id = ?',
        [student_id, job_id]
      );
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job position.',
        });
      }

      await query(
        `INSERT INTO applications (student_id, job_id, resume_used, cover_letter, application_answers, status)
         VALUES (?, ?, ?, ?, ?, 'Applied')`,
        [student_id, job_id, resumeFilePath, cover_letter || null, answersJSON]
      );

      // Notify company
      const jobRows = await query('SELECT company_id, title FROM jobs WHERE job_id = ?', [job_id]);
      if (jobRows && jobRows.length > 0) {
        await query(
          `INSERT INTO notifications (user_id, user_type, title, message) VALUES (?, 'Company', 'New Job Application', ?)`,
          [jobRows[0].company_id, `A new candidate applied for: ${jobRows[0].title}`]
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully! The company will be notified.',
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.applications.find(
        a => a.student_id === student_id && a.job_id === parseInt(job_id)
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job position.',
        });
      }

      const newApp = {
        application_id: memoryStore.applications.length + 1,
        student_id,
        job_id: parseInt(job_id),
        resume_used: resumeFilePath,
        cover_letter: cover_letter || null,
        application_answers: answers,
        status: 'Applied',
        applied_date: new Date(),
      };
      memoryStore.applications.push(newApp);

      const jobObj = memoryStore.jobs.find(j => j.job_id === parseInt(job_id));
      if (jobObj) {
        memoryStore.notifications.push({
          notification_id: memoryStore.notifications.length + 1,
          user_id: jobObj.company_id,
          user_type: 'Company',
          title: 'New Job Application',
          message: `A new candidate applied for: ${jobObj.title}`,
          read_status: 0,
          created_at: new Date(),
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully! The company will be notified.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Save Job
 */
export const saveJob = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { job_id } = req.body;

    if (!job_id) return res.status(400).json({ success: false, message: 'Job ID is required.' });

    if (isConnected) {
      const existing = await query(
        'SELECT saved_job_id FROM saved_jobs WHERE student_id = ? AND job_id = ?',
        [student_id, job_id]
      );
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Job is already saved.' });
      }
      await query('INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)', [student_id, job_id]);
      return res.status(201).json({ success: true, message: 'Job saved to your bookmarks!' });
    } else {
      const existing = memoryStore.saved_jobs.find(
        sj => sj.student_id === student_id && sj.job_id === parseInt(job_id)
      );
      if (existing) {
        return res.status(400).json({ success: false, message: 'Job is already saved.' });
      }
      memoryStore.saved_jobs.push({
        saved_job_id: memoryStore.saved_jobs.length + 1,
        student_id,
        job_id: parseInt(job_id),
        saved_date: new Date(),
      });
      return res.status(201).json({ success: true, message: 'Job saved to your bookmarks!' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Unsave Job
 */
export const unsaveJob = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { id } = req.params;

    if (isConnected) {
      await query('DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?', [student_id, id]);
      return res.json({ success: true, message: 'Job removed from saved bookmarks.' });
    } else {
      const idx = memoryStore.saved_jobs.findIndex(
        sj => sj.student_id === student_id && sj.job_id === parseInt(id)
      );
      if (idx !== -1) memoryStore.saved_jobs.splice(idx, 1);
      return res.json({ success: true, message: 'Job removed from saved bookmarks.' });
    }
  } catch (error) {
    next(error);
  }
};
