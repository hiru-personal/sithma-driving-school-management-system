import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Info,
  Building2,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Strict Validation Functions ─────────────────────────────────────────────────

/**
 * Validates strictly that the card expiry date is:
 * 1. Formatted as MM/YY
 * 2. Month is strictly 01 to 12
 * 3. Year and Month must be in the future (cannot be past, e.g. 2025 or earlier)!
 */
export const validateExpiryDate = (expStr) => {
  if (!expStr || !expStr.trim()) {
    return { valid: false, error: 'Expiry date is required (MM/YY).' };
  }
  const clean = expStr.trim();
  if (!/^\d{2}\/\d{2}$/.test(clean)) {
    return { valid: false, error: 'Expiry date format must be MM/YY (e.g. 12/28).' };
  }

  const [mStr, yStr] = clean.split('/');
  const month = parseInt(mStr, 10);
  const year2Digit = parseInt(yStr, 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid expiry month! Month must be between 01 and 12.' };
  }

  const now = new Date();
  const currentFullYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const fullCardYear = 2000 + year2Digit;

  // Cannot be 2025 or in the past - must be a future year!
  if (fullCardYear <= 2025 || fullCardYear < currentFullYear) {
    return {
      valid: false,
      error: `Card has expired! Year (${fullCardYear}) cannot be 2025 or in the past. Expiry date must be a future year and month.`,
    };
  }

  // If in current year, month must be strictly in the future!
  if (fullCardYear === currentFullYear && month < currentMonth) {
    return {
      valid: false,
      error: `Card has expired! Month (${mStr}/${yStr}) is in the past for year ${currentFullYear}. Expiry month must be in the future.`,
    };
  }

  // Reasonable upper bound check (cannot exceed 20 years into the future)
  if (fullCardYear > currentFullYear + 20) {
    return {
      valid: false,
      error: `Expiry year (${fullCardYear}) is invalid. Expiry cannot exceed ${currentFullYear + 20}.`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validates strictly that the CVC/CVV is:
 * 1. Exactly 3 numbers (numeric digits only)
 */
export const validateCvc = (cvcStr) => {
  if (!cvcStr || !cvcStr.trim()) {
    return { valid: false, error: 'CVV / CVC is required (strictly 3 numbers).' };
  }
  const clean = cvcStr.trim();
  if (!/^\d+$/.test(clean)) {
    return { valid: false, error: 'CVV / CVC must contain numeric digits only.' };
  }
  if (clean.length !== 3) {
    return { valid: false, error: 'CVV / CVC must be exactly 3 numbers (e.g. 123).' };
  }
  return { valid: true, error: null };
};

/**
 * Validates Cardholder Name
 */
export const validateCardHolder = (nameStr) => {
  if (!nameStr || !nameStr.trim()) {
    return { valid: false, error: 'Cardholder name is required.' };
  }
  const clean = nameStr.trim();
  if (clean.length < 2) {
    return { valid: false, error: 'Cardholder name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return { valid: false, error: 'Cardholder name can only contain letters and spaces.' };
  }
  return { valid: true, error: null };
};

/**
 * Validates Card Number (15 or 16 digits)
 */
export const validateCardNumber = (cardNumStr) => {
  const clean = (cardNumStr || '').replace(/\s+/g, '');
  if (!clean) {
    return { valid: false, error: 'Card number is required.' };
  }
  if (!/^\d+$/.test(clean)) {
    return { valid: false, error: 'Card number must contain numeric digits only.' };
  }
  if (clean.length < 15 || clean.length > 16) {
    return { valid: false, error: 'Card number must be 16 digits (or 15 for Amex).' };
  }
  return { valid: true, error: null };
};

// ── Test Cards for University Demo Mode ─────────────────────────────────────────
export const DEMO_TEST_CARDS = [
  {
    id: 'visa',
    name: 'Visa Test Card',
    number: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
    brand: 'Visa',
    gradient: 'from-[#1B3D59] via-[#152026] to-[#0A161E]',
    accentColor: '#B3D5F1',
    badge: 'State Bank of Ceylon / Commercial Bank',
  },
  {
    id: 'mastercard',
    name: 'Mastercard Test Card',
    number: '5500 0000 0000 0004',
    expiry: '10/29',
    cvv: '789',
    brand: 'Mastercard',
    gradient: 'from-[#3A1C28] via-[#1B3D59] to-[#152026]',
    accentColor: '#F3EED8',
    badge: "People's Bank / HNB Global",
  },
  {
    id: 'amex',
    name: 'American Express',
    number: '3714 496353 98431',
    expiry: '08/27',
    cvv: '849', // strictly 3 numbers
    brand: 'Amex',
    gradient: 'from-[#1A3344] via-[#2A4D67] to-[#152026]',
    accentColor: '#D4EEF8',
    badge: 'Nations Trust Bank Amex',
  },
];

export const DEMO_DEFAULT_OTP = '849201';

export default function SimulatedPaymentGatewayModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount = 5000,
  itemTitle = 'Advance Registration Fee',
  studentName = 'Student',
  studentNic = '',
  studentBranch = 'Maharagama',
  email = '',
  phone = '',
  onSubmitPayment, // Async callback to execute backend API call
}) {
  // Modal Stages: 'input' | 'otp' | 'processing' | 'receipt'
  const [stage, setStage] = useState('input');

  // Form State
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardHolder, setCardHolder] = useState(studentName || 'LEARNER DRIVER');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [showCvv, setShowCvv] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('Visa');

  // Real-time Validation Errors & Touched States
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Simulation Options
  const [enable3DSecure, setEnable3DSecure] = useState(true);
  const [instantActivation, setInstantActivation] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [otpError, setOtpError] = useState('');

  // Processing State
  const [processStep, setProcessStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Success Receipt State
  const [receiptData, setReceiptData] = useState(null);

  const receiptRef = useRef(null);

  // Auto-detect brand based on card number
  useEffect(() => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) setSelectedCardType('Visa');
    else if (raw.startsWith('5')) setSelectedCardType('Mastercard');
    else if (raw.startsWith('3')) setSelectedCardType('Amex');
    else setSelectedCardType('Visa');
  }, [cardNumber]);

  // Sync cardHolder when studentName changes
  useEffect(() => {
    if (studentName) {
      setCardHolder(studentName.toUpperCase());
    }
  }, [studentName]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (stage === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, otpTimer]);

  if (!isOpen) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    setTouched((prev) => ({ ...prev, cardNumber: true }));

    const res = validateCardNumber(formatted);
    setFieldErrors((prev) => ({ ...prev, cardNumber: res.error }));
  };

  // Format Expiry (MM/YY) & Validate Month/Year on typing
  const handleExpiryChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setExpiry(formatted);
    setTouched((prev) => ({ ...prev, expiry: true }));

    if (formatted.length === 5) {
      const res = validateExpiryDate(formatted);
      setFieldErrors((prev) => ({ ...prev, expiry: res.error }));
    } else if (clean.length >= 2) {
      const m = parseInt(clean.slice(0, 2), 10);
      if (m < 1 || m > 12) {
        setFieldErrors((prev) => ({
          ...prev,
          expiry: 'Invalid month! Month must be between 01 and 12.',
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, expiry: null }));
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, expiry: null }));
    }
  };

  // Handle CVV Change strictly 3 numeric digits
  const handleCvvChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 3); // strictly 3 numbers
    setCvv(clean);
    setTouched((prev) => ({ ...prev, cvv: true }));

    const res = validateCvc(clean);
    setFieldErrors((prev) => ({ ...prev, cvv: res.error }));
  };

  // Handle Cardholder Change
  const handleCardHolderChange = (val) => {
    const upper = val.toUpperCase();
    setCardHolder(upper);
    setTouched((prev) => ({ ...prev, cardHolder: true }));

    const res = validateCardHolder(upper);
    setFieldErrors((prev) => ({ ...prev, cardHolder: res.error }));
  };

  // Preset Card autofill
  const handleSelectPresetCard = (card) => {
    setCardNumber(card.number);
    setExpiry(card.expiry);
    setCvv(card.cvv);
    setSelectedCardType(card.brand);
    setFieldErrors({});
    setTouched({
      cardNumber: true,
      cardHolder: true,
      expiry: true,
      cvv: true,
    });
    toast.success(`${card.name} loaded (3-digit CVC: ${card.cvv})`, { icon: '💳' });
  };

  // Comprehensive Card form validation
  const validateCardForm = () => {
    const numRes = validateCardNumber(cardNumber);
    const holderRes = validateCardHolder(cardHolder);
    const expRes = validateExpiryDate(expiry);
    const cvcRes = validateCvc(cvv);

    const newErrors = {
      cardNumber: numRes.error,
      cardHolder: holderRes.error,
      expiry: expRes.error,
      cvv: cvcRes.error,
    };

    setFieldErrors(newErrors);
    setTouched({
      cardNumber: true,
      cardHolder: true,
      expiry: true,
      cvv: true,
    });

    if (!numRes.valid) {
      toast.error(numRes.error);
      return false;
    }
    if (!holderRes.valid) {
      toast.error(holderRes.error);
      return false;
    }
    if (!expRes.valid) {
      toast.error(expRes.error);
      return false;
    }
    if (!cvcRes.valid) {
      toast.error(cvcRes.error);
      return false;
    }

    return true;
  };

  // Proceed from Card Entry
  const handleProceedToPayment = () => {
    if (!validateCardForm()) return;

    if (enable3DSecure) {
      setStage('otp');
      setOtpTimer(120);
      setOtpCode('');
      setOtpError('');
    } else {
      executeTransaction();
    }
  };

  // Handle OTP submission
  const handleVerifyOtp = () => {
    if (!otpCode.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }
    if (otpCode.trim().length !== 6) {
      setOtpError('OTP must be exactly 6 digits.');
      return;
    }
    setOtpError('');
    executeTransaction();
  };

  // Auto-fill test OTP
  const handleQuickFillOtp = () => {
    setOtpCode(DEMO_DEFAULT_OTP);
    setOtpError('');
    toast.success('Test OTP filled (849201)');
  };

  // Execution: Processing Steps & Backend Call
  const executeTransaction = async () => {
    setStage('processing');
    setSubmitting(true);
    setProcessStep(1); // Connecting to payment gateway

    const rawNumber = cardNumber.replace(/\s/g, '');
    const cardLast4 = rawNumber.slice(-4) || '4242';
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const txRef = `ONPAY-${Date.now().toString().slice(-8)}`;

    try {
      // Realistic simulation steps
      await new Promise((r) => setTimeout(r, 800));
      setProcessStep(2); // Authenticating 3DS security

      await new Promise((r) => setTimeout(r, 900));
      setProcessStep(3); // Capturing funds & issuing receipt

      // Call external submission handler provided by parent
      let backendResult = null;
      if (onSubmitPayment) {
        backendResult = await onSubmitPayment({
          cardLast4,
          cardBrand: selectedCardType,
          cardHolder: cardHolder.toUpperCase(),
          transactionReference: txRef,
          authCode,
          receiptNumber,
          autoVerify: instantActivation,
          amount,
        });
      }

      await new Promise((r) => setTimeout(r, 500));

      const finalReceipt = {
        receiptNumber: backendResult?.receiptNumber || receiptNumber,
        transactionReference: backendResult?.payment?.transactionReference || txRef,
        authCode: backendResult?.authCode || authCode,
        amount: Number(amount),
        itemTitle,
        studentName: studentName || cardHolder,
        studentNic,
        studentBranch,
        cardBrand: selectedCardType,
        cardLast4,
        date: new Date().toISOString(),
        status: instantActivation ? 'PAID & VERIFIED' : 'PENDING STAFF VERIFICATION',
        instantActivation,
      };

      setReceiptData(finalReceipt);
      setStage('receipt');

      if (onPaymentSuccess) {
        onPaymentSuccess(finalReceipt, backendResult);
      }
      toast.success('🎉 Payment authorized successfully!');
    } catch (err) {
      console.error('Payment simulation error:', err);
      toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
      setStage('input');
    } finally {
      setSubmitting(false);
    }
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Format seconds to mm:ss
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#152026]/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl overflow-hidden my-auto animate-fade-in text-[#152026]">

        {/* ── Top Header Strip ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#B3D5F1] shadow-xs">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Sithma Pay</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-[#F3EED8]/60">
                  Secure Gateway
                </span>
              </div>
              <p className="text-[11px] text-[#B3D5F1] flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL Encrypted • Strict Card Validation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-[#D4EEF8]/80 font-bold uppercase">Total Due</p>
              <p className="text-base font-black text-white tracking-wide">
                Rs. {Number(amount).toLocaleString()}.00
              </p>
            </div>
            {stage !== 'processing' && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-2 cursor-pointer"
                title="Close Gateway"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Sub-header: Item Summary & Amount ────────────────────────────── */}
        <div className="bg-[#FAFCFE] border-b border-[#D4EEF8] px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#152026] font-semibold">
            <span className="text-[#6A97C0]">Paying for:</span>
            <span className="font-extrabold text-[#1B3D59]">{itemTitle}</span>
            {studentBranch && (
              <span className="text-[#6A97C0]">({studentBranch} Branch)</span>
            )}
          </div>
          <div className="sm:hidden font-black text-sm text-[#1B3D59]">
            Rs. {Number(amount).toLocaleString()}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STAGE 1: CARD ENTRY & STRICT VALIDATION INPUTS                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {stage === 'input' && (
          <div className="p-5 sm:p-7 space-y-6">

            {/* Visual Credit Card Preview */}
            <div className="relative mx-auto max-w-sm sm:max-w-md h-48 sm:h-52 rounded-2xl p-5 text-white shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-tr from-[#1B3D59] via-[#152026] to-[#0D253A] border border-white/15">
              {/* Card Hologram / Background Accents */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#B3D5F1]/10 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Top strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black tracking-widest text-[#D4EEF8] uppercase">
                      SITHMA DRIVING SCHOOL
                    </span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-[11px] font-black tracking-wider text-white border border-white/20">
                    {selectedCardType.toUpperCase()}
                  </div>
                </div>

                {/* EMV Chip & Contactless */}
                <div className="flex items-center gap-3 my-1">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-8 h-5 border border-amber-800/40 rounded-[3px] opacity-70" />
                  </div>
                  <div className="text-white/60 text-xs font-mono">
                    <BadgeCheck className="w-4 h-4 text-[#B3D5F1]" />
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <p className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow-sm select-all">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>

                {/* Footer: Cardholder & Expiry */}
                <div className="flex items-end justify-between text-xs pt-1">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#D4EEF8]/70 font-semibold">CARDHOLDER</p>
                    <p className="font-extrabold uppercase text-white truncate max-w-[200px] tracking-wide">
                      {cardHolder || studentName || 'LEARNER DRIVER'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-[#D4EEF8]/70 font-semibold">EXPIRES</p>
                    <p className="font-mono font-extrabold text-white tracking-wider">
                      {expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Card Quick Selectors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Quick Test Cards (Click to Fill):
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-300">
                  Strict Validation Ready
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_TEST_CARDS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectPresetCard(c)}
                    className="p-2.5 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] hover:bg-[#D4EEF8]/40 hover:border-[#1B3D59] text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#152026] group-hover:text-[#1B3D59]">{c.brand}</span>
                      <span className="text-[10px] font-mono text-[#6A97C0] font-bold">CVC: {c.cvv}</span>
                    </div>
                    <p className="text-[10px] text-[#6A97C0] truncate mt-0.5 font-medium">Exp: {c.expiry} • {c.badge}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Form Inputs with Live Validation Feedback */}
            <div className="space-y-4 text-xs">
              {/* Card Number */}
              <div>
                <label className="block font-bold text-[#152026] mb-1.5">
                  Card Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    maxLength={19}
                    className={`w-full px-4 py-3 bg-[#FAFCFE] border text-[#152026] font-mono font-bold text-sm rounded-xl outline-none pr-12 shadow-xs transition-colors ${
                      touched.cardNumber && fieldErrors.cardNumber
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : touched.cardNumber && !fieldErrors.cardNumber
                        ? 'border-emerald-500 focus:border-emerald-600'
                        : 'border-[#D4EEF8] focus:border-[#1B3D59]'
                    }`}
                  />
                  <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A97C0]" />
                </div>
                {touched.cardNumber && fieldErrors.cardNumber && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.cardNumber}
                  </p>
                )}
                {touched.cardNumber && !fieldErrors.cardNumber && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3 flex-shrink-0" /> 16-digit card verified ({selectedCardType})
                  </p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block font-bold text-[#152026] mb-1.5">
                  Cardholder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => handleCardHolderChange(e.target.value)}
                  placeholder="e.g. HIRUNI DISSANAYAKE"
                  className={`w-full px-4 py-3 bg-[#FAFCFE] border text-[#152026] font-bold text-sm rounded-xl outline-none uppercase shadow-xs transition-colors ${
                    touched.cardHolder && fieldErrors.cardHolder
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                      : 'border-[#D4EEF8] focus:border-[#1B3D59]'
                  }`}
                />
                {touched.cardHolder && fieldErrors.cardHolder && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.cardHolder}
                  </p>
                )}
              </div>

              {/* Expiry Date & CVC Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Expiry Date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-[#152026]">
                      Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#6A97C0] font-bold">MM/YY (Future)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-4 py-3 bg-[#FAFCFE] border text-[#152026] font-mono font-bold text-sm rounded-xl outline-none shadow-xs transition-colors pr-10 ${
                        touched.expiry && fieldErrors.expiry
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : touched.expiry && !fieldErrors.expiry && expiry.length === 5
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-[#D4EEF8] focus:border-[#1B3D59]'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A97C0]" />
                  </div>
                  {touched.expiry && fieldErrors.expiry && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-start gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{fieldErrors.expiry}</span>
                    </p>
                  )}
                  {touched.expiry && !fieldErrors.expiry && expiry.length === 5 && (
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3 flex-shrink-0" /> Valid future expiry date
                    </p>
                  )}
                </div>

                {/* CVV / CVC (Strictly 3 Numbers) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-[#152026]">
                      CVV / CVC <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-300">
                        Exact 3 Digits
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="text-[10px] text-[#1B3D59] hover:underline cursor-pointer font-bold"
                      >
                        {showCvv ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      value={cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      placeholder="123"
                      maxLength={3} // STRICTLY 3 DIGITS
                      className={`w-full px-4 py-3 bg-[#FAFCFE] border text-[#152026] font-mono font-bold text-sm rounded-xl outline-none shadow-xs transition-colors pr-10 ${
                        touched.cvv && fieldErrors.cvv
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : touched.cvv && !fieldErrors.cvv && cvv.length === 3
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-[#D4EEF8] focus:border-[#1B3D59]'
                      }`}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A97C0]" />
                  </div>
                  {touched.cvv && fieldErrors.cvv && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {fieldErrors.cvv}
                    </p>
                  )}
                  {touched.cvv && !fieldErrors.cvv && cvv.length === 3 && (
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3 flex-shrink-0" /> 3-digit CVC verified
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* University Demo Controls */}
            <div className="rounded-2xl p-4 bg-[#F3EED8] border border-[#6A97C0]/40 space-y-2 text-xs">
              <p className="font-extrabold text-[#152026] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> University Evaluation Configuration:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#152026]">
                  <input
                    type="checkbox"
                    checked={enable3DSecure}
                    onChange={(e) => setEnable3DSecure(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B3D59] focus:ring-[#1B3D59] cursor-pointer"
                  />
                  <span>Simulate 3D Secure Bank OTP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#152026]">
                  <input
                    type="checkbox"
                    checked={instantActivation}
                    onChange={(e) => setInstantActivation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B3D59] focus:ring-[#1B3D59] cursor-pointer"
                  />
                  <span>Auto-Activate Account Instantly</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4 text-white" />
                Pay Rs. {Number(amount).toLocaleString()}.00 Securely
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-[#6A97C0] hover:text-[#152026] cursor-pointer transition-colors"
              >
                Cancel and return
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STAGE 2: 3D SECURE BANK OTP VERIFICATION MODAL                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {stage === 'otp' && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in text-center">
            {/* Bank Header Aesthetic */}
            <div className="w-16 h-16 rounded-2xl bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] mx-auto flex items-center justify-center shadow-xs">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified by {selectedCardType} SecurePass
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#152026]">
                Bank OTP Verification
              </h3>
              <p className="text-xs text-[#6A97C0] leading-relaxed font-medium">
                A 6-digit One-Time Password (OTP) has been sent to your registered mobile ending in <strong className="text-[#152026]">••48</strong>.
              </p>
            </div>

            {/* Transaction Brief */}
            <div className="bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl p-4 text-xs space-y-2 max-w-md mx-auto text-left">
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Merchant:</span>
                <span className="font-bold text-[#152026]">Sithma Driving School (Pvt) Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Card Number:</span>
                <span className="font-mono font-bold text-[#152026]">•••• •••• •••• {cardNumber.replace(/\s/g, '').slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0]">Amount:</span>
                <span className="font-black text-emerald-700 text-sm">Rs. {Number(amount).toLocaleString()}.00 LKR</span>
              </div>
            </div>

            {/* Demo Helper Button */}
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleQuickFillOtp}
                className="w-full py-2 px-3 rounded-xl bg-[#F3EED8] hover:bg-[#eae3c4] border border-[#6A97C0]/40 text-[#152026] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" />
                Demo Mode: Click to auto-fill OTP (<span className="font-mono font-black">{DEMO_DEFAULT_OTP}</span>)
              </button>
            </div>

            {/* OTP Input Field */}
            <div className="max-w-xs mx-auto space-y-2">
              <label className="block text-xs font-extrabold text-[#152026]">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                maxLength={6}
                placeholder="• • • • • •"
                autoFocus
                className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 rounded-xl border-2 border-[#1B3D59] bg-white text-[#152026] outline-none shadow-md"
              />
              {otpError && (
                <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {otpError}
                </p>
              )}
            </div>

            {/* Timer & Resend */}
            <div className="text-xs text-[#6A97C0] flex items-center justify-center gap-2 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires in <strong className="text-[#152026] font-mono">{formatTimer(otpTimer)}</strong></span>
              {otpTimer === 0 && (
                <button
                  type="button"
                  onClick={() => setOtpTimer(120)}
                  className="text-[#1B3D59] underline font-bold ml-2 cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="max-w-md mx-auto space-y-2 pt-2">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Submit & Authorize Payment
              </button>
              <button
                type="button"
                onClick={() => setStage('input')}
                className="w-full py-2 text-xs font-bold text-[#6A97C0] hover:text-[#152026] cursor-pointer"
              >
                Back to Card Details
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STAGE 3: PROCESSING SIMULATION SPINNER                            */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {stage === 'processing' && (
          <div className="py-20 px-6 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full border-4 border-[#D4EEF8] border-t-[#1B3D59] animate-spin mx-auto" />

            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#152026]">
                Processing Secure Transaction...
              </h3>
              <p className="text-xs text-[#6A97C0]">
                Please do not close or refresh this window while we communicate with your issuing bank.
              </p>
            </div>

            {/* Multi-step progress items */}
            <div className="max-w-xs mx-auto space-y-2.5 text-xs text-left pt-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>1. Card verification completed</span>
              </div>
              <div className={`flex items-center gap-2 font-bold ${processStep >= 2 ? 'text-emerald-700' : 'text-[#6A97C0]'}`}>
                {processStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59] flex-shrink-0" />
                )}
                <span>2. 3D Secure OTP authentication approved</span>
              </div>
              <div className={`flex items-center gap-2 font-bold ${processStep >= 3 ? 'text-emerald-700' : 'text-[#6A97C0]'}`}>
                {processStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <span>3. Issuing official payment receipt...</span>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STAGE 4: SUCCESS CONFIRMATION & OFFICIAL PRINTABLE RECEIPT        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {stage === 'receipt' && receiptData && (
          <div className="p-5 sm:p-7 space-y-6 animate-fade-in">
            {/* Success Icon & Notice */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                Payment Authorized Successfully
              </span>
              <h2 className="text-2xl font-black text-[#152026]">
                {receiptData.instantActivation ? 'Account Activated!' : 'Payment Captured!'}
              </h2>
              <p className="text-xs text-[#6A97C0] max-w-sm mx-auto font-medium">
                {receiptData.instantActivation
                  ? 'Your advance payment has been confirmed by the 3DS Gateway and your student profile is now verified.'
                  : 'Your payment was successfully submitted and placed into the officer verification queue.'}
              </p>
            </div>

            {/* Official Sithma Printable Receipt Voucher */}
            <div
              ref={receiptRef}
              id="printable-payment-receipt"
              className="p-6 rounded-2xl bg-white border-2 border-[#1B3D59]/20 shadow-md space-y-4 text-xs text-[#152026]"
            >
              {/* Receipt Header */}
              <div className="border-b border-[#D4EEF8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-[#1B3D59] uppercase tracking-wide">
                    Sithma Driving School (Pvt) Ltd
                  </h4>
                  <p className="text-[11px] text-[#6A97C0] font-medium">
                    {studentBranch} Branch • Tel: 011-2849201 • Sri Lanka
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="font-mono font-black text-xs text-[#152026] bg-[#D4EEF8]/60 px-2.5 py-1 rounded-md border border-[#B3D5F1]">
                    {receiptData.receiptNumber}
                  </span>
                  <p className="text-[10px] text-[#6A97C0] mt-1 font-medium">
                    {new Date(receiptData.date).toLocaleDateString()} • {new Date(receiptData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Student Name:</p>
                  <p className="font-bold text-[#152026]">{receiptData.studentName}</p>
                </div>
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Payment Purpose:</p>
                  <p className="font-bold text-[#1B3D59]">{receiptData.itemTitle}</p>
                </div>
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Transaction Ref:</p>
                  <p className="font-mono font-bold text-[#152026]">{receiptData.transactionReference}</p>
                </div>
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Auth Code:</p>
                  <p className="font-mono font-bold text-[#152026]">{receiptData.authCode}</p>
                </div>
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Payment Channel:</p>
                  <p className="font-bold text-[#152026]">
                    {receiptData.cardBrand} •••• {receiptData.cardLast4} (3DS)
                  </p>
                </div>
                <div>
                  <p className="text-[#6A97C0] text-[11px] font-medium">Amount Paid:</p>
                  <p className="font-black text-emerald-700 text-sm">
                    Rs. {receiptData.amount.toLocaleString()}.00 LKR
                  </p>
                </div>
              </div>

              {/* Digital Stamp / Verification Footer */}
              <div className="pt-3 border-t border-[#D4EEF8] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Authorized & Stored</span>
                </div>
                <span className="text-[#6A97C0] font-mono text-[10px]">
                  ID: {receiptData.authCode}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="py-3 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] hover:bg-[#D4EEF8]/40 text-[#152026] font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-[#1B3D59]" />
                Print / Download PDF Receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-[#1B3D59] hover:bg-[#152026] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                Done & Continue <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
