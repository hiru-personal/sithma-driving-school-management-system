import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  Car,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  CreditCard,
  BookOpen,
  LayoutDashboard,
  Users,
  Layers,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, isStudent, isStaff, isInstructor, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 lg:px-8 py-1 max-w-7xl mx-auto w-full transition-all duration-300">
      {/* Liquid Glass Capsule Bar */}
      <div className="relative backdrop-blur-2xl bg-slate-900/70 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 transition-all duration-300">
        {/* Specular Liquid Light Shimmer (Top Highlight) */}
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* Logo & School Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl sm:rounded-full bg-gradient-to-tr from-primary via-blue-600 to-accent flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(11,95,165,0.6)] border border-white/30 group-hover:scale-105 transition-transform duration-300">
              <Car className="w-5 h-5 drop-shadow" />
              <div className="absolute inset-0 rounded-xl sm:rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow">
                Sithma <span className="text-accent font-black">Driving</span>
              </span>
              <span className="text-[10px] text-blue-200/80 font-medium tracking-wide">
                Sri Lanka's Driving Academy
              </span>
            </div>
          </Link>

          {/* Desktop Liquid Glass Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/student/dashboard')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link
                    to="/student/lessons"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/student/lessons') || isActive('/student/lessons/book')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Lessons
                  </Link>
                  <Link
                    to="/student/payments"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/student/payments')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Payments
                  </Link>
                  <Link
                    to="/student/quiz"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Exam Practice
                  </Link>
                  <Link
                    to="/student/profile"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/student/profile')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Profile ID
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'bg-accent text-slate-950 shadow-[0_0_15px_rgba(242,169,59,0.5)] border border-accent/60'
                      : 'text-accent hover:bg-accent/20'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Executive Dashboard
                </Link>
              )}

              {isStaff && (
                <>
                  <Link
                    to="/staff/students"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/students')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Students & DMT
                  </Link>
                  <Link
                    to="/staff/slots"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/slots')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Slot Creator
                  </Link>
                  <Link
                    to="/staff/packages"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/packages')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/quiz')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/payments')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Payment Queue
                  </Link>
                  <Link
                    to="/staff/reports"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive('/staff/reports')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Reports
                  </Link>
                </>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive('/instructor/schedule')
                      ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Daily Schedule
                </Link>
              )}
            </nav>
          )}

          {/* Right Actions & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                {/* Frosted User Pill */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold">
                      {user.role} • {user.branch}
                    </p>
                  </div>
                </div>

                {/* Liquid Glass Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 hover:border-red-400/40 text-slate-300 hover:text-red-300 border border-white/15 transition-all duration-300 flex items-center justify-center shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/15"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-accent via-amber-400 to-accent-dark hover:scale-105 rounded-full shadow-[0_0_15px_rgba(242,169,59,0.4)] border border-amber-300/40 transition-all duration-300"
                >
                  Register as Learner
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-200 hover:text-white bg-white/10 border border-white/20 backdrop-blur-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Glass Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl backdrop-blur-3xl bg-slate-950/85 border border-white/20 shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] space-y-2 animate-in fade-in zoom-in-95 duration-200">
          {user ? (
            <>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs mb-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-cyan-300 font-semibold">{user.email} • {user.branch} Branch</p>
                </div>
                <span className="badge badge-warning text-[10px]">{user.role}</span>
              </div>

              {isStudent && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Dashboard & DMT Timeline
                  </Link>
                  <Link
                    to="/student/lessons"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Book Lessons
                  </Link>
                  <Link
                    to="/student/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Payments
                  </Link>
                  <Link
                    to="/student/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Exam Practice
                  </Link>
                </div>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-accent font-bold bg-accent/10 border border-accent/20"
                >
                  Executive Dashboard
                </Link>
              )}

              {isStaff && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Students & DMT Milestones
                  </Link>
                  <Link
                    to="/staff/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Slot Creator
                  </Link>
                  <Link
                    to="/staff/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Course Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    Payment Queue
                  </Link>
                </div>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium text-xs"
                >
                  Daily Assigned Schedule
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 mt-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-white bg-white/10 font-bold border border-white/15"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-slate-950 bg-accent font-extrabold shadow-md"
              >
                Register as Learner
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
