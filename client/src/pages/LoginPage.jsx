import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'student') {
        navigate('/student/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'instructor') {
        navigate('/instructor/schedule');
      } else {
        navigate('/staff/students');
      }
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'student') {
      setEmail('student.kasun@gmail.com');
      setPassword('password123');
    } else if (role === 'staff') {
      setEmail('staff.maharagama@sithma.lk');
      setPassword('password123');
    } else if (role === 'instructor') {
      setEmail('instructor.sunil@sithma.lk');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@sithma.lk');
      setPassword('admin123');
    }
    toast.success(`Demo credentials filled for: ${role.toUpperCase()}`);
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold mt-2 shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher for Testing/Grading */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent" /> Quick Demo Role Switcher:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-cyan-300 transition-colors text-left"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-amber-300 transition-colors text-left"
              >
                🏢 Staff Officer
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('instructor')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-emerald-300 transition-colors text-left"
              >
                🚗 Instructor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-accent transition-colors text-left"
              >
                👑 Admin
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
