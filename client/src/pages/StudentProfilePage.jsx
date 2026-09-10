import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
  PlusCircle,
  MinusCircle,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function StudentProfilePage() {
  const { user, student, updateStudentData } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');

  // Buy Additional Lessons State
  const [selectedExtraCount, setSelectedExtraCount] = useState(2);
  const [extraPaymentMethod, setExtraPaymentMethod] = useState('online'); // 'online' | 'slip'
  const [extraBankName, setExtraBankName] = useState('Bank of Ceylon');
  const [extraSlipRef, setExtraSlipRef] = useState('');
  const [buyingLoading, setBuyingLoading] = useState(false);

  const handlePrintCard = () => {
    window.print();
  };

  const handlePhoneUpdate = (e) => {
    e.preventDefault();
    toast.success('Contact telephone updated');
    setIsEditingPhone(false);
  };

  const calculateExtraTotal = (count) => {
    if (count === 5) return 11500; // Special 5-pack discount
    return count * 2500;
  };

  const handleBuyExtraLessons = async (e) => {
    e.preventDefault();
    if (extraPaymentMethod === 'slip' && !extraSlipRef.trim()) {
      toast.error('Please enter the bank deposit slip reference number');
      return;
    }

    setBuyingLoading(true);
    try {
      const res = await api.post('/payments/buy-additional-lessons', {
        lessonCount: selectedExtraCount,
        paymentMethod: extraPaymentMethod,
        bankName: extraBankName,
        transactionReference: extraSlipRef.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.student) {
          updateStudentData(res.data.student);
        }
        setExtraSlipRef('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purchase additional lessons');
    } finally {
      setBuyingLoading(false);
    }
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

          {/* BUY ADDITIONAL DRIVING LESSONS MODULE */}
          <div className="card p-6 space-y-6 border-2 border-cyan-400/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-purple-950/40 shadow-[0_8px_32px_0_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="badge badge-accent text-[10px] font-bold uppercase tracking-wider mb-1">
                  Extra Driving Practice
                </span>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-accent" /> Buy Additional Practical Lessons
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Package lessons not enough? Purchase additional 1-on-1 practical driving sessions directly through your profile.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Current Available:</span>
                <span className="text-lg font-black text-cyan-300">
                  {Math.max(
                    0,
                    (student?.lessonsUnlocked !== undefined && student?.lessonsUnlocked !== null
                      ? student.lessonsUnlocked
                      : (student?.package?.lessonsTotal || 15) + (student?.package?.additionalLessonsRequested || 0)) -
                      (student?.lessonsUsed || student?.package?.lessonsUsed || 0)
                  )}{' '}
                  Lessons
                </span>
              </div>
            </div>

            {/* Lesson Balance Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">Base Package</span>
                <span className="font-bold text-white text-sm">{student?.package?.lessonsTotal || 15}</span>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/20 text-center">
                <span className="text-cyan-300 text-[10px] block">Extra Added</span>
                <span className="font-bold text-cyan-300 text-sm">+{student?.package?.additionalLessonsRequested || 0}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">Completed</span>
                <span className="font-bold text-slate-300 text-sm">{student?.lessonsUsed || student?.package?.lessonsUsed || 0}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20 text-center">
                <span className="text-emerald-300 text-[10px] block">Ready to Book</span>
                <span className="font-bold text-emerald-300 text-sm">
                  {Math.max(
                    0,
                    (student?.lessonsUnlocked !== undefined && student?.lessonsUnlocked !== null
                      ? student.lessonsUnlocked
                      : (student?.package?.lessonsTotal || 15) + (student?.package?.additionalLessonsRequested || 0)) -
                      (student?.lessonsUsed || student?.package?.lessonsUsed || 0)
                  )}
                </span>
              </div>
            </div>

            <form onSubmit={handleBuyExtraLessons} className="space-y-5">
              {/* Select Lesson Count */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  1. Choose Lesson Pack:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { count: 1, price: 2500, label: '1 Lesson' },
                    { count: 2, price: 5000, label: '2 Lessons' },
                    { count: 3, price: 7500, label: '3 Lessons' },
                    { count: 5, price: 11500, label: '5 Lessons', badge: 'Save Rs. 1,000' },
                  ].map((pkg) => (
                    <button
                      type="button"
                      key={pkg.count}
                      onClick={() => setSelectedExtraCount(pkg.count)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                        selectedExtraCount === pkg.count
                          ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400 shadow-md'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-xs text-white">{pkg.label}</span>
                        {selectedExtraCount === pkg.count && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-sm font-black text-accent">
                        Rs. {pkg.price.toLocaleString()}
                      </div>
                      {pkg.badge ? (
                        <span className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20 inline-block">
                          {pkg.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mt-1">Rs. 2,500 / hr</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  2. Choose Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setExtraPaymentMethod('online')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      extraPaymentMethod === 'online'
                        ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400 text-cyan-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-cyan-400" /> Instant Online Card Payment
                      </span>
                      {extraPaymentMethod === 'online' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Unlocks additional lessons <strong>immediately</strong> upon submission.
                    </p>
                  </div>

                  <div
                    onClick={() => setExtraPaymentMethod('slip')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      extraPaymentMethod === 'slip'
                        ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 text-amber-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-400" /> Bank Transfer / Deposit Slip
                      </span>
                      {extraPaymentMethod === 'slip' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Submit deposit reference for branch Data Entry Officer verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Slip Fields (if slip chosen) */}
              {extraPaymentMethod === 'slip' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Deposited Bank
                    </label>
                    <select
                      value={extraBankName}
                      onChange={(e) => setExtraBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-white/15 bg-slate-950/90 text-white rounded-xl text-xs outline-none"
                    >
                      <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                      <option value="Commercial Bank">Commercial Bank</option>
                      <option value="Sampath Bank">Sampath Bank</option>
                      <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                      <option value="People's Bank">People's Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Deposit Reference Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BOC-DEP-99401"
                      value={extraSlipRef}
                      onChange={(e) => setExtraSlipRef(e.target.value)}
                      className="w-full px-3 py-2 border border-white/15 bg-slate-950/90 text-white rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Checkout Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs text-slate-400 block">Total Purchase Cost:</span>
                  <span className="text-xl font-black text-accent">
                    Rs. {calculateExtraTotal(selectedExtraCount).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    ({selectedExtraCount} Practical Lesson{selectedExtraCount > 1 ? 's' : ''})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/student/lessons/book"
                    className="btn-secondary text-xs py-2.5 px-4 font-bold"
                  >
                    Go to Booking Calendar
                  </Link>
                  <button
                    type="submit"
                    disabled={buyingLoading}
                    className="btn-accent text-xs py-2.5 px-5 font-bold shadow-lg flex items-center gap-2"
                  >
                    {buyingLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Confirm & Buy {selectedExtraCount} Lesson{selectedExtraCount > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
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
