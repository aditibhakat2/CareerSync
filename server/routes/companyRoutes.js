import express from 'express';
import {
  getCompanyDashboard,
  postJob,
  editJob,
  deleteJob,
  getCompanyJobs,
  getCompanyApplicants,
  updateApplicantStatus,
  scheduleInterview,
  getApplicationDetail,
  saveJobQuestions,
} from '../controllers/companyController.js';
import { authenticateJWT, authorizeCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard',                        authenticateJWT, authorizeCompany, getCompanyDashboard);
router.post('/post-job',                        authenticateJWT, authorizeCompany, postJob);
router.put('/edit-job/:id',                     authenticateJWT, authorizeCompany, editJob);
router.delete('/delete-job/:id',                authenticateJWT, authorizeCompany, deleteJob);
router.get('/jobs',                             authenticateJWT, authorizeCompany, getCompanyJobs);
router.get('/applicants/:jobId?',               authenticateJWT, authorizeCompany, getCompanyApplicants);
router.put('/applicant-status',                 authenticateJWT, authorizeCompany, updateApplicantStatus);
router.post('/schedule-interview',              authenticateJWT, authorizeCompany, scheduleInterview);
router.get('/application/:applicationId',       authenticateJWT, authorizeCompany, getApplicationDetail);
router.post('/job-questions/:jobId',            authenticateJWT, authorizeCompany, saveJobQuestions);

// Notification preferences
router.put('/notification-preferences', authenticateJWT, authorizeCompany, (req, res) => {
  res.json({ success: true, message: 'Notification preferences saved.', preferences: req.body });
});

export default router;
