import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffStudentListPage from './pages/StaffStudentListPage';
import PackageManagementPage from './pages/PackageManagementPage';
import {
  Car,
  MapPin,
  Clock,
  BookOpen,
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutralBg">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Clock className="w-5 h-5 animate-spin" /> Loading Portal...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function HomePage() {
  const { user } = useAuth();

  const branches = [
    { name: 'Maharagama Branch', address: 'High Level Road, Maharagama', slots: '3 daily sessions • 1 hr each' },
    { name: 'Werahara Branch', address: 'Near DMT Central Office, Werahara', slots: '3 daily sessions • 1 hr each' },
    { name: 'Delgoda Branch', address: 'Main Street, Delgoda', slots: '3 daily sessions • 1 hr each' },
  ];

  return (
    <div className="min-h-screen bg-neutralBg flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primaryDark via-primary to-[#1875c4] rounded-3xl text-white p-8 sm:p-12 shadow-card relative overflow-hidden">
          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent font-semibold text-xs backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" /> Sri Lanka's Trusted Driving Academy
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Master the Road with Sithma Driving School
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Serving Maharagama, Werahara, and Delgoda branches with professional instructors, streamlined Department of Motor Traffic (DMT) milestone tracking, and modern trial preparation.
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              {user ? (
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : '/staff/students'}
                  className="btn-accent px-6 py-3 font-bold text-sm shadow-md"
                >
                  Go to {user.role === 'student' ? 'Student Dashboard' : 'Staff Portal'} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-accent px-6 py-3 font-bold text-sm shadow-md">
                    Register as Learner <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 px-5 py-3 text-sm font-semibold">
                    Sign In to Portal
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="absolute right-[-30px] bottom-[-30px] opacity-10 pointer-events-none hidden lg:block">
            <Car className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Operating Branches */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-dark" /> Our Branches & Instructors
            </h2>
            <span className="badge badge-info">3 Branches • 6 Instructors</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b, idx) => (
              <div key={idx} className="card card-hover flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-textMain mb-1">{b.name}</h3>
                  <p className="text-xs text-textMuted mb-3">{b.address}</p>
                </div>
                <div className="pt-3 border-t border-borderColor flex items-center justify-between text-xs">
                  <span className="text-textMuted flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sessions:</span>
                  <span className="font-semibold text-primary">{b.slots}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Key System Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-textMain">Type 1 & Type 2 Support</h3>
              <p className="text-xs text-textMuted">Support for brand new learners as well as trial-ready students.</p>
            </div>
            <div className="card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent-dark">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-textMain">DMT Milestone Rules</h3>
              <p className="text-xs text-textMuted">Auto-enforced 1.5-year trial window and 3-attempt maximum limit.</p>
            </div>
            <div className="card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center text-success">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-textMain">Bonus Lessons Bundle</h3>
              <p className="text-xs text-textMuted">Car full package includes 2 free Bike and 2 free Three-Wheeler lessons.</p>
            </div>
            <div className="card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-textMain">3-Language Quiz</h3>
              <p className="text-xs text-textMuted">Informal practice questions available in Sinhala, Tamil, and English.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-borderColor py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted">
          <p>© 2026 Sithma Driving School Management System — Sri Lanka Institute of Information Technology (SLIIT)</p>
          <div className="flex items-center gap-4 font-medium">
            <span>Maharagama</span> • <span>Werahara</span> • <span>Delgoda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import BookLessonPage from './pages/BookLessonPage';
import MyLessonsPage from './pages/MyLessonsPage';
import SlotManagementPage from './pages/SlotManagementPage';
import InstructorSchedulePage from './pages/InstructorSchedulePage';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutralBg flex flex-col font-sans">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/lessons"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyLessonsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/lessons/book"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <BookLessonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff & Admin Protected Routes */}
          <Route
            path="/staff/students"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffStudentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/packages"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <PackageManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/slots"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <SlotManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/payments"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffStudentListPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Protected Routes */}
          <Route
            path="/instructor/schedule"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'staff', 'admin']}>
                <InstructorSchedulePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
