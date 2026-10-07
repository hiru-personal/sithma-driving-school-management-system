import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  RefreshCw,
  Eye,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Printer,
  ArrowRight,
  Lock,
  ChevronRight,
  PackageCheck,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import SimulatedPaymentGatewayModal from '../components/SimulatedPaymentGatewayModal';

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy', fallback = '') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

const PACKAGES_LIST = [
  {
    type: 'Car_FullPackage',
    name: 'Car Full Package (Manual / Auto)',
    price: 45000,
    lessons: 15,
    bonus: '2 Free Bike + 2 Free Three-Wheeler Lessons',
  },
  {
    type: 'Car_Refresher',
    name: 'Car Refresher Course (Existing License)',
    price: 15000,
    lessons: 6,
    bonus: 'Practical Confidence Training',
  },
  {
    type: 'HeavyVehicle_Bus',
    name: 'Heavy Vehicle (Bus) Package',
    price: 65000,
    lessons: 15,
    bonus: 'Requires 2+ Yrs Light Vehicle License',
  },
];

export default function UploadPaymentPage() {
  const { user, student, updateStudentData } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Tab State: 'online' | 'slip'
  const [activeTab, setActiveTab] = useState('online');

  // Online Gateway Modal State
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(
    student?.package?.type || 'Car_FullPackage'
  );
  const [paymentPlan, setPaymentPlan] = useState(student?.paymentPlan || 'full');

  // Slip Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    amount: student?.package?.priceTotal || 45000,
    bankName: 'Bank of Ceylon (BOC)',
    transactionReference: '',
  });

  // Receipt Modal for History
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const fetchPayments = async () => {
    if (!student?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/payments/student/${student._id}`);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a payment slip image or document');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('slipImage', selectedFile);
    data.append('amount', formData.amount);
    data.append('bankName', formData.bankName);
    data.append('transactionReference', formData.transactionReference);
    data.append('paymentType', 'package');

    try {
      const res = await api.post('/payments/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('🎉 Payment slip uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchPayments();

        if (student?._id) {
          const profileRes = await api.get(`/students/${student._id}`);
          if (profileRes.data.success) {
            updateStudentData(profileRes.data.student);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload payment slip');
    } finally {
      setUploading(false);
    }
  };

  // Online Gateway Submission Callback
  const handleGatewaySubmit = async ({
    cardLast4,
    cardBrand,
    cardHolder,
    transactionReference,
    authCode,
    receiptNumber,
    autoVerify,
    amount,
  }) => {
    const chosenPkg = PACKAGES_LIST.find((p) => p.type === selectedPackage) || PACKAGES_LIST[0];

    const res = await api.post('/payments/package-payment', {
      packageType: chosenPkg.type,
      paymentPlan,
      paymentMethod: 'online_gateway',
      amount,
      transactionReference,
      authCode,
      receiptNumber,
      autoVerify,
      cardLast4,
      cardBrand,
      cardHolder,
    });

    if (res.data.success) {
      fetchPayments();
      if (student?._id) {
        const profileRes = await api.get(`/students/${student._id}`);
        if (profileRes.data.success) {
          updateStudentData(profileRes.data.student);
        }
      }
    }
    return res.data;
  };

  const currentPkgDetails =
    PACKAGES_LIST.find((p) => p.type === selectedPackage) || PACKAGES_LIST[0];

  const packageAmountDue =
    paymentPlan === 'installments'
      ? Math.round(currentPkgDetails.price / 3)
      : currentPkgDetails.price;

  const latestPayment = payments[0];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto w-full text-[#152026]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Fees & Invoicing Module
          </div>
          <h1 className="text-2xl font-extrabold text-[#152026] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1B3D59]" /> Course Fees & Payment Portal
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">
            Pay securely online via 3D Secure Card Gateway or upload an official bank deposit slip.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold text-xs rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#D4EEF8] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'online'
              ? 'bg-[#1B3D59] text-white shadow-md'
              : 'bg-white text-[#152026] border border-[#D4EEF8] hover:bg-[#FAFCFE]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 Sithma Pay — 3D Secure Online Gateway</span>
          <span className="text-[10px] bg-emerald-400 text-[#152026] px-2 py-0.5 rounded-full font-bold uppercase ml-1">
            Instant
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slip')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'slip'
              ? 'bg-[#1B3D59] text-white shadow-md'
              : 'bg-white text-[#152026] border border-[#D4EEF8] hover:bg-[#FAFCFE]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>📄 Bank Deposit Slip Upload</span>
          <span className="text-[10px] bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 px-2 py-0.5 rounded-full font-bold uppercase ml-1">
            Staff Audit
          </span>
        </button>
      </div>

      {/* Grid: Payment Method Form (Left) + Status & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Form Panel */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─────────────────────────────────────────────────────────────── */}
          {/*  TAB 1: SITHMA PAY ONLINE GATEWAY                               */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'online' && (
            <div className="card p-6 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
                <div>
                  <h2 className="text-base font-black text-[#152026] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1B3D59]" /> Select Course Package & Pay Online
                  </h2>
                  <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">
                    Pay securely using Visa, Mastercard, or American Express with 3D Secure bank verification
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                  Verified 3D Secure Gateway
                </span>
              </div>

              {/* Package Selector Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#152026]">
                  Select Course Package:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACKAGES_LIST.map((pkg) => {
                    const isSelected = selectedPackage === pkg.type;
                    return (
                      <button
                        key={pkg.type}
                        type="button"
                        onClick={() => setSelectedPackage(pkg.type)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4EEF8]/40 border-[#1B3D59] ring-2 ring-[#1B3D59]/20 shadow-sm'
                            : 'bg-white border-[#D4EEF8] hover:border-[#6A97C0]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-[#152026] truncate">
                            {pkg.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#1B3D59] shrink-0" />
                          )}
                        </div>
                        <p className="text-base font-black text-[#1B3D59] mt-1">
                          Rs. {pkg.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-[#6A97C0] mt-1 font-medium">
                          {pkg.lessons} Lessons • {pkg.bonus}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Plan Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[#152026] mb-1.5">Payment Plan</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-3.5 py-3 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="full">Full Upfront Payment (100%)</option>
                    <option value="installments">3 Installments (1/3 per term)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#152026] mb-1.5">Amount Payable Today</label>
                  <div className="px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl font-black text-sm text-[#1B3D59] flex items-center justify-between">
                    <span>Rs. {packageAmountDue.toLocaleString()}.00</span>
                    <span className="text-[11px] font-bold text-[#6A97C0]">LKR</span>
                  </div>
                </div>
              </div>

              {/* Gateway Banner Card */}
              <div className="rounded-2xl bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B3D5F1]">
                      Instant Lesson Unlock
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-[#152026] px-2 py-0.5 rounded-full">
                      3D Secure
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black !text-white mt-1 tracking-tight" style={{ color: '#ffffff' }}>
                    Rs. {packageAmountDue.toLocaleString()}.00 LKR
                  </div>
                  <p className="text-xs text-[#D4EEF8] mt-0.5">
                    {currentPkgDetails.name} • {currentPkgDetails.lessons} Lessons Unlocked
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGatewayModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 text-emerald-200" />
                  Pay Online (Instant Unlock) <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
                  <p className="font-bold text-[#152026] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#1B3D59]" /> All Major Cards Accepted
                  </p>
                  <p className="text-[11px] text-[#6A97C0]">Visa, Mastercard, & American Express supported.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
                  <p className="font-bold text-[#152026] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 3D Secure Protection
                  </p>
                  <p className="text-[11px] text-[#6A97C0]">Multi-factor bank OTP authentication.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
                  <p className="font-bold text-[#152026] flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-[#1B3D59]" /> Instant Digital Receipt
                  </p>
                  <p className="text-[11px] text-[#6A97C0]">Official transaction voucher with ref code.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/*  TAB 2: BANK DEPOSIT SLIP UPLOAD                                */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'slip' && (
            <div className="space-y-6">
              {/* Official Bank Account Details */}
              <div className="bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] text-white rounded-3xl p-6 border border-[#1B3D59]/30 shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/20 text-[#D4EEF8] border border-[#B3D5F1]/30 text-[10px] font-bold uppercase tracking-wider">
                    Official Driving School Account
                  </span>
                  <Building2 className="w-5 h-5 text-[#B3D5F1]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                  <div>
                    <p className="text-[#D4EEF8]/70">Bank & Branch:</p>
                    <p className="font-bold text-sm text-white">Bank of Ceylon (BOC)</p>
                    <p className="text-[11px] text-[#B3D5F1]">Maharagama Branch</p>
                  </div>
                  <div>
                    <p className="text-[#D4EEF8]/70">Account Name:</p>
                    <p className="font-bold text-sm text-white">Sithma Driving School (Pvt) Ltd</p>
                  </div>
                  <div>
                    <p className="text-[#D4EEF8]/70">Account Number:</p>
                    <p className="font-mono font-black text-sm text-[#B3D5F1] tracking-wider">
                      8472910394
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Form */}
              <div className="card p-6 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
                  <h2 className="text-base font-bold text-[#152026] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#1B3D59]" /> Upload New Payment Slip
                  </h2>
                  <span className="text-xs font-bold text-[#1B3D59]">
                    Package Due: Rs. {student?.package?.priceTotal?.toLocaleString() || '45,000'}
                  </span>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#152026] mb-1">
                        Amount Paid (LKR) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-bold text-sm outline-none focus:border-[#1B3D59]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#152026] mb-1">
                        Paying Bank Name:
                      </label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl outline-none font-medium cursor-pointer focus:border-[#1B3D59]"
                      >
                        <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                        <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                        <option value="People's Bank">People's Bank</option>
                        <option value="Sampath Bank">Sampath Bank</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#152026] mb-1">
                        Bank Reference / Transaction ID (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BOC-TXN-98471203"
                        value={formData.transactionReference}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionReference: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                      />
                    </div>
                  </div>

                  {/* File Drop Area */}
                  <div>
                    <label className="block font-semibold text-[#152026] mb-1">
                      Upload Slip Image or PDF <span className="text-rose-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-[#D4EEF8] hover:border-[#1B3D59] rounded-2xl p-6 text-center transition-colors bg-[#FAFCFE] cursor-pointer">
                      <input
                        type="file"
                        id="slipFile"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="slipFile" className="cursor-pointer block space-y-2">
                        <Upload className="w-8 h-8 text-[#1B3D59] mx-auto" />
                        <p className="font-semibold text-[#152026] text-xs">
                          {selectedFile ? selectedFile.name : 'Click to select bank payment slip file'}
                        </p>
                        <p className="text-[11px] text-[#6A97C0]">JPG, PNG, WEBP, or PDF up to 5MB</p>
                      </label>
                    </div>
                  </div>

                  {/* Preview Thumbnail */}
                  {previewUrl && (
                    <div className="p-3.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl flex items-center gap-3">
                      {selectedFile?.type === 'application/pdf' ||
                      selectedFile?.name?.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                          <FileText className="w-7 h-7" />
                        </div>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Slip Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-[#D4EEF8]"
                        />
                      )}
                      <div className="text-xs flex-1 min-w-0">
                        <p className="font-bold text-[#152026] truncate">{selectedFile?.name}</p>
                        <p className="text-[11px] text-[#6A97C0]">
                          {selectedFile?.size
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : 'Ready to upload'}
                        </p>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1B3D59] hover:underline inline-flex items-center gap-1 font-bold mt-1 text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" /> View Selected Document
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? 'Uploading Slip...' : 'Submit Payment Slip for Verification'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Status & Payment Log */}
        <div className="space-y-6">
          {/* Latest Status Pill Card */}
          <div className="card p-5 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B3D59]" /> Current Course & Payment Status
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Enrolled Package:</span>
                <span className="font-bold text-[#152026]">{student?.package?.type || 'Car Full Package'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Package Status:</span>
                <span className={`font-bold capitalize px-2 py-0.5 rounded-full text-[10px] border ${
                  student?.packagePaymentStatus === 'confirmed' || student?.packagePaymentStatus === 'verified'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                }`}>
                  {student?.packagePaymentStatus || 'Not Paid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Lessons Unlocked:</span>
                <span className="font-bold text-[#1B3D59]">
                  {student?.lessonsUnlocked || student?.package?.lessonsTotal || 0} Lessons
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Advance Status:</span>
                <span className="font-bold text-emerald-700">
                  {student?.isAdvancePaid ? 'Paid & Verified' : 'Pending'}
                </span>
              </div>
            </div>

            {latestPayment && (
              <div className="border-t border-[#D4EEF8] pt-3 text-xs space-y-1">
                <p className="font-bold text-[#152026]">Latest Activity:</p>
                <p className="text-[#6A97C0]">
                  Method: <strong className="text-[#152026]">{latestPayment.paymentMethod === 'online_gateway' ? '3DS Card Gateway' : 'Bank Deposit Slip'}</strong>
                </p>
                <p className="text-[#6A97C0]">
                  Amount: <strong className="text-[#152026]">Rs. {latestPayment.amount?.toLocaleString()}</strong>
                </p>
                <p className="text-[#6A97C0]">
                  Date: {safeFormatDate(latestPayment?.uploadedAt, 'MMM dd, yyyy', 'N/A')}
                </p>
              </div>
            )}
          </div>

          {/* Payment History List */}
          <div className="card p-5 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#152026]">Payment Submission Log</h3>
            {loading ? (
              <p className="text-xs text-[#6A97C0]">Loading history...</p>
            ) : payments.length === 0 ? (
              <p className="text-xs text-[#6A97C0] italic">No previous payments.</p>
            ) : (
              <div className="divide-y divide-[#D4EEF8] text-xs">
                {payments.map((p) => {
                  const isOnline =
                    p.payment_method === 'online_gateway' || p.paymentMethod === 'online_gateway';
                  return (
                    <div key={p._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#152026] flex items-center gap-1.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#1B3D59]">
                              <CreditCard className="w-3 h-3 text-[#1B3D59]" /> Online ({p.cardBrand || 'Card'} •••• {p.cardLast4 || '4242'})
                            </span>
                          ) : (
                            p.bankName
                          )}
                        </p>
                        <p className="text-[10px] text-[#6A97C0]">
                          {safeFormatDate(p?.uploadedAt || p?.createdAt, 'MMM dd, yyyy', '')}
                          {p.transactionReference ? ` • ${p.transactionReference}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#152026]">
                          Rs. {p.amount?.toLocaleString()}
                        </span>
                        <div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 border capitalize ${
                              p.status === 'confirmed' || p.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : p.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3D Secure Simulated Gateway Modal ──────────────────────────────── */}
      <SimulatedPaymentGatewayModal
        isOpen={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        onSubmitPayment={handleGatewaySubmit}
        amount={packageAmountDue}
        itemTitle={`${currentPkgDetails.name} (${paymentPlan === 'installments' ? 'Installment' : 'Full Payment'})`}
        studentName={user?.name || student?.name}
        studentNic={student?.nic || user?.nic}
        studentBranch={student?.branch || user?.branch}
        email={user?.email}
      />
    </div>
  );
}
