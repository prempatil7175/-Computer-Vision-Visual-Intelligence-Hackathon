import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => {
  return (
    <div className="glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
      <div className="p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1 font-outfit">{title}</p>
            <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{value}</h3>
          </div>
          {icon && (
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </div>
      </div>
      {description && (
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 backdrop-blur-sm">
          <div className="text-sm flex items-center gap-2">
            {trend === 'up' && <span className="text-emerald-500 font-medium">↑</span>}
            {trend === 'down' && <span className="text-rose-500 font-medium">↓</span>}
            <span className="text-slate-500 font-medium">{description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
