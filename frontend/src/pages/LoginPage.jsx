import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, KeyRound, User, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(username, password);
      const roleName = loggedUser?.role?.name;
      
      if (roleName === 'Admin' || roleName === 'Restaurant Staff') {
        navigate('/admin');
      } else if (roleName === 'Kitchen Staff') {
        navigate('/kitchen');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => typeof d === 'string' ? d : (d.msg ? `${d.loc?.[d.loc?.length - 1] || 'field'}: ${d.msg}` : JSON.stringify(d))).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Backend server is unreachable. Please ensure the backend server is running on http://localhost:8000.');
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill
  const handleQuickLogin = (usr, pwd) => {
    setUsername(usr);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your Smart Restaurant account</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or john@example.com"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div className="pt-4 border-t border-slate-800">
          <span className="block text-[11px] font-semibold text-slate-400 mb-2.5 text-center">
            ⚡ Quick Demo Logins (Click to autofill):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'password123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-amber-500 text-slate-300 text-left"
            >
              <span className="block font-bold text-amber-400">1. Admin</span>
              <span className="text-[10px] text-slate-500">admin / password123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('chef_marco', 'password123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-emerald-500 text-slate-300 text-left"
            >
              <span className="block font-bold text-emerald-400">2. Kitchen Staff</span>
              <span className="text-[10px] text-slate-500">chef_marco / password123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff_sarah', 'password123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-purple-500 text-slate-300 text-left"
            >
              <span className="block font-bold text-purple-400">3. Resto Staff</span>
              <span className="text-[10px] text-slate-500">staff_sarah / password123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john_doe', 'password123')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-blue-500 text-slate-300 text-left"
            >
              <span className="block font-bold text-blue-400">4. Customer</span>
              <span className="text-[10px] text-slate-500">john_doe / password123</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 font-semibold hover:underline">
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
};
