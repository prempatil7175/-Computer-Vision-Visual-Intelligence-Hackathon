import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

const InspectionDetail = () => {
  const { id } = useParams();

  const anomalies = [
    { id: 'a1', category: 'PPE_Violation', severity: 'Critical', desc: 'Worker missing hardhat on scaffold (Zone A). Risk of severe injury.', action: 'Immediate safety stand-down. Ensure PPE compliance before resuming.' },
    { id: 'a2', category: 'Concrete_Crack', severity: 'Moderate', desc: '3mm micro-crack on load-bearing pillar near Level 2.', action: 'Monitor in next cycle. If expansion exceeds 5mm, schedule epoxy injection.' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow">
            <ArrowLeft size={18} className="mr-2" /> Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">AI Inspection Report</h1>
            <p className="text-slate-500 text-sm mt-1">ID: {id} • Scanned 2 minutes ago</p>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold shadow-sm">
          <CheckCircle2 size={18} />
          Analysis Complete
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col h-[600px]">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-slate-800 font-outfit">Visual Data source</h3>
               <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Drone Capture</span>
             </div>
             
             <div className="w-full flex-1 bg-slate-900 rounded-2xl border-4 border-slate-800 overflow-hidden relative group">
                {/* Simulated Image Placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888081622-12ec16413d7a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-luminosity"></div>
                
                {/* Scanning overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 h-32 animate-[scan_3s_ease-in-out_infinite]" />
                
                {/* Bounding box 1 (Critical) */}
                <div className="absolute border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.5)] rounded" style={{ top: '35%', left: '45%', width: '10%', height: '15%' }}>
                   <div className="absolute -top-7 left-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-md">PPE Violation</div>
                </div>
                
                {/* Bounding box 2 (Moderate) */}
                <div className="absolute border-2 border-amber-500 bg-amber-500/20 rounded" style={{ top: '65%', left: '25%', width: '15%', height: '8%' }}>
                   <div className="absolute -top-7 left-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-md">Crack Detected</div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-5 flex flex-col h-[600px]">
          <div className="glass rounded-3xl overflow-hidden flex flex-col border border-slate-200 shadow-xl h-full">
            <div className="px-8 py-6 border-b border-slate-100 bg-white/60">
              <h3 className="text-xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-2">
                <ShieldAlert className="text-indigo-600" />
                Detected Anomalies
              </h3>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {anomalies.map((a) => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-slate-900 text-lg font-outfit">{a.category.replace('_', ' ')}</div>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">{a.desc}</p>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Action</span>
                    <p className="text-slate-700 font-medium text-sm">{a.action}</p>
                  </div>
                  
                  <div className="mt-5 flex justify-end">
                    <button className="flex items-center gap-2 text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-colors">
                      <ShieldAlert size={16} />
                      Acknowledge & Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetail;
