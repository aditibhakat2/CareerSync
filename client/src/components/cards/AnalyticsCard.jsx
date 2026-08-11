import React from 'react';

export const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-primary transition-colors">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 duration-300 ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
    </div>
  );
};
