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
  Database,
} from 'lucide-react';
import api from '../api/axios';

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

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const origin = new URL(apiUrl).origin;
        return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
      } catch {
        return path;
      }
    }
    return path;
  };

  const [dbInfo, setDbInfo] = useState(null);
  const [pendingRescheduleCount, setPendingRescheduleCount] = useState(0);

  const navRef = useRef(null);

  // Fetch active database status
  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.data?.database) {
          setDbInfo(res.data.database);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  // Fetch pending reschedule requests for Staff / DEO
  useEffect(() => {
    if (isStaff) {
      api.get('/students/reschedule-requests/all?status=Pending')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.requests)) {
            setPendingRescheduleCount(res.data.requests.length);
          }
        })
        .catch(() => {});
    }
  }, [isStaff, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header ref={navRef} className="sticky top-2 sm:top-3 z-50 px-3 sm:px-5 lg:px-8 py-1.5 sm:py-2 max-w-[1440px] mx-auto w-full transition-all duration-300">
      {/* Liquid Glass Capsule Bar */}
      <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-purple-300/25 shadow-[0_8px_32px_0_rgba(147,51,234,0.25)] rounded-2xl sm:rounded-full px-3.5 sm:px-5 lg:px-6 py-2 sm:py-2.5 transition-all duration-300">
        {/* Specular Liquid Light Shimmer (Top Highlight) */}
        <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-300/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & School Branding */}
          <Link to={user && isStudent ? "/student/dashboard" : "/"} className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-full bg-slate-950/80 p-1 sm:p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300 shrink-0">
              <img
                src="/images/sithma-emblem.png"
                alt="Sithma Driving School"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-full bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow whitespace-nowrap">
                Sithma <span className="text-accent font-black">Driving</span>
              </span>
              <span className="text-[10px] sm:text-xs text-blue-200/90 font-medium tracking-wide hidden sm:block whitespace-nowrap">
                Sri Lanka's Driving Academy
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Liquid Glass Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 bg-white/5 p-1 lg:p-1.5 rounded-full border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar max-w-full shrink">
              {isStudent && (
                <>
                  {!isPremium && (
                    <span className="px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                      <span className="hidden xl:inline">Status: </span>Pending
                    </span>
                  )}

                  {/* Dashboard - Accessible to all students */}
                  <Link
                    to="/student/dashboard"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/student/dashboard')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Dashboard
                  </Link>

                  {/* Type 1 Only: DMT Milestones & Written Exam Practice */}
                  {!isType2 && isPremium && (
                    <>
                      <Link
                        to="/student/milestones"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/milestones')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-cyan-400 shrink-0" />
                        <span><span className="hidden xl:inline">DMT </span>Milestones</span>
                      </Link>
                      <Link
                        to="/student/quiz"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                        <span><span className="hidden xl:inline">Exam </span>Practice</span>
                      </Link>
                    </>
                  )}

                  {/* Book Lessons, Payments, Profile ID - Shared for both Type 1 & Type 2 */}
                  {isPremium && (
                    <>
                      <Link
                        to="/student/lessons"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/lessons') || isActive('/student/lessons/book')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                        <span><span className="hidden xl:inline">Book </span>Lessons</span>
                      </Link>
                      <Link
                        to="/student/payments"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/payments')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/profile')
                            ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Profile ID
                      </Link>
                    </>
                  )}
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/dashboard')
                        ? 'bg-accent text-slate-950 shadow-[0_0_15px_rgba(242,169,59,0.5)] border border-accent/60'
                        : 'text-accent hover:bg-accent/20'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span><span className="hidden xl:inline">Executive </span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/accounts"
                    className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/accounts')
                        ? 'bg-accent text-slate-950 shadow-[0_0_15px_rgba(242,169,59,0.5)] border border-accent/60'
                        : 'text-accent hover:bg-accent/20'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span><span className="hidden xl:inline">Manage </span>Accounts</span>
                  </Link>
                </>
              )}

              {isStaff && (
                <>
                  <Link
                    to="/staff/students"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/students')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span>Students<span className="hidden xl:inline"> & DMT</span></span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-md">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/staff/slots"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/slots')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span><span className="xl:hidden">Slots</span><span className="hidden xl:inline">Slot Creator</span></span>
                  </Link>
                  <Link
                    to="/staff/packages"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/packages')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span>Packages</span>
                  </Link>
                  <Link
                    to="/staff/quiz"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/quiz')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span><span className="xl:hidden">Quiz Bank</span><span className="hidden xl:inline">Question Bank</span></span>
                  </Link>
                  <Link
                    to="/staff/payments"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/payments')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span><span className="xl:hidden">Payments</span><span className="hidden xl:inline">Payment Queue</span></span>
                  </Link>
                  <Link
                    to="/staff/reports"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/reports')
                        ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span>Reports</span>
                  </Link>
                </>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive('/instructor/schedule')
                      ? 'bg-white/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Daily Schedule
                </Link>
              )}
            </nav>
          )}

          {/* Desktop & Tablet Liquid Glass Right Actions & User Profile */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-3.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-3 xl:gap-3.5">
                {/* Database Indicator Pill (Admin Only) */}
                {user?.role === 'admin' && dbInfo && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all shrink-0 ${
                      dbInfo.target?.includes('Atlas')
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    }`}
                    title={
                      dbInfo.target?.includes('Atlas')
                        ? 'Connected to MongoDB Atlas Cloud Cluster'
                        : 'Connected to Local MongoDB (127.0.0.1)'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        dbInfo.target?.includes('Atlas') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden lg:inline whitespace-nowrap">
                      {dbInfo.target?.includes('Atlas') ? 'Atlas Cloud' : 'Local DB'}
                    </span>
                  </div>
                )}

                <NotificationBell />

                {/* Frosted User Pill */}
                <div className="flex items-center gap-2 lg:gap-2.5 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm shrink-0">
                  {user?.profilePicture || student?.profilePicture ? (
                    <img
                      src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-xs lg:text-sm font-bold text-white truncate max-w-[80px] md:max-w-[100px] xl:max-w-[140px]">{user.name}</p>
                    <p className="text-[10px] lg:text-xs text-cyan-300 uppercase tracking-wider font-semibold whitespace-nowrap">
                      {user.role} <span className="hidden xl:inline">{user.branch ? `• ${user.branch}` : ''}</span>
                    </p>
                  </div>
                </div>

                {/* Liquid Glass Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 lg:p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 hover:border-red-400/40 text-slate-300 hover:text-red-300 border border-white/15 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/15 whitespace-nowrap"
                >
                  Sign In
                </Link>

                {/* Single Register Button Opening Student Type Selection Modal */}
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(true)}
                  className="px-4 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-accent via-amber-400 to-accent-dark hover:scale-105 rounded-full shadow-[0_0_15px_rgba(242,169,59,0.4)] border border-amber-300/40 transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Top Trigger Actions (< md) */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user && (
              <>
                <NotificationBell />
                {user?.profilePicture || student?.profilePicture ? (
                  <img
                    src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.3)] shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-[0_0_6px_rgba(6,182,212,0.3)] shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white bg-white/10 border border-white/20 backdrop-blur-md cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Glass Mobile Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl backdrop-blur-3xl bg-slate-950/95 border border-purple-400/25 shadow-[0_16px_48px_0_rgba(0,0,0,0.7)] space-y-3 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
          {user ? (
            <>
              {/* Mobile User Profile Header */}
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs flex items-center gap-3">
                {user?.profilePicture || student?.profilePicture ? (
                  <img
                    src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)] flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.4)] flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-sm">{user.name}</p>
                  <p className="text-[11px] text-cyan-300 font-semibold truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="badge badge-warning text-[9px] py-0.5">{user.role}</span>
                    <span className="badge badge-info text-[9px] py-0.5">{user.branch} Branch</span>
                  </div>
                </div>
              </div>

              {/* Database indicator in mobile drawer for admin */}
              {user?.role === 'admin' && dbInfo && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    dbInfo.target?.includes('Atlas')
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>DB: {dbInfo.target?.includes('Atlas') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}</span>
                </div>
              )}

              {/* Student Navigation Links */}
              {isStudent && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                  </Link>

                  {/* Type 1 Exclusive: Milestones & Quiz */}
                  {!isType2 && isPremium && (
                    <>
                      <Link
                        to="/student/milestones"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" /> DMT Milestones
                      </Link>
                      <Link
                        to="/student/quiz"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                      >
                        <BookOpen className="w-4 h-4 text-purple-400" /> DMT Exam Practice
                      </Link>
                    </>
                  )}

                  {/* Shared for all students: Lessons, Payments, Profile ID */}
                  {isPremium && (
                    <>
                      <Link
                        to="/student/lessons"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                      >
                        <Calendar className="w-4 h-4 text-cyan-400" /> Book Lessons
                      </Link>
                      <Link
                        to="/student/payments"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                      >
                        <CreditCard className="w-4 h-4 text-amber-400" /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                      >
                        <User className="w-4 h-4 text-emerald-400" /> Student Profile & Digital Pass
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Admin Navigation Links */}
              {user?.role === 'admin' && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-accent font-bold bg-accent/10 border border-accent/20"
                  >
                    <TrendingUp className="w-4 h-4 text-accent" /> Executive Dashboard
                  </Link>
                  <Link
                    to="/admin/accounts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <Users className="w-4 h-4 text-cyan-400" /> Manage Accounts
                  </Link>
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <Users className="w-4 h-4 text-purple-400" /> Student Directory
                  </Link>
                </div>
              )}

              {/* Staff Navigation Links */}
              {isStaff && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-cyan-400" /> Students & DMT Milestones
                    </span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-md">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/staff/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <Clock className="w-4 h-4 text-purple-400" /> Slot Creator
                  </Link>
                  <Link
                    to="/staff/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <Layers className="w-4 h-4 text-amber-400" /> Course Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-blue-400" /> Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Payment Queue
                  </Link>
                  <Link
                    to="/staff/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <BarChart3 className="w-4 h-4 text-cyan-300" /> Reports & Analytics
                  </Link>
                </div>
              )}

              {/* Instructor Navigation Links */}
              {isInstructor && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/instructor/schedule"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white font-medium"
                  >
                    <Calendar className="w-4 h-4 text-cyan-400" /> Daily Assigned Schedule
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 mt-3 rounded-xl text-xs font-bold text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
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

