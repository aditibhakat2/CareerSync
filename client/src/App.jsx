import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/common/Loader';

// ── Lazy Load Pages for code splitting ─────────────────────────────────────
const LandingPage          = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage            = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage         = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const JobsPortalPage       = lazy(() => import('./pages/JobsPortalPage').then(m => ({ default: m.JobsPortalPage })));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Student Pages
const StudentDashboard     = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentProfile       = lazy(() => import('./pages/student/StudentProfile').then(m => ({ default: m.StudentProfile })));
const StudentSettings      = lazy(() => import('./pages/student/StudentSettings').then(m => ({ default: m.StudentSettings })));
const SavedJobs            = lazy(() => import('./pages/student/SavedJobs').then(m => ({ default: m.SavedJobs })));
const AppliedJobs          = lazy(() => import('./pages/student/AppliedJobs').then(m => ({ default: m.AppliedJobs })));
const ResumeBuilder        = lazy(() => import('./pages/student/ResumeBuilder').then(m => ({ default: m.ResumeBuilder })));
// AIResumeGenerator & AIResumeAnalyzer merged into ResumeBuilder — see redirect routes below
const MockInterview        = lazy(() => import('./pages/student/MockInterview').then(m => ({ default: m.MockInterview })));
const SkillGapAnalysis     = lazy(() => import('./pages/student/SkillGapAnalysis').then(m => ({ default: m.SkillGapAnalysis })));

// Company Pages
const CompanyDashboard     = lazy(() => import('./pages/company/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })));
const CompanyProfile       = lazy(() => import('./pages/company/CompanyProfile').then(m => ({ default: m.CompanyProfile })));
const CompanySettings      = lazy(() => import('./pages/company/CompanySettings').then(m => ({ default: m.CompanySettings })));
const PostJob              = lazy(() => import('./pages/company/PostJob').then(m => ({ default: m.PostJob })));
const ManageJobs           = lazy(() => import('./pages/company/ManageJobs').then(m => ({ default: m.ManageJobs })));
const CompanyApplicants    = lazy(() => import('./pages/company/CompanyApplicants').then(m => ({ default: m.CompanyApplicants })));
const CompanyAnalytics     = lazy(() => import('./pages/company/CompanyAnalytics').then(m => ({ default: m.CompanyAnalytics })));

// Admin Pages
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminStudents        = lazy(() => import('./pages/admin/AdminStudents').then(m => ({ default: m.AdminStudents })));
const AdminCompanies       = lazy(() => import('./pages/admin/AdminCompanies').then(m => ({ default: m.AdminCompanies })));
const AdminJobs            = lazy(() => import('./pages/admin/AdminJobs').then(m => ({ default: m.AdminJobs })));
const AdminReports         = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminSettings        = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// ── Route Guard Components ──────────────────────────────────────────────────

/**
 * PrivateRoute: Redirects to /login if no token present.
 */
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

/**
 * RoleRoute: Redirects if the user's role doesn't match expected role.
 * Roles are stored as capitalized: 'Student', 'Company', 'Admin'
 */
const RoleRoute = ({ children, role }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  // Normalize comparison - backend returns capitalized roles
  const normalizedUserRole = user?.role?.toLowerCase();
  const normalizedExpectedRole = role?.toLowerCase();
  if (!user || normalizedUserRole !== normalizedExpectedRole) return <Navigate to="/" replace />;
  return children;
};

// ── Page Loading Fallback ───────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader message="Loading..." />
  </div>
);

// ── Main App Component ──────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public Routes ──────────────────────────────────── */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />
      <Route path="/jobs"          element={<PrivateRoute><JobsPortalPage /></PrivateRoute>} />

      {/* ── Student Protected Routes ────────────────────────── */}
      <Route path="/student/dashboard"    element={<RoleRoute role="student"><StudentDashboard /></RoleRoute>} />
      <Route path="/student/profile"      element={<RoleRoute role="student"><StudentProfile /></RoleRoute>} />
      <Route path="/student/settings"     element={<RoleRoute role="student"><StudentSettings /></RoleRoute>} />
      <Route path="/student/saved-jobs"   element={<RoleRoute role="student"><SavedJobs /></RoleRoute>} />
      <Route path="/student/applied-jobs" element={<RoleRoute role="student"><AppliedJobs /></RoleRoute>} />
      <Route path="/student/resume"       element={<RoleRoute role="student"><ResumeBuilder /></RoleRoute>} />
      {/* Legacy redirects — AI pages merged into Resume Builder */}
      <Route path="/student/ai-generator" element={<Navigate to="/student/resume" replace />} />
      <Route path="/student/ai-analyzer"  element={<Navigate to="/student/resume" replace />} />
      <Route path="/student/mock-interview" element={<RoleRoute role="student"><MockInterview /></RoleRoute>} />
      <Route path="/student/skill-gap"    element={<RoleRoute role="student"><SkillGapAnalysis /></RoleRoute>} />

      {/* ── Company Protected Routes ─────────────────────────── */}
      <Route path="/company/dashboard"    element={<RoleRoute role="company"><CompanyDashboard /></RoleRoute>} />
      <Route path="/company/profile"      element={<RoleRoute role="company"><CompanyProfile /></RoleRoute>} />
      <Route path="/company/settings"     element={<RoleRoute role="company"><CompanySettings /></RoleRoute>} />
      <Route path="/company/post-job"     element={<RoleRoute role="company"><PostJob /></RoleRoute>} />
      <Route path="/company/jobs"         element={<RoleRoute role="company"><ManageJobs /></RoleRoute>} />
      <Route path="/company/applicants"   element={<RoleRoute role="company"><CompanyApplicants /></RoleRoute>} />
      <Route path="/company/analytics"    element={<RoleRoute role="company"><CompanyAnalytics /></RoleRoute>} />

      {/* ── Admin Protected Routes ───────────────────────────── */}
      <Route path="/admin/dashboard"  element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
      <Route path="/admin/students"   element={<RoleRoute role="admin"><AdminStudents /></RoleRoute>} />
      <Route path="/admin/companies"  element={<RoleRoute role="admin"><AdminCompanies /></RoleRoute>} />
      <Route path="/admin/jobs"       element={<RoleRoute role="admin"><AdminJobs /></RoleRoute>} />
      <Route path="/admin/reports"    element={<RoleRoute role="admin"><AdminReports /></RoleRoute>} />
      <Route path="/admin/settings"   element={<RoleRoute role="admin"><AdminSettings /></RoleRoute>} />

      {/* ── 404 Catch-All ──────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
