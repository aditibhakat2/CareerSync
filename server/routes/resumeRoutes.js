import express from 'express';
import { createResume, updateResume, getStudentResumes, deleteResume } from '../controllers/resumeController.js';
import { authenticateJWT, authorizeStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authenticateJWT, authorizeStudent, createResume);
router.put('/update', authenticateJWT, authorizeStudent, updateResume);
router.get('/', authenticateJWT, authorizeStudent, getStudentResumes);
router.delete('/:id', authenticateJWT, authorizeStudent, deleteResume);

export default router;
