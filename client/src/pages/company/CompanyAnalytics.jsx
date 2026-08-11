import React, { useState, useEffect } from 'react';
import { BarChart3, Briefcase, Users, Calendar, TrendingUp, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const CompanyAnalytics = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/dashboard');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch {
      // Silently fallback — never 404
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const safe = (val) => (val !== undefined && val !== null ? val : 0);

  const cards = [
    { label: 'Jobs Posted',           value: safe(metrics?.activeJobs),            icon: Briefcase, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Applications Received', value: safe(metrics?.applicationsReceived),  icon: Users,     color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Interviews Scheduled',  value: safe(metrics?.interviewsScheduled),   icon: Calendar,  color: 'bg-purple-50 text-purple-600 border-purple-100'   },
    { label: 'Shortlisted',           value: safe(metrics?.shortlistedCandidates), icon: TrendingUp, color: 'bg-amber-50 text-amber-600 border-amber-100'   },
  ];

  const totalActivity = cards.reduce((sum, c) => sum + Number(c.value), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" />
              Hiring Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track your job posting performance and application pipeline.</p>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-extrabold text-slate-900">{card.value}</span>
                      <p className="text-xs text-slate-500 font-medium mt-1">{card.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Empty State — shown only if truly no activity */}
              {totalActivity === 0 && (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No analytics available yet</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Post your first job to start tracking hiring insights — applications, shortlists, and interview data will appear here automatically.
                  </p>
                </div>
              )}

              {/* Simple breakdown — visible only when there is data */}
              {totalActivity > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Pipeline Breakdown</h2>
                  {cards.map((card) => {
                    const pct = totalActivity > 0 ? Math.round((Number(card.value) / totalActivity) * 100) : 0;
                    return (
                      <div key={card.label}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{card.label}</span>
                          <span>{card.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
