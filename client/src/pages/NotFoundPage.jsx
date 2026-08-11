import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * NotFoundPage - 404 error page shown for unknown routes.
 * Provides navigation back to home or previous page.
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-violet-600 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 text-[9rem] font-black text-indigo-100 leading-none -z-10 translate-x-1 translate-y-1 select-none">
            404
          </div>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <span className="text-4xl">🔍</span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.<br />
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-indigo-200 hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-slate-700 text-sm font-bold rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          CareerSync — <span className="font-medium">Connecting Talent. Creating Opportunities.</span>
        </p>
      </div>
    </div>
  );
};
