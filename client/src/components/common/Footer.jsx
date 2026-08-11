import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

// ── Logo SVG (shared) ─────────────────────────────────────────────────────
const CareerSyncLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footerGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#footerGrad)" />
    <polyline points="8,28 16,18 22,23 32,11" stroke="white" strokeWidth="2.8"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="32" cy="11" r="2.8" fill="#FCD34D" />
    <line x1="8" y1="31" x2="32" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <CareerSyncLogo />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Career<span className="text-primary-light">Sync</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mt-0.5">
                  Placement &amp; Career Platform
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              CareerSync is an AI-powered placement and career platform that helps students build and analyze ATS-friendly resumes, prepare for interviews, identify skill gaps, and apply to verified job opportunities—all from one platform.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/jobs"   className="hover:text-white transition-colors">Job Search</Link></li>
              <li><Link to="/login"  className="hover:text-white transition-colors">Resume Assistant</Link></li>
              <li><Link to="/login"  className="hover:text-white transition-colors">Mock Interview</Link></li>
              <li><Link to="/login"  className="hover:text-white transition-colors">Skill Gap Analysis</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Quick Access</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login"    className="hover:text-white transition-colors">Student Login</Link></li>
              <li><Link to="/login"    className="hover:text-white transition-colors">Recruiter Portal</Link></li>
              <li><Link to="/login"    className="hover:text-white transition-colors">Admin Panel</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                <span>support@careersync.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                <span>+91 8637866730</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <p>© {new Date().getFullYear()} CareerSync Technologies Pvt. Ltd. · Made in India 🇮🇳</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
