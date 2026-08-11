import express from 'express';
import { registerStudent, registerCompany, loginUser, getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);
router.post('/login', loginUser);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, upload.fields([{ name: 'profile_photo', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), updateProfile);
router.put('/change-password', authenticateJWT, changePassword);
router.delete('/delete-account', authenticateJWT, deleteAccount);

export default router;
