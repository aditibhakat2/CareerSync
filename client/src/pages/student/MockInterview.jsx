import React, { useState, useCallback, useRef } from 'react';
import {
  Video, FileText, BookOpen, ChevronRight, ChevronLeft,
  Play, Send, Award, AlertTriangle, CheckCircle2,
  Star, Zap, Target, MessageSquare, Brain,
  BarChart2, Lightbulb, TrendingUp, RotateCcw,
  Upload, User
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';

// ── Constants ──────────────────────────────────────────────────────────────
const TOPICS = [
  'DSA', 'DBMS', 'Operating Systems', 'Computer Networks',
  'OOP', 'SQL', 'C', 'C++', 'Java', 'Python',
  'HTML', 'CSS', 'JavaScript', 'React',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const LOADING_MESSAGES_START = [
  'Preparing interview…',
  'Generating questions…',
  'Tailoring questions to your profile…',
  'Almost ready…',
];

const LOADING_MESSAGES_EVAL = [
  'Reviewing your answers…',
  'Evaluating technical accuracy…',
  'Assessing communication style…',
  'Preparing detailed report…',
  'Finalising your score…',
];

// Interview stages
const STAGE = {
  SETUP:       'setup',
  LOADING_Q:   'loading_q',
  QUESTION:    'question',
  LOADING_E:   'loading_e',
  REPORT:      'report',
  ERROR:       'error',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function StarRow({ count = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-5 h-5 ${n <= count ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

function ScoreBadge({ label, value, max = 10, color = 'primary' }) {
  const pct = Math.round((value / max) * 100);
  const colors = {
    primary:   { bar: 'bg-primary',    text: 'text-primary',    bg: 'bg-primary/5   border-primary/20'   },
    emerald:   { bar: 'bg-emerald-500',text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    violet:    { bar: 'bg-violet-500', text: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200'  },
    amber:     { bar: 'bg-amber-500',  text: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200'   },
    cyan:      { bar: 'bg-cyan-500',   text: 'text-cyan-600',    bg: 'bg-cyan-50    border-cyan-200'     },
    rose:      { bar: 'bg-rose-500',   text: 'text-rose-600',    bg: 'bg-rose-50    border-rose-200'     },
  };
  const c = colors[color] || colors.primary;
  return (
    <div className={`p-3 border rounded-2xl ${c.bg}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`text-sm font-extrabold ${c.text}`}>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-white rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export const MockInterview = () => {
  const { showToast } = useToast();

  // ── State ─────────────────────────────────────────────────────────────
  const [stage,      setStage]      = useState(STAGE.SETUP);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg,   setErrorMsg]   = useState('');

  // Setup form
  const [mode,       setMode]       = useState('topic'); // 'topic' | 'resume'
  const [topic,      setTopic]      = useState('DSA');
  const [difficulty, setDifficulty] = useState('Medium');
  const [resumeFile, setResumeFile] = useState(null);

  // Interview flow
  const [questions,    setQuestions]    = useState([]);   // string[]
  const [answers,      setAnswers]      = useState(Array(5).fill(''));
  const [currentQ,     setCurrentQ]     = useState(0);    // 0-indexed

  // Report
  const [report, setReport] = useState(null);

  // Ref for loading message interval
  const msgIntervalRef = useRef(null);

  // ── Loading message rotator ────────────────────────────────────────────
  const startRotatingMessages = useCallback((messages) => {
    let idx = 0;
    setLoadingMsg(messages[0]);
    msgIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMsg(messages[idx]);
    }, 2200);
  }, []);

  const stopRotatingMessages = useCallback(() => {
    if (msgIntervalRef.current) {
      clearInterval(msgIntervalRef.current);
      msgIntervalRef.current = null;
    }
    setLoadingMsg('');
  }, []);

  // ── Reset to setup ─────────────────────────────────────────────────────
  const resetToSetup = () => {
    stopRotatingMessages();
    setStage(STAGE.SETUP);
    setErrorMsg('');
    setQuestions([]);
    setAnswers(Array(5).fill(''));
    setCurrentQ(0);
    setReport(null);
    setResumeFile(null);
  };

  // ── Start Interview ────────────────────────────────────────────────────
  const handleStart = async (e) => {
    e.preventDefault();

    // Validate
    if (mode === 'resume' && !resumeFile) {
      showToast('Please upload your PDF resume to start a resume-based interview.', 'error');
      return;
    }
    if (mode === 'topic' && !topic) {
      showToast('Please select a topic.', 'error');
      return;
    }

    setStage(STAGE.LOADING_Q);
    startRotatingMessages(LOADING_MESSAGES_START);

    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('difficulty', difficulty);
      if (mode === 'topic')  formData.append('topic', topic);
      if (mode === 'resume') formData.append('resume', resumeFile);

      const res = await api.post('/ai/interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const qs = res.data.interview.questions;
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(''));
        setCurrentQ(0);
        stopRotatingMessages();
        setStage(STAGE.QUESTION);
        showToast('Interview started! Answer each question carefully.', 'success');
      } else {
        throw new Error(res.data.error || 'Failed to generate questions.');
      }
    } catch (err) {
      stopRotatingMessages();
      const msg = err.response?.data?.error || err.message || 'Unable to generate interview. Please try again.';
      setErrorMsg(msg);
      setStage(STAGE.ERROR);
    }
  };

  // ── Navigation within questions ────────────────────────────────────────
  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(q => q - 1);
    }
  };

  // ── Submit all answers for evaluation ─────────────────────────────────
  const handleSubmit = async () => {
    setStage(STAGE.LOADING_E);
    startRotatingMessages(LOADING_MESSAGES_EVAL);

    const questionsAndAnswers = questions.map((q, i) => ({
      question: q,
      answer:   answers[i] || '',
    }));

    try {
      const res = await api.post('/ai/interview/evaluate', {
        mode,
        topic:               mode === 'topic'  ? topic : undefined,
        difficulty,
        questionsAndAnswers,
      });

      if (res.data.success) {
        setReport(res.data.evaluation);
        stopRotatingMessages();
        setStage(STAGE.REPORT);
        showToast('Interview evaluated! Your AI report is ready.', 'success');
      } else {
        throw new Error(res.data.error || 'Evaluation failed.');
      }
    } catch (err) {
      stopRotatingMessages();
      const msg = err.response?.data?.error || err.message || 'Unable to evaluate the interview. Please try again.';
      setErrorMsg(msg);
      setStage(STAGE.ERROR);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-5 lg:p-7 overflow-hidden">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Video className="w-6 h-6 text-primary" />
                AI Mock Interview
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                AI generates interview questions, evaluates your answers, and provides a personalized summary of your performance.
              </p>
            </div>
            {stage !== STAGE.SETUP && (
              <button
                onClick={resetToSetup}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200
                           rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> New Interview
              </button>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              STAGE: SETUP
          ═══════════════════════════════════════════════════════════ */}
          {stage === STAGE.SETUP && (
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleStart} className="space-y-6">

                {/* Mode selector */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'topic',  label: 'Topic Based',  icon: BookOpen,  desc: 'Select a CS topic like DSA, DBMS, OOP…' },
                    { value: 'resume', label: 'Resume Based', icon: FileText,  desc: 'Upload your resume. AI asks about your skills.' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={`p-5 border-2 rounded-2xl text-left transition-all ${
                        mode === value
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-slate-200 bg-white hover:border-primary/40'
                      }`}
                    >
                      <Icon className={`w-7 h-7 mb-2 ${mode === value ? 'text-primary' : 'text-slate-400'}`} />
                      <p className={`text-sm font-bold ${mode === value ? 'text-primary' : 'text-slate-800'}`}>{label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>

                {/* Topic selector (topic mode only) */}
                {mode === 'topic' && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Topic</h3>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            topic === t
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume upload (resume mode only) */}
                {mode === 'resume' && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Upload Your Resume</h3>
                    <label className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                      resumeFile ? 'border-primary/60 bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-indigo-50/40'
                    }`}>
                      <Upload className={`w-8 h-8 ${resumeFile ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="text-sm font-bold text-slate-700">
                        {resumeFile ? resumeFile.name : 'Click to upload PDF Resume'}
                      </span>
                      <span className="text-[11px] text-slate-400">PDF only · max 5 MB</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (!f.name.toLowerCase().endsWith('.pdf')) {
                            showToast('Only PDF files are accepted.', 'error');
                            return;
                          }
                          if (f.size > 5 * 1024 * 1024) {
                            showToast('File exceeds 5 MB.', 'error');
                            return;
                          }
                          setResumeFile(f);
                        }}
                      />
                    </label>
                    {resumeFile && (
                      <button type="button" onClick={() => setResumeFile(null)}
                        className="text-[11px] text-rose-500 hover:underline font-semibold">
                        × Remove file
                      </button>
                    )}
                    <p className="text-[11px] text-slate-400">
                      AI will read your resume and generate 5 personalised interview questions based on your skills, projects and experience.
                    </p>
                  </div>
                )}

                {/* Difficulty */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Difficulty</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map(d => {
                      const colors = { Easy: 'emerald', Medium: 'amber', Hard: 'rose' };
                      const c = colors[d];
                      const sel = difficulty === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`p-3.5 border-2 rounded-xl text-sm font-bold transition-all ${
                            sel
                              ? `border-${c}-500 bg-${c}-50 text-${c}-700`
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                          style={sel ? { borderColor: c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : '#ef4444',
                                         backgroundColor: c === 'emerald' ? '#f0fdf4' : c === 'amber' ? '#fffbeb' : '#fff1f2',
                                         color: c === 'emerald' ? '#059669' : c === 'amber' ? '#d97706' : '#dc2626' } : {}}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info card */}
                <div className="bg-gradient-to-r from-primary/5 to-violet-50 border border-primary/20 rounded-2xl p-4 flex gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">How it works</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      AI generates a personalized set of interview questions for your selected topic and difficulty. Answer each question one at a time, then receive a detailed evaluation of your responses, including scores, ideal answers, key areas to improve, and an overall performance summary.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700
                             text-white font-extrabold text-base rounded-2xl shadow-lg shadow-primary/20
                             flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Start Interview
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STAGE: LOADING (questions or evaluation)
          ═══════════════════════════════════════════════════════════ */}
          {(stage === STAGE.LOADING_Q || stage === STAGE.LOADING_E) && (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-violet-400 animate-spin"
                  style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                {stage === STAGE.LOADING_Q
                  ? <Brain className="absolute inset-0 m-auto w-9 h-9 text-primary" />
                  : <Award className="absolute inset-0 m-auto w-9 h-9 text-primary" />
                }
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-bold text-slate-800 animate-pulse">{loadingMsg}</p>
                <p className="text-xs text-slate-400">
                  {stage === STAGE.LOADING_Q
                    ? 'Crafting personalized questions for you…'
                    : 'Reading all your answers carefully…'}
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STAGE: QUESTION (one at a time)
          ═══════════════════════════════════════════════════════════ */}
          {stage === STAGE.QUESTION && questions.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-5">

              {/* Progress header */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {mode === 'topic' ? topic : 'Resume Interview'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: difficulty === 'Easy' ? '#f0fdf4' : difficulty === 'Medium' ? '#fffbeb' : '#fff1f2',
                               color: difficulty === 'Easy' ? '#059669' : difficulty === 'Medium' ? '#d97706' : '#dc2626' }}>
                      {difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-primary">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>
                {/* Step dots */}
                <div className="flex gap-2 mt-3 justify-center">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentQ(i)}
                      className={`w-6 h-6 rounded-full text-[10px] font-extrabold transition-all ${
                        i === currentQ
                          ? 'bg-primary text-white shadow-md'
                          : answers[i]
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-violet-600 p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Question {currentQ + 1}</span>
                  </div>
                  <p className="text-base font-semibold leading-relaxed">{questions[currentQ]}</p>
                </div>

                <div className="p-5 space-y-4">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Your Answer</label>
                  <textarea
                    rows={7}
                    value={answers[currentQ]}
                    onChange={e => {
                      const newAns = [...answers];
                      newAns[currentQ] = e.target.value;
                      setAnswers(newAns);
                    }}
                    placeholder="Type your answer here as if you were speaking to a real interviewer. Be specific, clear, and confident…"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800
                               focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none
                               transition-all leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {answers[currentQ] ? `${answers[currentQ].length} characters` : 'Leaving blank = 0 score for this question'}
                    </span>
                    {answers[currentQ] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1.5 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold
                             text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentQ < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark
                               text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-3
                               bg-gradient-to-r from-primary to-violet-600 hover:from-primary-dark hover:to-violet-700
                               text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Submit All Answers for AI Evaluation
                  </button>
                )}
              </div>

              {/* Answered count */}
              <p className="text-center text-[11px] text-slate-400">
                {answers.filter(a => a.trim()).length} of {questions.length} questions answered
                {answers.filter(a => !a.trim()).length > 0 && (
                  <span className="text-amber-500 ml-1">
                    · {answers.filter(a => !a.trim()).length} blank (will receive 0 score from Gemini)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STAGE: REPORT
          ═══════════════════════════════════════════════════════════ */}
          {stage === STAGE.REPORT && report && (
            <div className="max-w-4xl mx-auto space-y-6 pb-10">

              {/* ── Overall hero scores ────────────────────────────────── */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Overall Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-extrabold">{report.overall_score}</span>
                      <span className="text-2xl font-bold text-white/60">/ 100</span>
                    </div>
                    <div className="mt-2">
                      <StarRow count={report.star_rating || 0} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-2">
                      {mode === 'topic' ? `${topic} Interview` : 'Resume Interview'}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                 color: difficulty === 'Easy' ? '#6ee7b7' : difficulty === 'Medium' ? '#fcd34d' : '#fca5a5' }}>
                        {difficulty}
                      </span>
                    </p>
                    <Award className="w-12 h-12 text-amber-400 ml-auto" />
                  </div>
                </div>

                {/* Sub-scores grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5">
                  {[
                    { label: 'Communication', val: report.communication_score   },
                    { label: 'Technical',     val: report.technical_score        },
                    { label: 'Confidence',    val: report.confidence_score       },
                    { label: 'Problem Solving', val: report.problem_solving_score },
                    { label: 'Grammar',       val: report.grammar_score          },
                    { label: 'Professionalism', val: report.professionalism_score },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                      <span className="text-xl font-extrabold block text-white">{val}</span>
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{label}</span>
                      <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 rounded-full" style={{ width: `${val * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Per-question breakdown ─────────────────────────────── */}
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Question-by-Question Breakdown
                </h2>

                {(report.question_results || []).map((qr, idx) => {
                  const scoreColor = qr.score >= 16 ? 'emerald' : qr.score >= 12 ? 'amber' : 'rose';
                  const scoreTextColor = scoreColor === 'emerald' ? 'text-emerald-600' : scoreColor === 'amber' ? 'text-amber-600' : 'text-rose-600';
                  const scoreBgColor  = scoreColor === 'emerald' ? 'bg-emerald-50 border-emerald-200' : scoreColor === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                      {/* Question header */}
                      <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">{qr.question}</p>
                        </div>
                        <div className={`ml-4 shrink-0 px-3 py-1.5 border rounded-xl text-center ${scoreBgColor}`}>
                          <span className={`text-lg font-extrabold block ${scoreTextColor}`}>{qr.score}</span>
                          <span className="text-[9px] font-bold text-slate-400">/ 20</span>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Student answer */}
                        <div>
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                            <User className="w-3 h-3" /> Your Answer
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-200 min-h-[60px]">
                            {qr.student_answer?.trim()
                              ? qr.student_answer
                              : <span className="text-slate-400 italic">No answer provided</span>
                            }
                          </p>
                        </div>

                        {/* Ideal answer */}
                        <div>
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ideal Answer
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50 rounded-xl p-3 border border-emerald-200 min-h-[60px]">
                            {qr.ideal_answer}
                          </p>
                        </div>

                        {/* Missing keywords */}
                        {qr.missing_keywords?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Missing Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {qr.missing_keywords.map((kw, i) => (
                                <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-200">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths */}
                        {qr.strengths?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Strengths
                            </h4>
                            <ul className="space-y-1">
                              {qr.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-slate-700 flex gap-1.5">
                                  <span className="text-emerald-500 shrink-0 font-bold">✓</span>{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Areas to improve */}
                        {qr.areas_to_improve?.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" /> Areas to Improve
                            </h4>
                            <ul className="space-y-1">
                              {qr.areas_to_improve.map((a, i) => (
                                <li key={i} className="text-xs text-slate-700 flex gap-1.5">
                                  <span className="text-amber-500 shrink-0 font-bold">→</span>{a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Overall strengths & areas ──────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Overall Strengths */}
                {(report.overall_strengths || []).length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                    <h3 className="text-sm font-extrabold text-emerald-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Overall Strengths
                    </h3>
                    <ul className="space-y-2">
                      {report.overall_strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs text-emerald-900">
                          <span className="text-emerald-500 font-bold shrink-0">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Improve */}
                {(report.areas_to_improve || []).length > 0 && (
                  <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
                    <h3 className="text-sm font-extrabold text-rose-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {report.areas_to_improve.map((a, i) => (
                        <li key={i} className="flex gap-2 text-xs text-rose-900">
                          <span className="text-rose-500 font-bold shrink-0">×</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Topics to study */}
              {(report.topics_to_study || []).length > 0 && (
                <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
                  <h3 className="text-sm font-extrabold text-indigo-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Topics to Study Before Next Interview
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.topics_to_study.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interviewer's Note */}
              {report.interviewer_note && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
                        Final Interviewer's Note
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed italic">
                        "{report.interviewer_note}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Retry button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetToSetup}
                  className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-2xl
                             shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Start New Interview
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STAGE: ERROR
          ═══════════════════════════════════════════════════════════ */}
          {stage === STAGE.ERROR && (
            <div className="max-w-lg mx-auto mt-16 space-y-5">
              <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-card text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-900">Interview Unavailable</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{errorMsg}</p>
                  {errorMsg?.toLowerCase().includes('api key') && (
                    <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-2 text-left font-mono">
                      Set GEMINI_API_KEY in server/.env to enable AI interviews
                    </p>
                  )}
                </div>
                <button
                  onClick={resetToSetup}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-md mx-auto flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
