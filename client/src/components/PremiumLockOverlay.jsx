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
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-extrabold text-sm shadow-xs">
          <Lock className="w-4 h-4 text-[#1B3D59]" /> Premium Account Required
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#152026] tracking-tight leading-tight">
          You must pay advanced payment to become a premium user.
        </h1>

        <p className="text-base sm:text-lg text-[#152026]/85 font-semibold max-w-2xl mx-auto leading-relaxed bg-[#F3EED8] p-4 rounded-3xl border border-[#6A97C0]/30">
          Please pay advance payment to become a premium user and to access the system.
        </p>
      </div>

      {/* Lock Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#D4EEF8] shadow-xl space-y-8 relative overflow-hidden">
        {/* Student & Package Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] text-sm">
          <div>
            <span className="text-xs text-[#6A97C0] uppercase tracking-wider font-bold">Registered Student</span>
            <p className="font-black text-[#152026] text-base mt-1">{user?.name}</p>
            <p className="text-xs text-[#1B3D59] font-bold">{user?.email}</p>
          </div>

          <div>
            <span className="text-xs text-[#6A97C0] uppercase tracking-wider font-bold">Enrolled Branch</span>
            <p className="font-black text-[#152026] text-base mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#1B3D59]" /> {student?.branch || user?.branch} Branch
            </p>
            <p className="text-xs text-[#6A97C0] font-bold">{student?.studentType?.replace('_', ' ')}</p>
          </div>

          <div>
            <span className="text-xs text-[#6A97C0] uppercase tracking-wider font-bold">Course Package</span>
            <p className="font-black text-[#152026] text-base mt-1">{student?.package?.type?.replace('_', ' ') || 'Car Full Package'}</p>
            <p className="text-xs text-[#1B3D59] font-extrabold">Required Advance: Rs. {amount.toLocaleString()}.00</p>
          </div>
        </div>

        {/* Status Alert if Pending Review */}
        {submittedPendingSlip ? (
          <div className="p-6 rounded-2xl bg-[#F3EED8] border-2 border-[#6A97C0]/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white text-[#1B3D59] flex items-center justify-center mx-auto border border-[#D4EEF8]">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#152026]">
                Payment Slip Submitted — Awaiting Staff Verification
              </h3>
              <p className="text-sm text-[#152026]/80 max-w-xl mx-auto">
                Your bank deposit slip for <strong>Rs. {amount.toLocaleString()}.00</strong> has been received! Our staff at <strong>{student?.branch || user?.branch} Branch</strong> will review your bank slip and activate your Premium User status.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSimulateStaffApprove}
                disabled={isProcessing}
                className="btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> [Demo]: Simulate Staff Bank Slip Approval
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex border-b border-[#D4EEF8]">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'upload'
                    ? 'border-[#1B3D59] text-[#1B3D59] font-black'
                    : 'border-transparent text-[#6A97C0] hover:text-[#152026]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#1B3D59]" /> Submit Bank Deposit Slip (Staff Review)
              </button>
              <button
                onClick={() => setActiveTab('dummy_card')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'dummy_card'
                    ? 'border-[#1B3D59] text-[#1B3D59] font-black'
                    : 'border-transparent text-[#6A97C0] hover:text-[#152026]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Dummy Online Payment Gateway
              </button>
            </div>

            {/* TAB 1: Upload Bank Slip */}
            {activeTab === 'upload' && (
              <div className="space-y-6 bg-[#FAFCFE] p-6 rounded-3xl border border-[#D4EEF8]">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#152026] flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#1B3D59]" /> Bank Slip Review & Verification Submission
                  </h3>
                  <p className="text-sm text-[#152026]/75">
                    Deposit the advance payment of <strong>Rs. {amount.toLocaleString()}.00</strong> to any of our bank accounts below and submit your receipt for staff review.
                  </p>
                </div>

                {/* Bank Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-white rounded-2xl border border-[#D4EEF8] space-y-1 shadow-xs">
                    <p className="font-bold text-[#1B3D59] text-sm">Bank of Ceylon (BOC)</p>
                    <p className="text-[#152026] font-mono font-bold">Acc: 00892014782</p>
                    <p className="text-[#6A97C0]">Branch: Maharagama</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#D4EEF8] space-y-1 shadow-xs">
                    <p className="font-bold text-[#1B3D59] text-sm">Commercial Bank</p>
                    <p className="text-[#152026] font-mono font-bold">Acc: 11094820194</p>
                    <p className="text-[#6A97C0]">Branch: Werahara</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#D4EEF8] space-y-1 shadow-xs">
                    <p className="font-bold text-[#1B3D59] text-sm">Sampath Bank</p>
                    <p className="text-[#152026] font-mono font-bold">Acc: 01847290123</p>
                    <p className="text-[#6A97C0]">Branch: Delgoda</p>
                  </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUploadSlip} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#152026] mb-1.5">Advance Amount (Rs.)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white border border-[#D4EEF8] text-[#152026] font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#152026] mb-1.5">Deposit Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#D4EEF8] text-[#152026] font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#152026] mb-1.5">
                      Bank Deposit Slip File (Optional for testing — dummy receipt generated automatically)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs"
                    />
                  </div>

                  {filePreview && (
                    <div className="mt-2 text-center">
                      <img src={filePreview} alt="Slip Preview" className="max-h-40 mx-auto rounded-xl border border-[#D4EEF8] shadow-sm" />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 btn-primary py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" /> {uploading ? 'Submitting...' : 'Submit Bank Deposit Slip for Staff Review'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateStaffApprove}
                      disabled={isProcessing}
                      className="btn-secondary py-3.5 px-5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#1B3D59]" /> Fast-Track Direct Activation
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Dummy Card Gateway */}
            {activeTab === 'dummy_card' && (
              <div className="space-y-6 bg-[#FAFCFE] p-6 rounded-3xl border border-[#D4EEF8]">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#152026] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1B3D59]" /> Dummy Online Payment Gateway Simulation
                  </h3>
                  <p className="text-sm text-[#152026]/75">
                    Use dummy credit/debit card numbers to simulate an instant advance deposit payment.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#D4EEF8] text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#6A97C0] font-bold mb-1">Dummy Card Number</label>
                      <input
                        type="text"
                        defaultValue="4532 •••• •••• 8892"
                        className="w-full px-3 py-2 bg-[#FAFCFE] border border-[#D4EEF8] rounded-lg text-[#152026] font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#6A97C0] font-bold mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || 'Kasun Perera'}
                        className="w-full px-3 py-2 bg-[#FAFCFE] border border-[#D4EEF8] rounded-lg text-[#152026] font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSimulateStaffApprove}
                  disabled={isProcessing}
                  className="w-full btn-primary py-4 text-base font-bold shadow-sm flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" /> Processing Dummy Card Payment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Complete Dummy Payment (Rs. {amount.toLocaleString()}) & Unlock System <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Benefits Pill */}
        <div className="pt-4 border-t border-[#D4EEF8] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#152026]/80 text-center">
          <div className="flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Interactive Portal Access
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-on-1 Practical Lesson Booking
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Trilingual DMT Exam Simulator
          </div>
        </div>
      </div>
    </div>
  );
}
