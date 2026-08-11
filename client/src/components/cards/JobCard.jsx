import React from 'react';
import { Building, MapPin, IndianRupee, Briefcase, Calendar, Bookmark, ArrowUpRight } from 'lucide-react';

export const JobCard = ({ job, onApply, onSave, isSaved, onViewDetails }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Company & Logo */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-primary text-lg overflow-hidden shrink-0">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {job.company_name}
              </span>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                {job.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onSave && onSave(job.job_id)}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50'
            }`}
            title={isSaved ? "Saved Job" : "Bookmark Job"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 font-semibold">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
            {job.salary}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            {job.job_type} ({job.remote_option || 'On-site'})
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.required_skills ? (
            job.required_skills.split(',').map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                {skill.trim()}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] rounded-md">General CS</span>
          )}
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently posted'}
        </span>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(job)}
              className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Details
            </button>
          )}
          <button
            onClick={() => onApply && onApply(job)}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-all"
          >
            Apply Now
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
