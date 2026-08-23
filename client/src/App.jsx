import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DarkVeil from './components/DarkVeil';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import BookLessonPage from './pages/BookLessonPage';
import MyLessonsPage from './pages/MyLessonsPage';
import UploadPaymentPage from './pages/UploadPaymentPage';
import QuizSetupPage from './pages/QuizSetupPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizHistoryPage from './pages/QuizHistoryPage';
import StaffStudentListPage from './pages/StaffStudentListPage';
import PackageManagementPage from './pages/PackageManagementPage';
import SlotManagementPage from './pages/SlotManagementPage';
import PaymentVerificationQueuePage from './pages/PaymentVerificationQueuePage';
import QuestionBankManagementPage from './pages/QuestionBankManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import InstructorSchedulePage from './pages/InstructorSchedulePage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import PremiumLockOverlay from './components/PremiumLockOverlay';
import { Clock } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isPremium, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300 font-bold bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl">
          <Clock className="w-5 h-5 animate-spin text-cyan-400" /> Loading Portal...
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

  // Learner Advance Payment & Premium Access Gate
  if (user.role === 'student' && !isPremium) {
    return <PremiumLockOverlay />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <DarkVeil
        hueShift={280}
        noiseIntensity={0.25}
        scanlineIntensity={0.05}
        scanlineFrequency={2.0}
        warpAmount={0.5}
        speed={0.4}
      />
      <div className="relative z-10 min-h-screen flex flex-col font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
        <Navbar />

        <main className="flex-1 w-full">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
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
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
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
              path="/student/lessons"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyLessonsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payments/upload"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <UploadPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/take"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizTakingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/result"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizHistoryPage />
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
                  <PaymentVerificationQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/quiz"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <QuestionBankManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/reports"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <ReportsAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Executive Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
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

            {/* Notifications Center (All Roles) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff', 'instructor', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
