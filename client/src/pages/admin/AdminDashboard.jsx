import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Building2, Shield, TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

// Stat card component for admin metrics
const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          ↑ {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-extrabold text-slate-900">{value?.toLocaleString?.() ?? value ?? '—'}</p>
    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
  </div>
);

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.metrics);
        setRecentActivity(res.data.recentActivity || []);
        setPendingCompanies(res.data.recentCompanies?.filter(c => !c.verified) || []);
      }
    } catch {
      showToast('Error loading admin dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId, action) => {
    try {
      // Backend expects { company_id, status, remarks } in body
      await api.put(`/admin/companies/${companyId}/verify`, {
        company_id: companyId,
        status: action === 'verify' ? 'Verified' : 'Rejected',
        remarks: action === 'verify' ? 'Verified by Admin' : 'Rejected by Admin'
      });
      showToast(`Company ${action === 'verify' ? 'verified' : 'rejected'} successfully.`, 'success');
      setPendingCompanies((prev) => prev.filter((c) => c.company_id !== companyId));
    } catch {
      showToast('Failed to update company status.', 'error');
    }
  };

  const metricCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-indigo-500', trend: '+12%' },
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, color: 'bg-violet-500', trend: '+8%' },
    { label: 'Active Job Postings', value: stats.totalJobs, icon: Briefcase, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Total Applications', value: stats.totalApplications, icon: TrendingUp, color: 'bg-amber-500', trend: '+24%' },
    { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'bg-sky-500' },
    { label: 'Pending Verifications', value: stats.pendingCompanyVerifications, icon: AlertTriangle, color: 'bg-rose-500' },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Platform overview and moderation controls.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {metricCards.map((card, i) => (
                  <StatCard key={i} {...card} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Company Verifications */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Pending Company Verifications
                  </h2>
                  {pendingCompanies.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                      <p className="text-sm font-medium">All companies verified</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingCompanies.slice(0, 5).map((company) => (
                        <div key={company.company_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{company.company_name}</p>
                            <p className="text-xs text-slate-500">{company.email} • {company.industry}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyCompany(company.company_id, 'verify')}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100"
                            >
                              ✓ Verify
                            </button>
                            <button
                              onClick={() => handleVerifyCompany(company.company_id, 'reject')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 hover:bg-rose-100"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Recent Platform Activity
                  </h2>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm font-medium">No recent activity available.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 8).map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                            activity.type === 'registration' ? 'bg-indigo-400' :
                            activity.type === 'application' ? 'bg-emerald-400' :
                            activity.type === 'job_post' ? 'bg-violet-400' : 'bg-slate-300'
                          }`} />
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{activity.message}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{activity.time_ago}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
