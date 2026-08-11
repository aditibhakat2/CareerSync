import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, BarChart2, Video,
  Target, Building, CheckCircle2, ArrowRight,
  ChevronDown, ChevronUp, TrendingUp, Lock, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { JobCard } from '../components/cards/JobCard';

// ── Featured jobs (India-localized, realistic) ─────────────────────────────
const FEATURED_JOBS = [
  {
    job_id: 1,
    company_name: 'Infosys Limited',
    title: 'Frontend Developer (React)',
    location: 'Bengaluru, Karnataka',
    salary: '₹8 LPA – ₹12 LPA',
    experience: '0–2 years',
    job_type: 'Full Time',
    remote_option: 'Hybrid',
    required_skills: 'React, JavaScript, Tailwind CSS, REST APIs',
    description: 'Join our engineering team to build scalable React frontends powering enterprise products.',
    created_at: new Date(),
  },
  {
    job_id: 2,
    company_name: 'Wipro Technologies',
    title: 'Backend Engineer (Node.js & MySQL)',
    location: 'Hyderabad, Telangana',
    salary: '₹10 LPA – ₹16 LPA',
    experience: '1–3 years',
    job_type: 'Full Time',
    remote_option: 'On-site',
    required_skills: 'Node.js, Express, MySQL, JWT, Redis',
    description: 'Architect RESTful APIs and authentication systems for fintech products.',
    created_at: new Date(),
  },
  {
    job_id: 3,
    company_name: 'Cognizant Technology Solutions',
    title: 'Full Stack Intern',
    location: 'Pune, Maharashtra',
    salary: '₹25,000 / month',
    experience: 'Fresher',
    job_type: 'Internship',
    remote_option: 'Remote',
    required_skills: 'React, Node.js, JavaScript, SQL',
    description: 'Hands-on internship for CS undergraduates. Build real products under senior mentorship.',
    created_at: new Date(),
  },
];

// ── Top hiring companies ──────────────────────────────────────────────────
const TOP_COMPANIES = [
  { name: 'Infosys',          location: 'Bengaluru & Pune'    },
  { name: 'Wipro',            location: 'Hyderabad & Chennai' },
  { name: 'TCS',              location: 'Mumbai & Bengaluru'  },
  { name: 'Cognizant',        location: 'Chennai & Pune'      },
  { name: 'HCL Technologies', location: 'Noida & Bengaluru'   },
  { name: 'Tech Mahindra',    location: 'Pune & Hyderabad'    },
  { name: 'Mphasis',          location: 'Bengaluru'           },
  { name: 'Persistent',       location: 'Pune & Nagpur'       },
];

// ── Core features ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'Resume Assistant',
    description: 'Build ATS-friendly resumes, analyze resume quality, and receive personalized suggestions.',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    title: 'Job Search',
    description: 'Explore verified jobs and apply through a streamlined application process.',
    icon: Search,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'AI Mock Interview',
    description: 'Practice technical and HR interviews with personalized questions and feedback.',
    icon: Video,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Compare your skills with target roles and receive a personalized learning roadmap.',
    icon: Target,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    title: 'Recruiter Portal',
    description: 'Post jobs, manage applicants, review resumes, and track recruitment efficiently.',
    icon: Building,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
];

// ── FAQs ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How does AI Resume Analysis work?',
    a: 'Upload your PDF resume or paste your resume text. The system checks your resume for keyword alignment, formatting, and section structure, providing personalized scores and actionable improvement suggestions.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your personal information, resume documents, and interview data are stored securely and never shared with unauthorized third parties.',
  },
  {
    q: 'Can recruiters post unlimited jobs?',
    a: 'Verified recruiter accounts can post job listings, review applicant profiles and resumes, and manage recruitment workflows through their dedicated company dashboard.',
  },
  {
    q: 'Is CareerSync free?',
    a: 'Yes! CareerSync is completely free for all registered students preparing for campus and off-campus placements.',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery]     = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [openFaq, setOpenFaq]             = useState(null);

  // Redirect logged-in users
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === 'student')       navigate('/student/dashboard',  { replace: true });
      else if (role === 'company')  navigate('/company/dashboard',  { replace: true });
      else if (role === 'admin')    navigate('/admin/dashboard',    { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  // All search/location actions redirect to login for unauthenticated users
  const goToLogin = (e) => {
    e?.preventDefault?.();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-14 pb-16 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Build. Prepare. Get Hired.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Everything You Need to{' '}
                <br className="hidden sm:inline" />
                <span className="text-gradient">Get Hired</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Analyze your resume for ATS compatibility, receive personalized improvement suggestions, practice mock interviews, identify skill gaps, and apply to verified job opportunities—all from one platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-base
                             rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200
                             flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-300 hover:border-slate-400
                             text-slate-800 font-bold text-base rounded-xl shadow-sm hover:shadow transition-all text-center"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
                {['Resume Assistant', 'Verified Recruiters', 'Mock Interview', 'Skill Gap Analysis'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — feature showcase */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 relative z-10">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    CS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">CareerSync Platform</h4>
                    <p className="text-xs text-slate-500">Everything you need for placements</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { emoji: '📄', title: 'AI Resume Assistant', desc: 'Build ATS-friendly resumes, analyze your resume, and receive personalized improvement suggestions.' },
                    { emoji: '💼', title: 'Job Search',         desc: 'Discover verified job opportunities and apply through a seamless application process.' },
                    { emoji: '🎤', title: 'Mock Interview',     desc: 'Practice personalized interview questions and receive detailed feedback and a summary of your performance.' },
                    { emoji: '📊', title: 'Skill Gap Analysis', desc: 'Compare your resume with your target role to identify missing skills and areas for improvement.' },
                  ].map((feat) => (
                    <div key={feat.title} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xl shrink-0">{feat.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{feat.title}</p>
                        <p className="text-[11px] text-slate-500">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/register"
                  className="block w-full text-center py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Get Started Free →
                </Link>
              </div>
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl -z-0" />
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR (redirects to login) ───────────────────────────────── */}
      <section className="bg-white py-7 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={goToLogin}
            className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border border-slate-200">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Role, skills (React, Java, DSA)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={goToLogin}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400 cursor-pointer"
                readOnly
              />
            </div>
            <div className="flex-1 flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location (Bengaluru, Hyderabad, Remote…)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onFocus={goToLogin}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400 cursor-pointer"
                readOnly
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm
                         rounded-xl transition-all duration-200 shadow-sm shrink-0 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Sign In to Search
            </button>
          </form>

          {/* Quick location chips → login */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={goToLogin}
                className="px-3 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-600
                           hover:border-primary/40 hover:text-primary rounded-full transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Handpicked Opportunities</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Featured Jobs &amp; Internships</h2>
            </div>
            <button
              onClick={goToLogin}
              className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 self-start md:self-auto"
            >
              View All Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_JOBS.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onApply={goToLogin}
                onSave={goToLogin}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">All-in-One Toolkit</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Everything You Need for Career Success
            </h2>
            <p className="text-sm text-slate-500">
              CareerSync integrates every step of your placement journey into one seamless workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-primary/30
                             hover:shadow-card-lg transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TOP HIRING COMPANIES ──────────────────────────────────────────── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Active Hiring Partners</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Top Hiring Companies</h2>
            <p className="text-sm text-slate-500 mt-2">These companies have active job postings on CareerSync.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TOP_COMPANIES.map((comp, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-lg hover:border-primary/20 transition-all text-center space-y-3 group"
              >
                {/* Logo placeholder */}
                <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-lg border border-indigo-100">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1">
                    {comp.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{comp.location}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Recruiter
                  </span>
                </div>
                <button
                  onClick={goToLogin}
                  className="w-full py-1.5 text-[11px] font-bold text-primary border border-primary/30 rounded-lg
                             hover:bg-primary hover:text-white transition-all"
                >
                  View Jobs
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="about" className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Got Questions?</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-sm hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
