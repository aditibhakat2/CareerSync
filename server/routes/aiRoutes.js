import express from 'express';
import {
  handleGenerateResume,
  handleAnalyzeResume,
  handleStartMockInterview,
  handleEvaluateMockInterview,
  handleSkillGapAnalysis,
  handleGetSkillGapHistory,
} from '../controllers/aiController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.post('/resume/generate', handleGenerateResume);
router.post('/resume/analyze', upload.single('resume'), handleAnalyzeResume);
router.post('/interview/start', upload.single('resume'), handleStartMockInterview);
router.post('/interview/evaluate', handleEvaluateMockInterview);
router.post('/skill-gap', upload.single('resume'), handleSkillGapAnalysis);
router.get('/skill-gap/history', authenticateJWT, handleGetSkillGapHistory);

export default router;

