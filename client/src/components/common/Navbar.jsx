import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LayoutDashboard, ChevronDown,
  Briefcase, Search, FileText, ClipboardList, Video, Target,
  Building, PlusCircle, Users, BarChart3, Settings, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── CareerSync SVG Logo ────────────────────────────────────────────────────
const CareerSyncLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Rounded square background */}
    <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
    {/* Arrow/growth symbol — upward trending path */}
    <polyline
      points="8,28 16,18 22,23 32,11"
      stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
      fill="none"
    />
    {/* Dot at the peak */}
    <circle cx="32" cy="11" r="2.8" fill="#FCD34D" />
    {/* Horizontal baseline */}
    <line x1="8" y1="31" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// ── Role-aware navigation definitions ─────────────────────────────────────
const getNavItems = (role) => {
  if (!role) {
    return [
      { name: 'Home', path: '/' },
    ];
  }
  if (role === 'Student') {
    return [
      { name: 'Home', path: '/student/dashboard', icon: LayoutDashboard },
    ];
  }
  if (role === 'Company') {
    return [
      { name: 'Home', path: '/company/dashboard', icon: LayoutDashboard },
    ];
  }
  if (role === 'Admin') {
    return [
      { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
    ];
  }
  return [];
};

const getDashboardPath = (role) => {
  if (role === 'Student') return '/student/dashboard';
  if (role === 'Company') return '/company/dashboard';
  if (role === 'Admin')   return '/admin/dashboard';
  return '/login';
};

// ── Component ──────────────────────────────────────────────────────────────
export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  const role     = user?.role || null;
  const navItems = getNavItems(role);
  const dashPath = getDashboardPath(role);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <nav className="bg-white/95 glass border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Brand ──────────────────────────────────────────────── */}
          <Link
            to={user ? dashPath : '/'}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="group-hover:scale-105 transition-transform duration-200">
              <CareerSyncLogo size={36} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[1.1rem] tracking-tight text-slate-900">
                Career<span className="text-primary">Sync</span>
              </span>
              <span className="text-[9.5px] font-semibold tracking-widest uppercase text-slate-400 hidden sm:block mt-0.5">
                Placement &amp; Career Platform
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon   = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-primary/8 text-primary font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* ── Auth area ────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card-lg border border-slate-100 py-2 z-50 animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[140px]">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-md">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={dashPath}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    {/* Profile link */}
                    {role === 'Student' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                    )}
                    {role === 'Company' && (
                      <Link
                        to="/company/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <Building className="w-4 h-4 text-slate-400" />
                        Company Profile
                      </Link>
                    )}

                    {/* Settings */}
                    <Link
                      to={`/${role?.toLowerCase()}/settings`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-card-lg transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile toggle ─────────────────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                {item.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to={dashPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
