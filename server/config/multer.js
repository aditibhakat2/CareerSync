import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const logosDir = path.join(uploadsDir, 'logos');
const profilesDir = path.join(uploadsDir, 'profiles');
const applicationsDir = path.join(uploadsDir, 'applications');

// Ensure upload directories exist
[uploadsDir, resumesDir, logosDir, profilesDir, applicationsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, resumesDir);
    } else if (file.fieldname === 'applicationResume') {
      cb(null, applicationsDir);
    } else if (file.fieldname === 'company_logo') {
      cb(null, logosDir);
    } else if (file.fieldname === 'profile_photo') {
      cb(null, profilesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume' || file.fieldname === 'applicationResume') {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed for resumes!'));
    }
  } else if (file.fieldname === 'company_logo' || file.fieldname === 'profile_photo') {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only JPG, JPEG, PNG and WEBP images are allowed!'));
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
