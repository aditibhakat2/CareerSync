import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Trash2, Eye, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const AdminJobs = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, filterType, page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/jobs', {
        params: { search: searchQuery, type: filterType, page, limit: 10 }
      });
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch {
      showToast('Error loading jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (job) => {
    setDeletingJob(job);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/jobs/${deletingJob.job_id}`);
      showToast(`Job "${deletingJob.title}" removed from platform.`, 'info');
      setJobs((prev) => prev.filter((j) => j.job_id !== deletingJob.job_id));
    } catch {
      showToast('Failed to delete job.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setDeletingJob(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Postings Management</h1>
            <p className="text-sm text-slate-500 mt-1">Review and moderate all job listings published on the platform.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search by job title or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
              >
                <option value="all">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={5} />
          ) : jobs.length === 0 ? (
            <EmptyState title="No Jobs Found" message="No job listings match your current filters." icon={Briefcase} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Job Title</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Company</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Type</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Applications</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job.job_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.location}</p>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-xs font-medium text-slate-700">{job.company_name}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">{job.job_type}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm font-bold text-emerald-600">{job.application_count ?? 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                            job.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setViewingJob(job); setViewModalOpen(true); }}
                              className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Job"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(job)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white">← Previous</button>
                  <span className="text-xs text-slate-500 font-semibold">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white">Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* View Job Detail Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={viewingJob?.title || 'Job Details'} maxWidth="max-w-lg">
        {viewingJob && (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[11px] text-slate-400 font-bold uppercase">Company</p><p className="font-semibold">{viewingJob.company_name}</p></div>
              <div><p className="text-[11px] text-slate-400 font-bold uppercase">Location</p><p className="font-semibold">{viewingJob.location}</p></div>
              <div><p className="text-[11px] text-slate-400 font-bold uppercase">Salary</p><p className="font-semibold">{viewingJob.salary}</p></div>
              <div><p className="text-[11px] text-slate-400 font-bold uppercase">Experience</p><p className="font-semibold">{viewingJob.experience}</p></div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Description</p>
              <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl">{viewingJob.description}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {viewingJob.required_skills?.split(',').map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-md border border-indigo-100">{s.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Remove Job Listing">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will permanently remove the job posting <strong>"{deletingJob?.title}"</strong> posted by <strong>{deletingJob?.company_name}</strong>, along with all associated applications.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow">Delete Job</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
