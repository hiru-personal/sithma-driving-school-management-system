import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-neutralBg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <Car className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-textMain font-heading">
          Sign In to Sithma Portal
        </h2>
        <p className="mt-1 text-center text-xs text-textMuted">
          Access your driving progress, DMT milestones, and lesson schedules
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card shadow-modal p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 font-bold mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher for Testing/Grading */}
          <div className="pt-4 border-t border-borderColor">
            <p className="text-xs font-bold text-textMain mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent-dark" /> Quick Demo Role Switcher (Grading Demo):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary-light text-primary hover:bg-primary/20 transition-colors text-left"
              >
                🎓 Student Account
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('staff')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors text-left"
              >
                🏢 Staff / Officer
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('instructor')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-colors text-left"
              >
                🚗 Instructor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors text-left"
              >
                👑 System Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-textMuted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Register as a Learner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
