import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ShieldCheck, ArrowRight, Eye, EyeOff, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ── Inline SVG Logo ───────────────────────────────────────────────────────
const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="loginGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#loginGrad)" />
    <polyline points="8,28 16,18 22,23 32,11" stroke="white" strokeWidth="2.8"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="32" cy="11" r="2.8" fill="#FCD34D" />
    <line x1="8" y1="31" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const roles = [
  { id: 'Student', label: 'Student', icon: User,        desc: 'Job search & career tools' },
  { id: 'Company', label: 'Recruiter', icon: Building,  desc: 'Post jobs & hire talent' },
  { id: 'Admin',   label: 'Admin',   icon: ShieldCheck, desc: 'Platform governance' },
];


export const LoginPage = () => {
  const { login }      = useAuth();
  const { showToast }  = useToast();
  const navigate       = useNavigate();

  const [role,     setRole]     = useState('Student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      if (res.data.success) {
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        login(res.data.user, res.data.token);
        const r = res.data.user.role?.toLowerCase();
        if (r === 'student') navigate('/student/dashboard');
        else if (r === 'company') navigate('/company/dashboard');
        else if (r === 'admin') navigate('/admin/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (hidden on mobile) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary-dark via-primary to-secondary
                      flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <Logo />
          <div>
            <p className="font-extrabold text-white text-xl tracking-tight leading-none">CareerSync</p>
            <p className="text-indigo-300 text-[11px] font-semibold tracking-wider uppercase mt-0.5">
              Placement &amp; Career Platform
            </p>
          </div>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              One Platform for<br />
              <span className="text-amber-400">Every Career Move</span>
            </h1>
            <p className="text-indigo-200 text-base mt-4 leading-relaxed max-w-md">
              Helping students build resumes, prepare for interviews, explore opportunities,
              and connect with recruiters through one platform.
            </p>
          </div>

          {/* Trust statements */}
          <div className="space-y-3">
            {[
              'Trusted by students preparing for campus and off-campus placements',
              'Designed for students, recruiters, and placement administrators',
              'Resume Assistant, Job Search, Mock Interviews, and Skill Gap Analysis—all in one platform',
              'Completely free for all registered students',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-indigo-200 text-sm">
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-400/60 text-xs relative z-10">
          © {new Date().getFullYear()} CareerSync Technologies Pvt. Ltd. · Made in India 🇮🇳
        </p>
      </div>

      {/* ── Right login panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-[420px] space-y-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <Logo />
            <div>
              <p className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">CareerSync</p>
              <p className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase">
                Placement &amp; Career Platform
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Role tabs */}
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1">
            {roles.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold
                            transition-all duration-150 ${
                              role === id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl
                         shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-200
                         flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In as {role}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            By signing in you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
