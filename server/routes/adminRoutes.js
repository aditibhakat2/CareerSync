import express from 'express';
import {
  getAdminDashboard,
  getAdminStudents,
  deleteStudent,
  getAdminCompanies,
  verifyCompany,
  deleteCompany,
  getAdminJobs,
  adminDeleteJob,
  getAdminReports,
  savePlatformSettings
} from '../controllers/adminController.js';
import { authenticateJWT, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard
router.get('/dashboard',         authenticateJWT, authorizeAdmin, getAdminDashboard);

// Students
router.get('/students',          authenticateJWT, authorizeAdmin, getAdminStudents);
router.delete('/students/:id',   authenticateJWT, authorizeAdmin, deleteStudent);

// Companies
router.get('/companies',         authenticateJWT, authorizeAdmin, getAdminCompanies);
router.put('/companies/:id/verify', authenticateJWT, authorizeAdmin, verifyCompany);
router.delete('/companies/:id',  authenticateJWT, authorizeAdmin, deleteCompany);

// Jobs
router.get('/jobs',              authenticateJWT, authorizeAdmin, getAdminJobs);
router.delete('/jobs/:id',       authenticateJWT, authorizeAdmin, adminDeleteJob);

// Reports
router.get('/reports',           authenticateJWT, authorizeAdmin, getAdminReports);

// Platform Settings
router.put('/platform-settings', authenticateJWT, authorizeAdmin, savePlatformSettings);

export default router;
