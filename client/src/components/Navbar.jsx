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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navRef = useRef(null);
  const moreMenuRef = useRef(null);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const isAnyMoreActive =
    isActive('/staff/packages') ||
    isActive('/staff/quiz') ||
    isActive('/staff/reports') ||
    isActive('/staff/slots') ||
    isActive('/staff/payments');

  const getActiveMoreLabel = () => {
    if (isActive('/staff/packages')) return 'Packages';
    if (isActive('/staff/quiz')) return 'Question Bank';
    if (isActive('/staff/reports')) return 'Reports';
    if (isActive('/staff/slots')) return 'Slots';
    if (isActive('/staff/payments')) return 'Payments';
    return null;
  };

  return (
    <header ref={navRef} className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 max-w-[1600px] mx-auto w-full transition-all duration-300">
      {/* Liquid Glass Capsule Bar */}
      <div className="relative backdrop-blur-xl bg-white/95 border border-[#DBE2EF] shadow-[0_4px_24px_rgba(17,45,78,0.06)] rounded-2xl sm:rounded-full pl-3.5 sm:pl-5 lg:pl-6 pr-4 sm:pr-6 lg:pr-7 xl:pr-8 py-2 sm:py-2.5 transition-all duration-300">
        {/* Specular Liquid Light Shimmer (Top Highlight) */}
        <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#DBE2EF] to-transparent pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Logo & School Branding */}
          <Link to={user && isStudent ? "/student/dashboard" : "/"} className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-full bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-sm border border-[#DBE2EF] group-hover:scale-105 group-hover:border-[#3F72AF] transition-all duration-300 shrink-0">
              <img
                src="/images/sithma-emblem.png"
                alt="Sithma Driving School"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(17,45,78,0.15)]"
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-full bg-[#3F72AF]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-[#112D4E] flex items-center gap-1.5 drop-shadow-sm whitespace-nowrap">
                Sithma <span className="text-[#3F72AF] font-black">Driving</span>
              </span>
              <span className="text-[10px] sm:text-xs text-[#4B6584] font-medium tracking-wide hidden 2xl:block whitespace-nowrap">
                Sri Lanka's Driving Academy
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Liquid Glass Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 bg-[#F0F4F8] p-1 lg:p-1.5 rounded-full border border-[#DBE2EF] backdrop-blur-md shrink-0 relative">
              {isStudent && (
                <>
                  {!isPremium && (
                    <span className="px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                      <span className="hidden xl:inline">Status: </span>Pending
                    </span>
                  )}

                  {/* Dashboard - Accessible to all students */}
                  <Link
                    to="/student/dashboard"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/student/dashboard')
                        ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
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
                            ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary shrink-0" />
                        <span><span className="hidden xl:inline">DMT </span>Milestones</span>
                      </Link>
                      <Link
                        to="/student/quiz"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                            ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
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
                            ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                        <span><span className="hidden xl:inline">Book </span>Lessons</span>
                      </Link>
                      <Link
                        to="/student/payments"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/payments')
                            ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/profile')
                            ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Profile ID
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Admin Navigation Links */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/dashboard')
                        ? 'bg-accent text-slate-950 shadow-sm border border-accent/60'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span><span className="hidden 2xl:inline">Executive </span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/accounts"
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/accounts')
                        ? 'bg-accent text-slate-950 shadow-sm border border-accent/60'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span><span className="hidden 2xl:inline">Manage </span>Accounts</span>
                  </Link>

                  <Link
                    to="/staff/students"
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/students')
                        ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span>Students<span className="hidden 2xl:inline"> & DMT</span></span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-sm">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>

                  {/* Operations / Management Dropdown */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        (isAnyMoreActive && !isActive('/admin/dashboard') && !isActive('/admin/accounts') && !isActive('/staff/students'))
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-sm font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-purple-600 shrink-0" />
                      <span>{getActiveMoreLabel() || 'Operations'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreMenuOpen && (
                      <div className="absolute top-full right-0 mt-2.5 w-72 rounded-2xl bg-white/98 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
                          <span>Operations & Management</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">Admin Tools</span>
                        </div>

                        {/* Slots */}
                        <Link
                          to="/staff/slots"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/slots') ? 'bg-purple-50 text-primary border border-purple-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Slot Creator</p>
                            <p className="text-[10px] text-slate-500">Lesson slots, scheduling & limits</p>
                          </div>
                        </Link>

                        {/* Payments */}
                        <Link
                          to="/staff/payments"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/payments') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Payment Queue</p>
                            <p className="text-[10px] text-slate-500">Verify slips & advance fees</p>
                          </div>
                        </Link>

                        {/* Packages */}
                        <Link
                          to="/staff/packages"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/packages') ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Course Packages</p>
                            <p className="text-[10px] text-slate-500">Classes, curriculum & pricing</p>
                          </div>
                        </Link>

                        {/* Question Bank */}
                        <Link
                          to="/staff/quiz"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/quiz') ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Question Bank</p>
                            <p className="text-[10px] text-slate-500">DMT theory test questions & practice</p>
                          </div>
                        </Link>

                        {/* Reports */}
                        <Link
                          to="/staff/reports"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/reports') ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                            <BarChart3 className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Reports & Analytics</p>
                            <p className="text-[10px] text-slate-500">Branch performance & exam statistics</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Staff (non-admin) Navigation Links */}
              {isStaff && user?.role !== 'admin' && (
                <>
                  <Link
                    to="/staff/students"
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/students')
                        ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span>Students<span className="hidden 2xl:inline"> & DMT</span></span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-sm">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/staff/slots"
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/slots')
                        ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span>Slots</span>
                  </Link>

                  {/* Operations Dropdown for Staff */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        (isActive('/staff/payments') || isActive('/staff/packages') || isActive('/staff/quiz') || isActive('/staff/reports'))
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-sm font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-purple-600 shrink-0" />
                      <span>{getActiveMoreLabel() || 'More Tools'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreMenuOpen && (
                      <div className="absolute top-full right-0 mt-2.5 w-72 rounded-2xl bg-white/98 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
                          <span>Staff Tools</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">Management</span>
                        </div>

                        {/* Payments */}
                        <Link
                          to="/staff/payments"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/payments') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Payment Queue</p>
                            <p className="text-[10px] text-slate-500">Verify slips & advance fees</p>
                          </div>
                        </Link>

                        {/* Packages */}
                        <Link
                          to="/staff/packages"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/packages') ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Course Packages</p>
                            <p className="text-[10px] text-slate-500">Classes, curriculum & pricing</p>
                          </div>
                        </Link>

                        {/* Question Bank */}
                        <Link
                          to="/staff/quiz"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/quiz') ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Question Bank</p>
                            <p className="text-[10px] text-slate-500">DMT theory test questions & practice</p>
                          </div>
                        </Link>

                        {/* Reports */}
                        <Link
                          to="/staff/reports"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            isActive('/staff/reports') ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                            <BarChart3 className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Reports & Analytics</p>
                            <p className="text-[10px] text-slate-500">Branch performance & exam statistics</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive('/instructor/schedule')
                      ? 'bg-white text-primary shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" /> Daily Schedule
                </Link>
              )}
            </nav>
          )}

          {/* Desktop & Tablet Liquid Glass Right Actions & User Profile */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3 shrink-0">
            {user ? (
              <>
                {/* Database Indicator Pill (Admin Only) */}
                {user?.role === 'admin' && dbInfo && (
                  <div
                    className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] font-semibold border transition-all shrink-0 ${
                      dbInfo.target?.includes('Atlas')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                        : 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
                    }`}
                    title={
                      dbInfo.target?.includes('Atlas')
                        ? 'Connected to MongoDB Atlas Cloud Cluster'
                        : 'Connected to Local MongoDB (127.0.0.1)'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        dbInfo.target?.includes('Atlas') ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden 2xl:inline whitespace-nowrap">
                      {dbInfo.target?.includes('Atlas') ? 'Atlas Cloud' : 'Local DB'}
                    </span>
                  </div>
                )}

                <NotificationBell />

                {/* Frosted User Pill */}
                <div
                  className="flex items-center gap-2 px-2 sm:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 backdrop-blur-md shadow-sm shrink-0"
                  title={`${user.name} (${user.role}${user.branch ? ` • ${user.branch}` : ''})`}
                >
                  {user?.profilePicture || student?.profilePicture ? (
                    <img
                      src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-primary/40 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[75px] md:max-w-[90px] xl:max-w-[115px] 2xl:max-w-[140px]">{user.name}</p>
                    <p className="text-[10px] text-primary uppercase tracking-wider font-semibold whitespace-nowrap">
                      {user.role} <span className="hidden 2xl:inline text-slate-500">{user.branch ? `• ${user.branch}` : ''}</span>
                    </p>
                  </div>
                </div>

                {/* Liquid Glass Logout */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-[#112D4E] hover:text-[#3F72AF] hover:bg-[#DBE2EF]/60 rounded-full transition-colors border border-transparent hover:border-[#DBE2EF] whitespace-nowrap"
                >
                  Sign In
                </Link>

                {/* Single Register Button Opening Student Type Selection Modal */}
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(true)}
                  className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#112D4E] to-[#19376D] hover:from-[#0B2447] hover:to-[#112D4E] hover:scale-105 rounded-full shadow-sm hover:shadow-[0_4px_16px_rgba(17,45,78,0.25)] border border-[#3F72AF]/40 transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A5D7E8]" />
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
                    className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200 backdrop-blur-md cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Glass Mobile Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl bg-white/98 border border-slate-200 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto text-slate-800">
          {user ? (
            <>
              {/* Mobile User Profile Header */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center gap-3">
                {user?.profilePicture || student?.profilePicture ? (
                  <img
                    src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-primary/40 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate text-sm">{user.name}</p>
                  <p className="text-[11px] text-slate-500 font-semibold truncate">{user.email}</p>
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
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
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
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                  </Link>

                  {/* Type 1 Exclusive: Milestones & Quiz */}
                  {!isType2 && isPremium && (
                    <>
                      <Link
                        to="/student/milestones"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" /> DMT Milestones
                      </Link>
                      <Link
                        to="/student/quiz"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      >
                        <BookOpen className="w-4 h-4 text-purple-600" /> DMT Exam Practice
                      </Link>
                    </>
                  )}

                  {/* Shared for all students: Lessons, Payments, Profile ID */}
                  {isPremium && (
                    <>
                      <Link
                        to="/student/lessons"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      >
                        <Calendar className="w-4 h-4 text-primary" /> Book Lessons
                      </Link>
                      <Link
                        to="/student/payments"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      >
                        <CreditCard className="w-4 h-4 text-amber-600" /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      >
                        <User className="w-4 h-4 text-emerald-600" /> Student Profile & Digital Pass
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Admin Navigation Links */}
              {user?.role === 'admin' && (
                <div className="space-y-1 text-xs">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Executive Administration</div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-950 font-bold bg-accent/20 border border-accent/40"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-600" /> Executive Dashboard
                  </Link>
                  <Link
                    to="/admin/accounts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Users className="w-4 h-4 text-primary" /> Manage Accounts
                  </Link>
                </div>
              )}

              {/* Staff & Admin Operations Navigation Links */}
              {isStaff && (
                <div className="space-y-1 text-xs">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Branch Operations</div>
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-primary" /> Students & DMT Milestones
                    </span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-sm">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/staff/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Clock className="w-4 h-4 text-purple-600" /> Slot Creator
                  </Link>
                  <Link
                    to="/staff/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Layers className="w-4 h-4 text-amber-600" /> Course Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" /> Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Queue
                  </Link>
                  <Link
                    to="/staff/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <BarChart3 className="w-4 h-4 text-primary" /> Reports & Analytics
                  </Link>
                </div>
              )}

              {/* Instructor Navigation Links */}
              {isInstructor && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/instructor/schedule"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Calendar className="w-4 h-4 text-primary" /> Daily Assigned Schedule
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 mt-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 font-bold border border-slate-200"
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

