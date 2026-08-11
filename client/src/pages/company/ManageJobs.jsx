import React, { useState, useEffect } from 'react';
import { Briefcase, Edit2, Trash2, Eye, Users, PlusSquare, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const ManageJobs = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/company/jobs');
      if (res.data.success) setJobs(res.data.jobs);
    } catch {
      showToast('Error loading your job listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (job) => {
    setEditingJob({ ...job });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/company/edit-job/${editingJob.job_id}`, editingJob);
      if (res.data.success) {
        showToast('Job updated successfully!', 'success');
        setJobs((prev) => prev.map((j) => (j.job_id === editingJob.job_id ? editingJob : j)));
        setEditModalOpen(false);
      }
    } catch {
      showToast('Failed to update job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (jobId) => {
    setDeletingId(jobId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/company/delete-job/${deletingId}`);
      if (res.data.success) {
        showToast('Job posting deleted.', 'info');
        setJobs((prev) => prev.filter((j) => j.job_id !== deletingId));
      }
    } catch {
      showToast('Failed to delete job.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const toggleJobStatus = async (job) => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      await api.put(`/company/edit-job/${job.job_id}`, { ...job, status: newStatus });
      setJobs((prev) => prev.map((j) => j.job_id === job.job_id ? { ...j, status: newStatus } : j));
      showToast(`Job ${newStatus === 'Closed' ? 'closed' : 'reopened'} successfully.`, 'success');
    } catch {
      showToast('Failed to update job status.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Job Postings</h1>
              <p className="text-sm text-slate-500 mt-1">Edit, close, or delete active job listings you've published.</p>
            </div>
            <Link
              to="/company/post-job"
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 w-fit"
            >
              <PlusSquare className="w-4 h-4" />
              Post New Job
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No Job Postings Yet"
              message="Post your first job to start receiving candidate applications."
              actionText="Post a Job"
              onAction={() => navigate('/company/post-job')}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.job_id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {job.status}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">{job.job_type}</span>
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full">{job.remote_option}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.location} • {job.salary} • {job.experience} exp • {job.vacancies} Vacancies
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.required_skills && job.required_skills.split(',').slice(0, 5).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">{s.trim()}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/company/applicants`)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Applicants
                      </button>
                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-colors ${
                          job.status === 'Active'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {job.status === 'Active' ? (
                          <><XCircle className="w-3.5 h-3.5" /> Close Hiring</>
                        ) : (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Reopen</>
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(job)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(job.job_id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Job Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Job Posting" maxWidth="max-w-2xl">
        {editingJob && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input type="text" required value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salary</label>
                <input type="text" value={editingJob.salary}
                  onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea rows="3" value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills</label>
              <input type="text" value={editingJob.required_skills}
                onChange={(e) => setEditingJob({ ...editingJob, required_skills: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                <select value={editingJob.job_type}
                  onChange={(e) => setEditingJob({ ...editingJob, job_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remote</label>
                <select value={editingJob.remote_option}
                  onChange={(e) => setEditingJob({ ...editingJob, remote_option: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Job Posting">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to permanently delete this job posting? All related applications will also be removed.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow">Delete Job</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
