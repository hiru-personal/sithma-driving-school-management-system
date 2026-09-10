import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  CreditCard,
  Upload,
  Building2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  MapPin,
  AlertCircle,
  FileCheck,
  Landmark,
  Wifi,
  Lock,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Branch contact details ───────────────────────────────────────────────────
const BRANCHES = {
  Maharagama: {
    address: 'High Level Road, Maharagama',
    phone: '011-2849201',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
    map: 'https://maps.google.com/?q=Maharagama,+Sri+Lanka',
    accountNo: '00892014782',
    bank: 'Bank of Ceylon (BOC)',
    swiftBranch: 'Maharagama',
  },
  Werahara: {
    address: 'Near DMT Central Office, Werahara',
    phone: '011-2518492',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
    map: 'https://maps.google.com/?q=Werahara,+Sri+Lanka',
    accountNo: '11094820194',
    bank: 'Commercial Bank',
    swiftBranch: 'Werahara',
  },
  Delgoda: {
    address: 'Main Street, Delgoda',
    phone: '011-2974820',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
    map: 'https://maps.google.com/?q=Delgoda,+Sri+Lanka',
    accountNo: '01847290123',
    bank: 'Sampath Bank',
    swiftBranch: 'Delgoda',
  },
};

// ─── Fake card brands ─────────────────────────────────────────────────────────
const DUMMY_CARDS = [
  { number: '4111 1111 1111 1111', type: 'Visa', color: 'from-blue-600 to-blue-800' },
  { number: '5500 0000 0000 0004', type: 'Mastercard', color: 'from-red-600 to-orange-600' },
  { number: '3714 496353 98431', type: 'Amex', color: 'from-teal-600 to-cyan-700' },
];

export default function PaymentGatewayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ── State passed from RegisterPage ──────────────────────────────────────────
  const {
    studentName = 'Student',
    studentId = null,
    userId = null,
    branch = 'Maharagama',
    nic = '',
    email = '',
    advanceAmount = 5000,
    registrationReference = `REG-${Date.now().toString().slice(-6)}`,
  } = location.state || {};

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [activeMethod, setActiveMethod] = useState(null); // 'slip' | 'online' | 'physical'
  const [step, setStep] = useState('choose'); // 'choose' | 'form' | 'success'

  // Slip Upload
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipForm, setSlipForm] = useState({
    bankName: BRANCHES[branch]?.bank || 'Bank of Ceylon',
    amount: advanceAmount,
    reference: '',
  });

  // Online payment (simulated)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: studentName,
    expiry: '',
    cvv: '',
  });
  const [cardStep, setCardStep] = useState('entry'); // 'entry' | 'processing' | 'done'
  const [selectedDummy, setSelectedDummy] = useState(null);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [doneData, setDoneData] = useState(null);

  const branchInfo = BRANCHES[branch] || BRANCHES['Maharagama'];

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  // ─── Submit Slip Upload ──────────────────────────────────────────────────────
  const handleSubmitSlip = async () => {
    if (!slipFile) {
      toast.error('Please select your bank deposit slip image or PDF');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('slipImage', slipFile);
      fd.append('amount', slipForm.amount);
      fd.append('bankName', slipForm.bankName);
      fd.append('transactionReference', slipForm.reference || `BOC-ADV-${Date.now().toString().slice(-6)}`);
      fd.append('paymentType', 'advance');

      // We need auth token if student was logged in during registration
      // But since they're pending, we call the public pre-auth slip endpoint
      // or we include their userId in the payload
      fd.append('pendingUserId', userId || '');

      const res = await api.post('/payments/upload-pending', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setDoneData({
          method: 'slip',
          reference: slipForm.reference || res.data.payment?.transactionReference || 'N/A',
          amount: slipForm.amount,
        });
        setDone(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload slip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Submit Online Payment (Simulated) ──────────────────────────────────────
  const handleOnlinePayment = async () => {
    const cleaned = cardForm.cardNumber.replace(/\s/g, '');
    if (cleaned.length < 12) {
      toast.error('Please enter a valid card number');
      return;
    }
    if (!cardForm.expiry || !cardForm.cvv) {
      toast.error('Please fill in all card details');
      return;
    }
    setCardStep('processing');
    setLoading(true);

    // Simulate gateway delay
    await new Promise((r) => setTimeout(r, 2500));

    try {
      const res = await api.post('/payments/pay-advance-pending', {
        amount: advanceAmount,
        bankName: 'Online Payment Gateway (Sithma Pay)',
        transactionReference: `ONPAY-${Date.now().toString().slice(-8)}`,
        pendingUserId: userId || '',
        cardLast4: cleaned.slice(-4),
      });

      if (res.data.success) {
        setCardStep('done');
        setDoneData({
          method: 'online',
          reference: res.data.payment?.transactionReference || `ONPAY-${Date.now()}`,
          amount: advanceAmount,
          cardLast4: cleaned.slice(-4),
        });
        setDone(true);
      }
    } catch (err) {
      setCardStep('entry');
      toast.error(err.response?.data?.message || 'Payment processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Physical Payment: just log intent ─────────────────────────────────────
  const handlePhysicalChoice = async () => {
    setLoading(true);
    try {
      await api.post('/payments/register-physical-intent', {
        pendingUserId: userId || '',
        branch,
        amount: advanceAmount,
      }).catch(() => {}); // non-critical
    } finally {
      setLoading(false);
      setDoneData({ method: 'physical', branch, amount: advanceAmount });
      setDone(true);
    }
  };

  // ─── If no state (direct URL access), redirect to register ─────────────────
  if (!location.state?.studentName && !studentId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-bold text-white">Session Expired</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Please register first to access the payment page.
        </p>
        <Link to="/register" className="btn-primary px-6 py-2.5 text-sm font-bold">
          Go to Registration
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (done && doneData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-xl w-full">
          <div className="rounded-3xl overflow-hidden backdrop-blur-2xl bg-slate-900/90 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Top bar */}
            <div className={`h-1.5 w-full ${doneData.method === 'physical' ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500'}`} />

            <div className="p-8 sm:p-10 text-center space-y-6">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border shadow-lg ${
                doneData.method === 'physical'
                  ? 'bg-amber-500/20 border-amber-400/40 shadow-amber-500/20'
                  : 'bg-emerald-500/20 border-emerald-400/40 shadow-emerald-500/20'
              }`}>
                {doneData.method === 'physical' ? (
                  <Building2 className="w-10 h-10 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                )}
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${
                  doneData.method === 'physical'
                    ? 'bg-amber-500/10 border-amber-400/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                }`}>
                  {doneData.method === 'physical' ? (
                    <><Clock className="w-3 h-3" /> Visit Branch to Pay</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" /> Payment Submitted</>
                  )}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {doneData.method === 'physical'
                    ? 'Please Visit Your Branch'
                    : doneData.method === 'online'
                    ? 'Payment Submitted!'
                    : 'Bank Slip Uploaded!'}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
                  {doneData.method === 'physical'
                    ? `Please visit the ${doneData.branch} branch to complete your advance payment. Bring your NIC and registration reference.`
                    : 'Our Data Entry Officer will review and verify your payment. You will receive login access once verified.'}
                </p>
              </div>

              {/* Details card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-semibold text-white">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="font-semibold text-white">{branch}</span>
                </div>
                {doneData.method !== 'physical' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <span className="font-bold text-amber-300 font-mono">{doneData.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Advance Amount:</span>
                  <span className="font-black text-emerald-400">Rs. {Number(doneData.amount).toLocaleString()}</span>
                </div>
                {doneData.method !== 'physical' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="font-bold text-amber-300">Pending Officer Verification</span>
                  </div>
                )}
                {doneData.method === 'physical' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch Address:</span>
                      <span className="font-semibold text-white text-right max-w-[60%]">{branchInfo.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Office Hours:</span>
                      <span className="font-semibold text-white">{branchInfo.hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-bold text-cyan-300">{branchInfo.phone}</span>
                    </div>
                  </>
                )}
              </div>

              {doneData.method !== 'physical' && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-xs text-slate-300 text-left flex gap-2.5">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-cyan-300">What happens next?</strong> Our branch Data Entry Officer will verify your payment slip within 1–2 business hours. Once verified, you can log in and start selecting your course package.
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  Go to Sign In Portal <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="btn-secondary py-3 px-5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  MAIN PAYMENT GATEWAY PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-4xl w-full space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 font-bold text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Advance Payment
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Complete Your Advance Payment
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Welcome, <strong className="text-white">{studentName}</strong>! To activate your account and access the Sithma portal, a one-time advance payment of{' '}
            <strong className="text-amber-300">Rs. {Number(advanceAmount).toLocaleString()}.00</strong> is required.
          </p>
        </div>

        {/* ── Registration Summary Strip ────────────────────────────────── */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {branch} Branch</span>
            {nic && <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> NIC: {nic}</span>}
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Advance: Rs. {Number(advanceAmount).toLocaleString()}</span>
          </div>
          <span className="badge badge-warning text-[10px]">Registration Pending Payment</span>
        </div>

        {/* ── Method Selection Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OPTION 1: Upload Bank Slip */}
          <button
            onClick={() => { setActiveMethod('slip'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'slip'
                ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                : 'bg-slate-900/60 border-white/10 hover:border-cyan-400/30 hover:bg-cyan-500/5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'slip'
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-400/30'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Upload Bank Slip</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit to our bank account and upload your deposit slip or transfer receipt.
            </p>
            <div className="mt-3 text-[10px] font-semibold text-cyan-300 flex items-center gap-1">
              Recommended <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'slip' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              </div>
            )}
          </button>

          {/* OPTION 2: Online Payment Gateway */}
          <button
            onClick={() => { setActiveMethod('online'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'online'
                ? 'bg-purple-500/15 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900/60 border-white/10 hover:border-purple-400/30 hover:bg-purple-500/5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'online'
                ? 'bg-purple-500/20 border-purple-400/40 text-purple-400'
                : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-purple-400 group-hover:border-purple-400/30'
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Pay Online</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use credit/debit card via secure Sithma Pay gateway. Instant activation after payment.
            </p>
            <div className="mt-3 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
              Instant activation <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'online' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              </div>
            )}
          </button>

          {/* OPTION 3: Pay at Branch */}
          <button
            onClick={() => { setActiveMethod('physical'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'physical'
                ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/60 border-white/10 hover:border-amber-400/30 hover:bg-amber-500/5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'physical'
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-400'
                : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-400/30'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Pay at Branch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visit your registered branch in person to make the advance payment directly to our staff.
            </p>
            <div className="mt-3 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
              In-person payment <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'physical' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              </div>
            )}
          </button>
        </div>

        {/* ── Form Panel ────────────────────────────────────────────────── */}
        {activeMethod && (
          <div className={`rounded-3xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${
            activeMethod === 'slip'
              ? 'bg-slate-900/95 border-cyan-400/20'
              : activeMethod === 'online'
              ? 'bg-slate-900/95 border-purple-400/20'
              : 'bg-slate-900/95 border-amber-400/20'
          }`}>
            {/* Top accent bar */}
            <div className={`h-1 w-full ${
              activeMethod === 'slip'
                ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500'
                : activeMethod === 'online'
                ? 'bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500'
                : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
            }`} />

            <div className="p-6 sm:p-8">

              {/* ─── SLIP UPLOAD FORM ──────────────────────────────────────── */}
              {activeMethod === 'slip' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-cyan-400" /> Upload Bank Deposit Slip
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Transfer the advance amount and upload your receipt</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bank Account Details */}
                  <div className="rounded-2xl bg-gradient-to-r from-slate-800/80 via-cyan-900/20 to-slate-800/80 border border-cyan-400/20 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      <Landmark className="w-3.5 h-3.5" /> Transfer To This Account
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 mb-0.5">Bank</p>
                        <p className="font-bold text-white">{branchInfo.bank}</p>
                        <p className="text-cyan-300 text-[11px]">{branchInfo.swiftBranch} Branch</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Account Name</p>
                        <p className="font-bold text-white">Sithma Driving School (Pvt) Ltd</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Account Number</p>
                        <p className="font-mono font-black text-base text-amber-300 tracking-wider">{branchInfo.accountNo}</p>
                        <p className="text-slate-400 text-[11px]">Amount: Rs. {Number(advanceAmount).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount Deposited (LKR) <span className="text-rose-400">*</span></label>
                      <input
                        type="number"
                        value={slipForm.amount}
                        onChange={(e) => setSlipForm({ ...slipForm, amount: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-bold rounded-xl text-sm outline-none focus:border-cyan-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Bank Name <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        value={slipForm.bankName}
                        onChange={(e) => setSlipForm({ ...slipForm, bankName: e.target.value })}
                        placeholder="e.g. Bank of Ceylon, Commercial Bank"
                        className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm outline-none focus:border-cyan-400/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Reference / Transaction ID (Optional)</label>
                      <input
                        type="text"
                        value={slipForm.reference}
                        onChange={(e) => setSlipForm({ ...slipForm, reference: e.target.value })}
                        placeholder="e.g. BOC-TXN-20260910-XXXXX"
                        className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm outline-none focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* File Drop Area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Upload Deposit Slip / Bank Receipt <span className="text-rose-400">*</span>
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        slipFile
                          ? 'border-cyan-400/60 bg-cyan-500/5'
                          : 'border-white/20 hover:border-cyan-400/40 bg-white/5 hover:bg-cyan-500/5'
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {slipPreview ? (
                        <div className="space-y-3">
                          <img src={slipPreview} alt="Slip Preview" className="max-h-40 mx-auto rounded-xl border border-white/20 shadow-lg object-contain" />
                          <p className="text-xs text-cyan-300 font-semibold">{slipFile?.name}</p>
                          <p className="text-[11px] text-slate-400">Click to change file</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-10 h-10 text-cyan-400/60 mx-auto" />
                          <p className="font-semibold text-white text-sm">Click to select bank slip</p>
                          <p className="text-xs text-slate-400">JPG, PNG, WEBP or PDF — Max 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitSlip}
                    disabled={loading || !slipFile}
                    className="w-full btn-primary py-4 font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Clock className="w-5 h-5 animate-spin" /> Uploading Slip...</>
                    ) : (
                      <><FileCheck className="w-5 h-5" /> Submit Slip for Staff Verification</>
                    )}
                  </button>
                </div>
              )}

              {/* ─── ONLINE PAYMENT (SIMULATED) ────────────────────────────── */}
              {activeMethod === 'online' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-400" /> Sithma Pay — Online Gateway
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Secure simulated payment gateway</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Amount Due */}
                  <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 via-violet-900/20 to-purple-900/40 border border-purple-400/20 p-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400">Advance Payment Due</div>
                    <div className="text-2xl font-black text-white">Rs. {Number(advanceAmount).toLocaleString()}<span className="text-sm font-normal text-slate-400">.00</span></div>
                  </div>

                  {cardStep === 'processing' ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-400/30 border-t-purple-400 animate-spin mx-auto" />
                      <p className="text-white font-bold">Processing Payment...</p>
                      <p className="text-xs text-slate-400">Please do not close this window</p>
                    </div>
                  ) : (
                    <>
                      {/* Test Card Autofill */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Use a Test Card (Demo Mode)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {DUMMY_CARDS.map((card, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedDummy(i);
                                setCardForm({ ...cardForm, cardNumber: card.number, expiry: '12/28', cvv: '123' });
                              }}
                              className={`rounded-xl p-3 border text-left text-xs transition-all bg-gradient-to-br ${card.color} ${
                                selectedDummy === i ? 'border-white/50 shadow-lg scale-[1.02]' : 'border-white/20 hover:border-white/40 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <p className="font-mono text-white text-[11px] tracking-wider">{card.number}</p>
                              <p className="text-white/70 mt-1 font-bold">{card.type}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardForm.cardNumber}
                              onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-mono rounded-xl text-sm outline-none focus:border-purple-400/50 pr-12"
                            />
                            <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Holder Name</label>
                          <input
                            type="text"
                            value={cardForm.cardHolder}
                            onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm outline-none focus:border-purple-400/50 uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiry Date</label>
                            <input
                              type="text"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-mono rounded-xl text-sm outline-none focus:border-purple-400/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">CVV / CVC</label>
                            <input
                              type="password"
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.slice(0, 4) })}
                              placeholder="•••"
                              maxLength={4}
                              className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 text-white font-mono rounded-xl text-sm outline-none focus:border-purple-400/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security badges */}
                      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> PCI DSS Compliant</span>
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> 3D Secure</span>
                      </div>

                      <button
                        onClick={handleOnlinePayment}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] disabled:opacity-50"
                      >
                        <Lock className="w-5 h-5" /> Pay Rs. {Number(advanceAmount).toLocaleString()} Securely
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ─── PHYSICAL PAYMENT INFO ─────────────────────────────────── */}
              {activeMethod === 'physical' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-400" /> Pay at {branch} Branch
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Visit us in person — bring your NIC and reference code</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Branch Details Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-900/60 to-orange-900/20 border border-amber-400/30 p-6 space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Sithma Driving School</h3>
                        <p className="text-amber-300 font-semibold text-sm">{branch} Branch</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 mb-0.5">Address</p>
                          <p className="font-semibold text-white">{branchInfo.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 mb-0.5">Contact Number</p>
                          <p className="font-bold text-white">{branchInfo.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 mb-0.5">Office Hours</p>
                          <p className="font-semibold text-white">{branchInfo.hours}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-400 mb-0.5">Amount to Pay</p>
                          <p className="font-black text-amber-300 text-base">Rs. {Number(advanceAmount).toLocaleString()}.00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What to bring */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> What to Bring
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2">
                      {[
                        'Original NIC or Passport for identity verification',
                        `Your registration reference: ${registrationReference}`,
                        `Advance payment amount: Rs. ${Number(advanceAmount).toLocaleString()}`,
                        'The email you registered with: ' + email,
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Info note */}
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-xs text-slate-300 flex gap-2.5">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>
                      After paying in person, the Data Entry Officer will verify your account on the spot. Your portal access will be granted immediately.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={branchInfo.map}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" /> Get Directions
                    </a>
                    <button
                      onClick={handlePhysicalChoice}
                      disabled={loading}
                      className="py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                    >
                      {loading ? <Clock className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Please wait...' : "I'll Visit the Branch"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <p className="text-center text-xs text-slate-500">
          Already paid?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
            Sign In to Portal
          </Link>{' '}
          · Need help?{' '}
          <a href={`tel:${branchInfo.phone}`} className="text-amber-400 hover:text-amber-300 font-semibold">
            Call {branchInfo.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
