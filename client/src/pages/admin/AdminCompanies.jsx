import React, { useState, useEffect } from 'react';
import { Search, Building2, CheckCircle2, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const AdminCompanies = () => {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [searchQuery, filterStatus, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies', {
        params: { search: searchQuery, status: filterStatus, page, limit: 10 }
      });
      if (res.data.success) {
        setCompanies(res.data.companies);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch {
      showToast('Error loading companies.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId, verified) => {
    try {
      await api.put(`/admin/companies/${companyId}/verify`, {
        status: verified ? 'Verified' : 'Pending',
        remarks: verified ? 'Verified by Admin' : 'Revoked by Admin'
      });
      showToast(verified ? 'Company verified!' : 'Company unverified.', 'success');
      setCompanies((prev) =>
        prev.map((c) => c.company_id === companyId ? { ...c, is_verified: verified, verified: verified ? 1 : 0 } : c)
      );
    } catch {
      showToast('Failed to update verification status.', 'error');
    }
  };

  const confirmDelete = (company) => {
    setDeletingCompany(company);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/companies/${deletingCompany.company_id}`);
      showToast(`Company "${deletingCompany.company_name}" removed from platform.`, 'info');
      setCompanies((prev) => prev.filter((c) => c.company_id !== deletingCompany.company_id));
    } catch {
      showToast('Failed to delete company.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setDeletingCompany(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Management</h1>
            <p className="text-sm text-slate-500 mt-1">Verify, manage, and moderate all registered companies on the platform.</p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search by company name or industry..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
            >
              <option value="all">All Companies</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Pending Verification</option>
            </select>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : companies.length === 0 ? (
            <EmptyState title="No Companies Found" message="No companies match your current filters." icon={Building2} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Company</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Industry</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Jobs Posted</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Verified</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map((company) => (
                      <tr key={company.company_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-600 text-sm flex-shrink-0">
                              {company.company_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{company.company_name}</p>
                              <p className="text-xs text-slate-500">{company.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {company.industry || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm font-bold text-indigo-600">{company.jobs_count ?? 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          {company.is_verified ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full w-fit">
                              <AlertTriangle className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!company.is_verified ? (
                              <button
                                onClick={() => handleVerify(company.company_id, true)}
                                className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Verify Company"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(company.company_id, false)}
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Revoke Verification"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => confirmDelete(company)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove Company"
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
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white hover:bg-slate-50">← Previous</button>
                  <span className="text-xs text-slate-500 font-semibold">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white hover:bg-slate-50">Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Remove Company">
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            This will permanently delete <strong>{deletingCompany?.company_name}</strong>, all their job postings, and associated applications.
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow">Remove Company</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
