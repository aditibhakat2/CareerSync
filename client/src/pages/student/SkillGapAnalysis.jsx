import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Target, Upload, AlertTriangle, CheckCircle2, BookOpen,
  Clock, TrendingUp, Lightbulb, Star, Zap, Code,
  RotateCcw, ChevronDown, User, BarChart2, Calendar,
  Award, FileText, Brain
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';

// ── Constants ──────────────────────────────────────────────────────────────
const PRESET_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Java Developer',
  'Python Developer',
  'React Developer',
  'Node.js Developer',
  'Data Analyst',
  'Data Scientist',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'QA Engineer',
  'Cyber Security Analyst',
];

const LOADING_MESSAGES = [
  'Uploading Resume…',
  'Reading Resume…',
  'Understanding Skills…',
  'Comparing With Target Role…',
  'Finding Skill Gaps…',
  'Preparing Learning Plan…',
  'Generating Personalized Report…',
];

const PRIORITY_CONFIG = {
  HIGH:   { bg: 'bg-rose-100',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-500'   },
  MEDIUM: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  LOW:    { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-200',    dot: 'bg-sky-500'    },
};

// ── Stars component ─────────────────────────────────────────────────────────
function StarRow({ count = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < count ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

// ── Progress bar ────────────────────────────────────────────────────────────
function SkillBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-extrabold text-slate-800">{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Match ring ──────────────────────────────────────────────────────────────
function MatchRing({ pct }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct) / 100;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>{pct}%</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Match</span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export const SkillGapAnalysis = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading,    setLoading]    = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error,      setError]      = useState('');

  const [resumeFile, setResumeFile]  = useState(null);
  const [roleChoice, setRoleChoice]  = useState('Full Stack Developer');
  const [customRole, setCustomRole]  = useState('');
  const [analysis,   setAnalysis]    = useState(null);
  const [history,    setHistory]     = useState([]);

  const msgIntervalRef = useRef(null);

  // Effective role
  const effectiveRole = roleChoice === 'Other' ? customRole.trim() : roleChoice;

  // ── Load history on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    api.get('/ai/skill-gap/history')
      .then(res => { if (res.data.success) setHistory(res.data.history || []); })
      .catch(() => {}); // silently ignore
  }, [user]);

  // ── Rotating loading messages ─────────────────────────────────────────
  const startMessages = useCallback(() => {
    let idx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    msgIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 2000);
  }, []);

  const stopMessages = useCallback(() => {
    clearInterval(msgIntervalRef.current);
    msgIntervalRef.current = null;
    setLoadingMsg('');
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile) {
      showToast('Please upload your PDF resume.', 'error');
      return;
    }
    if (roleChoice === 'Other' && !customRole.trim()) {
      showToast('Please enter your target role.', 'error');
      return;
    }
    if (!effectiveRole) {
      showToast('Please select a target role.', 'error');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    startMessages();

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('targetRole', effectiveRole);

      const res = await api.post('/ai/skill-gap', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAnalysis(res.data.result);
        showToast('Skill gap analysis complete!', 'success');

        // Refresh history
        api.get('/ai/skill-gap/history')
          .then(r => { if (r.data.success) setHistory(r.data.history || []); })
          .catch(() => {});
      } else {
        throw new Error(res.data.error || 'Analysis failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unable to analyze your resume. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      stopMessages();
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError('');
    setResumeFile(null);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-5 lg:p-7 overflow-x-hidden">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Target className="w-6 h-6 text-rose-600" />
                Skill Gap Analysis
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Upload your resume · Select a target role · Get a personalized learning roadmap
              </p>
            </div>
            {analysis && (
              <button onClick={reset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white border
                           border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> New Analysis
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ══════════════════════════════════════════
                LEFT COLUMN — setup form + history
            ══════════════════════════════════════════ */}
            <div className="space-y-5">

              {/* Setup Form */}
              <form onSubmit={handleAnalyze} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> Configure Analysis
                </h3>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Resume (PDF only)
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed
                    rounded-xl cursor-pointer transition-colors ${
                      resumeFile
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-slate-300 hover:border-primary/50 hover:bg-indigo-50/30'
                    }`}>
                    <Upload className={`w-7 h-7 ${resumeFile ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold text-slate-700 text-center">
                      {resumeFile ? resumeFile.name : 'Click to upload PDF'}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF only · max 5 MB</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (!f.name.toLowerCase().endsWith('.pdf')) {
                          showToast('Only PDF files are accepted.', 'error'); return;
                        }
                        if (f.size > 5 * 1024 * 1024) {
                          showToast('File exceeds 5 MB limit.', 'error'); return;
                        }
                        setResumeFile(f);
                      }}
                    />
                  </label>
                  {resumeFile && (
                    <button type="button" onClick={() => setResumeFile(null)}
                      className="text-[10px] text-rose-500 hover:underline font-bold">
                      × Remove file
                    </button>
                  )}
                </div>

                {/* Target Role */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Role
                  </label>
                  <div className="relative">
                    <select
                      value={roleChoice}
                      onChange={e => setRoleChoice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                                 font-semibold text-slate-800 appearance-none focus:outline-none focus:border-primary"
                    >
                      {PRESET_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                      <option value="Other">Other (custom role)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {roleChoice === 'Other' && (
                    <input
                      type="text"
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                      placeholder="e.g. Blockchain Developer"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
                                 font-semibold text-slate-800 focus:outline-none focus:border-primary"
                    />
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600
                             text-white font-extrabold text-sm rounded-xl shadow-md shadow-rose-600/20
                             flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {loadingMsg || 'Analyzing…'}
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Analyze Skill Gap
                    </>
                  )}
                </button>
              </form>

              {/* Analysis History */}
              {history.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Analysis History
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, i) => {
                      const d = new Date(item.createdAt);
                      const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                      return (
                        <div key={item.id || i}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.targetRole}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                          </div>
                          {item.matchPct != null && (
                            <span className="text-sm font-extrabold text-primary">{item.matchPct}%</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center">
                    Track your improvement over time
                  </p>
                </div>
              )}

              {/* Info card */}
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-4 flex gap-3">
                <Zap className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800 mb-1">How it works</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Upload your resume as a PDF. Gemini reads your skills, projects, education, and experience,
                    then compares them to your chosen target role. Every report is unique to your profile.
                  </p>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                RIGHT COLUMN — loading / empty / report
            ══════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-5">

              {/* Loading */}
              {loading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center
                                justify-center min-h-[480px] space-y-7 p-10">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-orange-400 animate-spin"
                      style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                    <Brain className="absolute inset-0 m-auto w-9 h-9 text-rose-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-slate-800 animate-pulse">{loadingMsg}</p>
                    <p className="text-xs text-slate-400">Gemini is reading your resume carefully…</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && !analysis && !error && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center
                                justify-center min-h-[400px] space-y-4 p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <Target className="w-8 h-8 text-rose-400" />
                  </div>
                  <p className="text-base font-bold text-slate-800">Ready for Analysis</p>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Upload your resume PDF and select a target role to receive a full AI-powered skill gap report.
                  </p>
                </div>
              )}

              {/* Error (no analysis) */}
              {!loading && !analysis && error && (
                <div className="bg-white rounded-2xl border border-rose-200 shadow-sm flex flex-col items-center
                                justify-center min-h-[300px] space-y-4 p-10 text-center">
                  <AlertTriangle className="w-10 h-10 text-rose-400" />
                  <p className="text-sm font-bold text-slate-800">Analysis Failed</p>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{error}</p>
                  {error?.toLowerCase().includes('api key') && (
                    <p className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-2">
                      Set GEMINI_API_KEY in server/.env to enable AI analysis
                    </p>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════
                  REPORT
              ══════════════════════════════════════ */}
              {!loading && analysis && (
                <div className="space-y-5">

                  {/* ── Hero card: match + readiness ──────────────────── */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4">
                      AI Skill Gap Report · {effectiveRole}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      {/* Match ring */}
                      <div className="flex flex-col items-center gap-2">
                        <MatchRing pct={analysis.match_percentage || 0} />
                        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Role Match</p>
                      </div>

                      {/* Interview Readiness */}
                      <div className="text-center space-y-2">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Interview Readiness</p>
                        <StarRow count={analysis.interview_readiness_stars || 0} />
                        <p className="text-sm font-bold text-amber-300">{analysis.interview_readiness_label}</p>
                      </div>

                      {/* Time to ready */}
                      <div className="text-center space-y-2">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Time to Job Ready</p>
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          <span className="text-2xl font-extrabold text-cyan-300">{analysis.estimated_time_to_job_ready}</span>
                        </div>
                        <p className="text-[10px] text-white/40">~2-3 hours/day</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Skills row: current + missing ─────────────────── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Current Skills */}
                    <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Current Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.current_skills || []).map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.missing_skills || []).map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg border border-rose-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Strengths + Areas to Improve ──────────────────── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Strengths
                      </h3>
                      <ul className="space-y-1.5">
                        {(analysis.strengths || []).map((s, i) => (
                          <li key={i} className="flex gap-2 text-xs text-emerald-900">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Areas to Improve
                      </h3>
                      <ul className="space-y-1.5">
                        {(analysis.areas_to_improve || []).map((a, i) => (
                          <li key={i} className="flex gap-2 text-xs text-amber-900">
                            <span className="text-amber-500 font-bold shrink-0">→</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ── Skill-wise Progress Bars ───────────────────────── */}
                  {analysis.skill_category_scores && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" /> Skill-wise Analysis
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(analysis.skill_category_scores).map(([cat, score]) => (
                          <SkillBar key={cat} label={cat} value={score} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Priority Learning Plan ─────────────────────────── */}
                  {(analysis.priority_learning_plan || []).length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Priority Learning Plan
                      </h3>
                      <div className="space-y-3">
                        {/* Table header */}
                        <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="col-span-2">Priority</div>
                          <div className="col-span-4">Topic</div>
                          <div className="col-span-6">Why It Matters</div>
                        </div>
                        {analysis.priority_learning_plan.map((item, i) => {
                          const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.LOW;
                          return (
                            <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-start">
                              <div className="col-span-12 sm:col-span-2 flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                  {item.priority}
                                </span>
                              </div>
                              <div className="col-span-12 sm:col-span-4 text-xs font-bold text-slate-800">{item.topic}</div>
                              <div className="col-span-12 sm:col-span-6 text-xs text-slate-600 leading-relaxed">{item.reason}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Projects to Build ─────────────────────────────── */}
                  {(analysis.recommended_projects || []).length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" /> Projects to Build
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysis.recommended_projects.map((proj, i) => (
                          <div key={i}
                            className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-extrabold
                                               flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed pl-8">{proj.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Career Mentor Advice ───────────────────────────── */}
                  {analysis.career_mentor_advice && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">
                            Career Mentor Advice
                          </p>
                          <p className="text-sm text-white/90 leading-relaxed italic">
                            "{analysis.career_mentor_advice}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New analysis button */}
                  <button
                    onClick={reset}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm
                               rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Analyze Another Resume
                  </button>

                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
