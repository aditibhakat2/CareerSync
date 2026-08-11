import express from 'express';
import { getStudentDashboard, getSavedJobs, getAppliedJobs } from '../controllers/studentController.js';
import { authenticateJWT, authorizeStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticateJWT, authorizeStudent, getStudentDashboard);
router.get('/saved-jobs', authenticateJWT, authorizeStudent, getSavedJobs);
router.get('/applied-jobs', authenticateJWT, authorizeStudent, getAppliedJobs);

export default router;
