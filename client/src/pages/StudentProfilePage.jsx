import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Award,
  Printer,
  Sparkles,
  QrCode,
  CheckCircle2,
  Clock,
  Car,
  Key,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const { user, student } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');

  const handlePrintCard = () => {
    window.print();
  };

  const handlePhoneUpdate = (e) => {
    e.preventDefault();
    toast.success('Contact telephone updated');
    setIsEditingPhone(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto w-full print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Learner Identity & Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <User className="w-7 h-7 text-cyan-400" /> Student Profile & Digital ID
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official learner credentials, enrolled branch attribution, and DMT milestones.
          </p>
        </div>

        <button
          onClick={handlePrintCard}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold self-start sm:self-auto shadow-md print:hidden"
        >
          <Printer className="w-3.5 h-3.5" /> Print Learner Pass
        </button>
      </div>

      {/* Grid: Digital ID Card (Left) + Detailed Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 1 Col: Digital ID Badge */}
        <div className="card p-6 space-y-6 relative overflow-hidden border-2 border-cyan-400/40 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/95 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* School Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xs text-white">Sithma Driving School</h3>
                <p className="text-[9px] text-cyan-300">Official Student Learner Pass</p>
              </div>
            </div>
            <span className="badge badge-info text-[9px]">{student?.branch || user?.branch}</span>
          </div>

          {/* User Photo Placeholder & Details */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-2xl mx-auto flex items-center justify-center shadow-lg border-2 border-white/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: SDS-{user?._id ? user._id.slice(-6).toUpperCase() : '847291'}
              </p>
              <div className="inline-block mt-1">
                <span className="badge badge-warning text-[9px]">
                  {student?.studentType === 'Type1_NewLearner' ? 'Type 1: New Learner' : 'Type 2: Trial-Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Matrix */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Package:</span>
              <span className="font-bold text-white">{student?.package?.type?.replace('_', ' ') || 'Car Full'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Lessons Balance:</span>
              <span className="font-bold text-accent">
                {(student?.package?.lessonsTotal || 15) - (student?.package?.lessonsUsed || 0)} Remaining
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Trial Status:</span>
              <span className="font-bold text-emerald-400">
                {student?.trial?.licenseObtained ? 'Licensed' : 'In Training'}
              </span>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center pt-2 border-t border-white/10 space-y-1">
            <div className="w-16 h-16 rounded-xl bg-white p-1 mx-auto flex items-center justify-center shadow-md">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
            <p className="text-[9px] text-slate-500 font-mono">Scan for DMT Compliance Verification</p>
          </div>
        </div>

        {/* Right 2 Cols: Account & Milestones Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-cyan-300" /> Email Address:
                </span>
                <p className="font-bold text-white">{user?.email}</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone:
                </span>
                <p className="font-bold text-white">{user?.phone}</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" /> Registered Training Branch:
                </span>
                <p className="font-bold text-white">{student?.branch || user?.branch} Branch</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Registration Date:
                </span>
                <p className="font-bold text-white">
                  {user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'Aug 22, 2026'}
                </p>
              </div>
            </div>
          </div>

          {/* DMT Milestone Summary */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> DMT Regulatory Progress Records
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-bold text-white">1. National Transport Medical Exam</p>
                  <p className="text-[11px] text-slate-400">Fitness certificate issued by NTMI</p>
                </div>
                <span className={`badge ${student?.dmtDates?.medicalExamDate ? 'badge-success' : 'badge-warning'}`}>
                  {student?.dmtDates?.medicalExamDate ? 'Completed' : 'Pending Date'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-bold text-white">2. DMT Written Theory Examination</p>
                  <p className="text-[11px] text-slate-400">Standard computer-based multiple choice test</p>
                </div>
                <span className={`badge ${student?.dmtDates?.learnerExamPassed ? 'badge-success' : 'badge-warning'}`}>
                  {student?.dmtDates?.learnerExamPassed ? 'Passed (≥80%)' : 'In Preparation'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-bold text-white">3. Practical Trial Attempts Remaining</p>
                  <p className="text-[11px] text-slate-400">Maximum 3 trial attempts within 1.5-year limit</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-accent">
                    {3 - (student?.trial?.attemptsUsed || 0)} / 3 Attempts Left
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
