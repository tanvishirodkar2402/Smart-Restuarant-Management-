import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-400">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading Smart Resto...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.name)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md text-center border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">
            You do not have permissions to access this dashboard. Required role: {allowedRoles.join(', ')}
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};
