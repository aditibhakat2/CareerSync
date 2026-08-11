import { query, isConnected, memoryStore } from '../config/db.js';

/**
 * 1. Company Dashboard Metrics
 */
export const getCompanyDashboard = async (req, res, next) => {
  try {
    const company_id = req.user.id;

    if (isConnected) {
      const [activeJobs] = await query('SELECT COUNT(*) AS total FROM jobs WHERE company_id = ? AND status = "Active"', [company_id]);
      const [appReceived] = await query(`
        SELECT COUNT(*) AS total FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE j.company_id = ?
      `, [company_id]);

      const [shortlisted] = await query(`
        SELECT COUNT(*) AS total FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE j.company_id = ? AND a.status = "Shortlisted"
      `, [company_id]);

      const [interviews] = await query(`
        SELECT COUNT(*) AS total FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE j.company_id = ? AND a.status = "Interview Scheduled"
      `, [company_id]);

      const recentApplicants = await query(`
        SELECT a.application_id, a.status, a.applied_date, s.name AS student_name, s.email AS student_email, s.college, s.skills, j.title AS job_title
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN students s ON a.student_id = s.student_id
        WHERE j.company_id = ?
        ORDER BY a.applied_date DESC LIMIT 5
      `, [company_id]);

      const recentJobs = await query('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC LIMIT 5', [company_id]);

      return res.json({
        success: true,
        metrics: {
          activeJobs: activeJobs.total || 0,
          applicationsReceived: appReceived.total || 0,
          shortlistedCandidates: shortlisted.total || 0,
          interviewsScheduled: interviews.total || 0
        },
        recentApplicants,
        recentJobs
      });
    } else {
      // Memory Store Fallback
      const companyJobs = memoryStore.jobs.filter(j => j.company_id === company_id);
      const jobIds = companyJobs.map(j => j.job_id);
      const apps = memoryStore.applications.filter(a => jobIds.includes(a.job_id));

      const shortlisted = apps.filter(a => a.status === 'Shortlisted');
      const interviews = apps.filter(a => a.status === 'Interview Scheduled');

      const recentApplicants = apps.map(a => {
        const s = memoryStore.students.find(st => st.student_id === a.student_id) || {};
        const j = memoryStore.jobs.find(jb => jb.job_id === a.job_id) || {};
        return {
          application_id: a.application_id,
          status: a.status,
          applied_date: a.applied_date,
          student_name: s.name || 'Student Candidate',
          student_email: s.email,
          college: s.college,
          skills: s.skills,
          job_title: j.title
        };
      });

      return res.json({
        success: true,
        metrics: {
          activeJobs: companyJobs.filter(j => j.status === 'Active').length,
          applicationsReceived: apps.length,
          shortlistedCandidates: shortlisted.length,
          interviewsScheduled: interviews.length
        },
        recentApplicants,
        recentJobs: companyJobs
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Post Job + Save Application Questions
 */
export const postJob = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const {
      title, description, responsibilities, required_skills,
      salary, experience, location, job_type, remote_option,
      deadline, vacancies, education, application_questions
    } = req.body;

    if (!title || !description || !required_skills || !salary || !location) {
      return res.status(400).json({ success: false, message: 'Please fill in all mandatory job details.' });
    }

    // Parse questions if sent as JSON string
    let questions = [];
    try {
      questions = application_questions
        ? (typeof application_questions === 'string' ? JSON.parse(application_questions) : application_questions)
        : [];
    } catch {
      questions = [];
    }

    if (isConnected) {
      const result = await query(
        `INSERT INTO jobs (company_id, title, description, responsibilities, required_skills, salary, experience, location, job_type, remote_option, deadline, vacancies, education, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [company_id, title, description, responsibilities || null, required_skills, salary,
         experience || 'Fresher', location, job_type || 'Full Time', remote_option || 'On-site',
         deadline || null, vacancies || 1, education || null]
      );

      const newJobId = result.insertId;

      // Save application questions
      if (questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.question_text && q.question_text.trim()) {
            await query(
              `INSERT INTO application_questions (job_id, question_text, is_required, sort_order) VALUES (?, ?, ?, ?)`,
              [newJobId, q.question_text.trim(), q.is_required !== false, i + 1]
            );
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Job posting published successfully!',
        jobId: newJobId
      });
    } else {
      const newJob = {
        job_id: memoryStore.jobs.length + 1,
        company_id, title, description,
        responsibilities: responsibilities || '',
        required_skills, salary,
        experience: experience || 'Fresher',
        location, job_type: job_type || 'Full Time',
        remote_option: remote_option || 'On-site',
        deadline: deadline || null,
        vacancies: vacancies || 1,
        education: education || '',
        status: 'Active',
        created_at: new Date()
      };
      memoryStore.jobs.push(newJob);

      // Save questions to memory store
      questions.forEach((q, i) => {
        if (q.question_text && q.question_text.trim()) {
          memoryStore.application_questions.push({
            question_id: memoryStore.application_questions.length + 1,
            job_id: newJob.job_id,
            question_text: q.question_text.trim(),
            is_required: q.is_required !== false,
            sort_order: i + 1,
            created_at: new Date()
          });
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Job posting published successfully!',
        jobId: newJob.job_id
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Edit Job
 */
export const editJob = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { id } = req.params;
    const { title, description, responsibilities, required_skills, salary, experience, location, job_type, remote_option, status } = req.body;

    if (isConnected) {
      await query(
        `UPDATE jobs SET title=?, description=?, responsibilities=?, required_skills=?, salary=?, experience=?, location=?, job_type=?, remote_option=?, status=?
         WHERE job_id=? AND company_id=?`,
        [title, description, responsibilities, required_skills, salary, experience, location, job_type, remote_option, status || 'Active', id, company_id]
      );
      return res.json({ success: true, message: 'Job updated successfully.' });
    } else {
      const idx = memoryStore.jobs.findIndex(j => j.job_id === parseInt(id) && j.company_id === company_id);
      if (idx !== -1) {
        memoryStore.jobs[idx] = { ...memoryStore.jobs[idx], title, description, responsibilities, required_skills, salary, experience, location, job_type, remote_option, status };
      }
      return res.json({ success: true, message: 'Job updated successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Delete Job
 */
export const deleteJob = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { id } = req.params;

    if (isConnected) {
      await query('DELETE FROM jobs WHERE job_id = ? AND company_id = ?', [id, company_id]);
      return res.json({ success: true, message: 'Job posting deleted successfully.' });
    } else {
      const idx = memoryStore.jobs.findIndex(j => j.job_id === parseInt(id) && j.company_id === company_id);
      if (idx !== -1) memoryStore.jobs.splice(idx, 1);
      return res.json({ success: true, message: 'Job posting deleted successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Get Company Jobs
 */
export const getCompanyJobs = async (req, res, next) => {
  try {
    const company_id = req.user.id;

    if (isConnected) {
      const jobs = await query('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC', [company_id]);
      return res.json({ success: true, jobs });
    } else {
      const jobs = memoryStore.jobs.filter(j => j.company_id === company_id);
      return res.json({ success: true, jobs });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Get Applicants for Company – with search, filter, and answers
 */
export const getCompanyApplicants = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { jobId } = req.params;
    const { search, status } = req.query;

    if (isConnected) {
      let sql = `
        SELECT a.application_id, a.status, a.applied_date, a.resume_used, a.application_answers, a.cover_letter,
               s.student_id, s.name, s.email, s.phone, s.college, s.degree, s.branch, s.passing_year, s.cgpa, s.skills, s.profile_photo,
               j.job_id, j.title AS job_title
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN students s ON a.student_id = s.student_id
        WHERE j.company_id = ?
      `;
      const params = [company_id];

      if (jobId && jobId !== 'all') {
        sql += ` AND j.job_id = ?`;
        params.push(jobId);
      }
      if (status && status !== 'all') {
        sql += ` AND a.status = ?`;
        params.push(status);
      }
      if (search) {
        sql += ` AND (s.name LIKE ? OR s.email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      sql += ` ORDER BY a.applied_date DESC`;

      const applicants = await query(sql, params);

      // Parse JSON answers for each applicant
      const parsed = (applicants || []).map(a => ({
        ...a,
        application_answers: typeof a.application_answers === 'string'
          ? JSON.parse(a.application_answers || '[]')
          : (a.application_answers || []),
        resume_url: a.resume_used ? `${process.env.SERVER_URL || 'http://localhost:5000'}${a.resume_used}` : null
      }));

      return res.json({ success: true, applicants: parsed });
    } else {
      const companyJobs = memoryStore.jobs.filter(j => j.company_id === company_id);
      const companyJobIds = companyJobs.map(j => j.job_id);

      let filteredApps = memoryStore.applications.filter(a => companyJobIds.includes(a.job_id));
      if (jobId && jobId !== 'all') {
        filteredApps = filteredApps.filter(a => a.job_id === parseInt(jobId));
      }
      if (status && status !== 'all') {
        filteredApps = filteredApps.filter(a => a.status === status);
      }

      let applicants = filteredApps.map(a => {
        const s = memoryStore.students.find(st => st.student_id === a.student_id) || {};
        const j = memoryStore.jobs.find(jb => jb.job_id === a.job_id) || {};
        return {
          application_id: a.application_id,
          status: a.status,
          applied_date: a.applied_date,
          resume_used: a.resume_used,
          resume_url: a.resume_used ? `http://localhost:5000${a.resume_used}` : null,
          cover_letter: a.cover_letter || null,
          application_answers: Array.isArray(a.application_answers) ? a.application_answers : [],
          student_id: s.student_id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          college: s.college,
          degree: s.degree,
          branch: s.branch,
          passing_year: s.passing_year,
          cgpa: s.cgpa,
          skills: s.skills,
          profile_photo: s.profile_photo,
          job_id: j.job_id,
          job_title: j.title
        };
      });

      // Search filter
      if (search) {
        const term = search.toLowerCase();
        applicants = applicants.filter(a =>
          (a.name || '').toLowerCase().includes(term) ||
          (a.email || '').toLowerCase().includes(term)
        );
      }

      return res.json({ success: true, applicants });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Update Application Status (Shortlist, Reject, etc.)
 */
export const updateApplicantStatus = async (req, res, next) => {
  try {
    const { application_id, status } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({ success: false, message: 'Application ID and Status are required.' });
    }

    if (isConnected) {
      await query('UPDATE applications SET status = ? WHERE application_id = ?', [status, application_id]);
      
      // Send notification to student
      const [appRow] = await query('SELECT student_id, job_id FROM applications WHERE application_id = ?', [application_id]);
      if (appRow) {
        const [jobRow] = await query('SELECT title FROM jobs WHERE job_id = ?', [appRow.job_id]);
        await query('INSERT INTO notifications (user_id, user_type, title, message) VALUES (?, "Student", "Application Status Updated", ?)',
          [appRow.student_id, `Your application status for "${jobRow ? jobRow.title : 'Job'}" was updated to ${status}.`]);
      }
      return res.json({ success: true, message: `Application status updated to ${status}.` });
    } else {
      const idx = memoryStore.applications.findIndex(a => a.application_id === parseInt(application_id));
      if (idx !== -1) {
        memoryStore.applications[idx].status = status;
        const app = memoryStore.applications[idx];
        const job = memoryStore.jobs.find(j => j.job_id === app.job_id);

        memoryStore.notifications.push({
          notification_id: memoryStore.notifications.length + 1,
          user_id: app.student_id,
          user_type: 'Student',
          title: 'Application Status Updated',
          message: `Your application status for "${job ? job.title : 'Job'}" was updated to ${status}.`,
          read_status: 0,
          created_at: new Date()
        });
      }
      return res.json({ success: true, message: `Application status updated to ${status}.` });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Schedule Interview
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const { application_id, interview_date, interview_time, meeting_link, interview_mode } = req.body;

    if (!application_id || !interview_date || !interview_time) {
      return res.status(400).json({ success: false, message: 'Application ID, Date, and Time are required.' });
    }

    if (isConnected) {
      await query('UPDATE applications SET status = "Interview Scheduled" WHERE application_id = ?', [application_id]);
      const [appRow] = await query('SELECT student_id, job_id FROM applications WHERE application_id = ?', [application_id]);
      if (appRow) {
        const [jobRow] = await query('SELECT title FROM jobs WHERE job_id = ?', [appRow.job_id]);
        await query(
          `INSERT INTO notifications (user_id, user_type, title, message) VALUES (?, 'Student', 'Interview Scheduled', ?)`,
          [appRow.student_id, `Interview scheduled for "${jobRow ? jobRow.title : 'Position'}" on ${interview_date} at ${interview_time}. Mode: ${interview_mode || 'Online'}. Link: ${meeting_link || 'TBD'}`]
        );
      }
      return res.json({ success: true, message: 'Interview scheduled and candidate notified!' });
    } else {
      const idx = memoryStore.applications.findIndex(a => a.application_id === parseInt(application_id));
      if (idx !== -1) {
        memoryStore.applications[idx].status = 'Interview Scheduled';
        const app = memoryStore.applications[idx];
        const job = memoryStore.jobs.find(j => j.job_id === app.job_id);
        memoryStore.notifications.push({
          notification_id: memoryStore.notifications.length + 1,
          user_id: app.student_id,
          user_type: 'Student',
          title: 'Interview Scheduled',
          message: `Interview scheduled for "${job ? job.title : 'Position'}" on ${interview_date} at ${interview_time}. Mode: ${interview_mode || 'Online'}. Link: ${meeting_link || 'TBD'}`,
          read_status: 0,
          created_at: new Date(),
        });
      }
      return res.json({ success: true, message: 'Interview scheduled and candidate notified!' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Get Single Application Detail (with answers + resume URL)
 */
export const getApplicationDetail = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { applicationId } = req.params;

    if (isConnected) {
      const rows = await query(
        `SELECT a.application_id, a.status, a.applied_date, a.resume_used, a.application_answers, a.cover_letter,
                s.student_id, s.name, s.email, s.phone, s.college, s.degree, s.branch, s.passing_year, s.cgpa, s.skills, s.linkedin, s.github,
                j.job_id, j.title AS job_title, j.company_id
         FROM applications a
         JOIN jobs j ON a.job_id = j.job_id
         JOIN students s ON a.student_id = s.student_id
         WHERE a.application_id = ? AND j.company_id = ?`,
        [applicationId, company_id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }

      const app = rows[0];
      const answers = typeof app.application_answers === 'string'
        ? JSON.parse(app.application_answers || '[]')
        : (app.application_answers || []);

      return res.json({
        success: true,
        application: {
          ...app,
          application_answers: answers,
          resume_url: app.resume_used
            ? `${process.env.SERVER_URL || 'http://localhost:5000'}${app.resume_used}`
            : null
        }
      });
    } else {
      const app = memoryStore.applications.find(a => a.application_id === parseInt(applicationId));
      if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

      const job = memoryStore.jobs.find(j => j.job_id === app.job_id);
      if (!job || job.company_id !== company_id) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      const student = memoryStore.students.find(s => s.student_id === app.student_id) || {};

      return res.json({
        success: true,
        application: {
          application_id: app.application_id,
          status: app.status,
          applied_date: app.applied_date,
          resume_used: app.resume_used,
          resume_url: app.resume_used ? `http://localhost:5000${app.resume_used}` : null,
          cover_letter: app.cover_letter || null,
          application_answers: Array.isArray(app.application_answers) ? app.application_answers : [],
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          college: student.college,
          degree: student.degree,
          branch: student.branch,
          passing_year: student.passing_year,
          cgpa: student.cgpa,
          skills: student.skills,
          linkedin: student.linkedin,
          github: student.github,
          job_id: job.job_id,
          job_title: job.title,
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Save / Update Application Questions for an existing Job
 */
export const saveJobQuestions = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { jobId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Questions must be an array.' });
    }

    if (isConnected) {
      // Verify ownership
      const jobRows = await query('SELECT job_id FROM jobs WHERE job_id = ? AND company_id = ?', [jobId, company_id]);
      if (!jobRows || jobRows.length === 0) {
        return res.status(403).json({ success: false, message: 'Job not found or unauthorized.' });
      }

      // Delete existing and re-insert
      await query('DELETE FROM application_questions WHERE job_id = ?', [jobId]);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.question_text && q.question_text.trim()) {
          await query(
            `INSERT INTO application_questions (job_id, question_text, is_required, sort_order) VALUES (?, ?, ?, ?)`,
            [jobId, q.question_text.trim(), q.is_required !== false, i + 1]
          );
        }
      }
      return res.json({ success: true, message: 'Application questions saved successfully.' });
    } else {
      // Memory store
      const job = memoryStore.jobs.find(j => j.job_id === parseInt(jobId) && j.company_id === company_id);
      if (!job) return res.status(403).json({ success: false, message: 'Job not found or unauthorized.' });

      memoryStore.application_questions = memoryStore.application_questions.filter(
        q => q.job_id !== parseInt(jobId)
      );
      questions.forEach((q, i) => {
        if (q.question_text && q.question_text.trim()) {
          memoryStore.application_questions.push({
            question_id: memoryStore.application_questions.length + 1,
            job_id: parseInt(jobId),
            question_text: q.question_text.trim(),
            is_required: q.is_required !== false,
            sort_order: i + 1,
            created_at: new Date(),
          });
        }
      });
      return res.json({ success: true, message: 'Application questions saved successfully.' });
    }
  } catch (error) {
    next(error);
  }
};
