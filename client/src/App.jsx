import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import StudentDashboard from './pages/StudentDashboard';
import DmtMilestonesPage from './pages/DmtMilestonesPage';
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
import InstructorProfilePage from './pages/InstructorProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminAccountsPage from './pages/AdminAccountsPage';
import NotFoundPage from './pages/NotFoundPage';
import PremiumLockOverlay from './components/PremiumLockOverlay';
import PaymentGatewayPage from './pages/PaymentGatewayPage';
import AccountPendingVerification from './components/AccountPendingVerification';
import { Clock } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles, onlyType1 = false, requirePremium = false }) {
  const { user, student, isPremium, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-primary font-bold bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-xl">
          <Clock className="w-5 h-5 animate-spin text-primary" /> Loading Portal...
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

  // 1. Admin Verification Gate for Students:
  // If a student account is NOT verified by admin, lock student functionality and show AccountPendingVerification
  if (user.role === 'student' && user.verificationStatus !== 'Verified') {
    return <AccountPendingVerification />;
  }

  // Learner Unpaid Gate: If a verified student has not submitted any payment, route directly to /payment-gateway
  if (user.role === 'student') {
    const isVerified = Boolean(
      user.status === 'active' ||
      user.account_status === 'Verified' ||
      student?.isAdvancePaid ||
      student?.advancePaymentStatus === 'verified'
    );
    const hasSubmittedPayment = Boolean(
      student?.hasSubmittedPayment ||
      student?.latestPayment ||
      (student?.advancePaymentStatus && student.advancePaymentStatus !== 'none') ||
      student?.isAdvancePaid
    );
    if (!isVerified && !hasSubmittedPayment) {
      return (
        <Navigate
          to="/payment-gateway"
          replace
          state={{
            studentName: user.name,
            studentId: student?._id,
            userId: user._id || user.id,
            branch: student?.branch || user.branch,
            nic: student?.nic || user.nic,
            email: user.email,
            studentType: student?.student_type || student?.studentType || user?.student_type,
            advanceAmount: student?.advancePaymentAmount || 5000,
            registrationReference: student?.advancePaymentReference,
          }}
        />
      );
    }
  }

  // Learner Advance Payment & Verification Gate
  if (requirePremium && user.role === 'student' && !isPremium) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Only Type 1 students can do exam practices & DMT milestones (US-04/US-09 curriculum)
  const isType1 =
    student?.studentType === 'Type1_NewLearner' ||
    student?.studentType === 'type1' ||
    student?.studentType === 'Type 1' ||
    student?.student_type === 'Type 1' ||
    user?.studentType === 'Type1_NewLearner' ||
    user?.studentType === 'Type 1' ||
    user?.student_type === 'Type 1';
  if (onlyType1 && !isType1) {
    return <Navigate to="/student/lessons" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      {/* Clean Enterprise Canvas */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#FAFCFE]" />
      <div className="relative z-10 min-h-screen flex flex-col font-sans text-[#152026] selection:bg-[#1B3D59] selection:text-white w-full max-w-full overflow-x-hidden bg-transparent">
        <Navbar />

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/type-2" element={<Navigate to="/register?type=Type%202" replace />} />
            <Route path="/register/type2" element={<Navigate to="/register?type=Type%202" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment-gateway" element={<PaymentGatewayPage />} />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

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
              path="/student/milestones"
              element={
                <ProtectedRoute allowedRoles={['student']} onlyType1 requirePremium>
                  <DmtMilestonesPage />
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
                <ProtectedRoute allowedRoles={['student']} requirePremium>
                  <BookLessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/lessons"
              element={
                <ProtectedRoute allowedRoles={['student']} requirePremium>
                  <MyLessonsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payments/upload"
              element={
                <ProtectedRoute allowedRoles={['student']} requirePremium>
                  <UploadPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payments"
              element={
                <ProtectedRoute allowedRoles={['student']} requirePremium>
                  <UploadPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz"
              element={
                <ProtectedRoute allowedRoles={['student']} onlyType1 requirePremium>
                  <QuizSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/take"
              element={
                <ProtectedRoute allowedRoles={['student']} onlyType1 requirePremium>
                  <QuizTakingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/result"
              element={
                <ProtectedRoute allowedRoles={['student']} onlyType1 requirePremium>
                  <QuizResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/history"
              element={
                <ProtectedRoute allowedRoles={['student']} onlyType1 requirePremium>
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
              path="/admin/question-lists"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
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

            {/* Admin Executive Dashboard & Account Management */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAccountsPage />
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
            <Route
              path="/instructor/profile"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'staff', 'admin']}>
                  <InstructorProfilePage />
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
