import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setErrorMessage('');
    const res = await login(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (res && res.success) {
      if (res.user.role === 'student') {
        navigate('/student/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'instructor') {
        navigate('/instructor/schedule');
      } else {
        navigate('/staff/students');
      }
    } else {
      setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  // 1-Click Instant Login for demo roles
  const handleInstantDemoLogin = (role) => {
    let demoEmail = '';
    let demoPass = '';

    if (role === 'student') {
      demoEmail = 'student.kasun@gmail.com';
      demoPass = 'password123';
    } else if (role === 'staff') {
      demoEmail = 'staff.maharagama@sithma.lk';
      demoPass = 'password123';
    } else if (role === 'instructor') {
      demoEmail = 'instructor.sunil@sithma.lk';
      demoPass = 'password123';
    } else if (role === 'admin') {
      demoEmail = 'admin@sithma.lk';
      demoPass = 'admin123';
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    toast.loading(`Authenticating as ${role.toUpperCase()}...`, { duration: 1000 });
    handleLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-accent flex items-center justify-center text-white shadow-[0_0_25px_rgba(11,95,165,0.7)] border border-white/30">
            <Car className="w-6 h-6 drop-shadow" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading drop-shadow">
          Sign In to Sithma Portal
        </h2>
        <p className="text-xs text-slate-400">
          Access your driving progress, DMT milestones, and lesson schedules
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold mt-2 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Instant Demo Role Switcher */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent" /> 1-Click Instant Demo Login:
              </p>
              <span className="text-[10px] text-slate-400">Click to enter portal</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('student')}
                disabled={loading}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 transition-all text-left flex items-center justify-between group"
              >
                <span>🎓 Student</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('staff')}
                disabled={loading}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 transition-all text-left flex items-center justify-between group"
              >
                <span>🏢 Staff Officer</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('instructor')}
                disabled={loading}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 transition-all text-left flex items-center justify-between group"
              >
                <span>🚗 Instructor</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('admin')}
                disabled={loading}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 transition-all text-left flex items-center justify-between group"
              >
                <span>👑 Admin</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-300 font-bold hover:underline">
              Register as a Learner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
