import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Camera, Target, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const { data, error } = await supabase
          .from('anomalies')
          .select(`
            id,
            category,
            severity,
            created_at,
            inspection_id,
            inspections (
              projects (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAnomalies(data || []);
      } catch (err) {
        console.error('Error fetching anomalies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Real-time infrastructure intelligence and insights.</p>
        </div>
        <Link 
          to="/inspections/new" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Camera size={18} />
          New Inspection
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Inspections" 
          value="124" 
          description="↑ 12% from last month" 
          icon={<Activity size={28} />}
          trend="up"
        />
        <StatCard 
          title="Critical Anomalies" 
          value={anomalies.filter(a => a.severity === 'Critical').length} 
          description="Requires immediate action" 
          icon={<Zap size={28} className="text-rose-500" />}
          trend="down"
        />
        <StatCard 
          title="Avg Safety Score" 
          value="92/100" 
          description="Top 5% of projects" 
          icon={<Target size={28} className="text-emerald-500" />}
          trend="up"
        />
      </div>

      {/* Anomalies List */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <h3 className="text-xl font-bold text-slate-800 font-outfit tracking-tight">Recent Anomalies</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All &rarr;</button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : anomalies.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">
            No anomalies found. Good job!
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/50 bg-white/30">
            {anomalies.map((anomaly) => (
              <li 
                key={anomaly.id} 
                onClick={() => navigate(`/inspections/${anomaly.inspection_id}`)}
                className="px-8 py-5 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                  <div>
                    <p className="text-base font-semibold text-slate-800">{anomaly.category.replace('_', ' ')}</p>
                    <p className="text-sm font-medium text-slate-500">
                      {anomaly.inspections?.projects?.name || 'Unknown Project'} <span className="mx-1">•</span> {formatDate(anomaly.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <SeverityBadge severity={anomaly.severity} />
                  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
