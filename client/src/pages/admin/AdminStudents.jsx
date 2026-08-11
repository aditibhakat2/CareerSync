import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, User, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const AdminStudents = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', { params: { search: searchQuery, page, limit: 10 } });
      if (res.data.success) {
        setStudents(res.data.students);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch {
      showToast('Error loading students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (student) => {
    setDeletingStudent(student);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      // Backend uses student_id, not user_id
      const id = deletingStudent.student_id || deletingStudent.user_id;
      await api.delete(`/admin/students/${id}`);
      showToast(`Student "${deletingStudent.name}" removed from platform.`, 'info');
      setStudents((prev) => prev.filter((s) => (s.student_id || s.user_id) !== id));
    } catch {
      showToast('Failed to delete student.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setDeletingStudent(null);
    }
  };

  const badgeColor = (status) => {
    if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Banned') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Management</h1>
              <p className="text-sm text-slate-500 mt-1">Search, view, and manage all registered students.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or college..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {loading ? (
            <SkeletonLoader count={5} />
          ) : students.length === 0 ? (
            <EmptyState title="No Students Found" message="No students match your search query." icon={User} />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">College / Degree</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <tr key={student.student_id || student.user_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-xs font-medium text-slate-700">{student.college || '—'}</p>
                          <p className="text-[11px] text-slate-400">{student.degree || ''}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-xs text-slate-600">{new Date(student.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${badgeColor(student.status || 'Active')}`}>
                            {student.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => confirmDelete(student)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white hover:bg-slate-50"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-slate-500 font-semibold">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl disabled:opacity-40 bg-white hover:bg-slate-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Remove Student Account">
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            This will permanently delete <strong>{deletingStudent?.name}</strong>'s account and all related data (applications, resumes, saved jobs).
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow">Remove Student</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
