# CareerSync — Connecting Talent. Creating Opportunities.

A full-stack web application that serves as a one-stop career platform for students and companies — combining job search, AI-powered resume tools, mock interviews, skill gap analysis, and a company hiring portal.

> **Built as a high-quality resume/portfolio project for CS placement interviews.**

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js (MVC Architecture) |
| **Database** | MySQL with connection pooling |
| **AI** | Google Gemini API (`@google/genai`) |
| **Auth** | JWT + bcryptjs |
| **File Upload** | Multer |
| **PDF Parsing** | pdf-parse |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
CareerSync/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/               # JobCard, ApplicantCard, AnalyticsCard, SkeletonLoader
│   │   │   └── common/              # Navbar, Footer, Sidebar, Loader, Modal, EmptyState, Toast
│   │   ├── context/                 # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboard, Students, Companies, Jobs, Reports, Settings
│   │   │   ├── company/             # Dashboard, Profile, PostJob, ManageJobs, Applicants, Settings
│   │   │   ├── student/             # Dashboard, Profile, Resume, AI tools, MockInterview, SkillGap
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── JobsPortalPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx                  # Main router with lazy loading + route guards
│   │   ├── main.jsx                 # React DOM entry point
│   │   └── index.css                # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                          # Node.js Backend (Express MVC)
    ├── config/
    │   ├── db.js                    # MySQL pool + memory store fallback
    │   ├── jwt.js                   # JWT sign/verify helpers
    │   └── multer.js                # File upload config
    ├── controllers/                 # Auth, Student, Company, Job, Resume, AI, Admin
    ├── middleware/
    │   └── authMiddleware.js        # JWT auth + role verification
    ├── routes/                      # Express routes for each domain
    ├── services/
    │   ├── geminiService.js         # Gemini AI: Resume Gen, Analyzer, Interview, Skill Gap
    │   └── pdfExtractService.js     # PDF text extraction (pdf-parse)
    ├── database/
    │   ├── schema.sql               # 12-table MySQL schema
    │   ├── seed.sql                 # Sample data
    │   └── init.js                  # DB initialization script
    ├── app.js                       # Express app setup + middleware
    ├── server.js                    # HTTP server entry point
    ├── .env                         # Environment variables (do NOT commit)
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- Google Gemini API Key (free tier available)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CareerSync.git
cd CareerSync
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create the `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=careersync
DB_USER=root
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

Initialize the database:

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE careersync;"

# Run schema
mysql -u root -p careersync < database/schema.sql

# Run seed data (optional)
mysql -u root -p careersync < database/seed.sql
```

Start the backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Default Test Credentials

After running the seed data, you can log in with:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@test.com` | `password123` |
| **Company** | `company@test.com` | `password123` |
| **Admin** | `admin@careersync.com` | `admin123456` |

---

## 🤖 AI Features (Gemini API)

All AI features are powered by the **Google Gemini API**. You need a valid API key for these features to work:

1. **AI Resume Generator** — Generates a full professional resume from your profile data
2. **ATS Resume Analyzer** — Analyzes resume against a job description, gives an ATS score
3. **Mock Interview** — Conducts a simulated technical interview with AI feedback
4. **Skill Gap Analysis** — Identifies missing skills for your target role

Get a free Gemini API key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 🏗️ API Endpoints Summary

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user (student/company) |
| POST | `/login` | Login and receive JWT token |
| GET | `/me` | Get current user profile |
| PUT | `/change-password` | Update user password |
| DELETE | `/delete-account` | Delete user account |

### Student Routes (`/api/student`) — JWT required, role: student
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Student dashboard metrics |
| GET/PUT | `/profile` | Get or update student profile |
| POST | `/apply/:jobId` | Apply to a job |
| GET | `/applied-jobs` | All applied jobs |
| POST | `/save/:jobId` | Save a job |
| GET | `/saved-jobs` | All saved jobs |
| DELETE | `/unsave/:jobId` | Remove saved job |

### Company Routes (`/api/company`) — JWT required, role: company
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Company dashboard metrics |
| GET/PUT | `/profile` | Get or update company profile |
| POST | `/post-job` | Create a job listing |
| GET | `/jobs` | Get all company job listings |
| PUT | `/edit-job/:id` | Edit a job listing |
| DELETE | `/delete-job/:id` | Delete a job listing |
| GET | `/applicants/:jobId` | Get applicants for a job |
| PUT | `/applicant-status` | Update application status |
| POST | `/schedule-interview` | Schedule a candidate interview |

### AI Routes (`/api/ai`) — JWT required
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate-resume` | AI resume generation |
| POST | `/analyze-resume` | ATS score analysis |
| POST | `/mock-interview` | AI mock interview session |
| POST | `/skill-gap` | Skill gap analysis |

### Admin Routes (`/api/admin`) — JWT required, role: admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Platform stats |
| GET | `/students` | Paginated student list |
| DELETE | `/students/:id` | Remove student |
| GET | `/companies` | Paginated company list |
| PUT | `/companies/:id/verify` | Verify/reject company |
| DELETE | `/companies/:id` | Remove company |
| GET | `/jobs` | All job listings |
| DELETE | `/jobs/:id` | Remove job listing |
| GET | `/reports` | Platform analytics |

---

## 🎨 Features Overview

### 🧑‍🎓 Student Portal
- Dashboard with application metrics and activity timeline
- Complete profile management (education, experience, skills, projects)
- Job portal with search + multi-filter (type, remote, experience, salary)
- Save jobs and track applications with real-time status
- Resume Builder (form-based with PDF download preview)
- AI Resume Generator (Gemini-powered)
- ATS Resume Analyzer with score and recommendations
- AI Mock Interview (interactive Q&A with instant feedback)
- Skill Gap Analysis for any target role

### 🏢 Company Portal
- Dashboard with hiring metrics (applications, shortlisted, interviews)
- Company profile management
- Post job listings with rich details
- Manage all job postings (edit, close, delete)
- Applicant management (shortlist, reject, schedule interviews)
- Interview scheduler with meeting link and mode selection

### 🛡️ Admin Panel
- Platform-wide metrics dashboard
- Student management with search and pagination
- Company verification queue + management
- Job moderation (view, delete inappropriate listings)
- Reports with analytics charts and CSV export
- Admin settings (password, platform configuration)

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend (Render)
1. Create new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root to `server/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env`

---

## 📝 License

This project is built for educational/portfolio purposes. Free to use for personal projects.

---

**Made with ❤️ by [Your Name] — CareerSync | CS Placement Portfolio Project**
