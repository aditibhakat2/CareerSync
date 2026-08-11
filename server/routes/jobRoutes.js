import express from 'express';
import {
  getJobs,
  getJobById,
  getApplicationQuestions,
  applyJob,
  saveJob,
  unsaveJob,
} from '../controllers/jobController.js';
import { authenticateJWT, authorizeStudent } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Public — specific routes BEFORE wildcard /:id
router.get('/', getJobs);
router.get('/questions/:jobId', getApplicationQuestions);
router.get('/:id', getJobById);

// Student-only
router.post('/apply', authenticateJWT, authorizeStudent, upload.single('applicationResume'), applyJob);
router.post('/save', authenticateJWT, authorizeStudent, saveJob);
router.delete('/save/:id', authenticateJWT, authorizeStudent, unsaveJob);

export default router;

