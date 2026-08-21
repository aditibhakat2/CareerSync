import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  BarChart2,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
  FileText,
  Video,
  Target,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { AnalyticsCard } from '../../components/cards/AnalyticsCard';
import { JobCard } from '../../components/cards/JobCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user) {
    fetchDashboard();
  }
}, [user]);

const fetchDashboard = async () => {
  try {
    const [dashboardResult, applicationsResult, savedJobsResult] =
      await Promise.allSettled([
        api.get('/student/dashboard'),
        api.get('/student/applied-jobs'),
        api.get('/student/saved-jobs')
      ]);

    const dashboard =
      dashboardResult.status === 'fulfilled' &&
      dashboardResult.value.data?.success
        ? dashboardResult.value.data
        : {};

    const applications =
      applicationsResult.status === 'fulfilled' &&
      applicationsResult.value.data?.success
        ? applicationsResult.value.data.applications || []
        : [];

    const savedJobs =
      savedJobsResult.status === 'fulfilled' &&
      savedJobsResult.value.data?.success
        ? savedJobsResult.value.data.savedJobs || []
        : [];

    setData({
      ...dashboard,

      metrics: {
        ...(dashboard.metrics || {}),
        totalApplications: applications.length,
        savedJobs: savedJobs.length
      },

      latestApplications:
        dashboard.latestApplications?.length > 0
          ? dashboard.latestApplications
          : applications.slice(0, 5)
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-emerald-100 text-emerald-800';
      case 'Interview Scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'Rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          
          {/* Welcome Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back, {user?.name || 'Student'}!
              </h1>
              <p className="text-sm text-slate-500 mt-1">Here is your live placement preparation overview for today.</p>
            </div>

            <Link
              to="/student/resume"
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 w-fit"
            >
              <FileText className="w-4 h-4" />
              AI Resume Assistant
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : (
            <div className="space-y-8">
              
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                  title="Total Applications"
                  value={data?.metrics?.totalApplications || 0}
                  subtitle="Tracked applications"
                  icon={Briefcase}
                  color="blue"
                />
                <AnalyticsCard
                  title="Saved Jobs"
                  value={data?.metrics?.savedJobs || 0}
                  subtitle="Bookmarked positions"
                  icon={Bookmark}
                  color="amber"
                />
                <AnalyticsCard
                  title="Resume ATS Score"
                  value={`${data?.metrics?.atsScore || 88}%`}
                  subtitle="Compatibility score"
                  icon={BarChart2}
                  color="emerald"
                />
                <AnalyticsCard
                  title="Upcoming Interviews"
                  value={data?.metrics?.upcomingInterviews || 0}
                  subtitle="Scheduled rounds"
                  icon={Calendar}
                  color="indigo"
                />
              </div>

              {/* Smart Career Tools */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Smart Career Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/student/resume" className="p-5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 flex flex-col items-start transition-colors group">
                    <FileText className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-900 mb-1">AI Resume Assistant</span>
                    <span className="text-xs text-slate-500 leading-relaxed">Build ATS-friendly resumes, analyze resume quality, and receive personalized suggestions.</span>
                  </Link>
                  <Link to="/student/mock-interview" className="p-5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-100 flex flex-col items-start transition-colors group">
                    <Video className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-900 mb-1">Mock Interview</span>
                    <span className="text-xs text-slate-500 leading-relaxed">Practice technical and HR interviews with personalized questions and feedback.</span>
                  </Link>
                  <Link to="/student/skill-gap" className="p-5 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-100 flex flex-col items-start transition-colors group">
                    <Target className="w-6 h-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-900 mb-1">Skill Gap Analysis</span>
                    <span className="text-xs text-slate-500 leading-relaxed">Compare your skills with target roles and receive a personalized learning roadmap.</span>
                  </Link>
                </div>
              </div>

              {/* Grid: Latest Applications & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Applied Jobs Table / Cards */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Latest Applied Jobs</h3>
                    <Link to="/student/applied-jobs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      View All Applications <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {data?.latestApplications?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No active applications found yet. Search jobs to apply!</p>
                  ) : (
                    <div className="space-y-3">
                      {data?.latestApplications?.map((app) => (
                        <div key={app.application_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-primary text-sm">
                              {app.company_name ? app.company_name.charAt(0) : 'C'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{app.title}</h4>
                              <p className="text-xs text-slate-500">{app.company_name} • {app.location}</p>
                            </div>
                          </div>

                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications & Announcements */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Notifications
                    </h3>
                    <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Real-time</span>
                  </div>

                  <div className="space-y-3">
                    {data?.notifications?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No unread notifications.</p>
                    ) : (
                      data?.notifications?.map((notif) => (
                        <div key={notif.notification_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <h5 className="text-xs font-bold text-slate-800">{notif.title}</h5>
                          <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 block pt-1">
                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Recommended Jobs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Recommended Jobs For You</h3>
                  <Link to="/jobs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">Explore All Jobs <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data?.recommendedJobs?.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      onApply={() => api.post('/jobs/apply', { job_id: job.job_id })}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};
