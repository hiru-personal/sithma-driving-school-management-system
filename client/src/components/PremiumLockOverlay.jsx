import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  ShieldAlert,
  CreditCard,
  Upload,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Car,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function PremiumLockOverlay() {
  const { user, student, payAdvance } = useAuth();
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'upload'
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload Form State
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [amount, setAmount] = useState(student?.package?.priceTotal ? Math.min(5000, student.package.priceTotal) : 5000);
  const [bankName, setBankName] = useState('Bank of Ceylon (BOC)');
  const [transactionReference, setTransactionReference] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInstantPay = async () => {
    setIsProcessing(true);
    try {
      const res = await payAdvance(amount, 'Online Direct Advance Payment', `ADV-INSTANT-${Date.now()}`);
      if (res?.success) {
        toast.success('👑 Advance payment received! Welcome to Sithma Premium Portal.');
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
    e.preventDefault();
    if (!file) {
      toast.error('Please select your bank deposit slip image before uploading.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('slipImage', file);
      formData.append('amount', amount);
      formData.append('bankName', bankName);
      formData.append('transactionReference', transactionReference);

      const res = await api.post('/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Bank slip uploaded! Auto-activating your advance payment for testing...');
        // Automatically activate advance payment for seamless experience
        await payAdvance(amount, bankName, transactionReference || `SLIP-${Date.now()}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload payment slip.');
    } finally {
      setUploading(false);
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

        {/* Payment Tabs */}
        <div className="space-y-6">
          <div className="flex border-b border-white/15">
            <button
              onClick={() => setActiveTab('instant')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'instant'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> 1-Click Instant Advance Payment
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-amber-400 text-amber-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 text-cyan-400" /> Upload Bank Deposit Slip
            </button>
          </div>

          {/* TAB 1: Instant Advance Payment */}
          {activeTab === 'instant' && (
            <div className="space-y-6 bg-purple-950/30 p-6 rounded-2xl border border-purple-400/20">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" /> Instant Advance Payment Activation
                </h3>
                <p className="text-sm text-slate-300">
                  Pay the advance fee of <strong>Rs. {amount.toLocaleString()}.00</strong> to instantly unlock your Premium User status and gain immediate full access to all portal features.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-sm text-purple-200">
                <div className="flex justify-between items-center">
                  <span>Advance Registration Deposit:</span>
                  <span className="font-extrabold text-amber-300 text-lg">Rs. {amount.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Portal Status Upon Payment:</span>
                  <span className="badge badge-success text-xs">👑 Premium User Unlocked</span>
                </div>
              </div>

              <button
                onClick={handleInstantPay}
                disabled={isProcessing}
                className="w-full btn-accent py-4 text-base font-black shadow-[0_0_25px_rgba(242,169,59,0.5)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" /> Processing Advance Payment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950" /> Pay Advance Payment & Unlock Premium System Access <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Upload Bank Slip */}
          {activeTab === 'upload' && (
            <div className="space-y-6 bg-purple-950/30 p-6 rounded-2xl border border-purple-400/20">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" /> Bank Transfer & Deposit Slip Upload
                </h3>
                <p className="text-sm text-slate-300">
                  Transfer the advance payment to any of our Sithma Driving School official bank accounts below and upload the receipt image.
                </p>
              </div>

              {/* Bank Account Grid */}
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

              {/* Upload Form */}
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
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Bank Name</label>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Deposit Slip Image / Receipt File</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-xs"
                    required
                  />
                </div>

                {filePreview && (
                  <div className="mt-2 text-center">
                    <img src={filePreview} alt="Slip Preview" className="max-h-40 mx-auto rounded-xl border border-white/20 shadow-md" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2"
                >
                  {uploading ? 'Uploading Slip...' : 'Submit Deposit Slip & Activate Premium'}
                </button>
              </form>
            </div>
          )}
        </div>

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
