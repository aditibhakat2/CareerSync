import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle2, Calendar, PlusSquare, ArrowRight, Building } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { AnalyticsCard } from '../../components/cards/AnalyticsCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/company/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching company dashboard metrics', err);
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Recruiter Portal: {user?.company_name || user?.name || data?.company_name || 'Recruiter'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage active job postings, evaluate candidate applications, and schedule interviews.</p>
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
          ) : (
            <div className="space-y-8">
              
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                  title="Active Jobs"
                  value={data?.metrics?.activeJobs || 0}
                  subtitle="Open listings"
                  icon={Briefcase}
                  color="blue"
                />
                <AnalyticsCard
                  title="Applications Received"
                  value={data?.metrics?.applicationsReceived || 0}
                  subtitle="Candidate submissions"
                  icon={Users}
                  color="indigo"
                />
                <AnalyticsCard
                  title="Shortlisted Candidates"
                  value={data?.metrics?.shortlistedCandidates || 0}
                  subtitle="Passed initial screen"
                  icon={CheckCircle2}
                  color="emerald"
                />
                <AnalyticsCard
                  title="Interviews Scheduled"
                  value={data?.metrics?.interviewsScheduled || 0}
                  subtitle="Upcoming rounds"
                  icon={Calendar}
                  color="purple"
                />
              </div>

              {/* Recent Applicants */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Recent Candidate Applications</h3>
                  <Link to="/company/applicants" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Manage All Applicants <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {data?.recentApplicants?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No candidate applications received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.recentApplicants?.map((app) => (
                      <div key={app.application_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {app.student_name ? app.student_name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{app.student_name}</h4>
                            <p className="text-xs text-slate-500">{app.college || 'Stanford University'} • Applied for: <span className="font-semibold text-slate-700">{app.job_title}</span></p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
