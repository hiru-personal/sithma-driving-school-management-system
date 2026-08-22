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
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primaryDark font-bold shadow-sm">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight">
                Sithma Driving School
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-primaryDark/70 px-2 py-0.5 rounded text-blue-100 font-medium">
                {user ? `${user.role.toUpperCase()} PORTAL` : 'MANAGEMENT SYSTEM'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/student/dashboard')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard & Timeline
                  </Link>
                  <Link
                    to="/student/lessons"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/student/lessons')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-4 h-4" /> Book Lessons
                  </Link>
                  <Link
                    to="/student/payments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/student/payments')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Payments
                  </Link>
                  <Link
                    to="/student/quiz"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/student/quiz')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Exam Practice
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'bg-accent text-primaryDark font-bold'
                      : 'text-accent hover:bg-primaryDark/50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> Executive Dashboard
                </Link>
              )}

              {isStaff && (
                <>
                  <Link
                    to="/staff/students"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/students')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Students & DMT
                  </Link>
                  <Link
                    to="/staff/slots"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/slots')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" /> Slot Management
                  </Link>
                  <Link
                    to="/staff/packages"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/packages')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> Packages
                  </Link>
                  <Link
                    to="/staff/quiz"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/quiz')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Question Bank
                  </Link>
                  <Link
                    to="/staff/payments"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/payments')
                        ? 'bg-primaryDark text-white'
                        : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Payment Queue
                  </Link>
                </>
              )}

              {isInstructor && (
                <Link
                  to="/instructor/schedule"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/instructor/schedule')
                      ? 'bg-primaryDark text-white'
                      : 'text-blue-100 hover:bg-primaryDark/50 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> My Assigned Schedule
                </Link>
              )}
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="text-right">
                  <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-xs text-blue-200">
                    {user.branch} • {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-primaryDark/80 hover:bg-danger text-white transition-colors flex items-center gap-1 text-xs"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark/60 rounded-lg">
                  Login
                </Link>
                <Link to="/register" className="btn-accent text-sm py-2 px-4 shadow-sm">
                  Register as Learner
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-primaryDark"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primaryDark px-4 pt-2 pb-4 space-y-2 border-t border-primary/40">
          {user ? (
            <>
              <div className="py-2 border-b border-primary/40 text-sm">
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-blue-200">{user.email} • {user.branch}</p>
              </div>
              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-white hover:bg-primary"
                  >
                    Dashboard & DMT Timeline
                  </Link>
                  <Link
                    to="/student/lessons"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-white hover:bg-primary"
                  >
                    Book Lessons
                  </Link>
                  <Link
                    to="/student/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-white hover:bg-primary"
                  >
                    Payments
                  </Link>
                </>
              )}
              {isStaff && (
                <>
                  <Link
                    to="/staff/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-white hover:bg-primary"
                  >
                    Students & DMT Milestones
                  </Link>
                  <Link
                    to="/staff/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-white hover:bg-primary"
                  >
                    Course Packages
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-danger-light hover:bg-danger hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm text-white bg-primary rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm text-textMain bg-accent font-semibold rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
