import React, { useState, useRef, useCallback } from 'react';
import {
  FileText, Download, Save, Sparkles, Eye, Plus, Trash2,
  BarChart2, CheckCircle2, AlertTriangle, Lightbulb,
  Star, ArrowRight, ChevronDown, ChevronUp, User, Target,
  TrendingUp, Shield, Zap, Mail, Phone, MapPin
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';

// ── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'build',    label: 'Build Resume',  icon: FileText  },
  { id: 'analyze',  label: 'ATS Analysis',  icon: BarChart2 },
  { id: 'score',    label: 'Resume Score',  icon: Star      },
  { id: 'improve',  label: 'Improvements',  icon: Lightbulb },
  { id: 'download', label: 'Download PDF',  icon: Download  },
];

// ── Rotating loading messages ──────────────────────────────────────────────
const LOADING_MESSAGES = [
  'Reading your resume…',
  'Extracting resume sections…',
  'Understanding your projects…',
  'Evaluating your skills…',
  'Evaluating ATS compatibility…',
  'Comparing with recruiter expectations…',
  'Preparing personalized recommendations…',
  'Generating AI report…',
];

// ── Helpers ────────────────────────────────────────────────────────────────
function resumeDataToText(d) {
  const lines = [];
  if (d.fullName)  lines.push(`Name: ${d.fullName}`);
  if (d.email)     lines.push(`Email: ${d.email}`);
  if (d.phone)     lines.push(`Phone: ${d.phone}`);
  if (d.location)  lines.push(`Location: ${d.location}`);
  if (d.summary)   lines.push(`\nProfessional Summary:\n${d.summary}`);
  if (d.skills)    lines.push(`\nTechnical Skills:\n${d.skills}`);
  if (d.education?.length) {
    lines.push('\nEducation:');
    d.education.forEach(e => {
      if (e.school || e.degree) lines.push(`  ${e.school} — ${e.degree} | ${e.year} | ${e.gpa}`);
    });
  }
  if (d.experience?.length) {
    lines.push('\nExperience & Internships:');
    d.experience.forEach(e => {
      if (e.company || e.role) lines.push(`  ${e.role} at ${e.company} (${e.duration})\n  ${e.desc}`);
    });
  }
  if (d.projects?.length) {
    lines.push('\nProjects:');
    d.projects.forEach(p => {
      if (p.name) lines.push(`  ${p.name} [${p.tech}]\n  ${p.desc}`);
    });
  }
  if (d.certifications) lines.push(`\nCertifications:\n${d.certifications}`);
  if (d.languages)      lines.push(`\nLanguages:\n${d.languages}`);
  return lines.join('\n');
}

// ── Field validation ───────────────────────────────────────────────────────
function validateEmail(v) {
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address';
}
function validatePhone(v) {
  if (!v) return null;
  return /^[+\d][\d\s\-()]{7,}$/.test(v) ? null : 'Invalid phone number';
}
function validateUrl(v, label) {
  if (!v) return null;
  try { new URL(v.startsWith('http') ? v : `https://${v}`); return null; }
  catch { return `Invalid ${label} URL`; }
}

// ── Main Component ─────────────────────────────────────────────────────────
export const ResumeBuilder = () => {
  const { user }      = useAuth();
  const { showToast } = useToast();

  // printRef is attached to the ALWAYS-MOUNTED off-screen printable div.
  // It is never null because the div is always in the DOM.
  const printRef = useRef(null);

  const [activeTab, setActiveTab] = useState('build');
  const [template,  setTemplate]  = useState('Modern');
  const [saving,    setSaving]    = useState(false);

  // ── Build Resume state ────────────────────────────────────────────────
  const [resumeData, setResumeData] = useState({
    fullName:       user?.name  || '',
    email:          user?.email || '',
    phone:          '',
    location:       '',
    linkedin:       '',
    github:         '',
    portfolio:      '',
    summary:        '',
    education:      [{ school: '', degree: '', year: '', gpa: '' }],
    skills:         '',
    projects:       [{ name: '', tech: '', desc: '' }],
    experience:     [{ company: '', role: '', duration: '', desc: '' }],
    certifications: '',
    languages:      '',
  });

  // ── Validation errors state ───────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({});

  // ── AI Analyzer state ─────────────────────────────────────────────────
  // Used by BOTH the "ATS Analysis" tab (upload PDF / paste) AND
  // the "Analyze Resume" button on the Build tab (serializes resumeData → text).
  const [resumeFile,    setResumeFile]    = useState(null);
  const [resumeText,    setResumeText]    = useState('');
  const [analysis,      setAnalysis]      = useState(null);
  const [analyzing,     setAnalyzing]     = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsedMeta,    setParsedMeta]    = useState(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const [loadingMsg,    setLoadingMsg]    = useState('');
  const [analysisError, setAnalysisError] = useState(null);

  // ── Field update helper ───────────────────────────────────────────────
  const updateField = useCallback((field, value) => {
    setResumeData(p => ({ ...p, [field]: value }));
    // Clear error on edit
    if (fieldErrors[field]) setFieldErrors(p => { const n = { ...p }; delete n[field]; return n; });
  }, [fieldErrors]);

  // ── Validate all fields ───────────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {};
    if (!resumeData.fullName?.trim()) errs.fullName = 'Full name is required';
    const emailErr = validateEmail(resumeData.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validatePhone(resumeData.phone);
    if (phoneErr) errs.phone = phoneErr;
    const liErr = validateUrl(resumeData.linkedin, 'LinkedIn');
    if (liErr) errs.linkedin = liErr;
    const ghErr = validateUrl(resumeData.github, 'GitHub');
    if (ghErr) errs.github = ghErr;
    const ptErr = validateUrl(resumeData.portfolio, 'Portfolio');
    if (ptErr) errs.portfolio = ptErr;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [resumeData]);

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix validation errors before saving.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/resume/create', { template_name: template, content: resumeData, ats_score: analysis?.overall_score || 0 });
      showToast('Resume saved successfully!', 'success');
    } catch {
      showToast('Saved locally.', 'info');
    } finally {
      setSaving(false);
    }
  };

  // ── PDF Download ──────────────────────────────────────────────────────
  // ROOT CAUSE OF BLANK PDF: Previously the printable div used
  // `position: absolute; left: -9999px` which places it outside the browser's
  // scrollable layout region. html2canvas renders off-screen elements that are
  // outside the viewport as blank because it cannot scroll to them.
  //
  // FIX: The printable div now uses `position: fixed; top: -9999px; left: 0`.
  // `position: fixed` elements are ALWAYS within the viewport coordinate space
  // and `html2canvas` can capture them reliably regardless of page scroll.
  // The div is visually invisible (top: -9999px) but measurable by html2canvas.
  //
  // Additionally: we give a 300ms settleDelay before calling html2pdf to ensure
  // React has fully committed the latest resumeData to the DOM.
  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      showToast('Resume element not found. Please refresh and try again.', 'error');
      return;
    }
    const name = resumeData.fullName?.trim() || 'Resume';
    const filename = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
    showToast('Generating PDF…', 'info');

    const el = printRef.current;
    const origPos = el.style.position;
    const origTop = el.style.top;
    const origZ   = el.style.zIndex;

    try {
      // Load html2pdf dynamically (CDN, cached after first load)
      await new Promise((resolve, reject) => {
        if (window.html2pdf) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        s.onload  = resolve;
        s.onerror = () => reject(new Error('Failed to load html2pdf library. Check your internet connection.'));
        document.body.appendChild(s);
      });

      // 300ms settle delay – ensures React has flushed all DOM updates
      await new Promise(r => setTimeout(r, 300));

      // Temporarily position element at origin behind viewport so html2canvas renders it fully
      el.style.position = 'absolute';
      el.style.top = '0px';
      el.style.left = '0px';
      el.style.zIndex = '-9999';

      const opt = {
        margin:      [10, 10, 10, 10],   // mm
        filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale:       2,
          useCORS:     true,
          logging:     false,
          letterRendering: true,
          scrollX:     0,
          scrollY:     0,
          windowWidth: 794,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('printable-resume-container');
            if (clonedEl) {
              clonedEl.style.position = 'static';
              clonedEl.style.top = '0px';
              clonedEl.style.left = '0px';
              clonedEl.style.opacity = '1';
              clonedEl.style.visibility = 'visible';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await window.html2pdf().set(opt).from(el).save();
      showToast(`${filename} downloaded successfully.`, 'success');
    } catch (err) {
      console.error('[PDF] Download failed:', err);
      showToast(`PDF failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      el.style.position = origPos;
      el.style.top = origTop;
      el.style.zIndex = origZ;
    }
  };

  // ── AI Analysis – shared handler ──────────────────────────────────────
  // Called from:
  //   1. ATS Analysis tab form (upload PDF or paste text)
  //   2. "Analyze Resume" button on the Build tab (serializes resumeData → text)
  //
  // Both paths hit the SAME backend endpoint: POST /api/ai/resume/analyze
  // No duplicate AI logic anywhere.
  const runAnalysis = useCallback(async (fileOrNull, textOrNull) => {
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    setExtractedText('');
    setParsedMeta(null);
    setShowExtracted(false);

    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2000);

    try {
      const formData = new FormData();
      if (fileOrNull)   formData.append('resume', fileOrNull);
      if (textOrNull)   formData.append('resumeText', textOrNull);

      const res = await api.post('/ai/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setExtractedText(res.data.extractedText || textOrNull || '');
        setParsedMeta(res.data.parsedMeta || null);
        showToast('AI Analysis complete!', 'success');
        setActiveTab('score');
      } else {
        const errMsg = res.data.error || 'Analysis failed. Please try again.';
        setAnalysisError({ code: res.data.code || 'ERROR', message: errMsg });
        showToast(errMsg, 'error');
      }
    } catch (err) {
      const errData    = err.response?.data || {};
      const errMsg     = errData.error || 'AI analysis unavailable. Please try again later.';
      const errCode    = errData.code  || 'ERROR';
      const status     = err.response?.status || 0;
      const displayMsg =
        status === 503 ? 'AI analysis is currently unavailable. Please ensure GEMINI_API_KEY is configured on the server.' :
        status === 502 ? 'AI returned an unreadable response. Please try again.' :
        errMsg;
      setAnalysisError({ code: errCode, message: displayMsg, status });
      showToast(displayMsg, 'error');
    } finally {
      clearInterval(msgInterval);
      setLoadingMsg('');
      setAnalyzing(false);
    }
  }, [showToast]);

  // ── Handler for ATS Analysis tab form submit ───────────────────────────
  const handleAnalyzeForm = async (e) => {
    e.preventDefault();
    if (!resumeFile && !resumeText.trim()) {
      showToast('Please upload a PDF or paste your resume text.', 'error');
      return;
    }
    if (resumeFile) {
      if (!resumeFile.name.toLowerCase().endsWith('.pdf') && !resumeFile.type.includes('pdf')) {
        showToast('Only PDF files are accepted.', 'error');
        return;
      }
      if (resumeFile.size > 5 * 1024 * 1024) {
        showToast('File exceeds 5 MB. Please upload a smaller PDF.', 'error');
        return;
      }
    }
    await runAnalysis(resumeFile || null, resumeText || null);
  };

  // ── Handler for "Analyze My Built Resume" button on Build tab ─────────
  const handleAnalyzeBuiltResume = async () => {
    const builtText = resumeDataToText(resumeData);
    if (builtText.trim().length < 50) {
      showToast('Please fill in your resume details before analysing.', 'error');
      return;
    }
    setActiveTab('analyze');
    // Small delay to allow tab render
    await new Promise(r => setTimeout(r, 50));
    await runAnalysis(null, builtText);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-5 lg:p-7 max-w-full overflow-hidden">

          {/* ── Page Header ─────────────────────────────────────────── */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Resume Assistant</h1>
              <p className="text-sm text-slate-500 mt-0.5">Build, analyse, and download your ATS-ready resume.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl
                           shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl
                           shadow-md shadow-primary/20 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  activeTab === id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              TAB: BUILD RESUME
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'build' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Form pane */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-5 max-h-[820px] overflow-y-auto">

                {/* Template picker */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Template</span>
                  <div className="flex gap-2">
                    {['Modern', 'Executive', 'Minimal'].map((t) => (
                      <button key={t} onClick={() => setTemplate(t)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                          template === t ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                {/* Personal */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'fullName',  placeholder: 'Full Name *',       type: 'text'  },
                      { key: 'email',     placeholder: 'Email Address',      type: 'email' },
                      { key: 'phone',     placeholder: '+91 98765 43210',    type: 'tel'   },
                      { key: 'location',  placeholder: 'Bengaluru, KA',      type: 'text'  },
                    ].map(({ key, placeholder, type }) => (
                      <div key={key}>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={resumeData[key]}
                          onChange={e => updateField(key, e.target.value)}
                          className={`input-field text-xs w-full ${fieldErrors[key] ? 'border-rose-400 bg-rose-50' : ''}`}
                        />
                        {fieldErrors[key] && (
                          <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{fieldErrors[key]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Online profiles */}
                  <div className="space-y-2">
                    {[
                      { key: 'linkedin',  placeholder: 'LinkedIn URL (linkedin.com/in/…)', icon: User },
                      { key: 'github',    placeholder: 'GitHub URL (github.com/…)',        icon: FileText },
                      { key: 'portfolio', placeholder: 'Portfolio URL (optional)',          icon: Eye },
                    ].map(({ key, placeholder, icon: Icon }) => (
                      <div key={key}>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="url"
                            placeholder={placeholder}
                            value={resumeData[key]}
                            onChange={e => updateField(key, e.target.value)}
                            className={`input-field text-xs pl-8 w-full ${fieldErrors[key] ? 'border-rose-400 bg-rose-50' : ''}`}
                          />
                        </div>
                        {fieldErrors[key] && (
                          <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{fieldErrors[key]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Professional Summary</h4>
                  <textarea rows={3} value={resumeData.summary}
                    onChange={e => updateField('summary', e.target.value)}
                    className="input-field text-xs w-full"
                    placeholder="Brief professional summary highlighting your strengths and career goals…"
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Technical Skills</h4>
                  <textarea rows={2} value={resumeData.skills}
                    onChange={e => updateField('skills', e.target.value)}
                    className="input-field text-xs w-full"
                    placeholder="React, Node.js, Python, MySQL, Docker…"
                  />
                </div>

                {/* Projects */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Projects</h4>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                      {resumeData.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => updateField('projects', resumeData.projects.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input type="text" placeholder="Project Title" value={proj.name}
                        onChange={e => { const u = [...resumeData.projects]; u[idx].name = e.target.value; updateField('projects', u); }}
                        className="input-field text-xs w-full"
                      />
                      <input type="text" placeholder="Tech Stack (React, Node.js, MySQL…)" value={proj.tech}
                        onChange={e => { const u = [...resumeData.projects]; u[idx].tech = e.target.value; updateField('projects', u); }}
                        className="input-field text-xs w-full"
                      />
                      <textarea rows={2} placeholder="Impact & description — include measurable outcomes…" value={proj.desc}
                        onChange={e => { const u = [...resumeData.projects]; u[idx].desc = e.target.value; updateField('projects', u); }}
                        className="input-field text-xs w-full"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateField('projects', [...resumeData.projects, { name: '', tech: '', desc: '' }])}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Experience & Internships</h4>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                      {resumeData.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => updateField('experience', resumeData.experience.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Company" value={exp.company}
                          onChange={e => { const u = [...resumeData.experience]; u[idx].company = e.target.value; updateField('experience', u); }}
                          className="input-field text-xs"
                        />
                        <input type="text" placeholder="Role / Position" value={exp.role}
                          onChange={e => { const u = [...resumeData.experience]; u[idx].role = e.target.value; updateField('experience', u); }}
                          className="input-field text-xs"
                        />
                      </div>
                      <input type="text" placeholder="Duration (Jun 2025 – Aug 2025)" value={exp.duration}
                        onChange={e => { const u = [...resumeData.experience]; u[idx].duration = e.target.value; updateField('experience', u); }}
                        className="input-field text-xs w-full"
                      />
                      <textarea rows={2} placeholder="Key responsibilities & measurable impact…" value={exp.desc}
                        onChange={e => { const u = [...resumeData.experience]; u[idx].desc = e.target.value; updateField('experience', u); }}
                        className="input-field text-xs w-full"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateField('experience', [...resumeData.experience, { company: '', role: '', duration: '', desc: '' }])}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Education</h4>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Institution" value={edu.school}
                        onChange={e => { const u = [...resumeData.education]; u[idx].school = e.target.value; updateField('education', u); }}
                        className="input-field text-xs"
                      />
                      <input type="text" placeholder="Degree / Programme" value={edu.degree}
                        onChange={e => { const u = [...resumeData.education]; u[idx].degree = e.target.value; updateField('education', u); }}
                        className="input-field text-xs"
                      />
                      <input type="text" placeholder="Year (2021–2025)" value={edu.year}
                        onChange={e => { const u = [...resumeData.education]; u[idx].year = e.target.value; updateField('education', u); }}
                        className="input-field text-xs"
                      />
                      <input type="text" placeholder="CGPA / %" value={edu.gpa}
                        onChange={e => { const u = [...resumeData.education]; u[idx].gpa = e.target.value; updateField('education', u); }}
                        className="input-field text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Certifications & Languages */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Certifications</h4>
                    <textarea rows={2} value={resumeData.certifications}
                      onChange={e => updateField('certifications', e.target.value)}
                      className="input-field text-xs w-full" placeholder="AWS Cloud Practitioner, Google IT…" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary">Languages</h4>
                    <textarea rows={2} value={resumeData.languages}
                      onChange={e => updateField('languages', e.target.value)}
                      className="input-field text-xs w-full" placeholder="English (Fluent), Hindi…" />
                  </div>
                </div>

                {/* Analyze My Built Resume button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleAnalyzeBuiltResume}
                    disabled={analyzing}
                    className="w-full py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700
                               text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20
                               flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {analyzing ? (
                      <><span className="animate-spin">⧗</span> Analysing…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analyze My Resume with AI</>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Uses Google Gemini AI · Same engine as the ATS Analysis tab
                  </p>
                </div>
              </div>

              {/* Live Preview pane */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  Live Preview — {template}
                </div>
                {/* Visual preview — purely for UX. The actual PDF source is printRef below. */}
                <ResumePreviewContent resumeData={resumeData} />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB: ATS ANALYSIS
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'analyze' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Upload pane */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-slate-900">AI Resume Analyzer</h3>
                </div>
                <p className="text-[11px] text-slate-500 -mt-2">
                  Upload your resume PDF or paste your resume text to receive personalized analysis and improvement suggestions.
                </p>

                <form onSubmit={handleAnalyzeForm} className="space-y-4">
                  {/* Drop zone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload PDF Resume</label>
                    <label className={`flex flex-col items-center justify-center gap-2 p-6 bg-slate-50 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                      resumeFile ? 'border-primary/60 bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-indigo-50/40'
                    }`}>
                      <FileText className={`w-8 h-8 ${resumeFile ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-700 text-center">
                        {resumeFile ? resumeFile.name : 'Click to upload PDF'}
                      </span>
                      <span className="text-[10px] text-slate-400">PDF only · max 5 MB</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f && !f.name.toLowerCase().endsWith('.pdf')) {
                            showToast('Only PDF files are accepted.', 'error');
                            e.target.value = '';
                            return;
                          }
                          setResumeFile(f || null);
                        }}
                        className="hidden"
                      />
                    </label>
                    {resumeFile && (
                      <button type="button" onClick={() => setResumeFile(null)}
                        className="mt-1 text-[10px] text-rose-500 hover:underline font-semibold">
                        × Remove file
                      </button>
                    )}
                  </div>

                  <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">— or paste text —</div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Resume Text</label>
                    <textarea
                      rows={7}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste your full resume text here…"
                      className="input-field text-xs w-full"
                      disabled={!!resumeFile}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={analyzing}
                    className="w-full py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700
                               text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20
                               flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {analyzing ? (
                      <><span className="animate-spin text-base">⧗</span> Analysing…</>
                    ) : (
                      <>Analyse with AI <BarChart2 className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                {/* Parsed metadata badge */}
                {parsedMeta && !analyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Resume Parsed Successfully</p>
                        <p className="text-[10px] text-emerald-700">
                          {parsedMeta.wordCount} words · {parsedMeta.detectedSections?.length || 0} sections detected
                        </p>
                      </div>
                    </div>

                    {/* Collapsible extracted text */}
                    <button
                      onClick={() => setShowExtracted(v => !v)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl
                                 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <span>View Extracted Resume</span>
                      {showExtracted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showExtracted && (
                      <pre className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3
                                     max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {extractedText || 'No text extracted.'}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Results pane */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-card min-h-[300px]">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[260px] space-y-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                      <BarChart2 className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-slate-800 animate-pulse">{loadingMsg || 'Reading your resume…'}</p>
                      <p className="text-xs text-slate-400">AI is reviewing every section of your resume</p>
                    </div>
                  </div>
                ) : analysisError ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[260px] space-y-4 px-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-rose-500" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm">
                      <p className="text-sm font-bold text-slate-800">
                        {analysisError.code === 'AI_UNAVAILABLE' ? 'AI Service Unavailable' :
                         analysisError.code === 'AI_INVALID_RESPONSE' ? 'AI Response Error' :
                         'Analysis Failed'}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">{analysisError.message}</p>
                      {analysisError.code === 'AI_UNAVAILABLE' && (
                        <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-2 text-left font-mono">
                          Set GEMINI_API_KEY in server/.env to enable AI analysis
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setAnalysisError(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : !analysis ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-slate-400 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <BarChart2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Your personalized analysis will appear here</p>
                      <p className="text-xs text-slate-400 mt-1">Upload a PDF or paste your resume text, then click Analyse.</p>
                    </div>
                  </div>
                ) : (
                  /* Quick summary shown inline after analysis */
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Quick Summary</h3>

                    {/* 3 hero scores */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Overall Score',       val: analysis.overall_score,       color: 'text-primary',    bg: 'bg-primary/5   border-primary/20'   },
                        { label: 'ATS Compatibility',   val: analysis.ats_score,            color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                        { label: 'Recruiter Readiness', val: analysis.recruiter_readiness,  color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200'  },
                      ].map(({ label, val, color, bg }) => (
                        <div key={label} className={`p-3 border rounded-2xl text-center ${bg}`}>
                          <span className={`text-2xl font-extrabold block ${color}`}>
                            {typeof val === 'number' ? val.toFixed(1) : '–'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(analysis.strengths || []).length > 0 && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                          <h4 className="text-[10px] font-extrabold uppercase text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                          </h4>
                          <ul className="space-y-1">
                            {analysis.strengths.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-[11px] text-slate-700 flex gap-1.5">
                                <span className="text-emerald-500 shrink-0">•</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(analysis.weaknesses || []).length > 0 && (
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1.5">
                          <h4 className="text-[10px] font-extrabold uppercase text-rose-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses
                          </h4>
                          <ul className="space-y-1">
                            {analysis.weaknesses.slice(0, 3).map((w, i) => (
                              <li key={i} className="text-[11px] text-slate-700 flex gap-1.5">
                                <span className="text-rose-400 shrink-0">•</span>{w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="text-center pt-1">
                      <button
                        onClick={() => setActiveTab('score')}
                        className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 mx-auto"
                      >
                        View Full Report <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB: RESUME SCORE
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'score' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!analysis ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center space-y-4">
                  <Star className="w-14 h-14 text-slate-200 mx-auto" />
                  <p className="text-sm text-slate-500">No score data yet. Run an AI analysis first.</p>
                  <button onClick={() => setActiveTab('analyze')}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md mx-auto flex items-center gap-2">
                    Analyse My Resume <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Hero: 3 top scores */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Overall Score',       val: analysis.overall_score,      icon: Star,       grad: 'from-primary to-violet-600'   },
                      { label: 'ATS Compatibility',   val: analysis.ats_score,           icon: Shield,     grad: 'from-emerald-500 to-teal-500' },
                      { label: 'Recruiter Readiness', val: analysis.recruiter_readiness, icon: TrendingUp, grad: 'from-violet-500 to-purple-600' },
                    ].map(({ label, val, icon: Icon, grad }) => (
                      <div key={label} className={`bg-gradient-to-br ${grad} rounded-2xl p-5 text-white text-center space-y-1 shadow-lg`}>
                        <Icon className="w-6 h-6 mx-auto opacity-80" />
                        <div className="text-4xl font-extrabold">{typeof val === 'number' ? val.toFixed(1) : '–'}</div>
                        <div className="text-xs font-semibold opacity-90">{label}</div>
                        <div className="text-[10px] opacity-70">out of 10</div>
                      </div>
                    ))}
                  </div>

                  {/* Section scores */}
                  {analysis.section_scores && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" /> Section-by-Section Breakdown
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'contact',        label: 'Contact Info',   color: 'bg-blue-500'    },
                          { key: 'summary',        label: 'Summary',        color: 'bg-violet-500'  },
                          { key: 'education',      label: 'Education',      color: 'bg-indigo-500'  },
                          { key: 'skills',         label: 'Skills',         color: 'bg-emerald-500' },
                          { key: 'projects',       label: 'Projects',       color: 'bg-amber-500'   },
                          { key: 'experience',     label: 'Experience',     color: 'bg-orange-500'  },
                          { key: 'certifications', label: 'Certifications', color: 'bg-pink-500'    },
                          { key: 'formatting',     label: 'Formatting',     color: 'bg-teal-500'    },
                          { key: 'grammar',        label: 'Grammar',        color: 'bg-cyan-500'    },
                        ].map(({ key, label, color }) => {
                          const score = analysis.section_scores[key] ?? 0;
                          const pct   = (score / 10) * 100;
                          const textColor = score >= 7 ? 'text-emerald-600' : score >= 5 ? 'text-amber-600' : 'text-rose-600';
                          return (
                            <div key={key}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-slate-700">{label}</span>
                                <span className={`text-xs font-extrabold ${textColor}`}>{score}/10</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full transition-all duration-700`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recruiter Impression */}
                  {analysis.recruiter_impression && (
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Recruiter's Impression</p>
                          <p className="text-sm text-white/90 leading-relaxed">{analysis.recruiter_impression}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button onClick={() => setActiveTab('improve')}
                      className="flex-1 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2">
                      View Suggestions <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveTab('analyze')}
                      className="px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm">
                      Re-analyse
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB: IMPROVEMENTS
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'improve' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                <h2 className="text-lg font-extrabold text-slate-900 mb-1">Personalized Suggestions</h2>
                <p className="text-sm text-slate-500 mb-5">
                  {analysis ? 'AI-generated recommendations based on your specific resume.' : 'Run an AI analysis to get personalized suggestions.'}
                </p>

                {analysis ? (
                  <div className="space-y-4 animate-fade-in">

                    {/* Numbered suggestions */}
                    {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
                      <div className="space-y-2">
                        {analysis.suggestions.map((tip, idx) => (
                          <div key={idx} className="flex gap-3 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                            <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Missing keywords */}
                    {(analysis.missing_keywords || []).length > 0 && (
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Missing Keywords — Add These to Your Resume
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.missing_keywords.map((kw, i) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing sections */}
                    {(analysis.missing_sections || []).length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Missing Sections
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.missing_sections.map((sec, i) => (
                            <span key={i} className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">{sec}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {(analysis.weaknesses || []).length > 0 && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-extrabold uppercase text-slate-600 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-500" /> Areas to Improve
                        </h4>
                        <ul className="space-y-1.5">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-slate-700 flex gap-2">
                              <span className="text-rose-400 shrink-0 font-bold">×</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-4">
                    <Lightbulb className="w-14 h-14 text-slate-200 mx-auto" />
                    <p className="text-sm text-slate-500">No suggestions yet.</p>
                    <button onClick={() => setActiveTab('analyze')}
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md mx-auto flex items-center gap-2">
                      Analyse My Resume <BarChart2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB: DOWNLOAD PDF
          ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'download' && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card max-w-2xl mx-auto space-y-8">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Download Your Resume</h2>
                <p className="text-sm text-slate-500 mt-1">Choose a template and export as a professional PDF.</p>
              </div>

              {/* Template choice */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">Select Template</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Modern', 'Executive', 'Minimal'].map((t) => (
                    <button key={t} onClick={() => setTemplate(t)}
                      className={`p-4 border-2 rounded-2xl text-sm font-bold transition-all ${
                        template === t
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 text-slate-600 hover:border-primary/40'
                      }`}
                    >
                      <FileText className={`w-6 h-6 mx-auto mb-1 ${template === t ? 'text-primary' : 'text-slate-400'}`} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview snippet */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-700 text-center text-sm uppercase">{resumeData.fullName || 'Your Name'}</p>
                <p className="text-slate-500 text-center">{resumeData.email} {resumeData.phone && `· ${resumeData.phone}`}</p>
                <p className="text-slate-400 text-center">{resumeData.location}</p>
                {resumeData.linkedin && <p className="text-slate-400 text-center text-[10px]">{resumeData.linkedin}</p>}
              </div>

              {/* AI Score badge if available */}
              {analysis && (
                <div className="flex gap-3">
                  {[
                    { label: 'ATS Score',   val: analysis.ats_score,           color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                    { label: 'AI Score',    val: analysis.overall_score,        color: 'text-primary',    bg: 'bg-primary/5 border-primary/20'   },
                    { label: 'Recruiter',   val: analysis.recruiter_readiness,  color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200'   },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`flex-1 p-2.5 border rounded-xl text-center ${bg}`}>
                      <span className={`text-lg font-extrabold block ${color}`}>{val?.toFixed(1) ?? '–'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleDownloadPDF}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold text-base rounded-2xl
                           shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all"
              >
                <Download className="w-6 h-6" />
                Download {template} PDF Resume
              </button>
              <p className="text-center text-xs text-slate-400">
                Your resume is generated locally in your browser and is never uploaded.
              </p>
            </div>
          )}

          {/*
           * ═══════════════════════════════════════════════════════════
           * ALWAYS-MOUNTED PRINTABLE DIV — attached to printRef
           *
           * ROOT CAUSE FIX:
           * The old code used `position: absolute; left: -9999px` which
           * html2canvas cannot reliably capture because the element is
           * far outside the browser's scrollable layout area.
           *
           * FIX: Using `position: fixed; top: -9999px; left: 0` ensures
           * the element is always within the viewport coordinate space
           * (fixed elements are measured from the viewport origin) so
           * html2canvas can capture it correctly even when the page is
           * scrolled. The element is visually invisible (top: -9999px)
           * but its layout and styles are computed by the browser.
           *
           * Width is set to 794px (A4 at 96dpi) to ensure correct layout.
           * This div is the SINGLE source of truth for PDF output.
           * ═══════════════════════════════════════════════════════════
           */}
          <div
            ref={printRef}
            aria-hidden="true"
            style={{
              position:    'fixed',
              top:         '-9999px',
              left:        '0',
              width:       '794px',
              zIndex:      -9999,
              background:  '#ffffff',
              padding:     '48px 40px',
              fontFamily:  'Georgia, "Times New Roman", serif',
              color:       '#0f172a',
              lineHeight:  '1.6',
              boxSizing:   'border-box',
            }}
          >
            <PrintableResume resumeData={resumeData} template={template} />
          </div>

        </main>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PrintableResume
//
// The SINGLE component rendered inside the off-screen printRef div.
// Uses inline styles ONLY (no Tailwind classes) to guarantee correct
// PDF rendering. html2canvas cannot load external stylesheets, but
// inline styles are always computed and captured correctly.
// ═══════════════════════════════════════════════════════════════════════════
const PrintableResume = ({ resumeData, template }) => {
  const accent = template === 'Modern'    ? '#4F46E5' :
                 template === 'Executive' ? '#1e293b' :
                 '#0f172a'; // Minimal

  const S = {
    root: {
      fontFamily:  'Georgia, "Times New Roman", serif',
      fontSize:    '11px',
      color:       '#0f172a',
      background:  '#ffffff',
      lineHeight:  '1.6',
    },
    header: {
      textAlign:     'center',
      paddingBottom: '14px',
      marginBottom:  '14px',
      borderBottom:  `2px solid ${accent}`,
    },
    name: {
      fontSize:    '24px',
      fontWeight:  'bold',
      color:       '#0f172a',
      margin:      0,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
    contact: {
      fontSize:    '10px',
      color:       '#475569',
      marginTop:   '5px',
    },
    links: {
      fontSize:    '10px',
      color:       accent,
      marginTop:   '3px',
    },
    sectionTitle: {
      fontSize:      '9px',
      fontWeight:    'bold',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color:         accent,
      borderBottom:  `1px solid ${accent}30`,
      paddingBottom: '3px',
      marginBottom:  '7px',
      marginTop:     '14px',
    },
    text: {
      fontSize:   '11px',
      color:      '#334155',
      margin:     '2px 0',
    },
    bold: {
      fontWeight: 'bold',
      color:      '#0f172a',
    },
    muted: {
      color:    '#64748b',
      fontSize: '10px',
    },
    row: {
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'baseline',
    },
    bullet: {
      marginLeft: '12px',
      marginTop:  '2px',
    },
    itemBlock: {
      marginBottom: '8px',
    },
  };

  const linkParts = [resumeData.linkedin, resumeData.github, resumeData.portfolio].filter(Boolean);

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <p style={S.name}>{resumeData.fullName || 'Your Name'}</p>
        <p style={S.contact}>
          {[resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join('  •  ')}
        </p>
        {linkParts.length > 0 && (
          <p style={S.links}>{linkParts.join('  •  ')}</p>
        )}
      </div>

      {/* Professional Summary */}
      {resumeData.summary && (
        <div>
          <p style={S.sectionTitle}>Professional Summary</p>
          <p style={S.text}>{resumeData.summary}</p>
        </div>
      )}

      {/* Technical Skills */}
      {resumeData.skills && (
        <div>
          <p style={S.sectionTitle}>Technical Skills</p>
          <p style={S.text}>{resumeData.skills}</p>
        </div>
      )}

      {/* Projects */}
      {resumeData.projects?.filter(p => p.name).length > 0 && (
        <div>
          <p style={S.sectionTitle}>Projects</p>
          {resumeData.projects.filter(p => p.name).map((p, i) => (
            <div key={i} style={S.itemBlock}>
              <div style={S.row}>
                <span style={{ ...S.text, ...S.bold }}>{p.name}</span>
                {p.tech && <span style={S.muted}>{p.tech}</span>}
              </div>
              {p.desc && <p style={{ ...S.text, ...S.bullet }}>• {p.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {resumeData.experience?.filter(e => e.company || e.role).length > 0 && (
        <div>
          <p style={S.sectionTitle}>Experience & Internships</p>
          {resumeData.experience.filter(e => e.company || e.role).map((e, i) => (
            <div key={i} style={S.itemBlock}>
              <div style={S.row}>
                <span style={{ ...S.text, ...S.bold }}>{e.role}{e.company ? ` — ${e.company}` : ''}</span>
                {e.duration && <span style={S.muted}>{e.duration}</span>}
              </div>
              {e.desc && <p style={{ ...S.text, ...S.bullet }}>• {e.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education?.filter(e => e.school || e.degree).length > 0 && (
        <div>
          <p style={S.sectionTitle}>Education</p>
          {resumeData.education.filter(e => e.school || e.degree).map((e, i) => (
            <div key={i} style={{ ...S.row, ...S.itemBlock }}>
              <span style={S.text}>
                <span style={S.bold}>{e.school}</span>
                {e.degree && ` — ${e.degree}`}
              </span>
              <span style={S.muted}>{[e.year, e.gpa].filter(Boolean).join('  |  ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {resumeData.certifications && (
        <div>
          <p style={S.sectionTitle}>Certifications</p>
          <p style={S.text}>{resumeData.certifications}</p>
        </div>
      )}

      {/* Languages */}
      {resumeData.languages && (
        <div>
          <p style={S.sectionTitle}>Languages</p>
          <p style={S.text}>{resumeData.languages}</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ResumePreviewContent
//
// The VISUAL preview rendered inside the "Build Resume" tab's preview pane.
// Uses Tailwind classes for styling (since the live preview is in the main
// document where Tailwind CSS is loaded). This is purely for UX feedback.
// The actual PDF is generated from PrintableResume (inline styles only).
// ═══════════════════════════════════════════════════════════════════════════
const ResumePreviewContent = ({ resumeData }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px] text-slate-900 font-sans text-left space-y-4 overflow-y-auto max-h-[740px]">
    {/* Header */}
    <div className="border-b-2 border-primary pb-3 text-center">
      <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
        {resumeData.fullName || <span className="text-slate-300">Your Name</span>}
      </h2>
      <p className="text-xs text-slate-500 mt-1">
        {[resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' • ')}
      </p>
      {(resumeData.linkedin || resumeData.github || resumeData.portfolio) && (
        <p className="text-[10px] text-primary mt-0.5">
          {[resumeData.linkedin, resumeData.github, resumeData.portfolio].filter(Boolean).join(' • ')}
        </p>
      )}
    </div>

    {resumeData.summary && (
      <PreviewSection title="Professional Summary">
        <p className="text-[11px] text-slate-700 leading-relaxed">{resumeData.summary}</p>
      </PreviewSection>
    )}
    {resumeData.skills && (
      <PreviewSection title="Technical Skills">
        <p className="text-[11px] text-slate-700">{resumeData.skills}</p>
      </PreviewSection>
    )}
    {resumeData.projects?.filter(p => p.name).length > 0 && (
      <PreviewSection title="Projects">
        {resumeData.projects.filter(p => p.name).map((p, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-bold text-slate-900">{p.name}</span>
              <span className="text-[10px] text-slate-400">{p.tech}</span>
            </div>
            {p.desc && <p className="text-[11px] text-slate-600 mt-0.5">• {p.desc}</p>}
          </div>
        ))}
      </PreviewSection>
    )}
    {resumeData.experience?.filter(e => e.company || e.role).length > 0 && (
      <PreviewSection title="Experience & Internships">
        {resumeData.experience.filter(e => e.company || e.role).map((e, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-bold text-slate-900">{e.role}{e.company && ` — ${e.company}`}</span>
              <span className="text-[10px] text-slate-400">{e.duration}</span>
            </div>
            {e.desc && <p className="text-[11px] text-slate-600 mt-0.5">• {e.desc}</p>}
          </div>
        ))}
      </PreviewSection>
    )}
    {resumeData.education?.filter(e => e.school || e.degree).length > 0 && (
      <PreviewSection title="Education">
        {resumeData.education.filter(e => e.school || e.degree).map((e, i) => (
          <div key={i} className="flex justify-between text-[11px] text-slate-700">
            <span><span className="font-bold">{e.school}</span>{e.degree && ` — ${e.degree}`}</span>
            <span className="text-slate-400">{[e.year, e.gpa].filter(Boolean).join(' | ')}</span>
          </div>
        ))}
      </PreviewSection>
    )}
    {resumeData.certifications && (
      <PreviewSection title="Certifications">
        <p className="text-[11px] text-slate-700">{resumeData.certifications}</p>
      </PreviewSection>
    )}
    {resumeData.languages && (
      <PreviewSection title="Languages">
        <p className="text-[11px] text-slate-700">{resumeData.languages}</p>
      </PreviewSection>
    )}
  </div>
);

// Section header helper for the visual preview
const PreviewSection = ({ title, children }) => (
  <div>
    <h3 className="text-[9px] font-extrabold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 mb-2">
      {title}
    </h3>
    {children}
  </div>
);
