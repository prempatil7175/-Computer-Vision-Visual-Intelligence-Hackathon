import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, ShieldAlert, UserCircle, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname.includes(path);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent z-0 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 glass-dark text-slate-300 flex flex-col z-50 m-0 lg:m-4 rounded-none lg:rounded-2xl border-r lg:border border-slate-700/50 shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Glow effect inside sidebar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
        
        <div className="h-20 flex items-center justify-between px-8 font-bold text-2xl border-b border-slate-800/60 text-white z-10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
            <span className="font-outfit tracking-tight">VisionGuard<span className="text-indigo-400">AI</span></span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 z-10">
          <nav className="px-4 space-y-2 font-medium">
            <Link 
              to="/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/dashboard') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              Overview
            </Link>
            <Link 
              to="/inspections/new" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/inspections/new') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}
            >
              <PlusCircle size={20} />
              New Inspection
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/60 z-10">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white">
            <Settings size={20} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden w-full">
        {/* Topbar */}
        <header className="h-20 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/50 bg-white/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 font-outfit hidden sm:block">Platform Dashboard</h2>
          </div>
          <div className="flex items-center gap-4 bg-white/60 px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow transition cursor-pointer">
            <UserCircle size={24} className="text-indigo-600" />
            <div className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
