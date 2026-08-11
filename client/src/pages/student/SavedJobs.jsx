import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { JobCard } from '../../components/cards/JobCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export const SavedJobs = () => {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/student/saved-jobs');
      if (res.data.success) {
        setSavedJobs(res.data.savedJobs);
      }
    } catch (err) {
      showToast('Error loading saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      const res = await api.delete(`/jobs/save/${jobId}`);
      if (res.data.success) {
        showToast('Job removed from bookmarks.', 'info');
        setSavedJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      }
    } catch (err) {
      showToast('Failed to remove saved job.', 'error');
    }
  };

  const handleApply = async (job) => {
    try {
      const res = await api.post('/jobs/apply', { job_id: job.job_id });
      if (res.data.success) {
        showToast(`Applied successfully for ${job.title}!`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Application failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
            <p className="text-sm text-slate-500 mt-1">Bookmarked positions saved for later review and application.</p>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : savedJobs.length === 0 ? (
            <EmptyState
              title="No Saved Jobs"
              message="You haven't saved any job postings to your bookmarks yet."
              actionText="Browse Job Search"
              onAction={() => window.location.href = '/jobs'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onApply={handleApply}
                  onSave={() => handleUnsave(job.job_id)}
                  isSaved={true}
                />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
