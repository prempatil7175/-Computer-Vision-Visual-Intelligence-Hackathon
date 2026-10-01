import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import InspectionDetail from './pages/InspectionDetail';

function App() {
  return (
    <Routes>
      {/* Dashboard Layout Routes */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inspections/new" element={<NewInspection />} />
        <Route path="inspections/:id" element={<InspectionDetail />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
