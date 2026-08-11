import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({ title = 'No Data Found', message = 'There are no items to display right now.', icon: Icon = FolderOpen, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-14 bg-white/50 rounded-3xl border border-dashed border-slate-300 text-center my-8 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-indigo-50 text-primary flex items-center justify-center mb-5 ring-8 ring-indigo-50/50">
        <Icon className="w-8 h-8 opacity-90" />
      </div>
      <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-2 mb-8 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
