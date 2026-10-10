import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Clock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function AccountPendingVerification() {
  const { user, student, logout, updateStudentData } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const checkStatus = async (isManual = false) => {
    if (checking) return;
    setChecking(true);
    try {
      // Check directly from verification-status endpoint or /auth/me
      const res = await api.get('/auth/verification-status');
      setLastChecked(new Date());

      if (res.data?.success && res.data?.isVerified) {
        toast.success('🎉 Your account has been verified by the admin! Welcome to Sithma Driving School.', {
          duration: 5000,
        });

        // Update local auth state with fresh user and student data
        const meRes = await api.get('/auth/me');
        if (meRes.data?.success) {
          updateStudentData(meRes.data.student, meRes.data.user);
        } else if (user) {
          updateStudentData(
            student ? { ...student, verificationStatus: 'Verified' } : null,
            { ...user, verificationStatus: 'Verified' }
          );
        }
        return;
      }

      if (isManual) {
        toast('Your account verification is still pending admin review. Please wait a moment.', {
          icon: '⏳',
        });
      }
    } catch (err) {
      if (isManual) {
        toast.error('Could not check status right now. Please try again.');
      }
    } finally {
      setChecking(false);
    }
  };

  // Automatic background polling every 10 seconds so the screen unlocks instantly once admin approves
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentName = user?.name || student?.name || 'Student';
  const studentEmail = user?.email || student?.email || '—';
  const studentPhone = user?.phone || student?.phone || '—';
  const studentBranch = student?.branch || user?.branch || 'Maharagama';
  const studentType =
    student?.studentType === 'Type2_TrialReady' || student?.student_type === 'Type 2'
      ? 'Type 2 — Trial-Ready (Existing License Holder)'
      : 'Type 1 — New Learner (Complete Curriculum)';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1B3D59] via-[#244c6e] to-[#152026] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  Status: Pending Admin Approval
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Account Pending Verification
                </h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer self-start sm:self-center shadow-xs"
              title="Logout from system"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-white text-[#152026]">
          {/* Official Verification Notice Box */}
          <div className="p-6 rounded-2xl bg-[#F3EED8]/60 border border-[#D4EEF8] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-base font-extrabold text-[#152026]">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Notice for Registered Student</span>
            </div>
            <p className="text-sm sm:text-base text-[#152026]/90 leading-relaxed font-medium">
              Your account has been successfully registered but is not yet verified by the admin.
            </p>
            <p className="text-sm sm:text-base text-[#152026]/90 leading-relaxed font-medium">
              Please wait until the admin verifies your account. You will be able to access the system once your account has been approved.
            </p>
          </div>

          {/* Registered Student Summary Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#1B3D59] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#1B3D59]" /> Your Registration Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                  Full Name
                </span>
                <p className="text-sm font-black text-[#152026] truncate">{studentName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                  Email Address
                </span>
                <p className="text-sm font-semibold text-[#152026] truncate">{studentEmail}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                  Contact Number
                </span>
                <p className="text-sm font-semibold text-[#152026] truncate">{studentPhone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                  Assigned Branch
                </span>
                <p className="text-sm font-bold text-[#152026] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#1B3D59]" /> {studentBranch}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] shadow-xs space-y-1 sm:col-span-2">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                  Registered Curriculum Program
                </span>
                <p className="text-sm font-bold text-[#152026]">{studentType}</p>
              </div>
            </div>
          </div>

          {/* Action and Live Polling Banner */}
          <div className="p-5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D4EEF8] flex items-center justify-center shrink-0">
                <RefreshCw className={`w-4 h-4 text-[#1B3D59] ${checking ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#152026]">
                  Automatic Live Verification Check Active
                </p>
                <p className="text-[11px] text-[#6A97C0]">
                  This page automatically refreshes every few seconds. Once verified, your dashboard will open immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => checkStatus(true)}
                disabled={checking}
                className="btn-primary text-xs sm:text-sm py-2.5 px-5 font-bold flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Checking...' : 'Check Status Now'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Contact Support Footer */}
          <div className="pt-4 border-t border-[#D4EEF8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6A97C0]">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#1B3D59]" />
              <span>Need urgent assistance? Call Sithma Academy: <strong>011-2849201</strong></span>
            </div>
            <div>
              <span>Sithma Driving School Management System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
