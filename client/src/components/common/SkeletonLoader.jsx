import React from 'react';

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-1/3 h-5 rounded-lg shimmer"></div>
            <div className="w-16 h-6 rounded-full shimmer"></div>
          </div>
          <div className="w-1/2 h-4 rounded-md shimmer"></div>
          <div className="w-full h-12 rounded-xl shimmer"></div>
          <div className="flex gap-2 pt-2">
            <div className="w-20 h-7 rounded-lg shimmer"></div>
            <div className="w-20 h-7 rounded-lg shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
