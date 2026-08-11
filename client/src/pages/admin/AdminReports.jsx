import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Users, Briefcase, Building2, Activity } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

// A simple bar chart rendered in pure CSS (no charting library dependency)
const SimpleBarChart = ({ data, label }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-600">{item.value}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-700"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-[10px] text-slate-400 text-center leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminReports = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.data.success) setReports(res.data);
    } catch {
      showToast('Error loading platform reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reports) return;
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Students', reports.stats?.total_students],
      ['Total Companies', reports.stats?.total_companies],
      ['Total Jobs Posted', reports.stats?.total_jobs],
      ['Total Applications', reports.stats?.total_applications],
      ['AI Resumes Generated', reports.stats?.ai_resumes],
      ['Mock Interviews Done', reports.stats?.mock_interviews],
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CareerSync_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Report exported as CSV.', 'success');
  };

  const summaryCards = reports ? [
    { label: 'Total Students', value: reports.stats?.total_students, icon: Users, color: 'bg-indigo-500' },
    { label: 'Total Companies', value: reports.stats?.total_companies, icon: Building2, color: 'bg-violet-500' },
    { label: 'Active Jobs', value: reports.stats?.total_jobs, icon: Briefcase, color: 'bg-emerald-500' },
    { label: 'Total Applications', value: reports.stats?.total_applications, icon: Activity, color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Reports</h1>
              <p className="text-sm text-slate-500 mt-1">Insights, analytics, and usage statistics for CareerSync.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={!reports}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV Report
            </button>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : !reports ? (
            <div className="text-center py-16 text-slate-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-3 text-slate-200" />
              <p className="text-sm">No report data available.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {summaryCards.map((card, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{card.value?.toLocaleString?.() ?? card.value ?? '—'}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Registrations */}
                {reports.monthly_registrations?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Monthly Student Registrations
                    </h2>
                    <SimpleBarChart data={reports.monthly_registrations} label="Students per month" />
                  </div>
                )}

                {/* Monthly Applications */}
                {reports.monthly_applications?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Monthly Job Applications
                    </h2>
                    <SimpleBarChart data={reports.monthly_applications} label="Applications per month" />
                  </div>
                )}
              </div>

              {/* Top Companies by Job Postings */}
              {reports.top_companies?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-500" />
                    Top Companies by Job Postings
                  </h2>
                  <div className="space-y-3">
                    {reports.top_companies.map((company, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                        <p className="flex-1 text-sm font-semibold text-slate-800">{company.company_name}</p>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-700"
                            style={{ width: `${(company.jobs_count / reports.top_companies[0].jobs_count) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 w-8 text-right">{company.jobs_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
