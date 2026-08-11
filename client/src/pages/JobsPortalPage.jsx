import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { JobCard } from '../components/cards/JobCard';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { ApplicationModal } from '../components/common/ApplicationModal';

export const JobsPortalPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteOption, setRemoteOption] = useState('');
  const [sort, setSort] = useState('latest');

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null); // job being applied to
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, [sort]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (company) params.company = company;
      if (skills) params.skills = skills;
      if (experience) params.experience = experience;
      if (jobType) params.job_type = jobType;
      if (remoteOption) params.remote_option = remoteOption;
      if (sort) params.sort = sort;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      showToast('Error loading job postings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    if (!user) {
      showToast('Please sign in to apply for jobs.', 'info');
      return navigate('/login');
    }
    if (user.role !== 'Student') {
      return showToast('Only registered students can apply for jobs.', 'error');
    }
    setSelectedJob(null); // close details modal if open
    setApplyingJob(job);  // open application modal
  };

  const handleApplicationSuccess = () => {
    showToast('Application submitted successfully!', 'success');
  };

  const handleSave = async (jobId) => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post('/jobs/save', { job_id: jobId });
      if (res.data.success) {
        showToast('Job saved to bookmarks!', 'success');
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Job already saved.', 'info');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setCompany('');
    setSkills('');
    setExperience('');
    setJobType('');
    setRemoteOption('');
    setSort('latest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Jobs & Internships</h1>
          <p className="text-sm text-slate-500 mt-1">Discover curated job openings from verified employers and top tech companies.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search job title, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location (Bengaluru, Hyderabad, Pune, Remote…)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all shadow-sm shrink-0"
            >
              Filter Jobs
            </button>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="">All Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Internship">Internship</option>
            </select>

            <select
              value={remoteOption}
              onChange={(e) => setRemoteOption(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="">Experience Level</option>
              <option value="Fresher">Fresher</option>
              <option value="0-2 years">0-2 years</option>
              <option value="1-3 years">1-3 years</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="latest">Sort: Latest</option>
              <option value="salary">Sort: Highest Salary</option>
              <option value="deadline">Sort: Deadline</option>
            </select>

            <button
              onClick={clearFilters}
              className="col-span-2 sm:col-span-1 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Jobs Grid Container */}
        {loading ? (
          <SkeletonLoader count={6} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No matching jobs found"
            message="Try broadening your search terms or clearing specific filters."
            actionText="Reset Filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onApply={handleApply}
                onSave={handleSave}
                isSaved={savedJobIds.includes(job.job_id)}
                onViewDetails={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detailed View Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title || 'Job Details'}
        maxWidth="max-w-2xl"
      >
        {selectedJob && (
          <div className="space-y-6 text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{selectedJob.company_name}</span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedJob.location} • {selectedJob.job_type} ({selectedJob.remote_option})</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-600">{selectedJob.salary}</span>
                <p className="text-[11px] text-slate-400 font-semibold">{selectedJob.vacancies} Vacancies</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Description</h4>
              <p className="text-sm leading-relaxed">{selectedJob.description}</p>
            </div>

            {selectedJob.responsibilities && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Responsibilities</h4>
                <p className="text-sm leading-relaxed">{selectedJob.responsibilities}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.required_skills ? (
                  selectedJob.required_skills.split(',').map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                      {s.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">General CS Core Skills</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleApply(selectedJob)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Submit Application Now
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Application Modal (multi-step) */}
      <ApplicationModal
        job={applyingJob}
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        onSuccess={handleApplicationSuccess}
      />

      <Footer />
    </div>
  );
};
