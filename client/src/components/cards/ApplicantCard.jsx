import React from 'react';
import { User, Download, CheckCircle, XCircle, Calendar, MessageSquare, Mail, Phone } from 'lucide-react';

export const ApplicantCard = ({ applicant, onShortlist, onReject, onScheduleInterview, onDownloadResume, onViewAnswers }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shortlisted':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Shortlisted</span>;
      case 'Interview Scheduled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">Interview Scheduled</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200">Under Review</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        
        {/* Candidate Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-200 shrink-0">
            {applicant.name ? applicant.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900">{applicant.name}</h4>
              {getStatusBadge(applicant.status)}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Applied for: <span className="text-primary font-semibold">{applicant.job_title}</span>
            </p>
            <p className="text-xs text-slate-400">
              {applicant.college || 'Stanford University'} • {applicant.degree || 'B.Tech CS'} ({applicant.passing_year || 2026}) • CGPA: {applicant.cgpa || '3.85'}
            </p>
          </div>
        </div>

        {/* Contact Info & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 lg:mt-0">
          <div className="flex flex-col gap-1 mr-2 sm:text-right hidden sm:flex">
             {applicant.email && (
               <span className="text-[11px] text-slate-500 flex items-center justify-end gap-1 font-medium">
                 <Mail className="w-3 h-3 text-slate-400"/> {applicant.email}
               </span>
             )}
             {applicant.phone && (
               <span className="text-[11px] text-slate-500 flex items-center justify-end gap-1 font-medium">
                 <Phone className="w-3 h-3 text-slate-400"/> {applicant.phone}
               </span>
             )}
          </div>
          {/* View Answers button — shown when answers exist */}
          {Array.isArray(applicant.application_answers) && applicant.application_answers.length > 0 && (
            <button
              onClick={() => onViewAnswers && onViewAnswers(applicant)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors border border-indigo-200"
            >
              <MessageSquare className="w-4 h-4" />
              Answers ({applicant.application_answers.length})
            </button>
          )}
          <button
            onClick={() => onDownloadResume && onDownloadResume(applicant)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Resume PDF
          </button>
        </div>

      </div>

      {/* Skills Summary */}
      <div className="py-3 flex flex-wrap gap-1.5">
        {applicant.skills ? (
          applicant.skills.split(',').map((skill, i) => (
            <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
              {skill.trim()}
            </span>
          ))
        ) : (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">React, Node.js, SQL</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          Applied on: {applicant.applied_date ? new Date(applicant.applied_date).toLocaleDateString() : 'Today'}
        </span>

        <div className="flex items-center gap-2">
          {applicant.status !== 'Rejected' && (
            <button
              onClick={() => onReject && onReject(applicant.application_id)}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          )}

          {applicant.status !== 'Shortlisted' && (
            <button
              onClick={() => onShortlist && onShortlist(applicant.application_id)}
              className="px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Shortlist
            </button>
          )}

          <button
            onClick={() => onScheduleInterview && onScheduleInterview(applicant)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
};
