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
        redirectBasedOnRole(res.user.role, res.user, res.student, res);
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

  const redirectBasedOnRole = (role, user, student, authRes = {}) => {
    if (role === 'student') {
      const isVerified = Boolean(
        user?.status === 'active' ||
        user?.account_status === 'Verified' ||
        student?.isAdvancePaid ||
        student?.advancePaymentStatus === 'verified'
      );

      const hasSubmittedPayment = Boolean(
        authRes?.hasSubmittedPayment ||
        authRes?.latestPayment ||
        student?.hasSubmittedPayment ||
        student?.latestPayment ||
        (student?.advancePaymentStatus && student.advancePaymentStatus !== 'none') ||
        student?.isAdvancePaid
      );

      // If student has not submitted any payment yet, send them straight to complete payment
      if (!isVerified && !hasSubmittedPayment) {
        navigate('/payment-gateway', {
          replace: true,
          state: {
            studentName: user?.name,
            studentId: student?._id,
            userId: user?._id || user?.id,
            branch: student?.branch || user?.branch,
            nic: student?.nic || user?.nic,
            email: user?.email,
            studentType: student?.student_type || student?.studentType || user?.student_type,
            advanceAmount: student?.advancePaymentAmount || 5000,
            registrationReference: student?.advancePaymentReference,
          },
        });
        return;
      }

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
    <div className="min-h-[88vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1380px] mx-auto w-full">
      {/* Force Password Change Modal if mandatory on first login */}
      {showForcePasswordModal && (
        <ForcePasswordChangeModal
          onComplete={() => {
            setShowForcePasswordModal(false);
            const userJson = localStorage.getItem('sithma_user');
            const studentJson = localStorage.getItem('sithma_student');
            if (userJson) {
              const u = JSON.parse(userJson);
              const s = studentJson ? JSON.parse(studentJson) : null;
              redirectBasedOnRole(u.role, u, s);
            }
          }}
        />
      )}

      {/* Main Split Card */}
      <div className="w-full rounded-3xl overflow-hidden bg-white border border-[#D4EEF8] shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[640px] xl:min-h-[720px]">
        {/* Left Side: Showcase */}
        <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[640px] xl:min-h-[700px] overflow-hidden group">
          <img
            src="/images/sithma-portal-login.jpg"
            alt="Sithma Driving School training vehicles"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#152026]/90 via-[#152026]/40 to-black/25 pointer-events-none" />

          {/* Top Brand Pill */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full bg-[#152026]/90 backdrop-blur-md border border-[#D4EEF8]/30 shadow-lg">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white p-0.5 flex items-center justify-center border border-[#B3D5F1]">
                <img src="/images/sithma-emblem.png" alt="Sithma Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                Sithma <span className="text-[#B3D5F1]">Driving School</span>
              </span>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] sm:text-xs font-bold shadow-md">
              DMT Certified
            </span>
          </div>

          {/* Bottom Frosted Showcase Card */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#152026]/90 backdrop-blur-md border border-[#D4EEF8]/30 shadow-2xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1B3D59] border border-[#6A97C0]/40 text-[#D4EEF8] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#B3D5F1]" /> Authentication & Portal Access
              </div>
              <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-white leading-tight">
                Real Driving Academy System
              </h3>
              <p className="text-xs text-[#D4EEF8]/90 leading-relaxed font-normal hidden sm:block">
                Log in to schedule road lessons, track your official DMT trial stages, and access bilingual exam practice tests.
              </p>

              <div className="pt-2.5 border-t border-white/10 space-y-1.5 text-xs text-white/90 hidden sm:block">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white font-medium">Dual-control car, bike, three-wheeler & heavy vehicle training</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white font-medium">Role-based access control with secure bcrypt authentication</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between space-y-6 sm:space-y-8 bg-white">
          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs sm:text-sm mb-2 sm:mb-3">
                <Lock className="w-3.5 h-3.5 text-[#1B3D59]" /> Secure Portal Access
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#152026] tracking-tight leading-tight">
                Sign In to Sithma Portal
              </h2>
              <p className="text-sm sm:text-base text-[#6A97C0] mt-1.5 font-medium">
                Enter your username or email address and password.
              </p>
            </div>

            {/* Error or Verification Banners */}
            {isPendingVerification ? (
              <div className="p-4 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] text-xs sm:text-sm space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-[#152026]">
                  <AlertCircle className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
                  <span>Account Pending Verification</span>
                </div>
                <p className="text-[#152026]/80 leading-relaxed pl-6">
                  Your student advance payment has not yet been verified by the Data Entry Officer. Server-side login is blocked until your payment proof is confirmed.
                </p>
              </div>
            ) : isAccountLocked ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <Clock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Account Temporarily Locked</span>
                </div>
                <p className="text-rose-800/90 leading-relaxed pl-6">
                  {errorMessage}
                </p>
              </div>
            ) : isDeactivated ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Account Deactivated</span>
                </div>
                <p className="text-rose-800/90 leading-relaxed pl-6">
                  This account has been deactivated. Please contact your branch administrator for assistance.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#152026]">
                  Email, Username, or Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#6A97C0] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email, username, or full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-2xl text-sm font-medium focus:bg-white focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] outline-none transition-all placeholder:text-[#6A97C0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-[#152026]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-[#1B3D59] hover:underline font-bold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#6A97C0] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-2xl text-sm font-medium focus:bg-white focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] outline-none transition-all placeholder:text-[#6A97C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A97C0] hover:text-[#152026] transition-colors p-1 cursor-pointer"
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
                className="btn-primary w-full py-3.5 font-bold text-base rounded-2xl mt-4 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Standard Credentials Hint */}
            <div className="p-4 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] text-xs space-y-2">
              <span className="font-bold text-[#152026] block">Default Demo Accounts:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#D4EEF8] shadow-xs space-y-0.5">
                  <span className="font-bold text-[#6A97C0] block text-[11px]">Admin:</span>
                  <div className="text-[11px]"><code className="text-[#1B3D59] font-bold break-all">admin@sithma.lk</code> / <code className="text-[#152026] font-semibold">admin123</code></div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#D4EEF8] shadow-xs space-y-0.5">
                  <span className="font-bold text-[#6A97C0] block text-[11px]">Staff:</span>
                  <div className="text-[11px]"><code className="text-[#1B3D59] font-bold break-all">staff.maharagama</code> / <code className="text-[#152026] font-semibold">password123</code></div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#D4EEF8] shadow-xs space-y-0.5">
                  <span className="font-bold text-[#6A97C0] block text-[11px]">Instructor:</span>
                  <div className="text-[11px]"><code className="text-[#1B3D59] font-bold break-all">instructor.sunil</code> / <code className="text-[#152026] font-semibold">password123</code></div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#D4EEF8] shadow-xs space-y-0.5">
                  <span className="font-bold text-[#6A97C0] block text-[11px]">Student:</span>
                  <div className="text-[11px]"><code className="text-[#1B3D59] font-bold break-all">student.kasun</code> / <code className="text-[#152026] font-semibold">password123</code></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#D4EEF8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6A97C0]">
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setTypeModalOpen(true)}
                className="text-[#1B3D59] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 inline text-xs"
              >
                Register as Learner
              </button>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#6A97C0] hover:text-[#152026] font-bold transition-colors"
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
