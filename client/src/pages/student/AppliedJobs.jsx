import React, { useState, useEffect } from 'react';
import {
  Building, FileText, ChevronDown, ChevronUp,
  Download, MessageSquare, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

// Status pipeline order
const PIPELINE_ORDER = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Selected': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Shortlisted': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Interview Scheduled': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
    default: return 'bg-amber-100 text-amber-800 border-amber-300';
  }
};

const getTimelineSteps = (currentStatus) => {
  const steps = [...PIPELINE_ORDER];
  if (currentStatus === 'Rejected') steps.push('Rejected');

  return steps.map((step) => {
    const isCurrent = currentStatus === step;
    const currentIdx = PIPELINE_ORDER.indexOf(currentStatus);
    const stepIdx = PIPELINE_ORDER.indexOf(step);
    const isCompleted = currentStatus !== 'Rejected'
      ? (stepIdx !== -1 && currentIdx !== -1 && stepIdx <= currentIdx)
      : step === 'Rejected';
    return { step, isCompleted, isCurrent };
  });
};

export const AppliedJobs = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnswers, setExpandedAnswers] = useState({}); // track which cards have answers open

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/student/applied-jobs');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch {
      showToast('Error loading application history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswers = (appId) => {
    setExpandedAnswers(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleDownloadResume = (app) => {
    if (app.resume_url) {
      window.open(app.resume_url, '_blank');
    } else {
      showToast('No resume was uploaded with this application.', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Application Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time status updates and pipeline tracking for all your job applications.
            </p>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No Job Applications Yet"
              message="You haven't submitted any job applications yet. Explore available jobs and apply now."
              actionText="Search Available Jobs"
              onAction={() => navigate('/jobs')}
            />
          ) : (
            <div className="space-y-6">
              <p className="text-xs font-semibold text-slate-400">
                {applications.length} application{applications.length !== 1 ? 's' : ''} submitted
              </p>

              {applications.map((app) => {
                const hasAnswers = Array.isArray(app.application_answers) && app.application_answers.length > 0;
                const answersOpen = expandedAnswers[app.application_id];

                return (
                  <div
                    key={app.application_id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Status Banner */}
                    <div className={`px-6 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b ${getStatusColor(app.status)}`}>
                      <span className="w-2 h-2 rounded-full bg-current opacity-60 inline-block" />
                      {app.status}
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <Building className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {app.company_name}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900">{app.title}</h3>
                            <p className="text-xs text-slate-500">
                              {app.location} · {app.salary} · {app.job_type}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-xs text-slate-400 block">Applied</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {app.applied_date
                              ? new Date(app.applied_date).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </div>

                      {/* Pipeline Timeline */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Application Pipeline
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {getTimelineSteps(app.status).map((item) => (
                            <div
                              key={item.step}
                              className={`py-2.5 px-2 rounded-xl border text-center text-xs transition-all ${
                                item.isCurrent
                                  ? 'bg-primary text-white border-primary shadow-md font-bold'
                                  : item.isCompleted
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                            >
                              {item.step}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resume & Actions Row */}
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                        {/* Resume Download */}
                        {app.resume_url ? (
                          <button
                            onClick={() => handleDownloadResume(app)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Submitted Resume
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            No resume on file
                          </span>
                        )}

                        {/* Cover Letter */}
                        {app.cover_letter && (
                          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl">
                            Cover Letter Included
                          </span>
                        )}

                        {/* View Answers Toggle */}
                        {hasAnswers && (
                          <button
                            onClick={() => toggleAnswers(app.application_id)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {answersOpen ? 'Hide' : 'View'} Answers ({app.application_answers.length})
                            {answersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Company Website */}
                        {app.website && (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Company Site
                          </a>
                        )}
                      </div>

                      {/* Expandable Answers Section */}
                      {hasAnswers && answersOpen && (
                        <div className="mt-2 space-y-3 border-t border-slate-100 pt-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Your Application Answers
                          </p>

                          {/* Cover Letter */}
                          {app.cover_letter && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                              <p className="text-xs font-bold text-indigo-700 mb-1.5 uppercase tracking-wide">
                                Cover Letter
                              </p>
                              <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">
                                {app.cover_letter}
                              </p>
                            </div>
                          )}

                          {app.application_answers.map((qa, i) => (
                            <div
                              key={i}
                              className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                            >
                              <p className="text-xs font-bold text-slate-600 mb-1.5">
                                Q{i + 1}. {qa.question_text}
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {qa.answer?.trim() || (
                                  <span className="text-slate-400 italic">No answer provided</span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
