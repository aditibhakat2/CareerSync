# 🚀 CareerSync — AI-Powered Career & Placement Platform

**CareerSync** is a full-stack career and placement platform designed to help students prepare for placements, improve their resumes, practice interviews, identify skill gaps, and connect with relevant job opportunities.

---

## ✨ Key Features

### 🎓 Student Portal

- **📄 Resume Assistant**: Build resumes, analyze resume quality and ATS compatibility, and receive personalized improvement suggestions.
- **🎤 AI Mock Interviews**: Practice personalized interview questions with answer evaluation, detailed feedback, and performance summaries.
- **📊 Skill Gap Analysis**: Compare your resume with a target role, identify missing skills, and receive role-specific learning recommendations.
- **💼 Job Search & Applications**: Discover job opportunities, apply to jobs, save opportunities, and track applications.
- **👤 Profile Management**: Manage education, experience, skills, projects, and other profile information.

### 🏢 Recruiter Portal

- **📋 Job Management**: Create, edit, manage, and delete job postings.
- **👥 Applicant Management**: View and manage candidates who apply to posted jobs.
- **🔎 Candidate Screening**: Shortlist or reject applicants.
- **📅 Interview Scheduling**: Schedule interviews with selected candidates.
- **🏢 Company Profile**: Manage recruiter/company information.

### 🛡️ Admin Portal

- **📊 Dashboard**: Monitor platform activity and statistics.
- **🎓 Student Management**: View and manage registered students.
- **🏢 Recruiter Management**: Manage and verify recruiter/company accounts.
- **💼 Job Management**: Monitor and manage job listings.
- **📈 Reports & Analytics**: View platform reports and analytics.

---

## 🤖 AI Features

CareerSync integrates the **Google Gemini API** to power:

- **Resume Analysis** — Evaluate ATS compatibility, identify areas for improvement, and provide personalized recommendations.
- **Mock Interviews** — Generate personalized interview questions and evaluate candidate responses.
- **Interview Evaluation** — Provide question-level feedback, ideal answers, improvement areas, and overall performance summaries.
- **Skill Gap Analysis** — Identify missing skills and generate role-specific learning recommendations.

---

## 🛠️ Tech Stack

### Frontend

- **React.js**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend

- **Node.js**
- **Express.js**
- **REST APIs**

### Database

- **MySQL**

### AI

- **Google Gemini API**
- **@google/genai**

### Authentication & File Processing

- **JWT**
- **bcryptjs**
- **Multer**
- **PDF.js**
- **pdf-parse**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Google Gemini API Key

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/aditibhakat2/CareerSync.git
cd CareerSync
````

#### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and configure the required database, authentication, and Gemini API variables.

#### 3. Database Setup

Create a MySQL database named `careersync` and initialize it using the schema provided in:

```text
server/database/schema.sql
```

#### 4. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder and configure the backend API URL.

#### 5. Run the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

---

## 🔐 Environment Variables

### Backend

The `server/.env` file requires configuration for:

* Server settings
* MySQL database connection
* JWT authentication
* Google Gemini API

### Frontend

The `client/.env` file requires:

* Backend API URL

---

## 📂 Project Structure

```text
CareerSync/
│
├── client/                         # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── company/
│       │   └── student/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── server/                         # Node.js + Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   │   ├── geminiService.js
│   │   └── pdfExtractService.js
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── init.js
│   ├── app.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🧠 How CareerSync Works

### 🎓 Student

```text
Student Profile
      ↓
Resume Assistant
      ↓
Resume Analysis & Improvement
      ↓
Skill Gap Analysis
      ↓
Mock Interview Preparation
      ↓
Job Search & Applications
      ↓
Application Tracking
```

### 🏢 Recruiter

```text
Recruiter Profile
      ↓
Create Job Posting
      ↓
Manage Job Listings
      ↓
Review Applications
      ↓
Screen Candidates
      ↓
Shortlist / Reject
      ↓
Schedule Interviews
```

### 🛡️ Admin

```text
Admin Dashboard
      ↓
Manage Students
      ↓
Manage Recruiters
      ↓
Verify Recruiters
      ↓
Manage Job Listings
      ↓
Monitor Platform Activity
      ↓
View Reports & Analytics
```

---

## 👨‍💻 Developed By

**Aditi Bhakat**

```
```
