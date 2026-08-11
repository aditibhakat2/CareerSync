import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ label = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="mt-2 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
};
