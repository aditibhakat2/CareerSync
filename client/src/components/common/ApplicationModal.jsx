import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronRight, ChevronLeft, Upload, FileText, CheckCircle2,
  AlertCircle, Loader2, Send, Building, Briefcase
} from 'lucide-react';
import api from '../../services/api';

const STEPS = ['Questions', 'Resume', 'Submit'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ApplicationModal = ({ job, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  // Reset everything when modal opens with a new job
  useEffect(() => {
    if (isOpen && job) {
      setStep(0);
      setAnswers({});
      setCoverLetter('');
      setResumeFile(null);
      setResumeError('');
      setSubmitted(false);
      setSubmitError('');
      loadQuestions();
    }
  }, [isOpen, job?.job_id]);

  const loadQuestions = async () => {
    if (!job) return;
    setFetchingQuestions(true);
    try {
      const res = await api.get(`/jobs/questions/${job.job_id}`);
      if (res.data.success) {
        setQuestions(res.data.questions || []);
      }
    } catch {
      setQuestions([]);
    } finally {
      setFetchingQuestions(false);
    }
  };

  if (!isOpen || !job) return null;

  // ── Validation ─────────────────────────────────────────────────────────────
  const unansweredRequired = questions.filter(
    q => q.is_required && (!answers[q.question_id] || !answers[q.question_id].trim())
  );
  const canProceedStep0 = unansweredRequired.length === 0;

  const handleFileSelect = (file) => {
    setResumeError('');
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Only PDF files are accepted.');
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResumeError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 5 MB.`);
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      setResumeError('Please upload your resume before submitting.');
      return;
    }
    setLoading(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('applicationResume', resumeFile);
      formData.append('job_id', job.job_id);
      formData.append('cover_letter', coverLetter);

      // Build answers array with question text for recruiter display
      const answersArray = questions.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text,
        answer: answers[q.question_id] || '',
      }));
      formData.append('answers', JSON.stringify(answersArray));

      const res = await api.post('/jobs/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center gap-5 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500 text-sm mt-2">
              Your application for <strong className="text-slate-700">{job.title}</strong> at{' '}
              <strong className="text-slate-700">{job.company_name}</strong> has been sent successfully.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              The hiring team has been notified. You can track your application status in the Applied Jobs section.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Main Modal ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{job.company_name}</p>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">{job.title}</h2>
              <p className="text-xs text-slate-500">{job.location} · {job.job_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 px-6 py-4 shrink-0">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-primary text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-semibold transition-colors ${
                  i === step ? 'text-slate-900' : 'text-slate-400'
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* ── STEP 0: Questions ── */}
          {step === 0 && (
            <div className="space-y-5">
              {fetchingQuestions ? (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading application questions…</span>
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No specific questions for this role.</p>
                  <p className="text-xs text-slate-400 mt-1">Proceed to upload your resume.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 font-medium">
                    Answer all required questions (<span className="text-rose-500">*</span>) before proceeding.
                  </p>
                  {questions.map((q, idx) => (
                    <div key={q.question_id} className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-800">
                        {idx + 1}. {q.question_text}
                        {q.is_required && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={answers[q.question_id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.question_id]: e.target.value }))}
                        placeholder={q.is_required ? 'Required — please provide a thoughtful answer…' : 'Optional — feel free to skip…'}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none ${
                          q.is_required && (!answers[q.question_id] || !answers[q.question_id].trim())
                            ? 'border-rose-200 focus:border-rose-400'
                            : 'border-slate-200 focus:border-primary'
                        }`}
                      />
                    </div>
                  ))}
                </>
              )}

              {/* Optional Cover Letter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-800">
                  Cover Letter <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="A brief cover letter helps your application stand out…"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 1: Resume Upload ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Your Resume</h3>
                <p className="text-xs text-slate-500 mt-0.5">PDF only · Maximum 5 MB · This will be sent directly to the recruiter.</p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                  resumeFile ? 'border-emerald-400 bg-emerald-50' :
                  resumeError ? 'border-rose-300 bg-rose-50' :
                  'border-slate-200 bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                {resumeFile ? (
                  <>
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-700">{resumeFile.name}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">{(resumeFile.size / 1024).toFixed(0)} KB · PDF</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline"
                    >
                      Remove &amp; choose another
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Upload className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Drag &amp; drop your PDF here</p>
                      <p className="text-xs text-slate-400 mt-0.5">or click to browse files</p>
                    </div>
                  </>
                )}
              </div>

              {resumeError && (
                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {resumeError}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                💡 <strong>Tip:</strong> Keep your resume under 1 page for freshers. Include your CGPA, relevant projects, and skills prominently.
              </div>
            </div>
          )}

          {/* ── STEP 2: Review & Submit ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review &amp; Submit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please review your application before final submission.</p>
              </div>

              {/* Job Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">{job.company_name}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{job.title}</p>
                <p className="text-xs text-slate-500">{job.location} · {job.job_type} · {job.remote_option}</p>
              </div>

              {/* Resume Preview */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Resume</p>
                  <p className="text-xs text-emerald-600">{resumeFile?.name} · {(resumeFile?.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>

              {/* Answers Summary */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Answers</p>
                  {questions.map((q, idx) => (
                    <div key={q.question_id} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-bold text-slate-700 mb-1">{idx + 1}. {q.question_text}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {answers[q.question_id]?.trim() || <span className="text-slate-400 italic">No answer provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Letter Preview */}
              {coverLetter.trim() && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-bold text-slate-700 mb-1">Cover Letter</p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
                </div>
              )}

              {submitError && (
                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          {/* Validation hint for step 0 */}
          {step === 0 && !canProceedStep0 && !fetchingQuestions && questions.length > 0 && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {unansweredRequired.length} required question{unansweredRequired.length > 1 ? 's' : ''} not answered
            </p>
          )}
          {step === 0 && (canProceedStep0 || questions.length === 0) && !fetchingQuestions && (
            <p className="text-xs text-slate-400">{questions.length} question{questions.length !== 1 ? 's' : ''} answered</p>
          )}
          {step > 0 && <div />}

          <div className="flex items-center gap-3 ml-auto">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={step === 0 && !canProceedStep0 && questions.length > 0 && !fetchingQuestions}
                onClick={() => {
                  if (step === 1 && !resumeFile) {
                    setResumeError('Please upload your resume before proceeding.');
                    return;
                  }
                  setStep(s => s + 1);
                }}
                className="flex items-center gap-1 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !resumeFile}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
