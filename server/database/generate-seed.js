/**
 * CareerSync – Seed Generator
 * Writes the complete seed.sql file to server/database/seed.sql
 * Run: node database/generate-seed.js  (from the server directory)
 *
 * NOTE: seed.sql is the file actually used by init.js.
 * Only run this if you need to regenerate seed.sql from scratch.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Real bcrypt hash of 'password123' (salt rounds = 10)
// Verified by: bcrypt.hash('password123', 10)
const PW_HASH = '$2a$10$tu5xx6n/4LWHP1PhycBIxO10TRliC4caCOE72HsFOQoX1RHi2KFwC';

const sql = `-- ============================================================
-- CareerSync – Complete Realistic Demo Seed Data
-- ============================================================
-- Password for ALL accounts: password123
-- Bcrypt hash (rounds=10): ${PW_HASH}
--
-- IDEMPOTENT: Truncates demo tables then re-inserts cleanly.
-- Run via: node database/init.js   OR   import directly in MySQL
-- ============================================================

USE careersync_db;

-- Disable FK checks so TRUNCATE works in any order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE company_verification;
TRUNCATE TABLE skill_gap;
TRUNCATE TABLE mock_interviews;
TRUNCATE TABLE resume_analysis;
TRUNCATE TABLE resumes;
TRUNCATE TABLE saved_jobs;
TRUNCATE TABLE applications;
TRUNCATE TABLE jobs;
TRUNCATE TABLE companies;
TRUNCATE TABLE students;
TRUNCATE TABLE admin;
SET FOREIGN_KEY_CHECKS = 1;

SET @pw = '${PW_HASH}';

-- ============================================================
-- ADMIN (1 row)
-- ============================================================
INSERT INTO admin (admin_id, name, email, password) VALUES
(1, 'CareerSync Admin', 'admin@careersync.in', @pw);

-- ============================================================
-- STUDENTS (35 rows)
-- 25 from Techno Main Salt Lake (TMSL), Kolkata
-- 10 from other Indian colleges
-- All: B.Tech, CSE, Fresher, passing_year=2026
-- ============================================================
INSERT INTO students
  (student_id, name, email, phone, password, college, degree, branch,
   passing_year, cgpa, skills, profile_photo, resume_path) VALUES

-- TMSL Kolkata (IDs 1-25)
(1,  'Aditi Bhakat',         'bhakataditi2@gmail.com',              '+91 97320 11201', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.74, 'C, C++, Java, HTML, CSS, JavaScript',  NULL, NULL),
(2,  'Megha Ghosh',          'meghaghose62@gmail.com',              '+91 97320 11202', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.58, 'Python, SQL, HTML, CSS, JavaScript',   NULL, NULL),
(3,  'Abhimanyu Kumar',      'manyu7549@gmail.com',                 '+91 97320 11203', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.69, 'C, Java, Python, SQL, DBMS',          NULL, NULL),
(4,  'Nilanjan Pradhan',     'nilanjanpradhan940@gmail.com',        '+91 97320 11204', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.36, 'C++, Java, HTML, CSS, Git',           NULL, NULL),
(5,  'Arkadip Patra',        'arkadippatra33@gmail.com',            '+91 97320 11205', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.21, 'Python, SQL, C, HTML, JavaScript',    NULL, NULL),
(6,  'Debjit Ghosh',         'ghoshdjg2005@gmail.com',              '+91 97320 11206', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.05, 'C, C++, SQL, DBMS, Git',              NULL, NULL),
(7,  'Punnag Maiti',         'punnagmaiti2004@gmail.com',           '+91 97320 11207', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.94, 'Java, HTML, CSS, JavaScript, SQL',    NULL, NULL),
(8,  'Nirnay Ghosh',         'ghoshnirnay2@gmail.com',              '+91 97320 11208', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.42, 'Python, C++, SQL, Git, DBMS',         NULL, NULL),
(9,  'Amit Sutradhar',       'amitsaha000123@gmail.com',            '+91 97320 11209', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.88, 'C, Java, HTML, CSS, SQL',             NULL, NULL),
(10, 'Indranil Ganguly',     'indranilganguly012@gmail.com',        '+91 97320 11210', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.11, 'C++, Python, SQL, JavaScript, Git',   NULL, NULL),
(11, 'Arpita Dasgupta',      'arpitadasgupta10b61252005@gmail.com', '+91 97320 11211', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.55, 'Java, SQL, HTML, CSS, DBMS',          NULL, NULL),
(12, 'Pritam Bhunia',        'pritambhunia49@gmail.com',            '+91 97320 11212', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.81, 'C, C++, Python, SQL, Git',            NULL, NULL),
(13, 'Anushtup Dutta',       'anushtupd@gmail.com',                 '+91 97320 11213', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.47, 'Python, JavaScript, HTML, SQL, DBMS', NULL, NULL),
(14, 'Armaan Faaiz',         'armaanfaaizofficial@gmail.com',       '+91 97320 11214', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.76, 'C, Java, SQL, HTML, Git',             NULL, NULL),
(15, 'Aratrika Karmakar',    'aratrikakarmakar754@gmail.com',       '+91 97320 11215', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.62, 'Python, C++, SQL, JavaScript, DBMS',  NULL, NULL),
(16, 'Arghyadip Pakhira',    'arghyadip.info@gmail.com',            '+91 97320 11216', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.92, 'C, Java, HTML, CSS, SQL',             NULL, NULL),
(17, 'Indira Ghosh',         'indiraghosh729@gmail.com',            '+91 97320 11217', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.24, 'Python, SQL, Java, Git, DBMS',        NULL, NULL),
(18, 'Argha Maity',          'arghamaity444@gmail.com',             '+91 97320 11218', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 7.73, 'C++, C, HTML, CSS, SQL',              NULL, NULL),
(19, 'Anas Ahmad',           'anasahmad7271nal@gmail.com',          '+91 97320 11219', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.39, 'Java, Python, SQL, JavaScript, Git',  NULL, NULL),
(20, 'Anwesha Bhattacharya', 'anweshab2020@gmail.com',              '+91 97320 11220', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.84, 'Python, React, SQL, HTML, CSS',       NULL, NULL),
(21, 'Aishik Ray',           'rayaishik321@gmail.com',              '+91 97320 11221', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.18, 'C, C++, Java, SQL, DBMS',             NULL, NULL),
(22, 'Doyel Banerjee',       'banerjeedoyel.2327@gmail.com',        '+91 97320 11222', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.71, 'Python, JavaScript, HTML, CSS, Git',  NULL, NULL),
(23, 'Madhurima Ghosh',      'ghoshmadhurima840@gmail.com',         '+91 97320 11223', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.33, 'Java, SQL, C++, HTML, DBMS',          NULL, NULL),
(24, 'Hrishita Sahoo',       'hrishitaasahoo@gmail.com',            '+91 97320 11224', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.56, 'C, Python, SQL, JavaScript, CSS',     NULL, NULL),
(25, 'Arnab Saha',           'saha.arnab545@gmail.com',             '+91 97320 11225', @pw, 'Techno Main Salt Lake', 'B.Tech', 'Computer Science & Engineering', 2026, 8.29, 'C++, Java, HTML, SQL, Git',           NULL, NULL),

-- Other colleges (IDs 26-35)
(26, 'Rahul Sharma',         'rahulsharma.cse26@jadavpur.edu',      '+91 98310 26001', @pw, 'Jadavpur University',             'B.Tech', 'Computer Science & Engineering', 2026, 8.51, 'C, Java, Python, SQL, DBMS',          NULL, NULL),
(27, 'Sneha Roy',            'sneharoy.cse26@heritageit.edu.in',    '+91 98310 26002', @pw, 'Heritage Institute of Technology', 'B.Tech', 'Computer Science & Engineering', 2026, 7.92, 'HTML, CSS, JavaScript, SQL, Git',     NULL, NULL),
(28, 'Arjun Verma',          'arjunverma.2026@makautstudent.in',    '+91 98310 26003', @pw, 'MAKAUT',                           'B.Tech', 'Computer Science & Engineering', 2026, 7.74, 'C++, Python, SQL, DBMS, HTML',        NULL, NULL),
(29, 'Priya Nair',           'priyanair.iem26@gmail.com',           '+91 98310 26004', @pw, 'IEM Kolkata',                      'B.Tech', 'Computer Science & Engineering', 2026, 8.15, 'Java, SQL, C, HTML, CSS',             NULL, NULL),
(30, 'Karan Singh',          'karansingh.kiit2026@gmail.com',       '+91 98310 26005', @pw, 'KIIT University',                  'B.Tech', 'Computer Science & Engineering', 2026, 8.44, 'Python, React, JavaScript, SQL, Git', NULL, NULL),
(31, 'Riya Das',             'riyadasvit2026@gmail.com',            '+91 98310 26006', @pw, 'VIT Vellore',                      'B.Tech', 'Computer Science & Engineering', 2026, 8.62, 'Java, Python, SQL, C++, DBMS',        NULL, NULL),
(32, 'Aman Gupta',           'amanguptasrm26@gmail.com',            '+91 98310 26007', @pw, 'SRM University',                   'B.Tech', 'Computer Science & Engineering', 2026, 7.88, 'C, HTML, CSS, JavaScript, SQL',       NULL, NULL),
(33, 'Neha Jain',            'nehajain.nit.dgp@gmail.com',          '+91 98310 26008', @pw, 'NIT Durgapur',                     'B.Tech', 'Computer Science & Engineering', 2026, 8.73, 'Python, Java, SQL, C++, Git',         NULL, NULL),
(34, 'Soham Chatterjee',     'sohamchatterjee.rcciit@gmail.com',    '+91 98310 26009', @pw, 'RCCIIT',                           'B.Tech', 'Computer Science & Engineering', 2026, 7.96, 'C, C++, SQL, HTML, DBMS',             NULL, NULL),
(35, 'Ayushi Mishra',        'ayushimishra.tiu26@gmail.com',        '+91 98310 26010', @pw, 'Techno India University',          'B.Tech', 'Computer Science & Engineering', 2026, 8.21, 'Python, JavaScript, HTML, CSS, SQL',  NULL, NULL);

-- ============================================================
-- COMPANIES (15 rows, all verified)
-- ============================================================
INSERT INTO companies
  (company_id, company_name, hr_name, email, phone, website, address, description, password, verified) VALUES

-- Kolkata (6)
(1,  'TCS Kolkata',            'Debarati Mukherjee',  'careers.kolkata@tcs.com',          '+91 33 6619 1234', 'https://www.tcs.com',               'Salt Lake Sector V, Kolkata, West Bengal',      'Tata Consultancy Services – Kolkata delivery centre serving global clients.',            @pw, TRUE),
(2,  'Cognizant Kolkata',      'Somnath Dey',         'hr.kolkata@cognizant.com',          '+91 33 6619 2345', 'https://www.cognizant.com',         'Technopolis, New Town, Kolkata, West Bengal',   'Cognizant Technology Solutions – Digital transformation and IT services.',               @pw, TRUE),
(3,  'PwC Kolkata',            'Rituparna Sen',       'campus.kolkata@pwc.com',            '+91 33 6619 3456', 'https://www.pwc.in',                'Camac Street, Kolkata, West Bengal',            'PricewaterhouseCoopers India – Advisory, Audit and Tax services.',                      @pw, TRUE),
(4,  'Capgemini Kolkata',      'Arnab Bose',          'recruit.kolkata@capgemini.com',     '+91 33 6619 4567', 'https://www.capgemini.com/in',      'Eco Space Business Park, Kolkata, West Bengal', 'Capgemini India – IT outsourcing, consulting and engineering services.',                 @pw, TRUE),
(5,  'LTIMindtree Kolkata',    'Priyanka Chatterjee', 'hr.kolkata@ltimindtree.com',        '+91 33 6619 5678', 'https://www.ltimindtree.com',       'Godrej Waterside, Kolkata, West Bengal',        'LTIMindtree – Technology consulting and digital solutions.',                            @pw, TRUE),
(6,  'Ericsson Kolkata',       'Supriya Ghosh',       'campus.kolkata@ericsson.com',       '+91 33 6619 6789', 'https://www.ericsson.com/en/in',    'Salt Lake Sector V, Kolkata, West Bengal',      'Ericsson India – Telecommunications, networking and ICT solutions.',                    @pw, TRUE),

-- Bengaluru (4)
(7,  'Infosys',                'Anita Desai',         'careers.blr@infosys.com',           '+91 80 2852 0261', 'https://www.infosys.com',           'Electronics City, Bengaluru, Karnataka',        'Infosys Limited – Global IT services, consulting and next-gen technology solutions.',    @pw, TRUE),
(8,  'Wipro Technologies',     'Rajesh Kumar',        'campus.blr@wipro.com',              '+91 80 2844 0011', 'https://www.wipro.com',             'Sarjapur Road, Bengaluru, Karnataka',           'Wipro – IT, consulting and business process services for global enterprises.',          @pw, TRUE),
(9,  'Accenture India',        'Divya Menon',         'campus.india@accenture.com',        '+91 80 6660 4000', 'https://www.accenture.com/in',      'Manyata Tech Park, Bengaluru, Karnataka',       'Accenture – Strategy, consulting, digital, technology and operations services.',        @pw, TRUE),
(10, 'IBM India',              'Vikram Rao',          'campus@in.ibm.com',                 '+91 80 2677 7000', 'https://www.ibm.com/in-en',         'Embassy Golf Links, Bengaluru, Karnataka',      'IBM India – Cloud, AI, data analytics and enterprise technology services.',             @pw, TRUE),

-- Hyderabad (2)
(11, 'Deloitte India',         'Meenakshi Sharma',    'campus.hyd@deloitte.com',           '+91 40 6674 3000', 'https://www2.deloitte.com/in',      'Mindspace Madhapur, Hyderabad, Telangana',      'Deloitte India – Audit, consulting, financial advisory and risk advisory.',             @pw, TRUE),
(12, 'Tech Mahindra',          'Sanjay Patil',        'campus.hyd@techmahindra.com',       '+91 40 6695 1234', 'https://www.techmahindra.com',      'HITEC City, Hyderabad, Telangana',              'Tech Mahindra – Digital transformation, IT services and BPO solutions.',               @pw, TRUE),

-- Pune (2)
(13, 'Persistent Systems',     'Kavita Joshi',        'campus.pune@persistent.com',        '+91 20 6703 0000', 'https://www.persistent.com',        'Pingala Nihira, Baner Road, Pune, Maharashtra', 'Persistent Systems – Software product development and IT services.',                   @pw, TRUE),
(14, 'Zensar Technologies',    'Akash Kulkarni',      'campus.pune@zensar.com',            '+91 20 6604 5000', 'https://www.zensar.com',            'Pune IT Park, Yerwada, Pune, Maharashtra',      'Zensar Technologies – Digital and technology solutions for global enterprises.',        @pw, TRUE),

-- Gurgaon (1)
(15, 'American Express India', 'Shreya Agarwal',      'campus.india@aexp.com',             '+91 124 280 2000', 'https://www.americanexpress.com/in', 'DLF Cyber City, Gurgaon, Haryana',             'American Express India – Financial services, payments and customer experience.',        @pw, TRUE);

-- ============================================================
-- JOBS (45 rows, ~40% Kolkata)
-- ============================================================
INSERT INTO jobs
  (job_id, company_id, title, description, responsibilities, required_skills,
   salary, experience, location, job_type, remote_option, deadline, vacancies, education, status) VALUES

-- TCS Kolkata (jobs 1-3)
(1,  1, 'Graduate Engineer Trainee',
 'TCS recruits fresh B.Tech graduates for its GETs program in Kolkata. You will be trained in enterprise technologies and deployed on client projects.',
 'Attend TCS Initial Learning Program; Work on real client assignments; Write and test code as guided by senior engineers.',
 'C, C++, Java, SQL, DBMS', '3.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-12-31', 30, 'B.Tech/B.E. in any discipline', 'Active'),

(2,  1, 'Associate Software Engineer – Java',
 'Join TCS Kolkata as an Associate Software Engineer focused on Java-based enterprise application development.',
 'Develop Java modules; Write unit tests; Collaborate with cross-functional teams; Participate in agile sprints.',
 'Core Java, SQL, JDBC, Basic Spring, Git', '4.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-11-30', 20, 'B.Tech CS/IT', 'Active'),

(3,  1, 'Software Development Intern',
 'A 6-month internship at TCS Kolkata for final-year students. Stipend-based with PPO on successful completion.',
 'Shadow senior developers; Contribute to sprint tasks; Write documentation and unit tests.',
 'Java, Python, SQL, HTML, CSS', '18000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'On-site', '2026-10-31', 10, 'Final year B.Tech pursuing', 'Active'),

-- Cognizant Kolkata (jobs 4-6)
(4,  2, 'Programmer Analyst Trainee',
 'Cognizant Kolkata hires fresh graduates as Programmer Analyst Trainees. Comprehensive GenC training provided.',
 'Complete GenC learning path; Contribute to live projects; Understand client requirements and document solutions.',
 'C, Java, SQL, HTML, CSS', '4 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-12-15', 25, 'B.Tech/BCA in CS/IT', 'Active'),

(5,  2, 'Python Developer Intern',
 'Cognizant offers a 3-month Python internship at its Kolkata office for students interested in backend automation.',
 'Develop Python scripts; Work with REST APIs; Maintain code quality and write documentation.',
 'Python, SQL, REST APIs, Git, DBMS', '15000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'Hybrid', '2026-09-30', 8, 'B.Tech pursuing or passed out 2026', 'Active'),

(6,  2, 'QA Engineer – Entry Level',
 'Join the Quality Assurance team at Cognizant Kolkata. Work with manual and automated testing frameworks.',
 'Write test cases; Execute regression testing; Report and track bugs; Work with Selenium basics.',
 'Manual Testing, SQL, Basic Selenium, DBMS, Excel', '3.8 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-11-30', 12, 'B.Tech/B.Sc. CS/IT', 'Active'),

-- PwC Kolkata (jobs 7-9)
(7,  3, 'Associate – Technology Consulting',
 'PwC Kolkata is hiring fresh B.Tech graduates for its technology consulting practice.',
 'Conduct client workshops; Assist in technology assessment; Prepare presentations and reports.',
 'SQL, Python, Excel, Communication, DBMS', '7 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'Hybrid', '2026-12-31', 5, 'B.Tech CS/IT or equivalent', 'Active'),

(8,  3, 'Data Analyst Intern',
 'A 6-month paid data analyst internship at PwC Kolkata working on financial and operational datasets.',
 'Clean and analyse data; Build dashboards; Write SQL queries for reporting; Present findings.',
 'SQL, Python, Excel, Data Visualization, DBMS', '20000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'Hybrid', '2026-10-15', 4, 'B.Tech pursuing final year', 'Active'),

(9,  3, 'Junior Software Developer',
 'PwC Technology India Kolkata is hiring junior developers to work on internal digital tools and client-facing web applications.',
 'Build web modules; Collaborate with UX and backend teams; Participate in daily stand-ups.',
 'JavaScript, HTML, CSS, SQL, Git', '6.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-11-30', 6, 'B.Tech CS/IT', 'Active'),

-- Capgemini Kolkata (jobs 10-12)
(10, 4, 'Analyst – Application Development',
 'Capgemini Kolkata is hiring fresher Analysts for its application development team.',
 'Develop and maintain enterprise applications; Write clean code; Participate in code reviews.',
 'Java, SQL, HTML, CSS, Git', '4.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-12-31', 15, 'B.Tech any discipline', 'Active'),

(11, 4, 'React Frontend Intern',
 'A 6-month frontend internship at Capgemini Kolkata. Hands-on training on React and modern web development.',
 'Build React components; Implement UI from Figma designs; Write reusable and testable code.',
 'HTML, CSS, JavaScript, React, Git', '15000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'Hybrid', '2026-09-30', 5, 'B.Tech pursuing 2026 passout', 'Active'),

(12, 4, 'Junior QA Tester',
 'Join Capgemini Kolkata quality team. You will learn testing methodologies and tools on the job.',
 'Execute test cases; Log defects; Participate in UAT; Document test results.',
 'Manual Testing, SQL, Excel, Basic Python', '3.8 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-11-15', 8, 'B.Tech CS/IT/ECE', 'Active'),

-- LTIMindtree Kolkata (jobs 13-15)
(13, 5, 'Software Engineer Trainee',
 'LTIMindtree Kolkata hires fresh engineers through its flagship GET program.',
 'Join induction training; Work in agile teams; Contribute to client delivery; Learn cloud tools.',
 'C, C++, Java, SQL, DBMS', '4.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-12-31', 20, 'B.Tech/B.E. in any branch', 'Active'),

(14, 5, 'Full Stack Intern',
 'LTIMindtree offers a 3-month full stack internship at Kolkata for students with basic web dev skills.',
 'Work on React frontend and Node.js backend tasks; Write API integrations; Review pull requests.',
 'HTML, CSS, JavaScript, React, Node.js, SQL', '18000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'Remote', '2026-10-15', 6, 'B.Tech pursuing final year', 'Active'),

(15, 5, 'Junior Data Analyst',
 'LTIMindtree is looking for a Junior Data Analyst to work on business intelligence reporting in Kolkata.',
 'Write and optimise SQL queries; Prepare monthly reports; Build Excel dashboards; Present findings.',
 'SQL, Excel, Python, DBMS, Data Visualization', '5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-11-30', 4, 'B.Tech CS/Statistics/Data Science', 'Active'),

-- Ericsson Kolkata (jobs 16-18)
(16, 6, 'Graduate Engineer – Networks',
 'Ericsson Kolkata is hiring fresh B.Tech graduates for its networks and telecom division.',
 'Support network deployment; Learn 5G and LTE protocols; Document technical configurations.',
 'C, C++, SQL, Networking Basics, Linux', '5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'On-site', '2026-12-31', 8, 'B.Tech CS/ECE/IT', 'Active'),

(17, 6, 'Backend Developer Intern',
 'A 6-month internship at Ericsson Kolkata focusing on backend Java microservices development.',
 'Develop REST APIs; Write unit tests; Participate in code reviews; Learn microservices patterns.',
 'Java, SQL, REST APIs, Git, DBMS', '20000/month', 'Fresher', 'Kolkata, West Bengal', 'Internship', 'On-site', '2026-10-31', 4, 'B.Tech pursuing 2026 passout', 'Active'),

(18, 6, 'Software Engineer – Python',
 'Ericsson Kolkata needs a junior Python Engineer to build automation tools and data pipelines.',
 'Write Python scripts for automation; Build REST API clients; Maintain CI/CD pipelines basics.',
 'Python, SQL, REST APIs, Git, Linux Basics', '5.5 LPA', 'Fresher', 'Kolkata, West Bengal', 'Full Time', 'Hybrid', '2026-11-30', 5, 'B.Tech CS/IT', 'Active'),

-- Infosys Bengaluru (jobs 19-21)
(19, 7, 'Systems Engineer',
 'Infosys Bengaluru hires Systems Engineers for its diverse global delivery teams.',
 'Complete Infosys induction training; Work on client-assigned projects; Mentor incoming trainees.',
 'C, Java, SQL, DBMS, HTML', '3.6 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'On-site', '2026-12-31', 50, 'B.Tech/B.E. any discipline', 'Active'),

(20, 7, 'React Frontend Developer',
 'Infosys product team needs a fresher React Developer for an enterprise digital banking platform.',
 'Build UI components in React; Integrate REST APIs; Ensure cross-browser compatibility.',
 'HTML, CSS, JavaScript, React, SQL, Git', '8 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'Hybrid', '2026-11-30', 5, 'B.Tech CS/IT', 'Active'),

(21, 7, 'Machine Learning Intern',
 'Infosys AI Labs offers a 6-month ML internship for students interested in data science and AI.',
 'Preprocess datasets; Train basic ML models; Evaluate model accuracy; Document results.',
 'Python, SQL, NumPy, Pandas, Basic ML', '25000/month', 'Fresher', 'Bengaluru, Karnataka', 'Internship', 'Hybrid', '2026-10-15', 6, 'B.Tech CS/IT/Data Science pursuing', 'Active'),

-- Wipro Bengaluru (jobs 22-24)
(22, 8, 'Project Engineer',
 'Wipro hires fresh engineers as Project Engineers across multiple service lines.',
 'Join Wipro training academy; Contribute to delivery milestones; Shadow senior consultants.',
 'C, Java, SQL, DBMS, Git', '3.5 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'On-site', '2026-12-31', 40, 'B.Tech/B.E. any discipline', 'Active'),

(23, 8, 'Python Developer',
 'Wipro Analytics team needs fresher Python Developers to build backend APIs and data processing scripts.',
 'Write Python REST APIs using Flask; Optimise SQL queries; Create automated test scripts.',
 'Python, SQL, Flask, REST APIs, Git', '6 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'Hybrid', '2026-11-30', 8, 'B.Tech CS/IT', 'Active'),

(24, 8, 'Software Development Intern – Full Stack',
 'Wipro Bengaluru offers a 3-month full stack internship. Pre-placement offer based on performance.',
 'Develop React components; Build Node.js API endpoints; Test and document features.',
 'HTML, CSS, JavaScript, React, Node.js, SQL', '20000/month', 'Fresher', 'Bengaluru, Karnataka', 'Internship', 'Remote', '2026-09-30', 10, 'B.Tech pursuing final year', 'Active'),

-- Accenture Bengaluru (jobs 25-27)
(25, 9, 'Associate Software Engineer',
 'Accenture India hires fresh graduates as Associate Software Engineers through its ASE program.',
 'Attend technology bootcamp; Work across client teams; Participate in innovation challenges.',
 'C, Java, SQL, HTML, CSS, Git', '4.5 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'On-site', '2026-12-31', 35, 'B.Tech/B.E. any discipline', 'Active'),

(26, 9, 'Full Stack Developer – Junior',
 'Accenture Digital team needs a junior Full Stack Developer for its enterprise product engineering group.',
 'Build React frontends; Develop Node.js APIs; Write SQL queries; Perform code reviews.',
 'HTML, CSS, JavaScript, React, Node.js, SQL', '7.5 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'Hybrid', '2026-11-30', 6, 'B.Tech CS/IT', 'Active'),

(27, 9, 'Data Analyst Intern',
 'Accenture Analytics Bengaluru offers a 6-month data analyst internship with real client data exposure.',
 'Query databases; Create visualisation reports; Present findings; Support senior analysts.',
 'SQL, Python, Excel, DBMS, Data Visualization', '22000/month', 'Fresher', 'Bengaluru, Karnataka', 'Internship', 'Hybrid', '2026-10-31', 5, 'B.Tech CS/Stats pursuing', 'Active'),

-- IBM Bengaluru (jobs 28-30)
(28, 10, 'Application Developer',
 'IBM India Bengaluru hires fresh Application Developers to work on enterprise cloud and AI solutions.',
 'Develop microservices; Write unit tests; Contribute to CI/CD pipelines; Assist in deployments.',
 'Java, Python, SQL, Git, REST APIs', '6.5 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'Hybrid', '2026-12-31', 12, 'B.Tech CS/IT', 'Active'),

(29, 10, 'Backend Developer Intern',
 'IBM Bengaluru offers a 6-month backend internship. Strong mentorship and possible PPO.',
 'Build REST APIs in Java or Python; Write test cases; Document API specifications.',
 'Java, SQL, REST APIs, DBMS, Git', '25000/month', 'Fresher', 'Bengaluru, Karnataka', 'Internship', 'On-site', '2026-10-31', 6, 'B.Tech CS/IT pursuing final year', 'Active'),

(30, 10, 'QA Engineer – Junior',
 'IBM India QA team needs a fresher QA Engineer to test enterprise software applications.',
 'Write and run test plans; Log defects in JIRA; Execute regression and smoke tests.',
 'Manual Testing, SQL, Excel, DBMS, Basic Selenium', '5 LPA', 'Fresher', 'Bengaluru, Karnataka', 'Full Time', 'On-site', '2026-11-30', 8, 'B.Tech CS/IT/ECE', 'Active'),

-- Deloitte Hyderabad (jobs 31-33)
(31, 11, 'Consultant – Technology',
 'Deloitte Hyderabad is hiring fresh graduates for its technology consulting practice.',
 'Work on IT advisory engagements; Prepare client decks; Analyse technology landscapes.',
 'SQL, Python, Excel, DBMS, Communication', '7.5 LPA', 'Fresher', 'Hyderabad, Telangana', 'Full Time', 'Hybrid', '2026-12-31', 8, 'B.Tech CS/IT or equivalent', 'Active'),

(32, 11, 'Junior Software Developer',
 'Deloitte Technology Hyderabad is expanding its product engineering team and needs junior developers.',
 'Develop and maintain web modules; Write clean JavaScript/Python code; Participate in sprints.',
 'JavaScript, Python, SQL, HTML, CSS, Git', '6.5 LPA', 'Fresher', 'Hyderabad, Telangana', 'Full Time', 'On-site', '2026-11-30', 6, 'B.Tech CS/IT', 'Active'),

(33, 11, 'Machine Learning Intern',
 'Deloitte AI Center Hyderabad offers a 6-month ML internship on client data science projects.',
 'Build classification models; Preprocess data; Create Jupyter notebooks; Document experiments.',
 'Python, SQL, NumPy, Pandas, Basic ML, Git', '22000/month', 'Fresher', 'Hyderabad, Telangana', 'Internship', 'Hybrid', '2026-10-31', 4, 'B.Tech CS/Data Science pursuing', 'Active'),

-- Tech Mahindra Hyderabad (jobs 34-36)
(34, 12, 'Software Engineer – GET',
 'Tech Mahindra hires Graduate Engineer Trainees for its Hyderabad delivery unit.',
 'Complete onboarding program; Work on client infrastructure projects; Document technical processes.',
 'C, Java, SQL, DBMS, HTML', '3.8 LPA', 'Fresher', 'Hyderabad, Telangana', 'Full Time', 'On-site', '2026-12-31', 20, 'B.Tech/B.E. any branch', 'Active'),

(35, 12, 'Java Developer – Junior',
 'Tech Mahindra Hyderabad needs a junior Java Developer for its telecom domain enterprise applications.',
 'Write Spring Boot microservices; Write unit tests; Participate in daily stand-ups; Review code.',
 'Core Java, SQL, Spring Basics, JDBC, Git', '5.5 LPA', 'Fresher', 'Hyderabad, Telangana', 'Full Time', 'On-site', '2026-11-30', 8, 'B.Tech CS/IT', 'Active'),

(36, 12, 'Frontend Intern',
 'Tech Mahindra Hyderabad offers a 3-month frontend internship on live enterprise portal projects.',
 'Build and style React components; Integrate REST APIs; Test cross-browser compatibility.',
 'HTML, CSS, JavaScript, React, Git', '15000/month', 'Fresher', 'Hyderabad, Telangana', 'Internship', 'Hybrid', '2026-09-30', 5, 'B.Tech pursuing 2026 passout', 'Active'),

-- Persistent Systems Pune (jobs 37-39)
(37, 13, 'Software Engineer',
 'Persistent Systems Pune hires fresh Software Engineers for its product engineering practice.',
 'Develop features for product clients; Write clean modular code; Participate in sprints.',
 'Java, SQL, HTML, CSS, Git, DBMS', '5 LPA', 'Fresher', 'Pune, Maharashtra', 'Full Time', 'On-site', '2026-12-31', 15, 'B.Tech CS/IT', 'Active'),

(38, 13, 'Python Backend Developer',
 'Persistent Pune needs a fresher Python developer for its cloud automation team.',
 'Write Python automation scripts; Build Flask REST APIs; Create test suites; Maintain documentation.',
 'Python, Flask, SQL, REST APIs, Git', '6 LPA', 'Fresher', 'Pune, Maharashtra', 'Full Time', 'Hybrid', '2026-11-30', 6, 'B.Tech CS/IT', 'Active'),

(39, 13, 'Full Stack Intern',
 'A 6-month full stack internship at Persistent Pune. Pre-placement offer for high performers.',
 'Develop React pages; Build Express APIs; Write SQL queries; Test and document features.',
 'HTML, CSS, JavaScript, React, Node.js, SQL', '20000/month', 'Fresher', 'Pune, Maharashtra', 'Internship', 'On-site', '2026-10-31', 5, 'B.Tech pursuing final year', 'Active'),

-- Zensar Pune (jobs 40-42)
(40, 14, 'Associate Engineer',
 'Zensar Technologies Pune recruits fresh associates for its digital services division.',
 'Work on enterprise application modules; Attend knowledge sessions; Participate in code reviews.',
 'Java, SQL, HTML, CSS, DBMS', '4 LPA', 'Fresher', 'Pune, Maharashtra', 'Full Time', 'On-site', '2026-12-31', 12, 'B.Tech/B.E. CS/IT/ECE', 'Active'),

(41, 14, 'QA Test Engineer Intern',
 'Zensar Pune offers a 3-month QA internship for students interested in software quality engineering.',
 'Write test plans; Execute manual test cases; Log and track defects; Prepare test reports.',
 'Manual Testing, SQL, Excel, DBMS, Basic Python', '12000/month', 'Fresher', 'Pune, Maharashtra', 'Internship', 'On-site', '2026-09-30', 4, 'B.Tech pursuing 2026 passout', 'Active'),

(42, 14, 'Junior Data Analyst',
 'Zensar Pune Analytics team needs a junior data analyst to support reporting and BI activities.',
 'Write SQL queries; Prepare data reports; Create Excel and Power BI dashboards; Clean datasets.',
 'SQL, Excel, Python, DBMS, Data Visualization', '4.5 LPA', 'Fresher', 'Pune, Maharashtra', 'Full Time', 'On-site', '2026-11-30', 4, 'B.Tech CS/Stats/Data Science', 'Active'),

-- American Express Gurgaon (jobs 43-45)
(43, 15, 'Technology Analyst',
 'American Express India Gurgaon hires fresh Technology Analysts for its enterprise payment engineering teams.',
 'Develop and test payment processing modules; Write clean code; Participate in design reviews.',
 'Java, SQL, REST APIs, DBMS, Git', '9 LPA', 'Fresher', 'Gurgaon, Haryana', 'Full Time', 'Hybrid', '2026-12-31', 10, 'B.Tech CS/IT', 'Active'),

(44, 15, 'Software Engineer Intern',
 'American Express Gurgaon offers a 6-month software engineering internship with exposure to global fintech products.',
 'Contribute to API development; Write unit tests; Shadow senior engineers; Attend architecture discussions.',
 'Java, Python, SQL, REST APIs, Git', '30000/month', 'Fresher', 'Gurgaon, Haryana', 'Internship', 'On-site', '2026-10-31', 5, 'B.Tech CS/IT pursuing final year', 'Active'),

(45, 15, 'Junior React Developer',
 'American Express India needs a junior React Developer for its customer-facing digital products.',
 'Build and maintain React UI components; Integrate APIs; Ensure responsive design; Write tests.',
 'HTML, CSS, JavaScript, React, SQL, Git', '8.5 LPA', 'Fresher', 'Gurgaon, Haryana', 'Full Time', 'Hybrid', '2026-11-30', 6, 'B.Tech CS/IT', 'Active');

-- ============================================================
-- APPLICATIONS (46 rows, ~66% of students have applied)
-- ============================================================
INSERT INTO applications
  (application_id, student_id, job_id, resume_used, status, applied_date) VALUES
(1,  1,  1,  'Aditi_Bhakat_Resume.pdf',         'Shortlisted',         '2026-07-15 10:00:00'),
(2,  1,  4,  'Aditi_Bhakat_Resume.pdf',          'Under Review',        '2026-07-18 11:00:00'),
(3,  1,  13, 'Aditi_Bhakat_Resume.pdf',          'Applied',             '2026-07-20 09:00:00'),
(4,  2,  10, 'Megha_Ghosh_Resume.pdf',           'Applied',             '2026-07-16 10:30:00'),
(5,  2,  17, 'Megha_Ghosh_Resume.pdf',           'Under Review',        '2026-07-19 11:30:00'),
(6,  3,  1,  'Abhimanyu_Kumar_Resume.pdf',       'Under Review',        '2026-07-14 09:00:00'),
(7,  3,  5,  'Abhimanyu_Kumar_Resume.pdf',        'Applied',             '2026-07-17 10:00:00'),
(8,  3,  7,  'Abhimanyu_Kumar_Resume.pdf',        'Shortlisted',         '2026-07-20 14:00:00'),
(9,  4,  13, 'Nilanjan_Pradhan_Resume.pdf',      'Applied',             '2026-07-18 10:00:00'),
(10, 4,  16, 'Nilanjan_Pradhan_Resume.pdf',      'Shortlisted',         '2026-07-21 09:30:00'),
(11, 5,  11, 'Arkadip_Patra_Resume.pdf',         'Interview Scheduled', '2026-07-15 11:00:00'),
(12, 5,  3,  'Arkadip_Patra_Resume.pdf',         'Applied',             '2026-07-19 10:00:00'),
(13, 6,  6,  'Debjit_Ghosh_Resume.pdf',          'Applied',             '2026-07-17 09:00:00'),
(14, 6,  14, 'Debjit_Ghosh_Resume.pdf',          'Applied',             '2026-07-20 10:00:00'),
(15, 7,  2,  'Punnag_Maiti_Resume.pdf',          'Applied',             '2026-07-16 14:00:00'),
(16, 8,  8,  'Nirnay_Ghosh_Resume.pdf',          'Under Review',        '2026-07-18 09:00:00'),
(17, 8,  1,  'Nirnay_Ghosh_Resume.pdf',          'Applied',             '2026-07-21 10:00:00'),
(18, 9,  4,  'Amit_Sutradhar_Resume.pdf',        'Applied',             '2026-07-19 11:00:00'),
(19, 10, 18, 'Indranil_Ganguly_Resume.pdf',      'Shortlisted',         '2026-07-15 10:00:00'),
(20, 10, 12, 'Indranil_Ganguly_Resume.pdf',      'Applied',             '2026-07-18 11:00:00'),
(21, 11, 1,  'Arpita_Dasgupta_Resume.pdf',       'Interview Scheduled', '2026-07-14 09:00:00'),
(22, 11, 9,  'Arpita_Dasgupta_Resume.pdf',       'Applied',             '2026-07-20 10:00:00'),
(23, 13, 15, 'Anushtup_Dutta_Resume.pdf',        'Applied',             '2026-07-17 09:00:00'),
(24, 13, 5,  'Anushtup_Dutta_Resume.pdf',        'Shortlisted',         '2026-07-21 10:00:00'),
(25, 15, 7,  'Aratrika_Karmakar_Resume.pdf',     'Selected',            '2026-07-13 10:00:00'),
(26, 15, 2,  'Aratrika_Karmakar_Resume.pdf',     'Under Review',        '2026-07-17 09:00:00'),
(27, 20, 1,  'Anwesha_Bhattacharya_Resume.pdf',  'Shortlisted',         '2026-07-14 10:00:00'),
(28, 20, 10, 'Anwesha_Bhattacharya_Resume.pdf',  'Applied',             '2026-07-18 11:00:00'),
(29, 20, 9,  'Anwesha_Bhattacharya_Resume.pdf',  'Interview Scheduled', '2026-07-21 09:00:00'),
(30, 22, 13, 'Doyel_Banerjee_Resume.pdf',        'Under Review',        '2026-07-16 10:00:00'),
(31, 22, 16, 'Doyel_Banerjee_Resume.pdf',        'Applied',             '2026-07-19 11:00:00'),
(32, 25, 3,  'Arnab_Saha_Resume.pdf',            'Interview Scheduled', '2026-07-15 09:00:00'),
(33, 25, 6,  'Arnab_Saha_Resume.pdf',            'Rejected',            '2026-07-19 10:00:00'),
(34, 26, 19, 'Rahul_Sharma_Resume.pdf',          'Shortlisted',         '2026-07-14 09:00:00'),
(35, 26, 22, 'Rahul_Sharma_Resume.pdf',          'Applied',             '2026-07-18 11:00:00'),
(36, 30, 25, 'Karan_Singh_Resume.pdf',           'Under Review',        '2026-07-16 10:00:00'),
(37, 30, 24, 'Karan_Singh_Resume.pdf',           'Applied',             '2026-07-20 09:00:00'),
(38, 31, 28, 'Riya_Das_Resume.pdf',              'Interview Scheduled', '2026-07-15 10:00:00'),
(39, 31, 31, 'Riya_Das_Resume.pdf',              'Shortlisted',         '2026-07-19 11:00:00'),
(40, 33, 37, 'Neha_Jain_Resume.pdf',             'Selected',            '2026-07-13 09:00:00'),
(41, 33, 26, 'Neha_Jain_Resume.pdf',             'Shortlisted',         '2026-07-17 10:00:00'),
(42, 33, 43, 'Neha_Jain_Resume.pdf',             'Applied',             '2026-07-21 11:00:00'),
(43, 34, 1,  'Soham_Chatterjee_Resume.pdf',      'Applied',             '2026-07-18 09:00:00'),
(44, 34, 16, 'Soham_Chatterjee_Resume.pdf',      'Applied',             '2026-07-20 10:00:00'),
(45, 35, 3,  'Ayushi_Mishra_Resume.pdf',         'Applied',             '2026-07-17 10:00:00'),
(46, 35, 5,  'Ayushi_Mishra_Resume.pdf',         'Under Review',        '2026-07-20 11:00:00');

-- ============================================================
-- SAVED JOBS (25 rows)
-- ============================================================
INSERT INTO saved_jobs (saved_job_id, student_id, job_id, saved_date) VALUES
(1,  1,  2,  '2026-07-10 10:00:00'),
(2,  1,  7,  '2026-07-12 11:00:00'),
(3,  2,  1,  '2026-07-11 09:00:00'),
(4,  2,  4,  '2026-07-13 10:00:00'),
(5,  3,  13, '2026-07-09 09:00:00'),
(6,  4,  15, '2026-07-10 10:00:00'),
(7,  4,  2,  '2026-07-11 11:00:00'),
(8,  5,  10, '2026-07-12 09:00:00'),
(9,  6,  16, '2026-07-10 10:00:00'),
(10, 8,  7,  '2026-07-09 11:00:00'),
(11, 8,  15, '2026-07-13 10:00:00'),
(12, 10, 17, '2026-07-11 09:00:00'),
(13, 11, 14, '2026-07-10 11:00:00'),
(14, 13, 13, '2026-07-12 10:00:00'),
(15, 15, 9,  '2026-07-09 09:00:00'),
(16, 20, 11, '2026-07-11 10:00:00'),
(17, 20, 7,  '2026-07-13 09:00:00'),
(18, 22, 15, '2026-07-10 11:00:00'),
(19, 25, 2,  '2026-07-11 10:00:00'),
(20, 26, 20, '2026-07-09 09:00:00'),
(21, 26, 25, '2026-07-13 10:00:00'),
(22, 30, 43, '2026-07-10 09:00:00'),
(23, 31, 29, '2026-07-12 10:00:00'),
(24, 33, 38, '2026-07-09 11:00:00'),
(25, 35, 4,  '2026-07-11 09:00:00');

-- ============================================================
-- NOTIFICATIONS (15 rows)
-- ============================================================
INSERT INTO notifications (user_id, user_type, title, message, read_status) VALUES
(1,  'Student', 'Application Shortlisted',  'Congratulations! TCS Kolkata has shortlisted your application for Graduate Engineer Trainee.', FALSE),
(1,  'Student', 'New Job Match',             'A new job matching your skills was posted by PwC Kolkata. Check it out!', FALSE),
(3,  'Student', 'Application Shortlisted',  'PwC Kolkata has shortlisted your application for Associate – Technology Consulting!', FALSE),
(5,  'Student', 'Interview Scheduled',      'Capgemini Kolkata has scheduled a technical interview for React Frontend Intern.', FALSE),
(8,  'Student', 'Application Under Review', 'Your application for Data Analyst Intern at PwC Kolkata is under review.', FALSE),
(11, 'Student', 'Interview Scheduled',      'TCS Kolkata has invited you for a technical interview for Graduate Engineer Trainee!', FALSE),
(15, 'Student', 'Application Selected',     'Congratulations! PwC Kolkata has selected you for Associate – Technology Consulting.', FALSE),
(20, 'Student', 'Application Shortlisted',  'Your application at TCS Kolkata for Graduate Engineer Trainee has been shortlisted!', FALSE),
(25, 'Student', 'Interview Scheduled',      'TCS Kolkata has scheduled a technical round interview for Software Development Intern.', FALSE),
(26, 'Student', 'Application Shortlisted',  'Infosys has shortlisted your application for Systems Engineer!', FALSE),
(33, 'Student', 'Application Selected',     'Persistent Systems has selected you for Software Engineer. Offer letter will follow shortly.', FALSE),
(1,  'Company', 'New Applicants',           '6 students applied for Graduate Engineer Trainee this week.', FALSE),
(3,  'Company', 'New Applicants',           '3 students applied for Associate – Technology Consulting.', FALSE),
(7,  'Company', 'New Applicant',            'Rahul Sharma applied for Systems Engineer at Infosys.', FALSE),
(13, 'Company', 'New Applicant',            'Neha Jain applied for Software Engineer at Persistent Systems.', FALSE);

-- ============================================================
-- COMPANY VERIFICATION (15 rows, all Verified)
-- ============================================================
INSERT INTO company_verification (company_id, status, remarks, verified_date) VALUES
(1,  'Verified', 'Corporate domain and tax ID verified',   NOW()),
(2,  'Verified', 'HR credentials and domain verified',     NOW()),
(3,  'Verified', 'Official company registration verified', NOW()),
(4,  'Verified', 'Corporate domain verified',              NOW()),
(5,  'Verified', 'HR email and company ID verified',       NOW()),
(6,  'Verified', 'Ericsson official domain verified',      NOW()),
(7,  'Verified', 'Infosys domain and GST verified',        NOW()),
(8,  'Verified', 'Wipro corporate credentials verified',   NOW()),
(9,  'Verified', 'Accenture official domain verified',     NOW()),
(10, 'Verified', 'IBM India registration verified',        NOW()),
(11, 'Verified', 'Deloitte India domain verified',         NOW()),
(12, 'Verified', 'Tech Mahindra credentials verified',     NOW()),
(13, 'Verified', 'Persistent Systems domain verified',     NOW()),
(14, 'Verified', 'Zensar Technologies domain verified',    NOW()),
(15, 'Verified', 'American Express India domain verified', NOW());

-- ============================================================
-- SUMMARY
--   admin              : 1
--   students           : 35  (25 TMSL Kolkata + 10 others)
--   companies          : 15  (6 Kolkata, 4 Bengaluru, 2 Hyderabad, 2 Pune, 1 Gurgaon)
--   jobs               : 45  (18 Kolkata = 40%, rest distributed)
--   applications       : 46  (23 students = 66% applied)
--   saved_jobs         : 25
--   notifications      : 15
--   company_verif.     : 15
-- ============================================================
`;

const outputPath = resolve(__dirname, 'seed.sql');
writeFileSync(outputPath, sql, 'utf8');
console.log('seed.sql written to:', outputPath);
