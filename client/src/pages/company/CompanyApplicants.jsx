import React, { useState, useEffect } from 'react';
import {
  Users, Filter, Calendar, Search, MessageSquare, Download,
  ChevronDown, ChevronUp, X
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { ApplicantCard } from '../../components/cards/ApplicantCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

const STATUS_OPTIONS = ['all', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

export const CompanyApplicants = () => {
  const { showToast } = useToast();
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interview Scheduler Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: '',
    interview_time: '10:00',
    meeting_link: '',
    interview_mode: 'Online'
  });

  // Answers Modal
  const [answersModalOpen, setAnswersModalOpen] = useState(false);
  const [viewingAnswers, setViewingAnswers] = useState(null);

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);

  const fetchApplicants = async (jobId = 'all', status = 'all', search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await api.get(`/company/applicants/${jobId}`, { params });
      if (res.data.success) setApplicants(res.data.applicants);
    } catch {
      showToast('Error loading applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/company/jobs');
      if (res.data.success) setJobs(res.data.jobs);
    } catch {}
  };

  const handleFilterChange = (jobId) => {
    setSelectedJobFilter(jobId);
    fetchApplicants(jobId, statusFilter, searchQuery);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchApplicants(selectedJobFilter, status, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplicants(selectedJobFilter, statusFilter, searchQuery);
  };

  const handleShortlist = async (applicationId) => {
    try {
      await api.put('/company/applicant-status', { application_id: applicationId, status: 'Shortlisted' });
      showToast('Candidate shortlisted!', 'success');
      setApplicants((prev) => prev.map((a) =>
        a.application_id === applicationId ? { ...a, status: 'Shortlisted' } : a
      ));
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await api.put('/company/applicant-status', { application_id: applicationId, status: 'Rejected' });
      showToast('Application marked as Rejected.', 'info');
      setApplicants((prev) => prev.map((a) =>
        a.application_id === applicationId ? { ...a, status: 'Rejected' } : a
      ));
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const openScheduleModal = (applicant) => {
    setSchedulingFor(applicant);
    setScheduleModalOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/company/schedule-interview', {
        application_id: schedulingFor.application_id,
        ...interviewForm
      });
      if (res.data.success) {
        showToast('Interview scheduled & candidate notified!', 'success');
        setScheduleModalOpen(false);
        setApplicants((prev) => prev.map((a) =>
          a.application_id === schedulingFor.application_id
            ? { ...a, status: 'Interview Scheduled' }
            : a
        ));
      }
    } catch {
      showToast('Failed to schedule interview.', 'error');
    }
  };

  // Fixed: use application-specific resume_url, not profile resume_path
  const handleDownloadResume = (applicant) => {
    if (applicant.resume_url) {
      window.open(applicant.resume_url, '_blank');
    } else {
      showToast('No resume was uploaded with this application.', 'info');
    }
  };

  const openAnswersModal = (applicant) => {
    setViewingAnswers(applicant);
    setAnswersModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Applicants</h1>
            <p className="text-sm text-slate-500 mt-1">Review, shortlist, reject, and schedule interviews for incoming candidates.</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 space-y-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by candidate name or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); fetchApplicants(selectedJobFilter, statusFilter, ''); }}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shrink-0 transition-all"
              >
                Search
              </button>
            </form>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
              </div>
              <select
                value={selectedJobFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm"
              >
                <option value="all">All Job Postings</option>
                {jobs.map((j) => (
                  <option key={j.job_id} value={j.job_id}>{j.title}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : applicants.length === 0 ? (
            <EmptyState
              title="No Applicants Found"
              message="No candidates match your current filters."
              icon={Users}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} found
              </p>
              {applicants.map((applicant) => (
                <ApplicantCard
                  key={applicant.application_id}
                  applicant={applicant}
                  onShortlist={handleShortlist}
                  onReject={handleReject}
                  onScheduleInterview={openScheduleModal}
                  onDownloadResume={handleDownloadResume}
                  onViewAnswers={openAnswersModal}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Interview Scheduler Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Schedule Interview — ${schedulingFor?.name || 'Candidate'}`}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800 font-medium">
            Scheduling interview for: <strong>{schedulingFor?.name}</strong> — Applied for: <strong>{schedulingFor?.job_title}</strong>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date *</label>
              <input
                type="date"
                required
                value={interviewForm.interview_date}
                onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interview Time *</label>
              <input
                type="time"
                required
                value={interviewForm.interview_time}
                onChange={(e) => setInterviewForm({ ...interviewForm, interview_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
            <input
              type="url"
              value={interviewForm.meeting_link}
              onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Interview Mode</label>
            <select
              value={interviewForm.interview_mode}
              onChange={(e) => setInterviewForm({ ...interviewForm, interview_mode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
            >
              <option value="Online">Online (Virtual)</option>
              <option value="Offline">Offline (In-Person)</option>
              <option value="Phone">Phone Screen</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600">Cancel</button>
            <button type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Confirm &amp; Notify Candidate
            </button>
          </div>
        </form>
      </Modal>

      {/* View Answers Modal */}
      <Modal
        isOpen={answersModalOpen}
        onClose={() => { setAnswersModalOpen(false); setViewingAnswers(null); }}
        title={`Application Answers — ${viewingAnswers?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        {viewingAnswers && (
          <div className="space-y-4">
            {/* Candidate Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><span className="font-bold text-slate-700">Position:</span> <span className="text-slate-600">{viewingAnswers.job_title}</span></p>
              <p><span className="font-bold text-slate-700">Applied:</span> <span className="text-slate-600">{new Date(viewingAnswers.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
              {viewingAnswers.resume_url && (
                <a
                  href={viewingAnswers.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary font-semibold hover:underline mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Submitted Resume
                </a>
              )}
            </div>

            {/* Cover Letter */}
            {viewingAnswers.cover_letter && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 mb-1 uppercase tracking-wide">Cover Letter</p>
                <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">{viewingAnswers.cover_letter}</p>
              </div>
            )}

            {/* Q&A Pairs */}
            {Array.isArray(viewingAnswers.application_answers) && viewingAnswers.application_answers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Questions &amp; Answers</p>
                {viewingAnswers.application_answers.map((qa, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      Q{i + 1}. {qa.question_text}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {qa.answer?.trim() || <span className="text-slate-400 italic">No answer provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400">
                No application questions were configured for this job posting.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
