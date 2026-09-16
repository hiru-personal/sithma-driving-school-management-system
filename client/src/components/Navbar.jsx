import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import StudentTypeSelectModal from './StudentTypeSelectModal';
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
  BarChart3,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, student, isStudent, isStaff, isInstructor, isPremium, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isType2 = Boolean(
    student?.studentType === 'Type 2' ||
    student?.studentType === 'Type2_TrialReady' ||
    student?.studentType === 'type2' ||
    student?.student_type === 'Type 2' ||
    user?.studentType === 'Type 2' ||
    user?.studentType === 'Type2_TrialReady' ||
    user?.student_type === 'Type 2'
  );
  const isType1 = !isType2;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 lg:px-10 py-2 max-w-[1440px] mx-auto w-full transition-all duration-300">
      {/* Liquid Glass Capsule Bar */}
      <div className="relative backdrop-blur-2xl bg-slate-900/75 border border-purple-300/25 shadow-[0_8px_32px_0_rgba(147,51,234,0.25)] rounded-2xl sm:rounded-full px-5 sm:px-7 py-3 transition-all duration-300">
        {/* Specular Liquid Light Shimmer (Top Highlight) */}
        <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-300/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* Logo & School Branding */}
          <Link to={user && isStudent && isType2 ? "/student/lessons" : "/"} className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-xl sm:rounded-full bg-slate-950/80 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
              <img
                src="/images/sithma-emblem.png"
                alt="Sithma Driving School"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-full bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow">
                Sithma <span className="text-accent font-black">Driving</span>
              </span>
              <span className="text-xs text-blue-200/90 font-medium tracking-wide">
                Sri Lanka's Driving Academy
              </span>
            </div>
          </Link>

          {/* Desktop Liquid Glass Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {isStudent && (
                <>
                  {!isPremium && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Status: Pending Verification
                    </span>
                  )}

                  {/* Type 2 (Trial-Only) Students: ONLY Book Lessons */}
                  {isType2 ? (
                    <Link
                      to="/student/lessons"
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                        isActive('/student/lessons') || isActive('/student/lessons/book')
                          ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Calendar className="w-4 h-4" /> Book Lessons
                    </Link>
                  ) : (
                    /* Type 1 Full Course Learner Navigation */
                    <>
                      <Link
                        to="/student/dashboard"
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                          isActive('/student/dashboard')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {isPremium && (
                        <>
                          <Link
                            to="/student/milestones"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive('/student/milestones')
                                ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-cyan-400" /> DMT Milestones
                          </Link>
                          <Link
                            to="/student/quiz"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                                ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <BookOpen className="w-4 h-4" /> Exam Practice
                          </Link>
                          <Link
                            to="/student/lessons"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive('/student/lessons') || isActive('/student/lessons/book')
                                ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <Calendar className="w-4 h-4" /> Book Lessons
                          </Link>
                          <Link
                            to="/student/payments"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive('/student/payments')
                                ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" /> Payments
                          </Link>
                          <Link
                            to="/student/profile"
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive('/student/profile')
                                ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <User className="w-4 h-4" /> Profile ID
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/admin/dashboard')
                        ? 'bg-accent text-slate-950 shadow-[0_0_15px_rgba(242,169,59,0.5)] border border-accent/60'
                        : 'text-accent hover:bg-accent/20'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" /> Executive Dashboard
                  </Link>
                  <Link
                    to="/admin/accounts"
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/admin/accounts')
                        ? 'bg-accent text-slate-950 shadow-[0_0_15px_rgba(242,169,59,0.5)] border border-accent/60'
                        : 'text-accent hover:bg-accent/20'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Manage Accounts
                  </Link>
                </>
              )}

              {isStaff && (
                <>
                  <Link
                    to="/staff/students"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/students')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Students & DMT
                  </Link>
                  <Link
                    to="/staff/slots"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/slots')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-4 h-4" /> Slot Creator
                  </Link>
                  <Link
                    to="/staff/packages"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/packages')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/quiz')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/payments')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Payment Queue
                  </Link>
                  <Link
                    to="/staff/reports"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive('/staff/reports')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" /> Reports
                  </Link>
                </>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isActive('/instructor/schedule')
                      ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Daily Schedule
                </Link>
              )}
            </nav>
          )}

          {/* Right Actions & User Profile */}
          <div className="hidden sm:flex items-center gap-3.5">
            {user ? (
              <div className="flex items-center gap-3.5">
                <NotificationBell />

                {/* Frosted User Pill */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{user.name}</p>
                    <p className="text-xs text-cyan-300 uppercase tracking-wider font-semibold">
                      {user.role} • {user.branch}
                    </p>
                  </div>
                </div>

                {/* Liquid Glass Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 hover:border-red-400/40 text-slate-300 hover:text-red-300 border border-white/15 transition-all duration-300 flex items-center justify-center shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/15"
                >
                  Sign In
                </Link>

                {/* Single Register Button Opening Student Type Selection Modal */}
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(true)}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-accent via-amber-400 to-accent-dark hover:scale-105 rounded-full shadow-[0_0_15px_rgba(242,169,59,0.4)] border border-amber-300/40 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Register</span>
                </button>
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
                  {isType2 ? (
                    <Link
                      to="/student/lessons"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 font-medium flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-cyan-400" /> Book Lessons
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/student/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                      >
                        Dashboard
                      </Link>
                      {isPremium && (
                        <>
                          <Link
                            to="/student/milestones"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 font-medium flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-cyan-400" /> DMT Milestones
                          </Link>
                          <Link
                            to="/student/quiz"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                          >
                            DMT Exam Practice
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
                        </>
                      )}
                    </>
                  )}
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

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTypeModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-slate-950 bg-gradient-to-r from-accent via-amber-400 to-accent-dark font-black text-xs shadow-md border border-amber-300/40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Register (Choose Category)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student Type Selection Modal (Step 1) */}
      <StudentTypeSelectModal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
      />
    </header>
  );
}

