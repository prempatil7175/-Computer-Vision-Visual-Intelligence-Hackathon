import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import InspectionDetail from './pages/InspectionDetail';
import Login from './pages/Login';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      {/* Public Landing / Auth Page */}
      <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={session ? <DashboardLayout /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inspections/new" element={<NewInspection />} />
        <Route path="/inspections/:id" element={<InspectionDetail />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
