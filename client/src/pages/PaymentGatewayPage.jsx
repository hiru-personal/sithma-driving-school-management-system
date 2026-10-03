import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CreditCard,
  Upload,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
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
  FileText,
  ExternalLink,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── 4 Official Sithma Bank Accounts ──────────────────────────────────────────
export const SITHMA_OFFICIAL_BANKS = [
  {
    id: 'BOC',
    name: 'Bank of Ceylon (BOC)',
    shortName: 'Bank of Ceylon (BOC)',
    accountName: 'Sithma Driving School (Pvt) Ltd',
    accountNo: '00892014782',
    branch: 'Maharagama Branch',
    badge: 'State Bank',
  },
  {
    id: 'PEOPLES',
    name: "People's Bank",
    shortName: "People's Bank",
    accountName: 'Sithma Driving School (Pvt) Ltd',
    accountNo: '04420018903124',
    branch: 'Maharagama Branch',
    badge: 'State Bank',
  },
  {
    id: 'COMBANK',
    name: 'Commercial Bank of Ceylon',
    shortName: 'Commercial Bank',
    accountName: 'Sithma Driving School (Pvt) Ltd',
    accountNo: '1000492817',
    branch: 'Maharagama Branch',
    badge: 'Private Bank',
  },
  {
    id: 'HNB',
    name: 'Hatton National Bank (HNB)',
    shortName: 'Hatton National Bank (HNB)',
    accountName: 'Sithma Driving School (Pvt) Ltd',
    accountNo: '014210034891',
    branch: 'Maharagama Branch',
    badge: 'Private Bank',
  },
];

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
    accountNo: '1000492817',
    bank: 'Commercial Bank',
    swiftBranch: 'Werahara',
  },
  Delgoda: {
    address: 'Main Street, Delgoda',
    phone: '011-2974820',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
    map: 'https://maps.google.com/?q=Delgoda,+Sri+Lanka',
    accountNo: '014210034891',
    bank: 'Hatton National Bank (HNB)',
    swiftBranch: 'Delgoda',
  },
};

// Dummy card numbers for simulation demo
const DUMMY_CARDS = [
  { number: '4111 1111 1111 1111', type: 'Visa', color: 'from-[#1B3D59] to-[#152026]' },
  { number: '5500 0000 0000 0004', type: 'Mastercard', color: 'from-[#6A97C0] to-[#1B3D59]' },
  { number: '3714 496353 98431', type: 'Amex', color: 'from-[#1B3D59] to-[#6A97C0]' },
];

export default function PaymentGatewayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { user, student, updateStudentData } = useAuth();

  // ── State passed from RegisterPage OR storage fallback ──────────────
  const savedPending = (() => {
    try {
      const sess = sessionStorage.getItem('sithma_pending_registration');
      if (sess) return JSON.parse(sess);
      const loc = localStorage.getItem('sithma_pending_registration');
      if (loc) return JSON.parse(loc);
      return null;
    } catch {
      return null;
    }
  })();

  const regData = location.state || savedPending || {};
  const studentName = regData.studentName || regData.name || user?.name || 'Student';
  const studentId = regData.studentId || student?._id || null;
  const userId = regData.userId || regData.pendingUserId || user?._id || user?.id || null;
  const branch = regData.branch || student?.branch || user?.branch || 'Maharagama';
  const nic = regData.nic || student?.nic || user?.nic || '';
  const email = regData.email || user?.email || '';
  const studentType =
    regData.studentType ||
    regData.student_type ||
    student?.student_type ||
    student?.studentType ||
    user?.student_type ||
    'Type 1';
  const advanceAmount = regData.advanceAmount || student?.advancePaymentAmount || 5000;
  const registrationReference =
    regData.registrationReference ||
    student?.advancePaymentReference ||
    `REG-${Date.now().toString().slice(-6)}`;

  React.useEffect(() => {
    if (location.state?.studentName || location.state?.name) {
      try {
        sessionStorage.setItem('sithma_pending_registration', JSON.stringify(location.state));
        localStorage.setItem('sithma_pending_registration', JSON.stringify(location.state));
      } catch (e) {}
    }
  }, [location.state]);

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [showExitModal, setShowExitModal] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null); // 'slip' | 'online' | 'physical'
  const [step, setStep] = useState('choose'); // 'choose' | 'form' | 'success'

  // Slip Upload
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState('BOC');
  const [copiedBankId, setCopiedBankId] = useState(null);
  const [showAllBanks, setShowAllBanks] = useState(false);
  const [slipForm, setSlipForm] = useState({
    bankName: 'Bank of Ceylon (BOC)',
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
  const handleSelectBank = (bank) => {
    setSelectedBankId(bank.id);
    setSlipForm((prev) => ({ ...prev, bankName: bank.name }));
  };

  const handleCopyAccountNo = (accNo, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accNo);
      setCopiedBankId(id);
      toast.success('Account number copied to clipboard!');
      setTimeout(() => setCopiedBankId(null), 2500);
    }
  };

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
      const fixedAmount = 5000;
      const fd = new FormData();
      fd.append('slipImage', slipFile);
      fd.append('amount', fixedAmount);
      fd.append('bankName', slipForm.bankName);
      fd.append('transactionReference', slipForm.reference || `BOC-ADV-${Date.now().toString().slice(-6)}`);
      fd.append('paymentType', 'advance');
      fd.append('pendingUserId', userId || user?._id || '');
      fd.append('userId', userId || user?._id || '');
      fd.append('studentId', studentId || student?._id || '');

      const res = await api.post('/payments/upload-pending', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        if (updateStudentData && student) {
          updateStudentData({
            ...student,
            advancePaymentStatus: 'pending',
            hasSubmittedPayment: true,
            latestPayment: res.data.payment,
          });
        }
        setDoneData({
          method: 'slip',
          reference: slipForm.reference || res.data.payment?.transactionReference || 'N/A',
          amount: fixedAmount,
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
      const cardType = selectedDummy !== null
        ? DUMMY_CARDS[selectedDummy].type
        : (cleaned.startsWith('4') ? 'Visa' : (cleaned.startsWith('5') ? 'Mastercard' : 'Visa / Mastercard'));

      const res = await api.post('/payments/pay-advance-pending', {
        amount: advanceAmount,
        bankName: 'Online Payment Gateway (Sithma Pay)',
        transactionReference: `ONPAY-${Date.now().toString().slice(-8)}`,
        pendingUserId: userId || user?._id || '',
        userId: userId || user?._id || '',
        studentId: studentId || student?._id || '',
        cardLast4: cleaned.slice(-4),
        cardBrand: cardType,
        cardHolder: cardForm.cardHolder || studentName,
      });

      if (res.data.success) {
        if (updateStudentData && student) {
          updateStudentData({
            ...student,
            advancePaymentStatus: 'pending',
            hasSubmittedPayment: true,
            latestPayment: res.data.payment,
          });
        }
        setCardStep('done');
        setDoneData({
          method: 'online',
          reference: res.data.payment?.transactionReference || `ONPAY-${Date.now()}`,
          amount: advanceAmount,
          cardLast4: cleaned.slice(-4),
          cardBrand: cardType,
          cardHolder: cardForm.cardHolder || studentName,
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
      const res = await api.post('/payments/register-physical-intent', {
        pendingUserId: userId || user?._id || '',
        userId: userId || user?._id || '',
        studentId: studentId || student?._id || '',
        branch,
        amount: advanceAmount,
      }).catch(() => null);

      if (updateStudentData && student) {
        updateStudentData({
          ...student,
          advancePaymentStatus: 'pending',
          hasSubmittedPayment: true,
          payment_method: 'physical_branch',
        });
      }
    } finally {
      setLoading(false);
      setDoneData({ method: 'physical', branch, amount: advanceAmount });
      setDone(true);
    }
  };

  // ─── If no state and no logged-in user, show helpful status notice ─────────
  if (!regData.studentName && !studentId && !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5 px-4 text-center max-w-md mx-auto">
        <div className="card p-8 bg-white border border-[#D4EEF8] rounded-3xl shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59] mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 text-[11px] font-bold">
              Account Verification Notice
            </span>
            <h2 className="text-2xl font-black text-[#152026]">Already Registered?</h2>
            <p className="text-[#6A97C0] text-xs leading-relaxed">
              If you submitted your registration, your account has been created and is safely stored in <strong className="text-[#152026] font-bold">Pending Verification</strong> status. You do not need to register again.
            </p>
            <p className="text-[#6A97C0] text-xs leading-relaxed">
              You can visit your selected branch to pay in person, or sign in once your account has been approved by our staff.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
            <Link to="/login" className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2.5 px-6 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
              Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/" className="py-2.5 px-6 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (done && doneData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 text-[#152026]">
        <div className="max-w-xl w-full">
          <div className="rounded-3xl overflow-hidden bg-white border border-[#D4EEF8] shadow-2xl">
            {/* Top bar */}
            <div className={`h-2 w-full ${doneData.method === 'physical' ? 'bg-[#1B3D59]' : 'bg-[#1B3D59]'}`} />

            <div className="p-8 sm:p-10 text-center space-y-6">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border shadow-xs ${
                doneData.method === 'physical'
                  ? 'bg-[#F3EED8] border-[#6A97C0]/40 text-[#152026]'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}>
                {doneData.method === 'physical' ? (
                  <Building2 className="w-10 h-10 text-[#152026]" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                )}
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${
                  doneData.method === 'physical'
                    ? 'bg-[#F3EED8] border-[#6A97C0]/40 text-[#152026]'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  {doneData.method === 'physical' ? (
                    <><Clock className="w-3 h-3" /> Visit Branch to Pay</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" /> Payment Submitted</>
                  )}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-[#152026] leading-tight">
                  {doneData.method === 'physical'
                    ? 'Please Visit Your Branch'
                    : doneData.method === 'online'
                    ? 'Online Card Payment Submitted!'
                    : 'Bank Slip Uploaded!'}
                </h2>
                <p className="text-sm text-[#6A97C0] mt-2 leading-relaxed max-w-sm mx-auto font-medium">
                  {doneData.method === 'physical'
                    ? `Please visit the ${doneData.branch} branch to complete your advance payment. Bring your NIC and registration reference.`
                    : doneData.method === 'online'
                    ? 'Your online card payment has been captured. Our branch Data Entry Officer will review and verify your transaction before activating your account.'
                    : 'Our Data Entry Officer will review and verify your bank deposit slip. You will receive login access once verified.'}
                </p>
              </div>

              {/* Details card */}
              <div className="p-5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] text-left text-xs space-y-3 text-[#152026]">
                <div className="flex justify-between">
                  <span className="text-[#6A97C0]">Name:</span>
                  <span className="font-bold text-[#152026]">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A97C0]">Branch:</span>
                  <span className="font-bold text-[#152026]">{branch}</span>
                </div>
                {doneData.method === 'online' && (
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0]">Payment Method:</span>
                    <span className="font-bold text-[#1B3D59]">
                      Online Gateway ({doneData.cardBrand || 'Card'} •••• {doneData.cardLast4 || 'Card'})
                    </span>
                  </div>
                )}
                {doneData.method !== 'physical' && (
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0]">Reference:</span>
                    <span className="font-bold text-[#1B3D59] font-mono">{doneData.reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6A97C0]">Advance Amount:</span>
                  <span className="font-black text-emerald-700 text-sm">Rs. {Number(doneData.amount).toLocaleString()}</span>
                </div>
                {doneData.method !== 'physical' && (
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0]">Account Status:</span>
                    <span className="font-bold text-[#152026] bg-[#F3EED8] px-2 py-0.5 rounded border border-[#6A97C0]/40">Pending Officer Verification</span>
                  </div>
                )}
                {doneData.method === 'physical' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#6A97C0]">Branch Address:</span>
                      <span className="font-semibold text-[#152026] text-right max-w-[60%]">{branchInfo.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6A97C0]">Office Hours:</span>
                      <span className="font-semibold text-[#152026]">{branchInfo.hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6A97C0]">Contact:</span>
                      <span className="font-bold text-[#1B3D59]">{branchInfo.phone}</span>
                    </div>
                  </>
                )}
              </div>

              {doneData.method !== 'physical' && (
                <div className="p-4 rounded-xl bg-[#D4EEF8]/40 border border-[#B3D5F1] text-xs text-[#152026] text-left flex gap-2.5">
                  <Info className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#152026] font-bold">What happens next?</strong> Our branch Data Entry Officer will verify your {doneData.method === 'online' ? 'online card gateway transaction' : 'payment slip'} within 1–2 business hours. Once verified, you will gain full access to your student dashboard.
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {user ? (
                  <Link
                    to="/student/dashboard"
                    className="flex-1 bg-[#1B3D59] hover:bg-[#152026] text-white py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    Go to Student Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex-1 bg-[#1B3D59] hover:bg-[#152026] text-white py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    Go to Sign In Portal <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to="/"
                  className="py-3 px-5 text-sm font-semibold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 text-[#152026]">
      {/* ── Confirmation / Exit Modal ────────────────────────────────────── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#D4EEF8] p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="w-14 h-14 rounded-2xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59] mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 text-[10px] font-bold">
                Account Created • Pending Status
              </span>
              <h3 className="text-xl font-black text-[#152026]">Your Account is Safely Saved!</h3>
              <p className="text-xs text-[#6A97C0] leading-relaxed">
                Your registration has already been created in <strong className="text-[#152026] font-bold">Pending Verification</strong> status. You can pay your advance now, or visit the branch to pay in person anytime.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-xs space-y-2.5 text-[#152026]">
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Student:</span>
                <span className="font-bold text-[#152026]">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Branch:</span>
                <span className="font-bold text-[#152026]">{branch} Branch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Reference:</span>
                <span className="font-mono font-bold text-[#1B3D59]">{registrationReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Status:</span>
                <span className="font-bold text-[#152026] font-mono bg-[#F3EED8] px-2 py-0.5 rounded border border-[#6A97C0]/40">pending_verification</span>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/login');
                }}
                className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                Go to Sign In Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/');
                }}
                className="w-full py-2.5 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 text-[#6A97C0] hover:text-[#152026] text-xs font-bold cursor-pointer transition-colors"
              >
                Stay on Payment Page
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full space-y-6">

        {/* ── Top Navigation & Status Bar ───────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAFCFE] border border-[#D4EEF8] text-xs font-bold text-[#152026] hover:border-[#1B3D59] shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1B3D59]" /> Back / Pay Later
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Account Created (Pending Status)
            </span>
          </div>
        </div>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> Secure Advance Payment
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#152026] leading-tight">
            Complete Your Advance Payment
          </h1>
          <p className="text-[#6A97C0] text-sm max-w-lg mx-auto font-medium">
            Welcome, <strong className="text-[#152026] font-bold">{studentName}</strong>! To activate your account and access the Sithma portal, a one-time advance payment of{' '}
            <strong className="text-[#1B3D59] font-bold">Rs. {Number(advanceAmount).toLocaleString()}.00</strong> is required.
          </p>
        </div>

        {/* ── Reassurance Banner: Account is Created and Pending ──────────── */}
        <div className="p-5 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/40 text-xs text-[#152026] flex items-start gap-3.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-extrabold text-[#152026] text-sm">
              Registration Details Submitted Successfully!
            </p>
            <p className="text-[#152026]/90 leading-relaxed font-medium">
              Your student account for <strong className="text-[#152026] font-bold">{studentName}</strong> ({email}) has been created with status <span className="font-mono bg-white border border-[#6A97C0]/40 text-[#152026] font-bold px-2 py-0.5 rounded text-[11px]">pending_verification</span>. You can submit your payment proof below, pay online, or pay at the <strong className="text-[#152026] font-bold underline decoration-[#6A97C0]">{branch} Branch</strong>. If you go back or exit now, your account remains safely created and pending.
            </p>
          </div>
        </div>

        {/* ── Registration Summary Strip ────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-[#D4EEF8] p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-4 text-[#152026] font-medium">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#1B3D59]" /> <strong className="text-[#152026]">{branch} Branch</strong></span>
            {nic && <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> NIC: <strong className="text-[#152026]">{nic}</strong></span>}
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Advance: <strong className="text-[#152026] font-bold">Rs. {Number(advanceAmount).toLocaleString()}</strong></span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 text-[11px] font-bold">
            REGISTRATION PENDING PAYMENT
          </span>
        </div>

        {/* ── Method Selection Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OPTION 1: Upload Bank Slip */}
          <button
            onClick={() => { setActiveMethod('slip'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border-2 text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'slip'
                ? 'bg-[#D4EEF8]/40 border-[#1B3D59] shadow-md ring-2 ring-[#1B3D59]/20'
                : 'bg-white border-[#D4EEF8] hover:border-[#1B3D59] hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'slip'
                ? 'bg-[#1B3D59] text-white border-[#1B3D59]'
                : 'bg-[#D4EEF8] border-[#B3D5F1] text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#152026] text-sm mb-1.5">Upload Bank Slip</h3>
            <p className="text-xs text-[#6A97C0] leading-relaxed font-medium">
              Deposit to our bank account and upload your deposit slip or transfer receipt.
            </p>
            <div className="mt-3 text-[11px] font-bold text-[#1B3D59] flex items-center gap-1">
              Recommended <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'slip' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1B3D59] flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* OPTION 2: Online Payment Gateway */}
          <button
            onClick={() => { setActiveMethod('online'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border-2 text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'online'
                ? 'bg-[#D4EEF8]/40 border-[#1B3D59] shadow-md ring-2 ring-[#1B3D59]/20'
                : 'bg-white border-[#D4EEF8] hover:border-[#1B3D59] hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'online'
                ? 'bg-[#1B3D59] text-white border-[#1B3D59]'
                : 'bg-[#D4EEF8] border-[#B3D5F1] text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white'
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#152026] text-sm mb-1.5">Online Gateway</h3>
            <p className="text-xs text-[#6A97C0] leading-relaxed font-medium">
              Visa / Master card. Verification by our branch officer is required before account activation.
            </p>
            <div className="mt-3 text-[11px] font-bold text-[#1B3D59] flex items-center gap-1">
              Officer Verification Required <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'online' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1B3D59] flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </button>

          {/* OPTION 3: Pay at Branch */}
          <button
            onClick={() => { setActiveMethod('physical'); setStep('form'); }}
            className={`group relative rounded-2xl p-5 border-2 text-left transition-all duration-300 cursor-pointer ${
              activeMethod === 'physical'
                ? 'bg-[#F3EED8]/60 border-[#1B3D59] shadow-md ring-2 ring-[#1B3D59]/20'
                : 'bg-white border-[#D4EEF8] hover:border-[#1B3D59] hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all ${
              activeMethod === 'physical'
                ? 'bg-[#1B3D59] text-white border-[#1B3D59]'
                : 'bg-[#F3EED8] border-[#6A97C0]/40 text-[#152026] group-hover:bg-[#1B3D59] group-hover:text-white'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#152026] text-sm mb-1.5">Pay at Branch</h3>
            <p className="text-xs text-[#6A97C0] leading-relaxed font-medium">
              Visit your registered branch in person to make the advance payment directly to our staff.
            </p>
            <div className="mt-3 text-[11px] font-bold text-[#152026] flex items-center gap-1">
              In-person payment <ChevronRight className="w-3 h-3" />
            </div>
            {activeMethod === 'physical' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1B3D59] flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>

        {/* ── Form Panel ────────────────────────────────────────────────── */}
        {activeMethod && (
          <div className="rounded-3xl border border-[#D4EEF8] bg-white shadow-xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-[#1B3D59]" />

            <div className="p-6 sm:p-8">

              {/* ─── SLIP UPLOAD FORM ──────────────────────────────────────── */}
              {activeMethod === 'slip' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#152026] flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#1B3D59]" /> Upload Bank Deposit Slip
                      </h2>
                      <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">Transfer the advance amount and upload your receipt</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="p-1.5 rounded-lg text-[#6A97C0] hover:text-[#152026] hover:bg-[#FAFCFE] transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bank Account Details - 4 Official Banks */}
                  <div className="rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-[#152026] uppercase tracking-wider">
                        <Landmark className="w-4 h-4 text-[#1B3D59]" /> Transfer to Official Sithma Bank Account
                      </div>
                      <span className="text-[11px] text-[#6A97C0] font-medium">
                        Select any of our 4 official bank accounts:
                      </span>
                    </div>

                    {/* 4 Banks Selector Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SITHMA_OFFICIAL_BANKS.map((b) => {
                        const isSelected = selectedBankId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleSelectBank(b)}
                            className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-[#D4EEF8] border-[#1B3D59] text-[#152026] shadow-xs ring-1 ring-[#1B3D59]/30'
                                : 'bg-white border-[#D4EEF8] text-[#152026] hover:border-[#6A97C0] hover:bg-[#FAFCFE]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-[#6A97C0] uppercase tracking-wider">
                                {b.id}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3D59] flex-shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-[#D4EEF8]" />
                              )}
                            </div>
                            <p className="text-xs font-extrabold truncate text-[#152026]">{b.shortName}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Bank Details Card */}
                    {(() => {
                      const currentBank =
                        SITHMA_OFFICIAL_BANKS.find((b) => b.id === selectedBankId) ||
                        SITHMA_OFFICIAL_BANKS[0];
                      return (
                        <div className="bg-white rounded-xl p-4 border border-[#D4EEF8] shadow-xs space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-[#6A97C0] mb-0.5 font-medium">Selected Bank</p>
                              <p className="font-extrabold text-[#152026] text-sm">{currentBank.name}</p>
                              <p className="text-[#1B3D59] text-[11px] font-bold">{currentBank.branch}</p>
                            </div>
                            <div>
                              <p className="text-[#6A97C0] mb-0.5 font-medium">Account Name</p>
                              <p className="font-extrabold text-[#152026] text-sm">{currentBank.accountName}</p>
                            </div>
                            <div>
                              <p className="text-[#6A97C0] mb-0.5 font-medium">Account Number</p>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xl text-[#152026] tracking-wider">
                                  {currentBank.accountNo}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyAccountNo(currentBank.accountNo, currentBank.id)}
                                  className="p-1.5 rounded-lg bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#152026] transition-colors border border-[#D4EEF8] cursor-pointer"
                                  title="Copy Account Number"
                                >
                                  {copiedBankId === currentBank.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-[#1B3D59]" />
                                  )}
                                </button>
                              </div>
                              <p className="text-[#6A97C0] text-[11px] mt-0.5 font-medium">
                                Advance: <span className="text-[#152026] font-black">Rs. {Number(advanceAmount).toLocaleString()}.00</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Expandable: View All 4 Bank Accounts At Once */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllBanks(!showAllBanks)}
                        className="text-[11px] text-[#1B3D59] hover:text-[#152026] underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {showAllBanks ? '▲ Hide all banks list' : '▼ View all 4 bank accounts at once'}
                      </button>

                      {showAllBanks && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-[#D4EEF8]">
                          {SITHMA_OFFICIAL_BANKS.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => handleSelectBank(b)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                selectedBankId === b.id
                                  ? 'bg-[#D4EEF8] border-[#1B3D59] ring-1 ring-[#1B3D59]/30 shadow-xs'
                                  : 'bg-white border-[#D4EEF8] hover:border-[#6A97C0]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[#152026]">{b.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyAccountNo(b.accountNo, b.id);
                                  }}
                                  className="text-[11px] text-[#1B3D59] hover:underline flex items-center gap-1 font-bold"
                                >
                                  {copiedBankId === b.id ? (
                                    <span className="text-emerald-700 font-bold">Copied!</span>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" /> Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="font-mono text-[#152026] font-black mt-1 text-sm tracking-wider">
                                {b.accountNo}
                              </p>
                              <p className="text-[11px] text-[#6A97C0] mt-0.5">
                                {b.branch} • {b.accountName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#152026]">
                          Amount Deposited (LKR) <span className="text-rose-500">*</span>
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" /> Fixed Advance
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value="5,000.00"
                          readOnly
                          disabled
                          className="w-full px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-extrabold rounded-xl text-sm outline-none cursor-not-allowed select-none opacity-100"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[#6A97C0] font-bold select-none pointer-events-none">
                          <Lock className="w-3.5 h-3.5 text-[#1B3D59]" />
                          <span className="text-[#6A97C0] font-bold">LKR (Fixed)</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6A97C0] mt-1 font-medium">
                        Registration advance fee is fixed at LKR 5,000 and cannot be changed.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#152026] mb-1.5">
                        Your Bank Name <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={slipForm.bankName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlipForm({ ...slipForm, bankName: val });
                          const matched = SITHMA_OFFICIAL_BANKS.find((b) => b.name === val);
                          if (matched) setSelectedBankId(matched.id);
                        }}
                        className="w-full px-4 py-3 bg-white border border-[#D4EEF8] text-[#152026] font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59] cursor-pointer shadow-xs"
                      >
                        {SITHMA_OFFICIAL_BANKS.map((b) => (
                          <option key={b.id} value={b.name} className="text-[#152026]">
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File Drop Area */}
                  <div>
                    <label className="block text-xs font-bold text-[#152026] mb-1.5">
                      Upload Deposit Slip / Bank Receipt <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        slipFile
                          ? 'border-[#1B3D59] bg-[#D4EEF8]/40'
                          : 'border-[#D4EEF8] hover:border-[#1B3D59] bg-[#FAFCFE] hover:bg-[#D4EEF8]/20'
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
                          {slipFile?.type === 'application/pdf' ||
                          slipFile?.name?.toLowerCase().endsWith('.pdf') ? (
                            /* PDF Document Preview Card */
                            <div className="max-w-md mx-auto p-4 rounded-xl bg-white border border-[#D4EEF8] text-left space-y-3 shadow-md">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-xs">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase tracking-wider">
                                      PDF Document
                                    </span>
                                    <span className="text-[#6A97C0] text-[11px] font-medium">
                                      {slipFile?.size ? `${(slipFile.size / 1024).toFixed(1)} KB` : ''}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-[#152026] truncate mt-0.5" title={slipFile?.name}>
                                    {slipFile?.name}
                                  </p>
                                </div>
                              </div>

                              {/* Action link & preview note */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#D4EEF8] text-xs">
                                <a
                                  href={slipPreview}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 rounded-lg bg-[#D4EEF8] hover:bg-[#B3D5F1] border border-[#B3D5F1] text-[#1B3D59] font-bold inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> View / Open PDF in New Tab
                                </a>
                                <span className="text-[11px] text-[#6A97C0]">Click box to replace file</span>
                              </div>

                              {/* Mini PDF preview embed */}
                              <div className="rounded-lg overflow-hidden border border-[#D4EEF8] bg-[#FAFCFE] h-44 w-full relative">
                                <iframe
                                  src={slipPreview}
                                  title="PDF Document Preview"
                                  className="w-full h-full pointer-events-none"
                                />
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(slipPreview, '_blank');
                                  }}
                                  className="absolute inset-0 bg-transparent hover:bg-black/5 cursor-pointer flex items-end justify-center pb-2"
                                  title="Click to view full PDF"
                                >
                                  <span className="text-[10px] bg-white text-[#1B3D59] font-bold px-2.5 py-1 rounded-md border border-[#D4EEF8] shadow-md">
                                    Click to open full document
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Image Preview Card */
                            <div className="space-y-2">
                              <div className="relative inline-block">
                                <img
                                  src={slipPreview}
                                  alt="Bank Deposit Slip"
                                  className="max-h-48 mx-auto rounded-xl border border-[#D4EEF8] shadow-md object-contain bg-[#FAFCFE]"
                                />
                                <a
                                  href={slipPreview}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-white/95 border border-[#D4EEF8] text-[10px] font-bold text-[#1B3D59] hover:text-[#152026] flex items-center gap-1 shadow-md"
                                >
                                  <ExternalLink className="w-3 h-3" /> Enlarge
                                </a>
                              </div>
                              <p className="text-xs text-[#152026] font-bold">{slipFile?.name}</p>
                              <p className="text-[11px] text-[#6A97C0]">Click anywhere in this box to change file</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-10 h-10 text-[#1B3D59] mx-auto" />
                          <p className="font-extrabold text-[#152026] text-sm">Click to select bank slip</p>
                          <p className="text-xs text-[#6A97C0] font-medium">JPG, PNG, WEBP or PDF — Max 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitSlip}
                    disabled={loading || !slipFile}
                    className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 shadow-md cursor-pointer transition-all"
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
                      <h2 className="text-lg font-extrabold text-[#152026] flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#1B3D59]" /> Sithma Pay — Online Gateway
                      </h2>
                      <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">Secure simulated payment gateway</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="p-1.5 rounded-lg text-[#6A97C0] hover:text-[#152026] hover:bg-[#FAFCFE] transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Amount Due */}
                  <div className="rounded-2xl bg-[#D4EEF8]/60 border border-[#B3D5F1] p-4.5 flex items-center justify-between">
                    <div className="text-xs text-[#1B3D59] font-bold">Advance Payment Due</div>
                    <div className="text-2xl font-black text-[#152026]">Rs. {Number(advanceAmount).toLocaleString()}<span className="text-sm font-semibold text-[#6A97C0]">.00</span></div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-3.5 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-xs text-[#152026] flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                    <p className="font-medium leading-relaxed">
                      <strong className="text-[#152026] font-bold">Officer Verification Required:</strong> Like Bank Deposit Slips, online card transactions are verified by our branch Data Entry Officer before full account activation.
                    </p>
                  </div>

                  {cardStep === 'processing' ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full border-4 border-[#D4EEF8] border-t-[#1B3D59] animate-spin mx-auto" />
                      <p className="text-[#152026] font-black text-base">Processing Payment...</p>
                      <p className="text-xs text-[#6A97C0]">Please do not close this window</p>
                    </div>
                  ) : (
                    <>
                      {/* Test Card Autofill */}
                      <div>
                        <p className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider mb-2">Use a Test Card (Demo Mode)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {DUMMY_CARDS.map((card, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedDummy(i);
                                setCardForm({ ...cardForm, cardNumber: card.number, expiry: '12/28', cvv: '123' });
                              }}
                              className={`rounded-xl p-3 border text-left text-xs transition-all bg-gradient-to-br ${card.color} cursor-pointer ${
                                selectedDummy === i ? 'ring-2 ring-[#1B3D59] shadow-lg scale-[1.02]' : 'hover:shadow-md opacity-90 hover:opacity-100'
                              }`}
                            >
                              <p className="font-mono text-white text-[11px] font-bold tracking-wider">{card.number}</p>
                              <p className="text-white/80 mt-1 font-extrabold">{card.type}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#152026] mb-1.5">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardForm.cardNumber}
                              onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              className="w-full px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-mono font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59] focus:bg-white pr-12 transition-colors"
                            />
                            <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A97C0]" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#152026] mb-1.5">Card Holder Name</label>
                          <input
                            type="text"
                            value={cardForm.cardHolder}
                            onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                            className="w-full px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59] focus:bg-white uppercase transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#152026] mb-1.5">Expiry Date</label>
                            <input
                              type="text"
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-mono font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59] focus:bg-white transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#152026] mb-1.5">CVV / CVC</label>
                            <input
                              type="password"
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.slice(0, 4) })}
                              placeholder="•••"
                              maxLength={4}
                              className="w-full px-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-mono font-bold rounded-xl text-sm outline-none focus:border-[#1B3D59] focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security badges */}
                      <div className="flex items-center justify-center gap-4 text-[11px] text-[#6A97C0] font-semibold">
                        <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-bit SSL</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> PCI DSS Compliant</span>
                        <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-[#1B3D59]" /> 3D Secure</span>
                      </div>

                      <button
                        onClick={handleOnlinePayment}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all bg-[#1B3D59] hover:bg-[#152026] text-white shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        <Lock className="w-5 h-5 text-white" /> Pay Rs. {Number(advanceAmount).toLocaleString()} Securely
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
                      <h2 className="text-lg font-extrabold text-[#152026] flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#1B3D59]" /> Pay at {branch} Branch
                      </h2>
                      <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">Visit us in person — bring your NIC and reference code</p>
                    </div>
                    <button onClick={() => setActiveMethod(null)} className="p-1.5 rounded-lg text-[#6A97C0] hover:text-[#152026] hover:bg-[#FAFCFE] transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Branch Details Card */}
                  <div className="rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/40 p-6 space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#6A97C0]/40 flex items-center justify-center flex-shrink-0 text-[#152026] shadow-xs">
                        <Building2 className="w-6 h-6 text-[#152026]" />
                      </div>
                      <div>
                        <h3 className="font-black text-[#152026] text-base">Sithma Driving School</h3>
                        <p className="text-[#152026] font-extrabold text-sm">{branch} Branch</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#6A97C0] mb-0.5 font-medium">Address</p>
                          <p className="font-bold text-[#152026]">{branchInfo.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#6A97C0] mb-0.5 font-medium">Contact Number</p>
                          <p className="font-bold text-[#152026]">{branchInfo.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#6A97C0] mb-0.5 font-medium">Office Hours</p>
                          <p className="font-bold text-[#152026]">{branchInfo.hours}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#6A97C0] mb-0.5 font-medium">Amount to Pay</p>
                          <p className="font-black text-[#152026] text-base">Rs. {Number(advanceAmount).toLocaleString()}.00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What to bring */}
                  <div className="rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] p-5 space-y-3">
                    <h4 className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" /> What to Bring
                    </h4>
                    <ul className="text-xs text-[#152026] font-medium space-y-2">
                      {[
                        'Original NIC or Passport for identity verification',
                        `Your registration reference: ${registrationReference}`,
                        `Advance payment amount: Rs. ${Number(advanceAmount).toLocaleString()}`,
                        'The email you registered with: ' + email,
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Info note */}
                  <div className="p-4 rounded-xl bg-[#D4EEF8]/40 border border-[#B3D5F1] text-xs text-[#152026] flex gap-2.5 font-medium">
                    <Info className="w-4 h-4 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                    <span>
                      After paying in person, the Data Entry Officer will verify your account on the spot. Your portal access will be granted immediately.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={branchInfo.map}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 text-sm font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-[#1B3D59]" /> Get Directions
                    </a>
                    <button
                      onClick={handlePhysicalChoice}
                      disabled={loading}
                      className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#1B3D59] hover:bg-[#152026] text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <Clock className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                      {loading ? 'Please wait...' : "I'll Visit the Branch"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <p className="text-center text-xs text-[#6A97C0] font-medium mt-6">
          Already paid?{' '}
          <Link to="/login" className="text-[#1B3D59] hover:text-[#152026] font-bold underline underline-offset-2">
            Sign In to Portal
          </Link>{' '}
          · Need help?{' '}
          <a href={`tel:${branchInfo.phone}`} className="text-[#152026] hover:text-[#1B3D59] font-bold">
            Call {branchInfo.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
