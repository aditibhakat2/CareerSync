import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Search, Bookmark, Briefcase,
  FileText, Video, Target, Settings, LogOut, Building,
  PlusCircle, Users, FileSpreadsheet, ChevronLeft, ChevronRight,
  BarChart3, MapPin, ClipboardList, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── CareerSync mini logo (reused from Navbar) ─────────────────────────────
const MiniLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#sideGrad)" />
    <defs>
      <linearGradient id="sideGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <polyline points="8,28 16,18 22,23 32,11" stroke="white" strokeWidth="2.8"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="32" cy="11" r="2.8" fill="#FCD34D" />
    <line x1="8" y1="31" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// ── Navigation maps per role ──────────────────────────────────────────────
const NAV = {
  Student: {
    main: [
      { name: 'Home',          path: '/student/dashboard',     icon: LayoutDashboard },
      { name: 'Job Search',    path: '/jobs',                  icon: Search          },
      { name: 'Saved Jobs',    path: '/student/saved-jobs',    icon: Bookmark        },
      { name: 'Applications',  path: '/student/applied-jobs',  icon: ClipboardList   },
    ],
    tools: [
      { name: 'AI Resume Assistant',path: '/student/resume',          icon: FileText  },
      { name: 'Mock Interview',    path: '/student/mock-interview',   icon: Video     },
      { name: 'Skill Gap Analysis',path: '/student/skill-gap',        icon: Target    },
    ],
    account: [
      { name: 'My Profile',   path: '/student/profile',    icon: User     },
      { name: 'Settings',     path: '/student/settings',   icon: Settings },
    ],
  },
  Company: {
    main: [
      { name: 'Dashboard',       path: '/company/dashboard',  icon: LayoutDashboard },
      { name: 'My Jobs',         path: '/company/jobs',       icon: Briefcase       },
      { name: 'Post Job',        path: '/company/post-job',   icon: PlusCircle      },
      { name: 'Applicants',      path: '/company/applicants', icon: Users           },
    ],
    tools: [
      { name: 'Analytics',       path: '/company/analytics',  icon: BarChart3       },
    ],
    account: [
      { name: 'Company Profile', path: '/company/profile',   icon: Building },
      { name: 'Settings',        path: '/company/settings',  icon: Settings },
    ],
  },
  Admin: {
    main: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Students',  path: '/admin/students',  icon: Users           },
      { name: 'Companies', path: '/admin/companies', icon: Building        },
      { name: 'Jobs',      path: '/admin/jobs',       icon: Briefcase       },
    ],
    tools: [
      { name: 'Reports',   path: '/admin/reports',   icon: FileSpreadsheet },
    ],
    account: [
      { name: 'Settings',  path: '/admin/settings',  icon: Settings },
    ],
  },
};

// ── NavItem component ─────────────────────────────────────────────────────
const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
          isActive
            ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-4.5 h-4.5 shrink-0 w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}`} />
          {!collapsed && <span className="truncate">{item.name}</span>}
          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-700 text-white text-xs font-semibold
                            rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                            transition-opacity duration-150 z-50 shadow-lg">
              {item.name}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

// ── Section label ─────────────────────────────────────────────────────────
const SectionLabel = ({ label, collapsed }) =>
  collapsed ? (
    <div className="h-px bg-slate-800 mx-2 my-3" />
  ) : (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 select-none">
      {label}
    </p>
  );

// ── Main Sidebar ──────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role; // 'Student' | 'Company' | 'Admin'
  const nav  = NAV[role] ?? NAV.Student;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-300 min-h-screen border-r border-slate-800
                  transition-all duration-300 flex flex-col shrink-0 ${
                    collapsed ? 'w-[68px]' : 'w-60'
                  }`}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={`h-16 flex items-center border-b border-slate-800 ${collapsed ? 'justify-center px-2' : 'px-4 gap-3'}`}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
            title="Expand"
          >
            <MiniLogo />
          </button>
        ) : (
          <>
            <MiniLogo />
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="text-sm font-bold text-white tracking-tight">CareerSync</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {role} Portal
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── User card ───────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary
                          text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto mt-3 space-y-0.5">
        {/* Main items */}
        <SectionLabel label={role === 'Student' ? 'CAREER' : 'Main'} collapsed={collapsed} />
        {nav.main.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}

        {/* Tools / AI features */}
        {nav.tools.length > 0 && (
          <>
            <SectionLabel label={role === 'Student' ? 'CAREER TOOLS' : 'Analytics'} collapsed={collapsed} />
            {nav.tools.map((item) => (
              <NavItem key={item.path} item={item} collapsed={collapsed} />
            ))}
          </>
        )}

        {/* Account */}
        <SectionLabel label="Account" collapsed={collapsed} />
        {nav.account.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Logout ──────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors
                      ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
