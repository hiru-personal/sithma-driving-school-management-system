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
  Package,
  FolderKanban,
  Building2,
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

  const [pendingRescheduleCount, setPendingRescheduleCount] = useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navRef = useRef(null);
  const moreMenuRef = useRef(null);

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
    isActive('/admin/branches') ||
    isActive('/staff/quiz') ||
    isActive('/admin/question-lists') ||
    isActive('/staff/reports') ||
    isActive('/staff/slots') ||
    isActive('/staff/payments');

  const getActiveMoreLabel = () => {
    if (isActive('/admin/branches')) return 'Branches';
    if (isActive('/staff/packages')) return 'Packages';
    if (isActive('/staff/quiz') || isActive('/admin/question-lists')) return 'Question Lists';
    if (isActive('/staff/reports')) return 'Reports';
    if (isActive('/staff/slots')) return 'Slots';
    if (isActive('/staff/payments')) return 'Payments';
    return null;
  };

  return (
    <header ref={navRef} className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 max-w-[1600px] mx-auto w-full transition-all duration-300">
      {/* Enterprise Capsule Bar */}
      <div className="relative bg-white border border-[#D4EEF8] shadow-[0_4px_24px_rgba(21,32,38,0.06)] rounded-2xl sm:rounded-full pl-3.5 sm:pl-5 lg:pl-6 pr-4 sm:pr-6 lg:pr-7 xl:pr-8 py-2 sm:py-2.5 transition-all duration-300">
        {/* Subtle Highlight */}
        <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4EEF8] to-transparent pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Logo & School Branding */}
          <Link to={user && isStudent ? "/student/dashboard" : "/"} className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-full bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-xs border border-[#D4EEF8] group-hover:scale-105 group-hover:border-[#6A97C0] transition-all duration-300 shrink-0">
              <img
                src="/images/sithma-emblem.png"
                alt="Sithma Driving School"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(21,32,38,0.15)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-[#152026] flex items-center gap-1.5 drop-shadow-xs whitespace-nowrap">
                Sithma <span className="text-[#1B3D59] font-black">Driving</span>
              </span>
              <span className="text-[10px] sm:text-xs text-[#6A97C0] font-medium tracking-wide hidden 2xl:block whitespace-nowrap">
                Sri Lanka's Driving Academy
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 bg-[#D4EEF8]/45 p-1 lg:p-1.5 rounded-full border border-[#D4EEF8] shrink-0 relative">
              {isStudent && (
                user?.verificationStatus !== 'Verified' ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F3EED8] text-[#152026] border border-amber-300 shadow-xs flex items-center gap-2 shrink-0 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin shrink-0" />
                    <span>Account Pending Verification</span>
                  </span>
                ) : (
                <>
                  {!isPremium && (
                    <span className="px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-bold bg-[#F3EED8] text-[#152026] border border-[#E2D9B8] shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-[#8C6D1F] animate-pulse shrink-0" />
                      <span className="hidden xl:inline">Status: </span>Pending
                    </span>
                  )}

                  {/* Dashboard - Accessible to all students */}
                  <Link
                    to="/student/dashboard"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/student/dashboard')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                    }`}
                  >
                    <LayoutDashboard className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/dashboard') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Dashboard
                  </Link>

                  {/* Type 1 Only: DMT Milestones & Written Exam Practice */}
                  {!isType2 && isPremium && (
                    <>
                      <Link
                        to="/student/milestones"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/milestones')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                        }`}
                      >
                        <ShieldCheck className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/milestones') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} />
                        <span><span className="hidden xl:inline">DMT </span>Milestones</span>
                      </Link>
                      <Link
                        to="/student/quiz"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                        }`}
                      >
                        <BookOpen className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/quiz') || location.pathname.startsWith('/student/quiz') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} />
                        <span><span className="hidden xl:inline">Exam </span>Practice</span>
                      </Link>
                    </>
                  )}

                  {/* Book Lessons, Payments, Profile ID - Shared for both Type 1 & Type 2 */}
                  {isPremium && (
                    <>
                      <Link
                        to="/student/lessons"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/lessons') || isActive('/student/lessons/book')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                        }`}
                      >
                        <Calendar className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/lessons') || isActive('/student/lessons/book') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} />
                        <span><span className="hidden xl:inline">Book </span>Lessons</span>
                      </Link>
                      <Link
                        to="/student/payments"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/payments')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                        }`}
                      >
                        <CreditCard className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/payments') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive('/student/profile')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold border border-[#1B3D59]'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                        }`}
                      >
                        <User className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/student/profile') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Profile ID
                      </Link>
                    </>
                  )}
                </>
                )
              )}

              {/* Admin Navigation Links */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/dashboard')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59]'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <TrendingUp
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/admin/dashboard') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>
                      <span className="hidden 2xl:inline">Executive </span>Dashboard
                    </span>
                  </Link>

                  <Link
                    to="/admin/accounts"
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/accounts')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59]'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Users
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/admin/accounts') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>
                      <span className="hidden 2xl:inline">Manage </span>Accounts
                    </span>
                  </Link>

                  <Link
                    to="/admin/branches"
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/admin/branches')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59]'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Building2
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/admin/branches') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>
                      <span className="hidden 2xl:inline">Manage </span>Branches
                    </span>
                  </Link>

                  <Link
                    to="/staff/students"
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/students')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59] font-bold'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Users
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/staff/students') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>
                      Students<span className="hidden 2xl:inline"> & DMT</span>
                    </span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-xs">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>

                  {/* Operations / Management Dropdown */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      style={
                        moreMenuOpen
                          ? { backgroundColor: '#D4EEF8', color: '#1B3D59', borderColor: '#6A97C0' }
                          : (isAnyMoreActive && !isActive('/admin/dashboard') && !isActive('/admin/accounts') && !isActive('/staff/students'))
                            ? { backgroundColor: '#1B3D59', color: '#ffffff', borderColor: '#1B3D59' }
                            : {}
                      }
                      className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        moreMenuOpen
                          ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0] shadow-xs'
                          : (isAnyMoreActive && !isActive('/admin/dashboard') && !isActive('/admin/accounts') && !isActive('/staff/students'))
                            ? 'bg-[#1B3D59] text-white border border-[#1B3D59] shadow-xs'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                      }`}
                    >
                      <Layers
                        className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 transition-colors ${
                          moreMenuOpen
                            ? 'text-[#1B3D59]'
                            : (isAnyMoreActive && !isActive('/admin/dashboard') && !isActive('/admin/accounts') && !isActive('/staff/students'))
                              ? 'text-[#B3D5F1]'
                              : 'text-[#6A97C0]'
                        }`}
                      />
                      <span>
                        {getActiveMoreLabel() || 'Operations'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreMenuOpen && (
                      <div
                        style={{ backgroundColor: '#ffffff', opacity: 1 }}
                        className="operations-dropdown absolute top-full right-0 mt-3 w-84 sm:w-[350px] rounded-2xl bg-white border border-[#D4EEF8] shadow-[0_20px_50px_rgba(21,32,38,0.12),0_4px_12px_rgba(21,32,38,0.06)] p-3 z-[60] space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6A97C0] border-b border-[#D4EEF8]/60 mb-1 flex items-center justify-between">
                          <span className="font-extrabold text-[#152026] tracking-wider">Operations & Management</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#D4EEF8] text-[#1B3D59] font-extrabold border border-[#B3D5F1] tracking-wider">Admin Tools</span>
                        </div>

                        {/* Branch Management */}
                        <Link
                          to="/admin/branches"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/admin/branches')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/admin/branches')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/admin/branches') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Branch Management</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Add, edit, view & assign branches</p>
                          </div>
                        </Link>

                        {/* 1. Slot Creator */}
                        <Link
                          to="/staff/slots"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/slots')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/slots')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/slots') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Slot Creator</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Lesson slots, scheduling & limits</p>
                          </div>
                        </Link>

                        {/* 2. Payment Queue */}
                        <Link
                          to="/staff/payments"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/payments')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/payments')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/payments') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Payment Queue</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Verify slips & advance fees</p>
                          </div>
                        </Link>

                        {/* 3. Course Packages */}
                        <Link
                          to="/staff/packages"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/packages')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/packages')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/packages') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Course Packages</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Classes, curriculum & pricing</p>
                          </div>
                        </Link>

                        {/* 4. Question Lists */}
                        <Link
                          to="/admin/question-lists"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/admin/question-lists') || isActive('/staff/quiz')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/admin/question-lists') || isActive('/staff/quiz')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/admin/question-lists') || isActive('/staff/quiz') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Question Lists</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Create & manage multiple question sets</p>
                          </div>
                        </Link>

                        {/* 5. Reports & Analytics */}
                        <Link
                          to="/staff/reports"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/reports')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/reports')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/reports') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Reports & Analytics</p>
                            <p className="text-[11px] text-slate-600 font-medium truncate leading-snug">Branch performance & exam statistics</p>
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
                    style={isActive('/staff/students') ? { backgroundColor: '#1B3D59', color: '#ffffff' } : {}}
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/students')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59] font-bold'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Users
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/staff/students') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>
                      Students<span className="hidden 2xl:inline"> & DMT</span>
                    </span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-xs">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/staff/slots"
                    style={isActive('/staff/slots') ? { backgroundColor: '#1B3D59', color: '#ffffff' } : {}}
                    className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/staff/slots')
                        ? 'nav-pill-active bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59] font-bold'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Clock
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive('/staff/slots') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`}
                    />
                    <span>Slots</span>
                  </Link>

                  {/* Operations Dropdown for Staff */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      style={
                        moreMenuOpen
                          ? { backgroundColor: '#D4EEF8', color: '#1B3D59', borderColor: '#6A97C0' }
                          : (isActive('/staff/payments') || isActive('/staff/packages') || isActive('/staff/quiz') || isActive('/staff/reports'))
                            ? { backgroundColor: '#1B3D59', color: '#ffffff', borderColor: '#1B3D59' }
                            : {}
                      }
                      className={`px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        moreMenuOpen
                          ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0] shadow-xs'
                          : (isActive('/staff/payments') || isActive('/staff/packages') || isActive('/staff/quiz') || isActive('/staff/reports'))
                            ? 'bg-[#1B3D59] text-white border border-[#1B3D59] shadow-xs'
                            : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white border border-transparent'
                      }`}
                    >
                      <Layers
                        className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 transition-colors ${
                          moreMenuOpen
                            ? 'text-[#1B3D59]'
                            : (isActive('/staff/payments') || isActive('/staff/packages') || isActive('/staff/quiz') || isActive('/staff/reports'))
                              ? 'text-[#B3D5F1]'
                              : 'text-[#6A97C0]'
                        }`}
                      />
                      <span>
                        {getActiveMoreLabel() || 'More Tools'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreMenuOpen && (
                      <div
                        style={{ backgroundColor: '#ffffff', opacity: 1 }}
                        className="operations-dropdown absolute top-full right-0 mt-3 w-84 sm:w-[350px] rounded-2xl bg-white border border-[#D4EEF8] shadow-[0_20px_50px_rgba(21,32,38,0.12),0_4px_12px_rgba(21,32,38,0.06)] p-3 z-[60] space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6A97C0] border-b border-[#D4EEF8]/60 mb-1 flex items-center justify-between">
                          <span className="font-extrabold text-[#152026] tracking-wider">Staff Tools</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#D4EEF8] text-[#1B3D59] font-extrabold border border-[#B3D5F1] tracking-wider">Management</span>
                        </div>

                        {/* Payments */}
                        <Link
                          to="/staff/payments"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/payments')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/payments')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/payments') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Payment Queue</p>
                            <p className="text-[11px] text-[#6A97C0] truncate leading-snug">Verify slips & advance fees</p>
                          </div>
                        </Link>

                        {/* Packages */}
                        <Link
                          to="/staff/packages"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/packages')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/packages')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/packages') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Course Packages</p>
                            <p className="text-[11px] text-[#6A97C0] truncate leading-snug">Classes, curriculum & pricing</p>
                          </div>
                        </Link>

                        {/* Question Lists */}
                        <Link
                          to="/staff/quiz"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/quiz') || isActive('/admin/question-lists')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/quiz') || isActive('/admin/question-lists')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/quiz') || isActive('/admin/question-lists') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Question Lists</p>
                            <p className="text-[11px] text-[#6A97C0] truncate leading-snug">DMT exam question lists & practice sets</p>
                          </div>
                        </Link>

                        {/* Reports */}
                        <Link
                          to="/staff/reports"
                          onClick={() => setMoreMenuOpen(false)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isActive('/staff/reports')
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] shadow-xs'
                              : 'hover:bg-[#D4EEF8]/40 border border-transparent'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive('/staff/reports')
                              ? 'bg-[#1B3D59] text-white shadow-xs'
                              : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]/60 group-hover:bg-[#1B3D59] group-hover:text-white group-hover:border-[#1B3D59] group-hover:scale-105'
                          }`}>
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold transition-colors ${
                              isActive('/staff/reports') ? 'text-[#1B3D59]' : 'text-[#152026] group-hover:text-[#1B3D59]'
                            }`}>Reports & Analytics</p>
                            <p className="text-[11px] text-[#6A97C0] truncate leading-snug">Branch performance & exam statistics</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {isInstructor && (
                <>
                  <Link
                    to="/instructor/schedule"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/instructor/schedule')
                        ? 'bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59] font-bold'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/instructor/schedule') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Daily Schedule
                  </Link>
                  <Link
                    to="/instructor/profile"
                    className={`px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive('/instructor/profile')
                        ? 'bg-[#1B3D59] text-white shadow-xs border border-[#1B3D59] font-bold'
                        : 'text-[#152026] hover:text-[#1B3D59] hover:bg-white'
                    }`}
                  >
                    <User className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive('/instructor/profile') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Instructor Profile
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Desktop & Tablet Liquid Glass Right Actions & User Profile */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3 shrink-0">
            {user ? (
              <>
                <NotificationBell />

                {/* User Pill */}
                <Link
                  to={isInstructor ? '/instructor/profile' : isStudent ? '/student/profile' : '#'}
                  className={`flex items-center gap-2 px-2 sm:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-white border border-[#D4EEF8] shadow-xs shrink-0 transition-colors ${
                    isInstructor || isStudent ? 'hover:border-[#1B3D59] cursor-pointer' : ''
                  }`}
                  title={`${user.name} (${user.role}${user.branch ? ` • ${user.branch}` : ''})`}
                >
                  {user?.profilePicture || student?.profilePicture ? (
                    <img
                      src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#1B3D59]/30 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#1B3D59] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-xs font-bold text-[#152026] truncate max-w-[75px] md:max-w-[90px] xl:max-w-[115px] 2xl:max-w-[140px]">{user.name}</p>
                    <p className="text-[10px] text-[#1B3D59] uppercase tracking-wider font-semibold whitespace-nowrap">
                      {user.role} <span className="hidden 2xl:inline text-[#6A97C0]">{user.branch ? `• ${user.branch}` : ''}</span>
                    </p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-rose-50 hover:border-rose-200 text-[#152026] hover:text-rose-600 border border-[#D4EEF8] transition-all duration-200 flex items-center justify-center shadow-xs cursor-pointer shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-[#1B3D59] hover:text-[#152026] hover:bg-[#D4EEF8]/60 rounded-full transition-colors border border-transparent hover:border-[#D4EEF8] whitespace-nowrap"
                >
                  Sign In
                </Link>

                {/* Single Register Button Opening Student Type Selection Modal */}
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(true)}
                  className="px-4 py-1.5 text-xs font-black text-white bg-[#1B3D59] hover:bg-[#152026] rounded-full shadow-xs border border-[#1B3D59] transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B3D5F1]" />
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
                    className="w-8 h-8 rounded-full object-cover border border-[#1B3D59]/30 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1B3D59] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-full text-[#152026] hover:text-[#1B3D59] bg-white border border-[#D4EEF8] cursor-pointer transition-colors shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl bg-white border border-[#D4EEF8] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto text-[#152026]">
          {user ? (
            <>
              {/* Mobile User Profile Header */}
              <div className="p-3.5 bg-[#D4EEF8]/30 rounded-2xl border border-[#D4EEF8] text-xs flex items-center gap-3">
                {user?.profilePicture || student?.profilePicture ? (
                  <img
                    src={getAvatarUrl(user?.profilePicture || student?.profilePicture)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#1B3D59]/30 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1B3D59] text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#152026] truncate text-sm">{user.name}</p>
                  <p className="text-[11px] text-[#6A97C0] font-semibold truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="badge bg-[#F3EED8] text-[#152026] text-[9px] py-0.5 border border-[#B3D5F1] font-bold">{user.role}</span>
                    <span className="badge bg-[#D4EEF8] text-[#1B3D59] text-[9px] py-0.5 border border-[#B3D5F1] font-bold">{user.branch} Branch</span>
                  </div>
                </div>
              </div>

              {/* Database indicator in mobile drawer for admin */}
              {user?.role === 'admin' && dbInfo && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    dbInfo.target?.includes('Atlas')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-[#F3EED8] text-[#152026] border-[#B3D5F1]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-[#1B3D59]" />
                  <span>DB: {dbInfo.target?.includes('Atlas') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}</span>
                </div>
              )}

              {/* Student Navigation Links */}
              {isStudent && (
                user?.verificationStatus !== 'Verified' ? (
                  <div className="p-3.5 rounded-2xl bg-[#F3EED8] border border-amber-300 text-xs font-bold text-[#152026] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
                    <span>Account Pending Verification</span>
                  </div>
                ) : (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive('/student/dashboard')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <LayoutDashboard className={`w-4 h-4 ${isActive('/student/dashboard') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Dashboard
                  </Link>

                  {/* Type 1 Exclusive: Milestones & Quiz */}
                  {!isType2 && isPremium && (
                    <>
                      <Link
                        to="/student/milestones"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                          isActive('/student/milestones')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                        }`}
                      >
                        <ShieldCheck className={`w-4 h-4 ${isActive('/student/milestones') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> DMT Milestones
                      </Link>
                      <Link
                        to="/student/quiz"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                          isActive('/student/quiz') || location.pathname.startsWith('/student/quiz')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 ${isActive('/student/quiz') || location.pathname.startsWith('/student/quiz') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> DMT Exam Practice
                      </Link>
                    </>
                  )}

                  {/* Shared for all students: Lessons, Payments, Profile ID */}
                  {isPremium && (
                    <>
                      <Link
                        to="/student/lessons"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                          isActive('/student/lessons') || isActive('/student/lessons/book')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                        }`}
                      >
                        <Calendar className={`w-4 h-4 ${isActive('/student/lessons') || isActive('/student/lessons/book') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Book Lessons
                      </Link>
                      <Link
                        to="/student/payments"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                          isActive('/student/payments')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 ${isActive('/student/payments') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Payments
                      </Link>
                      <Link
                        to="/student/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                          isActive('/student/profile')
                            ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                        }`}
                      >
                        <User className={`w-4 h-4 ${isActive('/student/profile') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Student Profile & Digital Pass
                      </Link>
                    </>
                  )}
                </div>
                )
              )}

              {/* Admin Navigation Links */}
              {user?.role === 'admin' && (
                <div className="space-y-1 text-xs">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6A97C0]">Executive Administration</div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                      isActive('/admin/dashboard')
                        ? 'bg-[#1B3D59] text-white shadow-xs'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <TrendingUp className={`w-4 h-4 ${isActive('/admin/dashboard') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Executive Dashboard
                  </Link>
                  <Link
                    to="/admin/accounts"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                      isActive('/admin/accounts')
                        ? 'bg-[#1B3D59] text-white shadow-xs'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <Users className={`w-4 h-4 ${isActive('/admin/accounts') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Manage Accounts
                  </Link>
                  <Link
                    to="/admin/branches"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                      isActive('/admin/branches')
                        ? 'bg-[#1B3D59] text-white shadow-xs'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${isActive('/admin/branches') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Branch Management
                  </Link>
                </div>
              )}

              {/* Staff & Admin Operations Navigation Links */}
              {isStaff && (
                <div className="space-y-1 text-xs">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6A97C0]">Branch Operations</div>
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/staff/students')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className={`w-4 h-4 ${isActive('/staff/students') ? 'text-[#B3D5F1]' : 'text-[#6A97C0]'}`} /> Students & DMT Milestones
                    </span>
                    {pendingRescheduleCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-xs">
                        {pendingRescheduleCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/staff/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/staff/slots')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${isActive('/staff/slots') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Slot Creator
                  </Link>
                  <Link
                    to="/staff/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/staff/payments')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <CreditCard className={`w-4 h-4 ${isActive('/staff/payments') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Payment Queue
                  </Link>
                  <Link
                    to="/staff/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/staff/packages')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <Package className={`w-4 h-4 ${isActive('/staff/packages') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Course Packages
                  </Link>
                  <Link
                    to={user?.role === 'admin' ? '/admin/question-lists' : '/staff/quiz'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/admin/question-lists') || isActive('/staff/quiz')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <FolderKanban className={`w-4 h-4 ${isActive('/admin/question-lists') || isActive('/staff/quiz') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Question Lists
                  </Link>
                  <Link
                    to="/staff/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive('/staff/reports')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <BarChart3 className={`w-4 h-4 ${isActive('/staff/reports') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Reports & Analytics
                  </Link>
                </div>
              )}

              {/* Instructor Navigation Links */}
              {isInstructor && (
                <div className="space-y-1 text-xs">
                  <Link
                    to="/instructor/schedule"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive('/instructor/schedule')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 ${isActive('/instructor/schedule') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Daily Assigned Schedule
                  </Link>
                  <Link
                    to="/instructor/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive('/instructor/profile')
                        ? 'bg-[#1B3D59] text-white shadow-xs font-bold'
                        : 'text-[#152026] hover:bg-[#D4EEF8]/50 hover:text-[#1B3D59]'
                    }`}
                  >
                    <User className={`w-4 h-4 ${isActive('/instructor/profile') ? 'text-[#B3D5F1]' : 'text-[#1B3D59]'}`} /> Instructor Profile
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 mt-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-[#1B3D59] bg-[#D4EEF8]/40 hover:bg-[#D4EEF8] font-bold border border-[#D4EEF8]"
              >
                Sign In
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTypeModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-white bg-[#1B3D59] hover:bg-[#152026] font-bold text-xs shadow-xs border border-[#1B3D59] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B3D5F1]" />
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

