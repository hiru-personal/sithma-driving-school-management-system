import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  CreditCard,
  Upload,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowRight,
  Clock,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function PremiumLockOverlay() {
  const { user, student, payAdvance } = useAuth();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'dummy_card'
  const [submittedPendingSlip, setSubmittedPendingSlip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [amount, setAmount] = useState(student?.package?.priceTotal ? Math.min(5000, student.package.priceTotal) : 5000);
  const [bankName, setBankName] = useState('Bank of Ceylon (BOC)');
  const [transactionReference, setTransactionReference] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(selected);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUploadSlip = async (e) => {
    e?.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('slipImage', file);
      }
      formData.append('amount', amount);
      formData.append('bankName', bankName);
      formData.append('transactionReference', transactionReference || `BOC-SLIP-${Date.now()}`);

      const res = await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('🎉 Bank slip submitted! Staff will review your slip to grant Premium User status.');
        setSubmittedPendingSlip(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment slip.');
    } finally {
      setUploading(false);
    }
  };

  const handleSimulateStaffApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await payAdvance(amount, bankName, `STAFF-VERIFIED-${Date.now()}`);
      if (res?.success) {
        toast.success('👑 Staff verified bank slip! Premium User access unlocked.');
      }
    } catch (err) {
      toast.error('Activation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto w-full flex flex-col items-center justify-center space-y-8">
      {/* Required Lock Banner */}
      <div className="w-full max-w-4xl text-center space-y-4">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
          <Lock className="w-4 h-4 text-amber-300" /> Premium Account Required
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight leading-tight">
          You must pay advanced payment to become a premium user.
        </h1>

        <p className="text-base sm:text-lg text-purple-200 font-semibold max-w-2xl mx-auto leading-relaxed bg-purple-950/40 p-4 rounded-2xl border border-purple-400/30">
          Please pay advance payment to become a premium user and to access the system.
        </p>
      </div>

      {/* Lock Card Container */}
      <div className="w-full max-w-4xl card p-8 sm:p-10 border-2 border-purple-400/40 shadow-[0_16px_50px_0_rgba(147,51,234,0.35)] space-y-8 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500" />

        {/* Student & Package Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white/5 border border-white/15 text-sm">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Registered Student</span>
            <p className="font-bold text-white text-base mt-1">{user?.name}</p>
            <p className="text-xs text-cyan-300 font-medium">{user?.email}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Enrolled Branch</span>
            <p className="font-bold text-white text-base mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" /> {student?.branch || user?.branch} Branch
            </p>
            <p className="text-xs text-purple-200 font-semibold">{student?.studentType?.replace('_', ' ')}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Course Package</span>
            <p className="font-bold text-white text-base mt-1">{student?.package?.type?.replace('_', ' ') || 'Car Full Package'}</p>
            <p className="text-xs text-amber-300 font-extrabold">Required Advance: Rs. {amount.toLocaleString()}.00</p>
          </div>
        </div>

        {/* Status Alert if Pending Review */}
        {submittedPendingSlip ? (
          <div className="p-6 rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/40">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-amber-300">
                Payment Slip Submitted — Awaiting Staff Verification
              </h3>
              <p className="text-sm text-purple-200 max-w-xl mx-auto">
                Your bank deposit slip for <strong>Rs. {amount.toLocaleString()}.00</strong> has been received! Our staff at <strong>{student?.branch || user?.branch} Branch</strong> will review your bank slip and activate your Premium User status.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSimulateStaffApprove}
                disabled={isProcessing}
                className="btn-accent py-3 px-6 text-sm font-black flex items-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" /> [Demo]: Simulate Staff Bank Slip Approval
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex border-b border-white/15">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'upload'
                    ? 'border-amber-400 text-amber-300 font-black'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 text-cyan-400" /> Submit Bank Deposit Slip (Staff Review)
              </button>
              <button
                onClick={() => setActiveTab('dummy_card')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'dummy_card'
                    ? 'border-amber-400 text-amber-300 font-black'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" /> Dummy Online Payment Gateway
              </button>
            </div>

            {/* TAB 1: Upload Bank Slip */}
            {activeTab === 'upload' && (
              <div className="space-y-6 bg-purple-950/30 p-6 rounded-2xl border border-purple-400/20">
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-cyan-400" /> Bank Slip Review & Verification Submission
                  </h3>
                  <p className="text-sm text-slate-300">
                    Deposit the advance payment of <strong>Rs. {amount.toLocaleString()}.00</strong> to any of our bank accounts below and submit your receipt for staff review.
                  </p>
                </div>

                {/* Bank Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <p className="font-bold text-cyan-300 text-sm">Bank of Ceylon (BOC)</p>
                    <p className="text-white font-mono">Acc: 00892014782</p>
                    <p className="text-slate-400">Branch: Maharagama</p>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <p className="font-bold text-amber-300 text-sm">Commercial Bank</p>
                    <p className="text-white font-mono">Acc: 11094820194</p>
                    <p className="text-slate-400">Branch: Werahara</p>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <p className="font-bold text-purple-300 text-sm">Sampath Bank</p>
                    <p className="text-white font-mono">Acc: 01847290123</p>
                    <p className="text-slate-400">Branch: Delgoda</p>
                  </div>
                </div>

                {/* Upload / Dummy Slip Form */}
                <form onSubmit={handleUploadSlip} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Advance Amount (Rs.)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-bold rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Deposit Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-bold rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Bank Deposit Slip File (Optional for testing — dummy receipt generated automatically)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-xs"
                    />
                  </div>

                  {filePreview && (
                    <div className="mt-2 text-center">
                      <img src={filePreview} alt="Slip Preview" className="max-h-40 mx-auto rounded-xl border border-white/20 shadow-md" />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 btn-primary py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" /> {uploading ? 'Submitting...' : 'Submit Bank Deposit Slip for Staff Review'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateStaffApprove}
                      disabled={isProcessing}
                      className="btn-accent py-3.5 px-5 text-sm font-black flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" /> Fast-Track Direct Activation
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Dummy Card Gateway */}
            {activeTab === 'dummy_card' && (
              <div className="space-y-6 bg-purple-950/30 p-6 rounded-2xl border border-purple-400/20">
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" /> Dummy Online Payment Gateway Simulation
                  </h3>
                  <p className="text-sm text-slate-300">
                    Use dummy credit/debit card numbers to simulate an instant advance deposit payment.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Dummy Card Number</label>
                      <input
                        type="text"
                        defaultValue="4532 •••• •••• 8892"
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || 'Kasun Perera'}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-white font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSimulateStaffApprove}
                  disabled={isProcessing}
                  className="w-full btn-accent py-4 text-base font-black shadow-[0_0_25px_rgba(242,169,59,0.5)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" /> Processing Dummy Card Payment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950" /> Complete Dummy Payment (Rs. {amount.toLocaleString()}) & Unlock System <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Benefits Pill */}
        <div className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Interactive Portal Access
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-on-1 Practical Lesson Booking
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Trilingual DMT Exam Simulator
          </div>
        </div>
      </div>
    </div>
  );
}
