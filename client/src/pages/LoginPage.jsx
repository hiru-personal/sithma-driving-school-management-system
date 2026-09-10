import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';
import {
  Car,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);

  const handleLogin = async (loginId, loginPassword) => {
    setLoading(true);
    setErrorMessage('');
    setIsPendingVerification(false);
    setIsAccountLocked(false);
    setIsDeactivated(false);

    const res = await login(loginId.trim(), loginPassword);
    setLoading(false);

    if (res && res.success) {
      if (res.mustChangePassword) {
        setShowForcePasswordModal(true);
      } else {
        redirectBasedOnRole(res.user.role);
      }
    } else {
      if (res?.pendingVerification) {
        setIsPendingVerification(true);
      } else if (res?.accountLocked) {
        setIsAccountLocked(true);
      } else if (res?.accountDeactivated) {
        setIsDeactivated(true);
      }
      setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
    }
  };

  const redirectBasedOnRole = (role) => {
    if (role === 'student') {
      navigate('/student/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'instructor') {
      navigate('/instructor/schedule');
    } else {
      navigate('/staff/students');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(identifier, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Force Password Change Modal if mandatory on first login */}
      {showForcePasswordModal && (
        <ForcePasswordChangeModal
          onComplete={() => {
            setShowForcePasswordModal(false);
            const userJson = localStorage.getItem('sithma_user');
            if (userJson) {
              const u = JSON.parse(userJson);
              redirectBasedOnRole(u.role);
            }
          }}
        />
      )}

      {/* Main Split Card */}
      <div className="w-full rounded-3xl overflow-hidden backdrop-blur-2xl bg-slate-900/85 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Showcase */}
        <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] lg:min-h-[580px] overflow-hidden group">
          <img
            src="/images/sithma-portal-login.jpg"
            alt="Sithma Driving School training vehicles"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/50 hidden lg:block" />

          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Car className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Sithma <span className="text-accent">Driving School</span>
              </span>
            </div>
            <span className="badge badge-success text-[10px] font-bold shadow-md">
              DMT Certified
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Authentication & Portal Access
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow">
                Real Driving Academy System
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to schedule road lessons, track your official DMT trial stages, and access bilingual exam practice tests.
              </p>
            </div>

            <div className="pt-2 border-t border-white/15 space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Dual-control car, bike, three-wheeler & heavy vehicle training</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Role-based access control with secure bcrypt authentication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-bold text-xs mb-2">
                <Lock className="w-3 h-3" /> Secure Portal Access
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                Sign In to Sithma Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your username or email address and password.
              </p>
            </div>

            {/* Error or Verification Banners */}
            {isPendingVerification ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Account Pending Verification</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  Your student advance payment has not yet been verified by the Data Entry Officer. Server-side login is blocked until your payment proof is confirmed.
                </p>
              </div>
            ) : isAccountLocked ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Account Temporarily Locked</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  {errorMessage}
                </p>
              </div>
            ) : isDeactivated ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Account Deactivated</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  This account has been deactivated. Please contact your branch administrator for assistance.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Username or Email Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. student.kasun or admin@sithma.lk"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-cyan-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-3.5 font-extrabold text-sm mt-3 shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Standard Credentials Hint */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1">
              <span className="font-bold text-slate-300 block">Default Accounts:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                <div>Admin: <code className="text-cyan-300">admin@sithma.lk</code> / <code className="text-slate-300">admin123</code></div>
                <div>Staff: <code className="text-cyan-300">staff.maharagama</code> / <code className="text-slate-300">password123</code></div>
                <div>Instructor: <code className="text-cyan-300">instructor.sunil</code> / <code className="text-slate-300">password123</code></div>
                <div>Student: <code className="text-cyan-300">student.kasun</code> / <code className="text-slate-300">password123</code></div>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-300 font-bold hover:underline">
                Register as Learner
              </Link>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
