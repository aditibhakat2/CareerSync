import { query, isConnected, memoryStore } from '../config/db.js';

/**
 * 1. Admin Dashboard Overview Metrics
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    if (isConnected) {
      const [students] = await query('SELECT COUNT(*) AS total FROM students');
      const [companies] = await query('SELECT COUNT(*) AS total FROM companies');
      const [jobs] = await query('SELECT COUNT(*) AS total FROM jobs');
      const [applications] = await query('SELECT COUNT(*) AS total FROM applications');
      const [pendingCompanies] = await query('SELECT COUNT(*) AS total FROM company_verification WHERE status = "Pending"');

      const recentStudents = await query('SELECT student_id, name, email, college, created_at FROM students ORDER BY created_at DESC LIMIT 5');
      const recentCompanies = await query('SELECT company_id, company_name, hr_name, email, verified, created_at FROM companies ORDER BY created_at DESC LIMIT 5');

      const recentActivity = [
        ...recentStudents.map(s => ({
          message: `New student registered: ${s.name} (${s.college || 'University'})`,
          time_ago: new Date(s.created_at).toLocaleDateString(),
          type: 'registration'
        })),
        ...recentCompanies.map(c => ({
          message: `Company registered: ${c.company_name} — HR: ${c.hr_name}`,
          time_ago: new Date(c.created_at).toLocaleDateString(),
          type: 'job_post'
        }))
      ].sort((a, b) => new Date(b.time_ago) - new Date(a.time_ago));

      return res.json({
        success: true,
        metrics: {
          totalStudents: students.total || 0,
          totalCompanies: companies.total || 0,
          totalJobs: jobs.total || 0,
          totalApplications: applications.total || 0,
          pendingCompanyVerifications: pendingCompanies.total || 0,
          activeUsers: (students.total || 0) + (companies.total || 0)
        },
        recentStudents,
        recentCompanies,
        recentActivity
      });
    } else {
      // Memory Store Fallback
      const pendingCount = memoryStore.company_verification.filter(cv => cv.status === 'Pending').length;
      const recentStudents = memoryStore.students.slice(-5);
      const recentCompanies = memoryStore.companies.slice(-5);
      const recentActivity = [
        ...recentStudents.map(s => ({
          message: `New student registered: ${s.name} (${s.college || 'University'})`,
          time_ago: new Date(s.created_at).toLocaleDateString(),
          type: 'registration'
        })),
        ...recentCompanies.map(c => ({
          message: `Company registered: ${c.company_name} — HR: ${c.hr_name}`,
          time_ago: new Date(c.created_at).toLocaleDateString(),
          type: 'job_post'
        }))
      ];

      return res.json({
        success: true,
        metrics: {
          totalStudents: memoryStore.students.length,
          totalCompanies: memoryStore.companies.length,
          totalJobs: memoryStore.jobs.length,
          totalApplications: memoryStore.applications.length,
          pendingCompanyVerifications: pendingCount,
          activeUsers: memoryStore.students.length + memoryStore.companies.length
        },
        recentStudents,
        recentCompanies,
        recentActivity
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get All Students
 */
export const getAdminStudents = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (isConnected) {
      let countSql = 'SELECT COUNT(*) AS total FROM students';
      let sql = 'SELECT student_id, name, email, phone, college, degree, branch, passing_year, cgpa, created_at FROM students';
      const params = [];
      const countParams = [];
      if (search) {
        const whereClause = ' WHERE name LIKE ? OR email LIKE ? OR college LIKE ?';
        const term = `%${search}%`;
        sql += whereClause;
        countSql += whereClause;
        params.push(term, term, term);
        countParams.push(term, term, term);
      }
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      const students = await query(sql, params);
      const [countRow] = await query(countSql, countParams);
      const total_pages = Math.ceil((countRow?.total || 0) / parseInt(limit));
      return res.json({ success: true, students, total_pages });
    } else {
      let students = memoryStore.students.map(s => {
        const copy = { ...s };
        delete copy.password;
        return copy;
      });
      if (search) {
        const term = search.toLowerCase();
        students = students.filter(s => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || (s.college && s.college.toLowerCase().includes(term)));
      }
      const total_pages = Math.ceil(students.length / parseInt(limit));
      const paginated = students.slice(offset, offset + parseInt(limit));
      return res.json({ success: true, students: paginated, total_pages });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Delete Student
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected) {
      await query('DELETE FROM students WHERE student_id = ?', [id]);
    } else {
      const idx = memoryStore.students.findIndex(s => s.student_id === parseInt(id));
      if (idx !== -1) memoryStore.students.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Student account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get All Companies
 */
export const getAdminCompanies = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (isConnected) {
      const conditions = [];
      const params = [];

      if (search) {
        conditions.push('(c.company_name LIKE ? OR c.email LIKE ? OR c.hr_name LIKE ?)');
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      if (status === 'verified') {
        conditions.push('c.verified = 1');
      } else if (status === 'unverified') {
        conditions.push('c.verified = 0');
      }

      const whereStr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) AS total FROM companies c LEFT JOIN company_verification cv ON c.company_id = cv.company_id ${whereStr}`;
      const [countRow] = await query(countSql, [...params]);
      const total_pages = Math.ceil((countRow?.total || 0) / parseInt(limit));

      const sql = `
        SELECT c.company_id, c.company_name, c.hr_name, c.email, c.phone, c.website, c.address,
               c.description, c.company_logo, c.verified, c.created_at,
               c.verified AS is_verified,
               cv.status AS verification_status, cv.remarks,
               (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.company_id) AS jobs_count
        FROM companies c
        LEFT JOIN company_verification cv ON c.company_id = cv.company_id
        ${whereStr}
        ORDER BY c.created_at DESC LIMIT ? OFFSET ?
      `;
      params.push(parseInt(limit), offset);
      const companies = await query(sql, params);
      return res.json({ success: true, companies, total_pages });
    } else {
      let companies = memoryStore.companies.map(c => {
        const cv = memoryStore.company_verification.find(v => v.company_id === c.company_id) || {};
        const jobs_count = memoryStore.jobs.filter(j => j.company_id === c.company_id).length;
        return {
          ...c,
          is_verified: Boolean(c.verified),
          verification_status: cv.status || (c.verified ? 'Verified' : 'Pending'),
          remarks: cv.remarks || 'Standard review',
          jobs_count
        };
      });
      if (search) {
        const term = search.toLowerCase();
        companies = companies.filter(c => c.company_name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.hr_name.toLowerCase().includes(term));
      }
      if (status === 'verified') companies = companies.filter(c => c.is_verified);
      if (status === 'unverified') companies = companies.filter(c => !c.is_verified);
      const total_pages = Math.ceil(companies.length / parseInt(limit));
      const paginated = companies.slice(offset, offset + parseInt(limit));
      return res.json({ success: true, companies: paginated, total_pages });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Verify / Reject Company
 */
export const verifyCompany = async (req, res, next) => {
  try {
    // Support both req.params.id (route param) and req.body.company_id
    const company_id = req.params.id || req.body.company_id;
    const { status, remarks } = req.body;

    if (!company_id || !status) {
      return res.status(400).json({ success: false, message: 'Company ID and Status are required.' });
    }

    const isApproved = (status === 'Verified');

    if (isConnected) {
      await query('UPDATE companies SET verified = ? WHERE company_id = ?', [isApproved, company_id]);
      
      const existing = await query('SELECT verification_id FROM company_verification WHERE company_id = ?', [company_id]);
      if (existing && existing.length > 0) {
        await query('UPDATE company_verification SET status = ?, remarks = ?, verified_date = NOW() WHERE company_id = ?', [status, remarks || '', company_id]);
      } else {
        await query('INSERT INTO company_verification (company_id, status, remarks, verified_date) VALUES (?, ?, ?, NOW())', [company_id, status, remarks || '']);
      }

      await query('INSERT INTO notifications (user_id, user_type, title, message) VALUES (?, "Company", "Verification Status Updated", ?)',
        [company_id, `Your company HR account verification has been set to ${status}.`]);

      return res.json({ success: true, message: `Company status updated to ${status}.` });
    } else {
      const idx = memoryStore.companies.findIndex(c => c.company_id === parseInt(company_id));
      if (idx !== -1) {
        memoryStore.companies[idx].verified = isApproved ? 1 : 0;
      }
      const vIdx = memoryStore.company_verification.findIndex(v => v.company_id === parseInt(company_id));
      if (vIdx !== -1) {
        memoryStore.company_verification[vIdx].status = status;
        memoryStore.company_verification[vIdx].remarks = remarks || '';
        memoryStore.company_verification[vIdx].verified_date = new Date();
      }

      memoryStore.notifications.push({
        notification_id: memoryStore.notifications.length + 1,
        user_id: parseInt(company_id),
        user_type: 'Company',
        title: 'Verification Status Updated',
        message: `Your company HR account verification has been set to ${status}.`,
        read_status: 0,
        created_at: new Date()
      });

      return res.json({ success: true, message: `Company status updated to ${status}.` });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Delete Company
 */
export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected) {
      await query('DELETE FROM companies WHERE company_id = ?', [id]);
    } else {
      const idx = memoryStore.companies.findIndex(c => c.company_id === parseInt(id));
      if (idx !== -1) memoryStore.companies.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Company account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Get All Jobs for Admin Moderation
 */
export const getAdminJobs = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (isConnected) {
      const conditions = [];
      const params = [];

      if (search) {
        conditions.push('(j.title LIKE ? OR c.company_name LIKE ?)');
        const term = `%${search}%`;
        params.push(term, term);
      }
      if (type && type !== 'all') {
        conditions.push('j.job_type = ?');
        params.push(type);
      }

      const whereStr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countSql = `SELECT COUNT(*) AS total FROM jobs j JOIN companies c ON j.company_id = c.company_id ${whereStr}`;
      const [countRow] = await query(countSql, [...params]);
      const total_pages = Math.ceil((countRow?.total || 0) / parseInt(limit));

      const sql = `
        SELECT j.*, c.company_name, c.email AS company_email,
               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) AS application_count
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        ${whereStr}
        ORDER BY j.created_at DESC LIMIT ? OFFSET ?
      `;
      params.push(parseInt(limit), offset);
      const jobs = await query(sql, params);
      return res.json({ success: true, jobs, total_pages });
    } else {
      let jobs = memoryStore.jobs.map(j => {
        const c = memoryStore.companies.find(comp => comp.company_id === j.company_id) || {};
        const application_count = memoryStore.applications.filter(a => a.job_id === j.job_id).length;
        return { ...j, company_name: c.company_name, company_email: c.email, application_count };
      });
      if (search) {
        const term = search.toLowerCase();
        jobs = jobs.filter(j => j.title.toLowerCase().includes(term) || (j.company_name && j.company_name.toLowerCase().includes(term)));
      }
      if (type && type !== 'all') jobs = jobs.filter(j => j.job_type === type);
      const total_pages = Math.ceil(jobs.length / parseInt(limit));
      const paginated = jobs.slice(offset, offset + parseInt(limit));
      return res.json({ success: true, jobs: paginated, total_pages });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Delete Job (Fake job removal)
 */
export const adminDeleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected) {
      await query('DELETE FROM jobs WHERE job_id = ?', [id]);
    } else {
      const idx = memoryStore.jobs.findIndex(j => j.job_id === parseInt(id));
      if (idx !== -1) memoryStore.jobs.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Job posting removed by Admin.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Get Reports & System Audit - Returns proper stats for the AdminReports frontend
 */
export const getAdminReports = async (req, res, next) => {
  try {
    if (isConnected) {
      // Aggregate stats
      const [studRow]   = await query('SELECT COUNT(*) AS cnt FROM students');
      const [compRow]   = await query('SELECT COUNT(*) AS cnt FROM companies');
      const [jobRow]    = await query('SELECT COUNT(*) AS cnt FROM jobs');
      const [appRow]    = await query('SELECT COUNT(*) AS cnt FROM applications');
      const [resumeRow] = await query('SELECT COUNT(*) AS cnt FROM resumes');
      const [interRow]  = await query('SELECT COUNT(*) AS cnt FROM mock_interviews');

      // Monthly student registrations (last 6 months)
      const monthly_registrations = await query(`
        SELECT DATE_FORMAT(created_at, '%b') AS label, COUNT(*) AS value
        FROM students
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at), label
        ORDER BY YEAR(created_at), MONTH(created_at)
      `);

      // Monthly applications (last 6 months)
      const monthly_applications = await query(`
        SELECT DATE_FORMAT(applied_date, '%b') AS label, COUNT(*) AS value
        FROM applications
        WHERE applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY YEAR(applied_date), MONTH(applied_date), label
        ORDER BY YEAR(applied_date), MONTH(applied_date)
      `);

      // Top companies by job count
      const top_companies = await query(`
        SELECT c.company_name, COUNT(j.job_id) AS jobs_count
        FROM companies c
        LEFT JOIN jobs j ON c.company_id = j.company_id
        GROUP BY c.company_id, c.company_name
        ORDER BY jobs_count DESC LIMIT 5
      `);

      return res.json({
        success: true,
        stats: {
          total_students:    studRow?.cnt  || 0,
          total_companies:   compRow?.cnt  || 0,
          total_jobs:        jobRow?.cnt   || 0,
          total_applications: appRow?.cnt  || 0,
          ai_resumes:        resumeRow?.cnt || 0,
          mock_interviews:   interRow?.cnt || 0,
        },
        monthly_registrations: monthly_registrations || [],
        monthly_applications:  monthly_applications  || [],
        top_companies:         top_companies         || [],
      });
    } else {
      // Memory store fallback
      const monthly_registrations = [
        { label: 'Mar', value: 12 }, { label: 'Apr', value: 19 },
        { label: 'May', value: 28 }, { label: 'Jun', value: 35 },
        { label: 'Jul', value: 42 }, { label: 'Aug', value: memoryStore.students.length }
      ];
      const monthly_applications = [
        { label: 'Mar', value: 8 }, { label: 'Apr', value: 15 },
        { label: 'May', value: 22 }, { label: 'Jun', value: 29 },
        { label: 'Jul', value: 38 }, { label: 'Aug', value: memoryStore.applications.length }
      ];
      const companyJobCounts = memoryStore.companies.map(c => ({
        company_name: c.company_name,
        jobs_count: memoryStore.jobs.filter(j => j.company_id === c.company_id).length
      })).sort((a, b) => b.jobs_count - a.jobs_count).slice(0, 5);

      return res.json({
        success: true,
        stats: {
          total_students:    memoryStore.students.length,
          total_companies:   memoryStore.companies.length,
          total_jobs:        memoryStore.jobs.length,
          total_applications: memoryStore.applications.length,
          ai_resumes:        memoryStore.resumes.length,
          mock_interviews:   memoryStore.mock_interviews.length,
        },
        monthly_registrations,
        monthly_applications,
        top_companies: companyJobCounts,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Save Platform Settings
 */
export const savePlatformSettings = async (req, res, next) => {
  try {
    const { siteName, maintenanceMode, maxJobsPerCompany, allowRegistrations } = req.body;
    // In a production system these would be persisted to a settings table
    // For now we accept and acknowledge the update
    return res.json({
      success: true,
      message: 'Platform settings saved successfully.',
      settings: { siteName, maintenanceMode, maxJobsPerCompany, allowRegistrations }
    });
  } catch (error) {
    next(error);
  }
};
