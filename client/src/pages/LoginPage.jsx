import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';
import StudentTypeSelectModal from '../components/StudentTypeSelectModal';
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
  const [typeModalOpen, setTypeModalOpen] = useState(false);

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
        redirectBasedOnRole(res.user.role, res.user, res.student);
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

  const redirectBasedOnRole = (role, userObj, studentObj) => {
    if (role === 'student') {
      const isType2 = Boolean(
        userObj?.studentType === 'Type 2' ||
        userObj?.studentType === 'Type2_TrialReady' ||
        userObj?.student_type === 'Type 2' ||
        studentObj?.studentType === 'Type 2' ||
        studentObj?.studentType === 'Type2_TrialReady' ||
        studentObj?.student_type === 'Type 2'
      );
      if (isType2) {
        navigate('/student/lessons');
      } else {
        navigate('/student/dashboard');
      }
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
    <div className="min-h-[88vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1380px] mx-auto w-full">
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
      <div className="w-full rounded-3xl overflow-hidden backdrop-blur-2xl bg-slate-900/85 border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.7)] grid grid-cols-1 lg:grid-cols-12 min-h-[640px] xl:min-h-[720px]">
        {/* Left Side: Showcase */}
        <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[640px] xl:min-h-[720px] overflow-hidden group">
          <img
            src="/images/sithma-portal-login.jpg"
            alt="Sithma Driving School training vehicles"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/50 hidden lg:block" />

          <div className="absolute top-7 left-7 right-7 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="w-7 h-7 rounded-full bg-slate-900/90 p-0.5 flex items-center justify-center border border-cyan-400/30">
                <img src="/images/sithma-emblem.png" alt="Sithma Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                Sithma <span className="text-accent">Driving School</span>
              </span>
            </div>
            <span className="badge badge-success text-xs font-bold shadow-md px-3.5 py-1.5">
              DMT Certified
            </span>
          </div>

          <div className="absolute bottom-8 left-8 right-8 space-y-4 z-10">
            <div className="space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Authentication & Portal Access
              </span>
              <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-tight drop-shadow">
                Real Driving Academy System
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Log in to schedule road lessons, track your official DMT trial stages, and access bilingual exam practice tests.
              </p>
            </div>

            <div className="pt-3 border-t border-white/15 space-y-2 text-sm text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Dual-control car, bike, three-wheeler & heavy vehicle training</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Role-based access control with secure bcrypt authentication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between space-y-8">
          <div className="space-y-7">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-bold text-xs sm:text-sm mb-3">
                <Lock className="w-3.5 h-3.5" /> Secure Portal Access
              </div>
              <h2 className="text-3xl sm:text-4xl xl:text-[2.6rem] font-black text-white font-heading tracking-tight leading-tight">
                Sign In to Sithma Portal
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2">
                Enter your username or email address and password.
              </p>
            </div>

            {/* Error or Verification Banners */}
            {isPendingVerification ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Account Pending Verification</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  Your student advance payment has not yet been verified by the Data Entry Officer. Server-side login is blocked until your payment proof is confirmed.
                </p>
              </div>
            ) : isAccountLocked ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Account Temporarily Locked</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  {errorMessage}
                </p>
              </div>
            ) : isDeactivated ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Account Deactivated</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  This account has been deactivated. Please contact your branch administrator for assistance.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Email, Username, or Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email, username, or full name"
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-950/80 border border-white/15 text-white rounded-2xl text-base focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-200">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-cyan-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-slate-950/80 border border-white/15 text-white rounded-2xl text-base focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-4 font-extrabold text-base rounded-2xl mt-4 shadow-xl flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.99] transition-transform disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Standard Credentials Hint */}
            <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 text-xs sm:text-sm space-y-2.5">
              <span className="font-bold text-slate-200 block">Default Accounts:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-300">
                <div className="bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-400 block text-xs">Admin:</span>
                  <code className="text-cyan-300 font-semibold">admin@sithma.lk</code> / <code className="text-slate-300">admin123</code>
                </div>
                <div className="bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-400 block text-xs">Staff:</span>
                  <code className="text-cyan-300 font-semibold">staff.maharagama</code> / <code className="text-slate-300">password123</code>
                </div>
                <div className="bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-400 block text-xs">Instructor:</span>
                  <code className="text-cyan-300 font-semibold">instructor.sunil</code> / <code className="text-slate-300">password123</code>
                </div>
                <div className="bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-400 block text-xs">Student:</span>
                  <code className="text-cyan-300 font-semibold">student.kasun</code> / <code className="text-slate-300">password123</code>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-300">
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setTypeModalOpen(true)}
                className="text-cyan-300 font-bold hover:underline cursor-pointer bg-transparent border-none p-0 inline text-sm"
              >
                Register as Learner
              </button>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>

      <StudentTypeSelectModal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
      />
    </div>
  );
}
