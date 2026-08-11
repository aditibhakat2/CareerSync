-- CareerSync Database Schema
-- MySQL Relational Database Creation Script

CREATE DATABASE IF NOT EXISTS careersync_db;
USE careersync_db;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  college VARCHAR(150),
  degree VARCHAR(100),
  branch VARCHAR(100),
  passing_year INT,
  cgpa DECIMAL(3,2),
  skills TEXT,
  linkedin VARCHAR(255),
  github VARCHAR(255),
  portfolio VARCHAR(255),
  profile_photo VARCHAR(255),
  resume_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  hr_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  website VARCHAR(255),
  address TEXT,
  description TEXT,
  password VARCHAR(255) NOT NULL,
  company_logo VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT,
  required_skills TEXT NOT NULL,
  salary VARCHAR(100) NOT NULL,
  experience VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  job_type VARCHAR(50) NOT NULL, -- Full Time, Part Time, Internship
  remote_option VARCHAR(50) DEFAULT 'On-site', -- Remote, Hybrid, On-site
  deadline DATE,
  vacancies INT DEFAULT 1,
  education VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active', -- Active, Closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  resume_used VARCHAR(255),
  cover_letter TEXT,
  application_answers JSON,
  status VARCHAR(50) DEFAULT 'Applied', -- Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- 5. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
  saved_job_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- 6. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  resume_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  template_name VARCHAR(50) DEFAULT 'Modern',
  resume_pdf VARCHAR(255),
  ats_score INT DEFAULT 0,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 7. Resume Analysis Table
CREATE TABLE IF NOT EXISTS resume_analysis (
  analysis_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  resume_id INT,
  grammar_score INT DEFAULT 8,
  format_score INT DEFAULT 8,
  keyword_score INT DEFAULT 7,
  overall_score DECIMAL(3,1) DEFAULT 7.5,
  suggestions JSON,
  missing_skills JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 8. Mock Interviews Table
CREATE TABLE IF NOT EXISTS mock_interviews (
  interview_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  category VARCHAR(50) NOT NULL, -- HR, Technical, Mixed
  subject VARCHAR(100) NOT NULL,
  score INT DEFAULT 80,
  feedback TEXT,
  confidence VARCHAR(50),
  technical_accuracy VARCHAR(50),
  communication VARCHAR(50),
  weak_points TEXT,
  strong_points TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 9. Skill Gap Table
CREATE TABLE IF NOT EXISTS skill_gap (
  gap_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  desired_role VARCHAR(100) NOT NULL,
  missing_skills JSON,
  roadmap JSON,
  recommended_projects JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- Student, Company, Admin
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Admin Table
CREATE TABLE IF NOT EXISTS admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Company Verification Table
CREATE TABLE IF NOT EXISTS company_verification (
  verification_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Verified, Rejected
  remarks TEXT,
  verified_date TIMESTAMP NULL,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 13. Application Questions Table (Per-Job Configurable Questions)
CREATE TABLE IF NOT EXISTS application_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  question_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);
