import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const SeverityBadge = ({ severity }: { severity: string }) => {
  const configs = {
    Low: {
      color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      icon: <Info size={14} className="mr-1.5" />
    },
    Moderate: {
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      icon: <AlertCircle size={14} className="mr-1.5" />
    },
    Critical: {
      color: 'bg-rose-500/10 text-rose-700 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      icon: <AlertTriangle size={14} className="mr-1.5 animate-pulse" />
    }
  };

  const config = configs[severity as keyof typeof configs] || {
    color: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    icon: <Info size={14} className="mr-1.5" />
  };

  return (
    <span className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full border backdrop-blur-sm transition-all ${config.color}`}>
      {config.icon}
      {severity}
    </span>
  );
};

export default SeverityBadge;
