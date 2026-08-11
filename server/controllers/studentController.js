import { query, isConnected, memoryStore } from '../config/db.js';

/**
 * 1. Student Dashboard Metrics
 */
export const getStudentDashboard = async (req, res, next) => {
  try {
    const student_id = req.user.id;

    if (isConnected) {
      const [appCount] = await query('SELECT COUNT(*) AS total FROM applications WHERE student_id = ?', [student_id]);
      const [savedCount] = await query('SELECT COUNT(*) AS total FROM saved_jobs WHERE student_id = ?', [student_id]);
      const [atsRow] = await query('SELECT ats_score FROM resumes WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [student_id]);
      const [interviewCount] = await query('SELECT COUNT(*) AS total FROM applications WHERE student_id = ? AND status = "Interview Scheduled"', [student_id]);
      
      const notifications = await query('SELECT * FROM notifications WHERE user_id = ? AND user_type = "Student" ORDER BY created_at DESC LIMIT 5', [student_id]);
      
      const latestApplications = await query(`
        SELECT a.application_id, a.status, a.applied_date, j.title, j.salary, j.location, c.company_name, c.company_logo
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        WHERE a.student_id = ?
        ORDER BY a.applied_date DESC LIMIT 5
      `, [student_id]);

      const recommendedJobs = await query(`
        SELECT j.*, c.company_name, c.company_logo
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.status = 'Active'
        ORDER BY j.created_at DESC LIMIT 4
      `);

      return res.json({
        success: true,
        metrics: {
          totalApplications: appCount.total || 0,
          savedJobs: savedCount.total || 0,
          atsScore: atsRow ? atsRow.ats_score : 85,
          upcomingInterviews: interviewCount.total || 0,
          resumeCompletion: 90
        },
        notifications,
        latestApplications,
        recommendedJobs
      });
    } else {
      // Memory Store Fallback
      const apps = memoryStore.applications.filter(a => a.student_id === student_id);
      const saved = memoryStore.saved_jobs.filter(s => s.student_id === student_id);
      const resObj = memoryStore.resumes.find(r => r.student_id === student_id);
      const interviewApps = apps.filter(a => a.status === 'Interview Scheduled');
      const notifications = memoryStore.notifications.filter(n => n.user_id === student_id && n.user_type === 'Student');

      const latestApplications = apps.map(a => {
        const j = memoryStore.jobs.find(job => job.job_id === a.job_id) || {};
        const c = memoryStore.companies.find(comp => comp.company_id === j.company_id) || {};
        return {
          application_id: a.application_id,
          status: a.status,
          applied_date: a.applied_date,
          title: j.title || 'Software Developer',
          salary: j.salary || '$80,000/yr',
          location: j.location || 'Remote',
          company_name: c.company_name || 'Tech Company',
          company_logo: c.company_logo
        };
      });

      const recommendedJobs = memoryStore.jobs.slice(0, 4).map(j => {
        const c = memoryStore.companies.find(comp => comp.company_id === j.company_id) || {};
        return { ...j, company_name: c.company_name, company_logo: c.company_logo };
      });

      return res.json({
        success: true,
        metrics: {
          totalApplications: apps.length,
          savedJobs: saved.length,
          atsScore: resObj ? resObj.ats_score : 88,
          upcomingInterviews: interviewApps.length,
          resumeCompletion: 90
        },
        notifications,
        latestApplications,
        recommendedJobs
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Student Saved Jobs List
 */
export const getSavedJobs = async (req, res, next) => {
  try {
    const student_id = req.user.id;

    if (isConnected) {
      const sql = `
        SELECT sj.saved_job_id, sj.saved_date, j.*, c.company_name, c.company_logo
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        WHERE sj.student_id = ?
        ORDER BY sj.saved_date DESC
      `;
      const saved = await query(sql, [student_id]);
      return res.json({ success: true, savedJobs: saved });
    } else {
      const saved = memoryStore.saved_jobs
        .filter(s => s.student_id === student_id)
        .map(s => {
          const j = memoryStore.jobs.find(job => job.job_id === s.job_id) || {};
          const c = memoryStore.companies.find(comp => comp.company_id === j.company_id) || {};
          return { saved_job_id: s.saved_job_id, saved_date: s.saved_date, ...j, company_name: c.company_name, company_logo: c.company_logo };
        });
      return res.json({ success: true, savedJobs: saved });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get Student Applied Jobs List
 */
export const getAppliedJobs = async (req, res, next) => {
  try {
    const student_id = req.user.id;

    if (isConnected) {
      const sql = `
        SELECT a.application_id, a.status, a.applied_date, a.resume_used, a.cover_letter, a.application_answers,
               j.job_id, j.title, j.salary, j.location, j.job_type, j.remote_option,
               c.company_name, c.company_logo, c.website
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        JOIN companies c ON j.company_id = c.company_id
        WHERE a.student_id = ?
        ORDER BY a.applied_date DESC
      `;
      const rows = await query(sql, [student_id]);

      // Parse JSON answers and build resume URL for each application
      const applications = (rows || []).map(a => ({
        ...a,
        application_answers: typeof a.application_answers === 'string'
          ? JSON.parse(a.application_answers || '[]')
          : (a.application_answers || []),
        resume_url: a.resume_used
          ? `${process.env.SERVER_URL || 'http://localhost:5000'}${a.resume_used}`
          : null
      }));

      return res.json({ success: true, applications });
    } else {
      const applications = memoryStore.applications
        .filter(a => a.student_id === student_id)
        .map(a => {
          const j = memoryStore.jobs.find(job => job.job_id === a.job_id) || {};
          const c = memoryStore.companies.find(comp => comp.company_id === j.company_id) || {};
          return {
            application_id: a.application_id,
            status: a.status,
            applied_date: a.applied_date,
            resume_used: a.resume_used,
            resume_url: a.resume_used ? `http://localhost:5000${a.resume_used}` : null,
            cover_letter: a.cover_letter || null,
            application_answers: Array.isArray(a.application_answers) ? a.application_answers : [],
            job_id: j.job_id,
            title: j.title,
            salary: j.salary,
            location: j.location,
            job_type: j.job_type,
            remote_option: j.remote_option,
            company_name: c.company_name,
            company_logo: c.company_logo,
            website: c.website
          };
        })
        .sort((a, b) => new Date(b.applied_date) - new Date(a.applied_date));

      return res.json({ success: true, applications });
    }
  } catch (error) {
    next(error);
  }
};
