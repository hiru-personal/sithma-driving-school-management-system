import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DmtMilestoneTimeline from '../components/DmtMilestoneTimeline';
import api from '../api/axios';
import {
  Car,
  Calendar,
  CreditCard,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  FileCheck,
  DollarSign,
  FileText,
  Stethoscope,
  Lock,
  ShieldAlert,
  PlusCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Package as PackageIcon,
  AlertTriangle,
  Building,
  Building2,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  X,
  Upload,
  Landmark,
  Copy,
  Check,
  Eye,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { SITHMA_OFFICIAL_BANKS } from './PaymentGatewayPage';

// Official Sithma branch contact & location metadata
const SITHMA_BRANCHES = {
  Maharagama: {
    address: 'High Level Road, Maharagama',
    phone: '011-2849201',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
  },
  Werahara: {
    address: 'Near DMT Central Office, Werahara',
    phone: '011-2518492',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
  },
  Delgoda: {
    address: 'Main Street, Delgoda',
    phone: '011-2974820',
    hours: 'Mon–Sat: 8:00 AM – 5:00 PM',
  },
};

// Sithma 3-installment breakdown calculation: "First pay big amount, finally small amount"
export const getInstallments = (pkgPrice) => {
  const p = Number(pkgPrice) || 40000;
  if (p === 65000) {
    return [
      { num: 1, amount: 25000, lessons: 5, label: '1st Month (Big Amount)' },
      { num: 2, amount: 25000, lessons: 5, label: '2nd Month' },
      { num: 3, amount: 15000, lessons: 5, label: '3rd Month (Final Small Amount)' },
    ];
  }
  if (p === 70000) {
    return [
      { num: 1, amount: 30000, lessons: 5, label: '1st Month (Big Amount)' },
      { num: 2, amount: 25000, lessons: 5, label: '2nd Month' },
      { num: 3, amount: 15000, lessons: 5, label: '3rd Month (Final Small Amount)' },
    ];
  }
  if (p === 40000) {
    return [
      { num: 1, amount: 15000, lessons: 5, label: '1st Month (Initial Amount)' },
      { num: 2, amount: 15000, lessons: 5, label: '2nd Month' },
      { num: 3, amount: 10000, lessons: 5, label: '3rd Month (Final Small Amount)' },
    ];
  }
  const i1 = Math.round((p * 0.375) / 1000) * 1000;
  const i2 = Math.round((p * 0.375) / 1000) * 1000;
  const i3 = p - i1 - i2;
  return [
    { num: 1, amount: i1, lessons: 5, label: '1st Month' },
    { num: 2, amount: i2, lessons: 5, label: '2nd Month' },
    { num: 3, amount: i3, lessons: 5, label: '3rd Month' },
  ];
};

// Fallback catalog matching curriculum
const FALLBACK_PACKAGES = [
  // Group C: Full Course Packages
  { _id: 'pkg_car_full', name: 'Car Package (Auto Car OR Manual Car)', type: 'Car_Full', categoryGroup: 'C', lessons: 15, price: 40000, isPerLesson: false, bonusLessons: { bike: 2, threeWheeler: 2 }, notes: 'Includes 15 standard lessons + 2 FREE Bike lessons + 2 FREE Three-Wheel lessons bonus.' },
  { _id: 'pkg_combo_full', name: 'Combo Package (Car + Bike + Three-Wheel)', type: 'Combo_Full', categoryGroup: 'C', lessons: 15, price: 65000, isPerLesson: false, bonusLessons: { bike: 0, threeWheeler: 0 }, notes: 'Full access to 15 standard lessons across all three categories.' },
  { _id: 'pkg_heavy_full', name: 'Heavy Vehicle Full Package', type: 'HeavyVehicle_Full', categoryGroup: 'C', lessons: 15, price: 70000, isPerLesson: false, bonusLessons: { bike: 0, threeWheeler: 0 }, notes: 'Includes 15 standard heavy vehicle training lessons.' },
  // Group B: Standard Single Lessons
  { _id: 'pkg_bike_std', name: 'Bike (Standard Single Lesson)', type: 'Bike_Standard', categoryGroup: 'B', lessons: 1, price: 800, isPerLesson: true, notes: 'Standard single lesson. LKR 800 / lesson.' },
  { _id: 'pkg_three_std', name: 'Three-Wheel (Standard Single Lesson)', type: 'ThreeWheeler_Standard', categoryGroup: 'B', lessons: 1, price: 1500, isPerLesson: true, notes: 'Standard single lesson. LKR 1,500 / lesson.' },
  { _id: 'pkg_car_std', name: 'Car (Standard Single Lesson)', type: 'Car_Standard', categoryGroup: 'B', lessons: 1, price: 2000, isPerLesson: true, notes: 'Car standard single lesson (Auto/Manual). LKR 2,000 / lesson.' },
  { _id: 'pkg_heavy_std', name: 'Heavy Vehicle (Standard Single Lesson)', type: 'HeavyVehicle_Standard', categoryGroup: 'B', lessons: 1, price: 2500, isPerLesson: true, notes: 'Heavy Vehicle standard single lesson. LKR 2,500 / lesson.' },
  // Group A: Individual / Private Single Lessons
  { _id: 'pkg_bike_ind', name: 'Bike (Individual / Private)', type: 'Bike_Individual', categoryGroup: 'A', lessons: 1, price: 2000, isPerLesson: true, notes: 'Individual / Private single lesson. LKR 2,000 / lesson.' },
  { _id: 'pkg_three_ind', name: 'Three-Wheel (Individual / Private)', type: 'ThreeWheeler_Individual', categoryGroup: 'A', lessons: 1, price: 2500, isPerLesson: true, notes: 'Individual / Private single lesson. LKR 2,500 / lesson.' },
  { _id: 'pkg_car_ind', name: 'Car (Auto / Manual — Individual / Private)', type: 'Car_Individual', categoryGroup: 'A', lessons: 1, price: 3000, isPerLesson: true, notes: 'Car (Auto / Manual) individual private lesson. LKR 3,000 / lesson.' },
  { _id: 'pkg_heavy_ind', name: 'Heavy Vehicle (Individual / Private)', type: 'HeavyVehicle_Individual', categoryGroup: 'A', lessons: 1, price: 3500, isPerLesson: true, notes: 'Heavy Vehicle individual private lesson. LKR 3,500 / lesson.' },
];

export default function StudentDashboard() {
  const { user, student, updateStudentData } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(student);
  const [loading, setLoading] = useState(!student);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Celebratory modal for newly verified student
  const [showVerifiedCelebrationModal, setShowVerifiedCelebrationModal] = useState(false);

  // Exam Result Modal State (Type 1 - max 3 attempts)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [submittingExamResult, setSubmittingExamResult] = useState(false);
  const [examForm, setExamForm] = useState({
    result: 'passed',
    marks: '',
    examDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Toggling milestone progress (Registration Done / Medical Done)
  const [togglingMilestone, setTogglingMilestone] = useState(false);

  // Re-registration after 3 failed attempts
  const [reRegistering, setReRegistering] = useState(false);

  // Dynamic Packages & Payment States (Groups A, B, C & 3 Installments / Single Lesson)
  const [availablePackages, setAvailablePackages] = useState(FALLBACK_PACKAGES);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('C');
  const [selectedPkgId, setSelectedPkgId] = useState('pkg_car_full');
  const [selectedPlan, setSelectedPlan] = useState('full'); // 'full' | 'installments' | 'single'
  const [activePaymentMethod, setActivePaymentMethod] = useState('slip'); // 'slip' | 'online' | 'physical'
  const [selectedBankId, setSelectedBankId] = useState('BOC');
  const [bankName, setBankName] = useState('Bank of Ceylon (BOC)');
  const [slipRef, setSlipRef] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '4532 8921 4421 9012',
    cardHolder: '',
    expDate: '08/28',
    cvv: '882',
  });
  const [cardProcessing, setCardProcessing] = useState(false);
  const [submittingPkgPayment, setSubmittingPkgPayment] = useState(false);
  const [showPaymentFormOverride, setShowPaymentFormOverride] = useState(false);

  // Edit Profile Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    nic: '',
    branch: 'Maharagama',
    studentType: 'Type1_NewLearner',
    packageId: '',
  });

  // DMT Milestone Dates Update Modal (For Type 1 student milestone tracking)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    medicalExamDate: '',
    learnerRegistrationDate: '',
    learnerExamDate: '',
  });

  const openMilestoneModal = () => {
    setMilestoneForm({
      medicalExamDate: profile?.dmtDates?.medicalExamDate ? profile.dmtDates.medicalExamDate.split('T')[0] : '',
      learnerRegistrationDate: profile?.dmtDates?.learnerRegistrationDate ? profile.dmtDates.learnerRegistrationDate.split('T')[0] : '',
      learnerExamDate: profile?.dmtDates?.learnerExamDate ? profile.dmtDates.learnerExamDate.split('T')[0] : '',
    });
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestones = async (e) => {
    e.preventDefault();
    setSavingMilestones(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        medicalExamDate: milestoneForm.medicalExamDate || null,
        learnerRegistrationDate: milestoneForm.learnerRegistrationDate || null,
        learnerExamDate: milestoneForm.learnerExamDate || null,
      });
      if (res.data.success) {
        toast.success('DMT milestone dates updated successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setIsMilestoneModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update milestone dates');
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleToggleMilestone = async (field, currentValue) => {
    setTogglingMilestone(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        [field]: !currentValue,
      });
      if (res.data.success) {
        toast.success(
          !currentValue
            ? `✓ ${field === 'registrationDone' ? 'DMT Registration' : 'DMT Medical'} marked as completed!`
            : 'Status updated.'
        );
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update milestone progress');
    } finally {
      setTogglingMilestone(false);
    }
  };

  const handleSaveExamResult = async (e) => {
    e.preventDefault();
    if (examForm.marks === '' || examForm.marks === null) {
      toast.error('Please enter marks scored in the examination');
      return;
    }
    setSubmittingExamResult(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.post(`/students/${studentId}/exam-attempt`, {
        result: examForm.result,
        marks: Number(examForm.marks),
        examDate: examForm.examDate,
        notes: examForm.notes,
      });
      if (res.data.success) {
        if (res.data.isAutoCancelled) {
          toast.error('⚠️ Maximum 3 failed attempts reached. Registration has been cancelled.');
        } else if (examForm.result === 'passed') {
          toast.success(`🎉 Congratulations! Passed with ${examForm.marks} marks. Practical lessons unlocked!`);
        } else {
          toast(`⚠️ Exam attempt recorded as failed. ${res.data.attemptsRemaining} attempt(s) remaining.`, {
            icon: '⚠️',
          });
        }
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setIsExamModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record exam attempt');
    } finally {
      setSubmittingExamResult(false);
    }
  };

  const handleReRegister = async () => {
    if (
      !window.confirm(
        'Are you sure you want to re-register as a new learner? This will reset your exam attempts and require re-paying the Rs. 5,000 advance fee.'
      )
    ) {
      return;
    }
    setReRegistering(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.post(`/students/${studentId}/re-register`);
      if (res.data.success) {
        toast.success('Re-registration initiated! Please submit your advance deposit to continue.');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        navigate('/payment-gateway', {
          state: {
            studentName: user?.name,
            studentId: profile?._id,
            userId: user?.id || user?._id,
            branch: profile?.branch || user?.branch,
            amount: 5000,
            paymentType: 'advance',
            studentType: profile?.studentType || 'Type 1',
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize re-registration');
    } finally {
      setReRegistering(false);
    }
  };

  const openEditModal = () => {
    const currentPkgId =
      profile?.package?.packageId?._id ||
      profile?.package?.packageId ||
      availablePackages.find((p) => p.type === profile?.package?.type)?._id ||
      (availablePackages.length > 0 ? availablePackages[0]._id : '');

    setEditForm({
      name: user?.name || profile?.name || '',
      phone: user?.phone || profile?.phone || '',
      email: user?.email || '',
      nic: profile?.nic || user?.nic || '',
      branch: profile?.branch || user?.branch || 'Maharagama',
      studentType: profile?.studentType || 'Type1_NewLearner',
      packageId: currentPkgId,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!editForm.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setSavingDetails(true);
    try {
      const studentId = profile?._id || student?._id;
      const isType2Student = Boolean(
        editForm.studentType?.includes('Type2') || editForm.studentType === 'Type 2'
      );
      const payload = { ...editForm };
      if (!isType2Student) {
        // Type 1 students do not select a vehicle package at the registration stage
        delete payload.packageId;
        delete payload.packageType;
      }
      const res = await api.patch(`/students/${studentId}/profile`, payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Details updated successfully!');
        setProfile(res.data.student);
        updateStudentData(res.data.student, res.data.user);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingDetails(false);
    }
  };

  const fetchProfile = async (showToast = false) => {
    if (showToast) setCheckingStatus(true);
    try {
      const targetId = profile?._id || student?._id;
      if (targetId) {
        const res = await api.get(`/students/${targetId}`);
        if (res.data.success) {
          const st = res.data.student;
          setProfile(st);
          updateStudentData(st, res.data.user);

          const isNowVerified = Boolean(
            st?.isAdvancePaid === true ||
            st?.advancePaymentStatus === 'verified' ||
            st?.accountStatus === 'active' ||
            st?.account_status === 'Verified'
          );

          if (isNowVerified && !localStorage.getItem('seen_verified_modal_' + st._id)) {
            setShowVerifiedCelebrationModal(true);
          } else if (showToast) {
            if (isNowVerified) {
              toast.success('🎉 Account verified! Your student dashboard is active.');
            } else {
              toast('⏳ Payment is still pending officer verification. Please check back shortly.', {
                icon: 'ℹ️',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      if (showToast) toast.error('Could not refresh verification status. Please try again.');
    } finally {
      setLoading(false);
      if (showToast) setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Load dynamic packages (US-13, US-14)
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages && res.data.packages.length > 0) {
        setAvailablePackages(res.data.packages);
        const preferredPkg = res.data.packages.find((p) => p.type === 'Car_Full') || res.data.packages[0];
        if (preferredPkg) setSelectedPkgId(preferredPkg._id);
      }
    }).catch(() => {});
  }, []);

  const handleSelectBank = (b) => {
    setSelectedBankId(b.id);
    setBankName(b.name);
  };

  const handleCopyAcc = (accNo) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(accNo);
      setCopiedBankAcc(true);
      toast.success('Account number copied to clipboard!');
      setTimeout(() => setCopiedBankAcc(false), 2000);
    }
  };

  const handleSlipFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please upload an image file (PNG, JPG) or PDF document');
        return;
      }
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setSlipPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSlip = () => {
    setSlipFile(null);
    setSlipPreview(null);
  };

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardForm({ ...cardForm, cardNumber: formatted });
  };

  const handlePackagePaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    const selectedPkg = availablePackages.find((p) => p._id === selectedPkgId) || availablePackages[0];
    if (!selectedPkg) {
      toast.error('Please select a course package first.');
      return;
    }

    const isGroupC = selectedPkg.categoryGroup === 'C' || !selectedPkg.isPerLesson;
    const finalPlan = isGroupC ? selectedPlan : 'single';
    const currentInstDue = Math.min(3, (profile?.installmentsPaidCount || 0) + 1);
    const instList = getInstallments(selectedPkg.price);

    let payAmount = selectedPkg.price;
    if (finalPlan === 'installments') {
      payAmount = instList[currentInstDue - 1]?.amount || 15000;
    } else if (finalPlan === 'single') {
      payAmount = selectedPkg.price;
    }

    if (activePaymentMethod === 'slip') {
      if (!slipFile) {
        toast.error('Please upload your payment slip or transfer screenshot');
        return;
      }
      setSubmittingPkgPayment(true);
      try {
        const formData = new FormData();
        formData.append('packageId', selectedPkg._id);
        formData.append('packageType', selectedPkg.type);
        formData.append('paymentPlan', finalPlan);
        if (finalPlan === 'installments') {
          formData.append('installmentNumber', currentInstDue);
        }
        formData.append('amount', payAmount);
        formData.append('paymentMethod', 'bank_slip');
        formData.append('bankName', bankName);
        formData.append('transactionReference', `SLIP-${Date.now().toString().slice(-6)}`);
        if (slipFile) {
          formData.append('slipImage', slipFile);
        }

        const res = await api.post('/payments/package-payment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success) {
          toast.success(res.data.message || 'Payment slip uploaded! Awaiting officer verification.');
          setProfile(res.data.student);
          updateStudentData(res.data.student);
          setSlipFile(null);
          setSlipPreview(null);
          setSlipRef('');
          setShowPaymentFormOverride(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit package payment');
      } finally {
        setSubmittingPkgPayment(false);
      }
    } else if (activePaymentMethod === 'online') {
      if (!cardForm.cardHolder.trim()) {
        toast.error('Please enter the cardholder name');
        return;
      }
      const rawCard = cardForm.cardNumber.replace(/\s+/g, '');
      if (rawCard.length < 15) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardForm.expDate.trim() || !cardForm.cvv.trim()) {
        toast.error('Please complete the card expiry and CVV');
        return;
      }

      setCardProcessing(true);
      setSubmittingPkgPayment(true);
      try {
        await new Promise((r) => setTimeout(r, 1200));

        const res = await api.post('/payments/package-payment', {
          packageId: selectedPkg._id,
          packageType: selectedPkg.type,
          paymentPlan: finalPlan,
          installmentNumber: finalPlan === 'installments' ? currentInstDue : undefined,
          amount: payAmount,
          paymentMethod: 'online_gateway',
          bankName: 'Online Payment Gateway (Visa/Mastercard)',
          transactionReference: `CARD-PKG-${Date.now()}`,
        });

        if (res.data?.success) {
          toast.success('🎉 Card payment approved! Your lessons are unlocked for booking immediately!');
          setProfile(res.data.student);
          updateStudentData(res.data.student);
          setShowPaymentFormOverride(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Card payment processing failed');
      } finally {
        setCardProcessing(false);
        setSubmittingPkgPayment(false);
      }
    } else if (activePaymentMethod === 'physical') {
      setSubmittingPkgPayment(true);
      try {
        const studentBranch = profile?.branch || user?.branch || 'Maharagama';
        const cashCode = `CASH-PKG-${studentBranch.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
        const res = await api.post('/payments/package-payment', {
          packageId: selectedPkg._id,
          packageType: selectedPkg.type,
          paymentPlan: finalPlan,
          installmentNumber: finalPlan === 'installments' ? currentInstDue : undefined,
          amount: payAmount,
          paymentMethod: 'physical_branch',
          bankName: `Physical Cash Deposit - ${studentBranch} Branch`,
          transactionReference: cashCode,
        });

        if (res.data?.success) {
          toast.success('In-person cash payment intent registered! Please visit the counter to pay.');
          setProfile(res.data.student);
          updateStudentData(res.data.student);
          setShowPaymentFormOverride(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to register branch cash payment intent');
      } finally {
        setSubmittingPkgPayment(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300 font-bold text-sm bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading Student Dashboard...
        </div>
      </div>
    );
  }

  const pkg = profile?.package || {
    type: 'Car_Full',
    lessonsTotal: 15,
    lessonsUsed: 0,
    priceTotal: 45000,
    bonusLessons: { bike: 2, threeWheeler: 2 },
  };

  const unlockedLessons = profile?.lessonsUnlocked !== undefined && profile?.lessonsUnlocked !== null
    ? profile.lessonsUnlocked
    : (pkg.lessonsTotal || 15);
  const usedLessons = profile?.lessonsUsed || pkg.lessonsUsed || 0;
  const remainingLessons = Math.max(0, unlockedLessons - usedLessons);

  const progressPercent = unlockedLessons > 0
    ? Math.min(Math.round((usedLessons / unlockedLessons) * 100), 100)
    : 0;

  const isType1 = Boolean(
    profile?.studentType === 'Type1_NewLearner' ||
    profile?.studentType === 'Type 1' ||
    profile?.student_type === 'Type 1' ||
    user?.studentType === 'Type 1' ||
    user?.studentType === 'Type1_NewLearner' ||
    user?.student_type === 'Type 1'
  );
  const isType2 = Boolean(
    profile?.studentType === 'Type2_TrialReady' ||
    profile?.studentType === 'Type 2' ||
    profile?.student_type === 'Type 2' ||
    user?.studentType === 'Type 2' ||
    user?.student_type === 'Type 2'
  );
  const isExamPassed = Boolean(
    profile?.learnerExamStatus === 'passed' ||
    profile?.dmtDates?.learnerExamPassed
  );
  const isTrialEligible = Boolean(isType2 || isExamPassed);

  const isCancelled = Boolean(
    profile?.registrationStatus === 'cancelled' ||
    profile?.accountStatus === 'cancelled' ||
    profile?.account_status === 'Cancelled'
  );

  const isVerifiedAccount = Boolean(
    !isCancelled && (
      profile?.isAdvancePaid === true ||
      profile?.advancePaymentStatus === 'verified' ||
      profile?.accountStatus === 'active' ||
      profile?.account_status === 'Verified' ||
      user?.account_status === 'Verified' ||
      user?.status === 'active'
    )
  );

  const isAdvancePaymentPending = Boolean(!isCancelled && !isVerifiedAccount);

  const attemptsCount =
    profile?.learnerExamAttempts?.length ||
    profile?.learnerExamAttemptsCount ||
    (profile?.learnerExamStatus === 'passed' ? 1 : profile?.learnerExamStatus === 'failed' ? 1 : 0);
  const remainingAttempts = Math.max(0, 3 - attemptsCount);

  const paymentMethod =
    profile?.payment_method ||
    profile?.paymentMethod ||
    user?.payment_method ||
    'bank_slip';
  const isPhysicalCash = paymentMethod === 'physical_branch';

  const isPackagePaymentPending = profile?.packagePaymentStatus === 'pending';
  const isPackagePaymentConfirmed = profile?.packagePaymentStatus === 'confirmed';
  const hasUnfinishedInstallments = Boolean(
    isPackagePaymentConfirmed &&
    profile?.paymentPlan === 'installments' &&
    (profile?.installmentsPaidCount || 0) < 3
  );
  const hasCompletedSingleLesson = Boolean(
    isPackagePaymentConfirmed &&
    profile?.paymentPlan === 'single' &&
    (profile?.lessonsUnlocked || 0) <= (profile?.lessonsUsed || 0)
  );
  const showPackagePaymentBanner =
    (!isPackagePaymentConfirmed || hasUnfinishedInstallments || hasCompletedSingleLesson || showPaymentFormOverride) &&
    (isType2 || (isType1 && isTrialEligible));


  const renderEditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="card max-w-lg w-full p-6 sm:p-8 bg-slate-900/95 border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-6 relative rounded-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-1">
                Correction / Update
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Registration Details
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Correct any errors in your personal or branch enrollment records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  placeholder="e.g. Kasun Perera"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                    placeholder="e.g. kasun@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                    placeholder="e.g. 077 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* NIC */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                National Identity Card (NIC) / Passport
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={editForm.nic}
                  onChange={(e) => setEditForm({ ...editForm, nic: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none font-mono"
                  placeholder="e.g. 200012345678 or 981234567V"
                />
              </div>
            </div>

            {/* Branch & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Registered Branch
                </label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Maharagama">Maharagama Branch</option>
                  <option value="Werahara">Werahara Branch</option>
                  <option value="Delgoda">Delgoda Branch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Learner Category
                </label>
                <select
                  value={editForm.studentType}
                  onChange={(e) => setEditForm({ ...editForm, studentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Type1_NewLearner">Category 1: New Learner</option>
                  <option value="Type2_TrialReady">Category 2: Trial-Ready</option>
                </select>
              </div>
            </div>

            {/* Course Training Package - Only for Type 2 (Trial-Ready) students at registration stage. Type 1 students do NOT select package at registration stage. */}
            {Boolean(editForm.studentType?.includes('Type2') || editForm.studentType === 'Type 2') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PackageIcon className="w-3.5 h-3.5 text-cyan-400" /> Enrolled Training Package <span className="text-rose-400">*</span>
                  </span>
                  {editForm.packageId && availablePackages.find((p) => p._id === editForm.packageId) && (
                    <span className="text-amber-400 font-extrabold text-xs">
                      Rs. {Number(availablePackages.find((p) => p._id === editForm.packageId)?.price || 0).toLocaleString()}.00
                    </span>
                  )}
                </label>
                <div className="relative">
                  <PackageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={editForm.packageId}
                    onChange={(e) => setEditForm({ ...editForm, packageId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  >
                    {availablePackages.length > 0 ? (
                      availablePackages.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.lessons} Lessons) — Rs. {Number(p.price).toLocaleString()}
                        </option>
                      ))
                    ) : (
                      <option value="">Loading available packages...</option>
                    )}
                  </select>
                </div>

                {(() => {
                  const sel = availablePackages.find((p) => p._id === editForm.packageId);
                  if (!sel) return null;
                  return (
                    <div className="text-xs text-slate-300 bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-cyan-300">
                          {sel.lessons} Practical Driving Lessons ({sel.vehicleCategory || 'Light'} Vehicle)
                        </span>
                        <span className="text-amber-300 font-mono">
                          {sel.isPerLesson ? `Rs. ${sel.price}/lesson` : `Total Rs. ${Number(sel.price).toLocaleString()}`}
                        </span>
                      </div>
                      {sel.notes && (
                        <p className="text-[11px] text-slate-400 leading-normal">{sel.notes}</p>
                      )}
                      {sel.bonusLessons?.bike > 0 && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-1">
                          <Gift className="w-3 h-3" /> Includes {sel.bonusLessons.bike} Bike &amp; {sel.bonusLessons.threeWheeler} Three-Wheeler bonus lessons
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={savingDetails}
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary text-xs py-2.5 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDetails}
                className="btn-accent text-xs py-2.5 px-5 font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {savingDetails ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMilestoneModal = () => {
    if (!isMilestoneModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="card max-w-md w-full p-6 sm:p-7 bg-slate-950/95 border border-cyan-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-5 relative rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="space-y-0.5">
              <span className="badge badge-info text-[10px] font-bold uppercase">
                DMT Milestone Tracking
              </span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Update DMT Milestone Dates
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsMilestoneModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            As a <strong>Type 1 student</strong>, enter or update your schedule dates for DMT processing below:
          </p>

          <form onSubmit={handleSaveMilestones} className="space-y-3.5 text-xs">
            {/* 1. Medical Exam Date */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <label className="block font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> 1. DMT Medical Exam Date
                </span>
                <span className={`text-[10px] font-semibold ${profile?.dmtDates?.medicalExamPassed ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {profile?.dmtDates?.medicalExamPassed ? '✓ Passed' : 'Pending'}
                </span>
              </label>
              <input
                type="date"
                value={milestoneForm.medicalExamDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, medicalExamDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/15 bg-slate-900 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">
                National Transport Medical Institute (NTMI) examination appointment date.
              </p>
            </div>

            {/* 2. Learner Registration Date */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <label className="block font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> 2. DMT Registration Date
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold">
                  {milestoneForm.learnerRegistrationDate ? 'Enrolled' : 'Pending'}
                </span>
              </label>
              <input
                type="date"
                value={milestoneForm.learnerRegistrationDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, learnerRegistrationDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/15 bg-slate-900 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">
                Official date your learner permit application was submitted to DMT.
              </p>
            </div>

            {/* 3. Learner Written Exam Date */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <label className="block font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 3. Learner's Written Exam Date
                </span>
                <span className={`text-[10px] font-bold ${profile?.learnerExamStatus === 'passed' || profile?.dmtDates?.learnerExamPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {profile?.learnerExamStatus === 'passed' || profile?.dmtDates?.learnerExamPassed ? '✓ Passed (Lessons Unlocked)' : 'Pass Required'}
                </span>
              </label>
              <input
                type="date"
                value={milestoneForm.learnerExamDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, learnerExamDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/15 bg-slate-900 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">
                Date scheduled to sit for the DMT written theory examination.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={savingMilestones}
                onClick={() => setIsMilestoneModalOpen(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingMilestones}
                className="btn-accent text-xs py-2 px-5 font-bold shadow-lg flex items-center gap-1.5"
              >
                {savingMilestones ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Milestone Dates'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderExamResultModal = () => {
    if (!isExamModalOpen) return null;
    const currentAttempts = profile?.learnerExamAttempts?.length || profile?.learnerExamAttemptsCount || 0;
    const attemptNumber = currentAttempts + 1;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="card max-w-md w-full p-6 sm:p-7 bg-slate-950/95 border border-purple-400/40 shadow-[0_25px_70px_rgba(168,85,247,0.3)] space-y-5 relative rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="badge badge-accent text-[10px] font-bold uppercase">
                Attempt {attemptNumber} of 3
              </span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Record Written Exam Result
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsExamModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Record your official DMT Written Theory Examination result. If you pass, practical lessons will be unlocked. You have a maximum of <strong>3 attempts</strong>.
          </p>

          <form onSubmit={handleSaveExamResult} className="space-y-4 text-xs">
            {/* Pass or Fail Toggle */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">Result Outcome</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExamForm({ ...examForm, result: 'passed' })}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    examForm.result === 'passed'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Passed Exam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExamForm({ ...examForm, result: 'failed' })}
                  className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    examForm.result === 'failed'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Failed Attempt</span>
                </button>
              </div>
            </div>

            {/* Marks scored */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200 flex items-center justify-between">
                <span>Marks Scored (out of 40)</span>
                <span className="text-[10px] text-slate-400">Passing mark is 30/40</span>
              </label>
              <input
                type="number"
                min="0"
                max="40"
                required
                placeholder="e.g. 35"
                value={examForm.marks}
                onChange={(e) => setExamForm({ ...examForm, marks: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none font-bold text-sm"
              />
            </div>

            {/* Exam Date */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-200">Date of Examination</label>
              <input
                type="date"
                required
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {examForm.result === 'failed' && (
              <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-xl text-amber-200 space-y-1 text-[11px]">
                <strong>Notice on Failed Attempt:</strong>
                <p>
                  {attemptNumber >= 3
                    ? '⚠️ This is your 3rd attempt. Failing this attempt will automatically cancel your registration!'
                    : `After recording this attempt, you can obtain a new exam date from branch staff. Remaining attempts: ${3 - attemptNumber}.`}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="btn-secondary text-xs py-2.5 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingExamResult}
                className="btn-accent text-xs py-2.5 px-5 font-bold shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittingExamResult ? 'Submitting...' : 'Save Exam Result'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderVerifiedCelebrationModal = () => {
    if (!showVerifiedCelebrationModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="card max-w-lg w-full p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-400/50 shadow-[0_25px_80px_rgba(16,185,129,0.3)] space-y-6 relative rounded-3xl text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="badge badge-success text-[11px] font-extrabold uppercase tracking-wider py-1 px-3">
              Account Verified Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Now You Are a Verified User! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Ayubowan, <strong>{user?.name}</strong>! Your Rs. 5,000 advance deposit has been approved by our branch officer.
              {isType1
                ? ' You now have full access to your Type 1 DMT Milestone Schedule, Theory Exam practice, and student dashboard!'
                : ' You now have full access to your student dashboard and practical trial training!'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Enrolled Category</span>
              <span className="font-bold text-white">
                {isType1 ? 'Type 1: New Learner' : 'Type 2: Trial-Ready'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registered Branch</span>
              <span className="font-bold text-white">
                {profile?.branch || user?.branch} Branch
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const stId = profile?._id || student?._id || user?._id;
              if (stId) localStorage.setItem('seen_verified_modal_' + stId, 'true');
              setShowVerifiedCelebrationModal(false);
            }}
            className="w-full btn-accent text-sm py-3.5 font-extrabold shadow-lg flex items-center justify-center gap-2"
          >
            <span>Go to My DMT Milestones Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (isCancelled) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1280px] mx-auto w-full">
        <div className="relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-rose-950/90 via-slate-900/95 to-slate-950/95 border-2 border-rose-500/60 p-6 sm:p-10 shadow-[0_15px_50px_rgba(244,63,94,0.3)] overflow-hidden space-y-6">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-rose-600 via-red-500 to-amber-600" />
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
            <div className="space-y-3 flex-1">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                Registration Cancelled • 3 Attempts Exhausted
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Learner Registration Auto-Cancelled (DMT Regulations)
              </h1>
              <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed max-w-3xl">
                According to Sri Lanka Department of Motor Traffic (DMT) regulations, candidate registrations are automatically cancelled upon exhausting three (3) unsuccessful attempts at the written learner theory examination.
              </p>
            </div>
          </div>

          {/* Attempts History Table */}
          <div className="rounded-2xl bg-black/40 border border-rose-400/30 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" /> Examination Attempts History (3 of 3 Failed)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(profile?.learnerExamAttempts && profile.learnerExamAttempts.length > 0 ? profile.learnerExamAttempts : [1, 2, 3]).map((att, idx) => {
                const attemptNum = typeof att === 'object' ? att.attemptNumber : att;
                const marks = typeof att === 'object' ? att.marks : null;
                const date = typeof att === 'object' && att.date ? new Date(att.date).toLocaleDateString() : 'Recorded Attempt';
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-rose-400/20 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">Attempt {attemptNum} of 3</span>
                      <span className="badge bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px]">FAILED</span>
                    </div>
                    <div className="text-xs text-slate-400">{date}</div>
                    <div className="text-xs font-semibold text-rose-300">
                      Score: {marks !== null && marks !== undefined ? `${marks} / 40` : 'Failed'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to Re-register */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">How to restart your training?</h4>
              <p className="text-xs text-slate-300 max-w-xl">
                You can re-register like a new user. To proceed, click below to initialize your new registration and complete the advance payment of Rs. 5,000.00.
              </p>
            </div>
            <button
              type="button"
              disabled={reRegistering}
              onClick={handleReRegister}
              className="btn-accent text-xs sm:text-sm py-3 px-6 font-bold flex items-center gap-2 shadow-xl whitespace-nowrap hover:scale-105 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 ${reRegistering ? 'animate-spin' : ''}`} />
              {reRegistering ? 'Initializing...' : 'Re-Register as New Learner (Pay Rs. 5,000)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdvancePaymentPending) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1280px] mx-auto w-full">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="badge badge-warning text-xs font-bold py-1">
              {profile?.branch || user?.branch} Branch
            </span>
            <span className="badge bg-white/10 text-cyan-300 text-xs border border-white/15">
              {isType2 ? 'Category 2: Trial-Ready' : 'Category 1: New Learner'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal()}
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 text-cyan-300 hover:border-cyan-400 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit Registration Details
            </button>
            <button
              onClick={() => fetchProfile(true)}
              disabled={checkingStatus}
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 hover:border-cyan-400 text-cyan-300 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${checkingStatus ? 'animate-spin' : ''}`} />
              {checkingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>

        {/* Primary Warning Hero Card */}
        <div className="relative rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-amber-950/80 via-slate-900/95 to-slate-950/90 border-2 border-amber-400/60 p-6 sm:p-10 shadow-[0_15px_50px_rgba(245,158,11,0.25)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          <div className="flex flex-col lg:flex-row items-start gap-6 relative z-10">
            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.35)] animate-pulse">
              <ShieldAlert className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Payment Verification In Progress
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ref: {profile?.advancePaymentReference || 'ADV-PENDING'}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isPhysicalCash
                    ? `Ayubowan, ${user?.name}! Branch Advance Payment Pending`
                    : `Ayubowan, ${user?.name}! Payment Verification In Progress`}
                </h1>

                {/* EXACT REQUIRED STATUS PROMPT */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm sm:text-base font-extrabold text-amber-100 leading-relaxed">
                      {isPhysicalCash
                        ? 'Please visit your nearest branch to complete your advance payment of LKR 5,000. You will gain full system access once the payment is verified by our team.'
                        : 'Your payment is currently being verified by a Data Entry Officer. You cannot access the system until your account is verified.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Notice Details Box */}
              <div className="rounded-2xl bg-black/40 border border-amber-400/30 p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  You have successfully logged in, but your <strong>Student Dashboard, Practical Lesson Bookings, and Course Package Scheduling</strong> are locked until your advance deposit of <strong className="text-amber-300">Rs. 5,000.00</strong> is verified by our branch Staff Officer or Data Entry Officer.
                </p>
                <p className="text-slate-400 text-xs">
                  {isPhysicalCash
                    ? 'Our staff will record your payment upon counter visit and immediately activate your account.'
                    : 'As soon as our Data Entry Officer approves your bank slip or gateway submission, your dashboard and practical lesson booking privileges will unlock automatically.'}
                </p>
              </div>


              {/* Real-time Status Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-slate-400 block text-[11px]">Enrolled Category</span>
                  <span className="font-bold text-white">
                    {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-slate-400 block text-[11px]">Advance Fee Amount</span>
                  <span className="font-bold text-amber-300">
                    Rs. {Number(profile?.advancePaymentAmount || 5000).toLocaleString()}.00
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-slate-400 block text-[11px]">Verification Status</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Officer Verification
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fetchProfile(true)}
                  disabled={checkingStatus}
                  className="btn-accent text-xs sm:text-sm py-3 px-6 font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                  {checkingStatus ? 'Checking Status...' : 'Check / Refresh Verification Status'}
                </button>

                <Link
                  to="/payment-gateway"
                  state={{
                    studentName: user?.name,
                    studentId: profile?._id,
                    userId: user?.id || user?._id,
                    branch: profile?.branch || user?.branch,
                    nic: profile?.nic || user?.nic,
                    email: user?.email,
                    advanceAmount: profile?.advancePaymentAmount || 5000,
                    registrationReference: profile?.advancePaymentReference,
                  }}
                  className="btn-secondary text-xs sm:text-sm py-3 px-5 font-bold flex items-center gap-2 border-white/20 text-white hover:border-cyan-400"
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" /> Re-upload / Change Payment Slip
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Summary of Submitted Details */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Your Submitted Registration Profile
            </h3>
            <button
              onClick={openEditModal}
              className="text-xs text-cyan-300 hover:text-cyan-200 underline font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Correct Typo / Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-bold text-white">{user?.name || profile?.name || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[11px]">NIC Number</span>
              <span className="font-bold text-white font-mono">{profile?.nic || user?.nic || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[11px]">Contact Phone</span>
              <span className="font-bold text-white">{user?.phone || profile?.phone || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[11px]">Registered Branch</span>
              <span className="font-bold text-cyan-300">{profile?.branch || user?.branch} Branch</span>
            </div>
          </div>
        </div>

        {/* ─── CONTACT DETAILS SECTION (REQUIRED BY USER) ────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/30 border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="badge bg-cyan-500/15 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                Official Support &amp; Verification Helpdesk
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-cyan-400" /> Contact Sithma Driving School
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                If your payment is urgent or if you have any questions regarding your verification, contact our branch officers directly.
              </p>
            </div>
            <a
              href="https://wa.me/94772849201?text=Hello%20Sithma%20Driving%20School,%20I%20have%20submitted%20my%20advance%20payment%20and%20am%20waiting%20for%20verification."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-2 transition-all self-start sm:self-center shadow-lg"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp Verification Support
            </a>
          </div>

          {/* 3 Branch Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Maharagama Branch */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" /> Maharagama Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  Main Office
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>High Level Road, Maharagama</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href="tel:0112849201" className="font-bold text-cyan-300 hover:underline">011-2849201</a>
                  <span className="text-slate-500">/</span>
                  <a href="tel:0772849201" className="font-bold text-cyan-300 hover:underline">077-2849201</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Mon–Sat: 8:00 AM – 5:00 PM</span>
                </p>
              </div>
              <a
                href="tel:0112849201"
                className="w-full btn-secondary text-xs py-2 text-center font-bold block"
              >
                Call Maharagama Branch
              </a>
            </div>

            {/* Werahara Branch */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" /> Werahara Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                  DMT Central
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Near DMT Central Office, Werahara</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href="tel:0112518492" className="font-bold text-cyan-300 hover:underline">011-2518492</a>
                  <span className="text-slate-500">/</span>
                  <a href="tel:0772518492" className="font-bold text-cyan-300 hover:underline">077-2518492</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Mon–Sat: 8:00 AM – 5:00 PM</span>
                </p>
              </div>
              <a
                href="tel:0112518492"
                className="w-full btn-secondary text-xs py-2 text-center font-bold block"
              >
                Call Werahara Branch
              </a>
            </div>

            {/* Delgoda Branch */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" /> Delgoda Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Branch Office
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Main Street, Delgoda</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href="tel:0112974820" className="font-bold text-cyan-300 hover:underline">011-2974820</a>
                  <span className="text-slate-500">/</span>
                  <a href="tel:0772974820" className="font-bold text-cyan-300 hover:underline">077-2974820</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Mon–Sat: 8:00 AM – 5:00 PM</span>
                </p>
              </div>
              <a
                href="tel:0112974820"
                className="w-full btn-secondary text-xs py-2 text-center font-bold block"
              >
                Call Delgoda Branch
              </a>
            </div>
          </div>

          {/* Quick Support Footer Note */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>General inquiries: <a href="mailto:info@sithmadrivingschool.lk" className="text-white font-semibold hover:underline">info@sithmadrivingschool.lk</a></span>
            </div>
            <p className="text-[11px] text-slate-400 text-center sm:text-right">
              Branch officers verify payment slips between 8:00 AM – 5:00 PM daily.
            </p>
          </div>
        </div>

        {renderEditModal()}
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-warning text-xs font-bold py-1">
              {profile?.branch} Branch
            </span>
            <span className="badge bg-white/15 text-cyan-300 text-xs border border-white/20">
              {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
            </span>
            {profile?.nic && (
              <span className="badge bg-slate-950/60 text-slate-300 text-xs border border-white/10 font-mono">
                NIC: {profile.nic}
              </span>
            )}
            {isAdvancePaymentPending ? (
              <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 py-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Status: Pending Verification
              </span>
            ) : (
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Status: Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white drop-shadow">
            Ayubowan, {user?.name}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to your driving portal. Track official DMT milestones, review your course lesson balance, and book your practical driving sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 sm:self-center relative z-10">
          <button
            onClick={openEditModal}
            className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 text-cyan-300 hover:border-cyan-400 shadow-md"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Details
          </button>
          <button
            onClick={fetchProfile}
            className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-cyan-300" /> Refresh
          </button>

          {isAdvancePaymentPending ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 Advance Payment Pending: Practical lesson booking is restricted until your advance deposit is approved by your branch officer.'
                )
              }
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 opacity-80 border border-amber-400/40 text-amber-300 cursor-not-allowed"
              title="Lesson booking locked until advance payment is verified"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Booking Locked (Payment Pending)
            </button>
          ) : isType1 && !isTrialEligible ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 DMT Requirement (US-09): Practical & trial lessons can only be booked after passing your Learner Written Exam (marked Passed by your branch officer).'
                )
              }
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 opacity-75 border border-cyan-400/30"
              title="Practical lessons locked until Learner Written Exam is passed"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Lessons Locked (Exam Pending)
            </button>
          ) : (
            <Link
              to="/student/lessons/book"
              className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-950" /> Book a Lesson
            </Link>
          )}
        </div>
      </div>


      {/* TYPE 1: US-09 DMT LEARNER EXAM GATE NOTICE BANNER */}
      {isType1 && !isTrialEligible && (
        <div className="card p-6 bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border-2 border-cyan-400/40 space-y-4 shadow-[0_10px_35px_rgba(6,182,212,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <span className="badge badge-warning text-[10px] font-bold uppercase tracking-wider mb-1">
                  US-09 DMT Regulation Active • Theory Exam Gate
                </span>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  Practical Trial Lessons Locked Until Learner's Exam Passed
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  As a <strong>Type 1 New Learner</strong>, you can review your enrolled details and DMT milestone schedule below. In accordance with DMT regulations, on-road practical driving and trial lessons can only be booked after your Learner Written Exam is officially marked <strong>"Passed"</strong> by your branch officer.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-right self-start sm:self-auto min-w-[180px]">
              <span className="text-[10px] text-slate-400 font-semibold block">Your Exam Status:</span>
              <span
                className={`text-xs font-black ${
                  profile?.learnerExamStatus === 'failed' ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {profile?.learnerExamStatus === 'failed'
                  ? 'Failed (Retake Required)'
                  : profile?.dmtDates?.learnerExamDate
                  ? 'Scheduled / Awaiting Result'
                  : 'Not Yet Faced'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COURSE PACKAGE SELECTION & PAYMENT BANNER (FOR TRIAL-READY STUDENTS) */}
      {showPackagePaymentBanner && (
        <div id="package-selection-payment" className="card p-6 sm:p-8 bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-purple-900/30 border border-amber-400/30 space-y-6 shadow-[0_10px_40px_rgba(245,158,11,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-1">
                {isType1
                  ? 'Theory Exam Passed • Step 2: Course Package Selection & Payment'
                  : hasUnfinishedInstallments
                  ? `Installment #${(profile?.installmentsPaidCount || 0) + 1} Due • Unlock 5 More Lessons`
                  : hasCompletedSingleLesson
                  ? 'Single Lesson Completed • Book Another or Upgrade to Full Course'
                  : 'Course Package Selection & Payment'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-400" />
                {hasUnfinishedInstallments
                  ? `Pay Next Installment (Installment #${(profile?.installmentsPaidCount || 0) + 1} of 3)`
                  : 'Select Course Package & Choose Payment Plan'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isType1
                  ? 'Congratulations on passing your DMT Written Examination! Select your package below to unlock practical driving lessons.'
                  : hasUnfinishedInstallments
                  ? `You have unlocked ${profile?.lessonsUnlocked || 5} lessons. Pay your next installment to unlock 5 additional lessons.`
                  : 'Choose between pay-per-lesson or full packages (pay full upfront or pay in 3 monthly installments).'}
              </p>
            </div>
            {isPackagePaymentPending && (
              <span className="badge badge-warning px-3 py-1 text-xs font-bold self-start sm:self-auto">
                ⏳ Payment Slip Pending Verification
              </span>
            )}
          </div>

          {/* Active Installment Progress Tracker (if currently on installments) */}
          {hasUnfinishedInstallments && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Active 3-Installment Plan:
                  <span className="text-cyan-300 font-mono ml-1">{profile?.package?.type?.replace('_', ' ') || 'Car Package'}</span>
                </span>
                <span className="badge badge-info text-[10px]">
                  {profile?.installmentsPaidCount || 1}/3 Paid • {profile?.lessonsUnlocked || 5} Lessons Unlocked
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {getInstallments(profile?.package?.priceTotal || 40000).map((inst) => {
                  const isPaid = (profile?.installmentsPaidCount || 0) >= inst.num;
                  const isCurrentDue = (profile?.installmentsPaidCount || 0) + 1 === inst.num;
                  return (
                    <div
                      key={inst.num}
                      className={`p-3 rounded-xl border ${
                        isPaid
                          ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                          : isCurrentDue
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span>Installment #{inst.num}</span>
                        {isPaid ? (
                          <span className="text-emerald-400 text-[10px]">✓ Paid</span>
                        ) : isCurrentDue ? (
                          <span className="text-amber-300 text-[10px]">Due Now</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Upcoming</span>
                        )}
                      </div>
                      <div className="font-black text-sm text-white">Rs. {inst.amount.toLocaleString()}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">Unlocks 5 Lessons</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Payment Notice */}
          {isPackagePaymentPending ? (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="text-white text-sm">Your course package payment slip is awaiting branch review.</strong>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Our Data Entry Officer is verifying your bank deposit. Your lesson balance will unlock automatically upon verification.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300">
                  Want to switch to online card payment for instant unlock?
                </span>
                <button
                  type="button"
                  onClick={() => setShowPaymentFormOverride(true)}
                  className="btn-accent text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shadow"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Online via Card Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STEP 1: Package Catalog with Category Tabs (A, B, C) */}
              {!hasUnfinishedInstallments && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      1. Choose Vehicle Training Package Category:
                    </label>
                    {/* Category Selector Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryGroup('C')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedCategoryGroup === 'C'
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        ⭐ C. Full Course Packages (15 Lessons)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('B');
                          setSelectedPlan('single');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedCategoryGroup === 'B'
                            ? 'bg-cyan-500 text-slate-950 shadow-md'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        B. Standard Single Lessons
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('A');
                          setSelectedPlan('single');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedCategoryGroup === 'A'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        A. Private / Individual Lessons
                      </button>
                    </div>
                  </div>

                  {/* Package Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availablePackages
                      .filter((p) => {
                        if (selectedCategoryGroup === 'C') return p.categoryGroup === 'C' || (!p.isPerLesson && p.lessons > 1);
                        if (selectedCategoryGroup === 'B') return p.categoryGroup === 'B';
                        if (selectedCategoryGroup === 'A') return p.categoryGroup === 'A';
                        return true;
                      })
                      .map((pkgItem) => {
                        const isSelected = selectedPkgId === pkgItem._id;
                        return (
                          <div
                            key={pkgItem._id}
                            onClick={() => {
                              setSelectedPkgId(pkgItem._id);
                              if (pkgItem.categoryGroup === 'C' || !pkgItem.isPerLesson) {
                                if (selectedPlan === 'single') setSelectedPlan('full');
                              } else {
                                setSelectedPlan('single');
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                                : 'border-white/10 bg-slate-900/60 hover:border-white/30 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-white text-xs leading-snug">{pkgItem.name}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 ml-1" />
                              )}
                            </div>
                            <div className="text-base font-black text-amber-300 mb-1">
                              Rs. {pkgItem.price?.toLocaleString()}
                              {pkgItem.isPerLesson && (
                                <span className="text-[10px] font-normal text-slate-400 ml-1">/ lesson</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                              {pkgItem.lessons} {pkgItem.lessons === 1 ? 'Lesson' : 'Lessons'} • {pkgItem.notes || 'Curriculum compliant'}
                            </p>
                            {pkgItem.bonusLessons && (pkgItem.bonusLessons.bike > 0 || pkgItem.bonusLessons.threeWheeler > 0) && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                                <Gift className="w-3 h-3" /> +{pkgItem.bonusLessons.bike} Bike & +{pkgItem.bonusLessons.threeWheeler} Three-Wheel Free
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Payment Plan (Full Payment vs 3 Installments vs Single Lesson) */}
              {!hasUnfinishedInstallments && (
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                    2. Choose Payment Plan:
                  </label>
                  {(() => {
                    const activePkg = availablePackages.find((p) => p._id === selectedPkgId) || availablePackages[0] || FALLBACK_PACKAGES[0];
                    const isFullPackage = activePkg?.categoryGroup === 'C' || !activePkg?.isPerLesson;
                    const instSchedule = getInstallments(activePkg?.price || 40000);

                    if (isFullPackage) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Option A: Full Payment */}
                          <div
                            onClick={() => setSelectedPlan('full')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                              selectedPlan === 'full'
                                ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-cyan-100'
                                : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-cyan-400" /> Option A: Full Upfront Payment
                              </span>
                              {selectedPlan === 'full' && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                            </div>
                            <div className="text-lg font-black text-cyan-300 mb-1">
                              Rs. {(activePkg?.price || 40000).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Pay the full course fee upfront. <strong>Immediately unlocks all 15 included lessons</strong> so you can book any available time slot.
                            </p>
                            <div className="mt-3 text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                              ✓ Unlocks All 15 Lessons Instantly
                            </div>
                          </div>

                          {/* Option B: 3 Installments */}
                          <div
                            onClick={() => setSelectedPlan('installments')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                              selectedPlan === 'installments'
                                ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-100'
                                : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-400" /> Option B: Pay in 3 Installments
                              </span>
                              {selectedPlan === 'installments' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                            </div>
                            <div className="text-lg font-black text-amber-300 mb-1">
                              1st Pay: Rs. {instSchedule[0].amount.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                              First pay big amount, finally small amount. Each payment unlocks 5 lessons.
                            </p>
                            {/* Installment breakdown pills */}
                            <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-200">
                              <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-center">
                                <div className="font-bold text-amber-300">1st Month</div>
                                <div>Rs. {instSchedule[0].amount.toLocaleString()}</div>
                                <div className="text-amber-400/80 font-mono">+5 Lessons</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-center">
                                <div className="font-bold text-slate-300">2nd Month</div>
                                <div>Rs. {instSchedule[1].amount.toLocaleString()}</div>
                                <div className="text-slate-400 font-mono">+5 Lessons</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-center">
                                <div className="font-bold text-slate-300">3rd Month</div>
                                <div>Rs. {instSchedule[2].amount.toLocaleString()}</div>
                                <div className="text-slate-400 font-mono">+5 Lessons</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Single Lesson Selected (Groups A or B)
                    return (
                      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <div>
                            <strong className="text-white">Pay-Per-Lesson Plan Selected:</strong>
                            <p className="text-slate-300 mt-0.5">
                              Paying for a single lesson unlocks exactly <strong>1 lesson</strong> for booking. You can pay again for future lessons as needed.
                            </p>
                          </div>
                        </div>
                        <span className="badge badge-info text-xs font-black">
                          Rs. {(activePkg?.price || 2000).toLocaleString()} • 1 Lesson
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 3: Payment Method Selection & Form (Identical to Registration Payment Experience) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      3. Select Payment Method:
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Transfer via official bank accounts, pay instantly with credit/debit card, or pay cash at branch.
                    </p>
                  </div>
                  {/* Total to pay badge */}
                  {(() => {
                    const activePkg = availablePackages.find((p) => p._id === selectedPkgId) || availablePackages[0] || FALLBACK_PACKAGES[0];
                    const isFullPackage = activePkg?.categoryGroup === 'C' || !activePkg?.isPerLesson;
                    const instSchedule = getInstallments(activePkg?.price || 40000);
                    const currentInstDue = Math.min(3, (profile?.installmentsPaidCount || 0) + 1);
                    const isInst = isFullPackage && (selectedPlan === 'installments' || hasUnfinishedInstallments);
                    const amountDue = isInst
                      ? instSchedule[currentInstDue - 1]?.amount || 15000
                      : activePkg?.price || 40000;
                    const lessonsToUnlock = isInst ? 5 : (isFullPackage ? (activePkg?.lessons || 15) : 1);
                    return (
                      <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold self-start sm:self-auto flex items-center gap-2">
                        <span>Total To Pay Now:</span>
                        <span className="text-sm font-black text-white">Rs. {amountDue.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-200">({lessonsToUnlock} Lesson{lessonsToUnlock > 1 ? 's' : ''} Unlocked)</span>
                      </div>
                    );
                  })()}
                </div>

                {/* 3 Payment Method Selector Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('slip')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePaymentMethod === 'slip'
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-white text-xs">
                      <Upload className={`w-4 h-4 ${activePaymentMethod === 'slip' ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>Upload Bank Slip</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Deposit to official Sithma accounts & upload receipt</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('online')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePaymentMethod === 'online'
                        ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-purple-400'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-white text-xs">
                      <CreditCard className={`w-4 h-4 ${activePaymentMethod === 'online' ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>Pay Online (Card)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Visa / Mastercard instant approval & unlock</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('physical')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePaymentMethod === 'physical'
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-white text-xs">
                      <Building2 className={`w-4 h-4 ${activePaymentMethod === 'physical' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Pay at Branch</span>
                    </div>
                    <p className="text-[11px] text-slate-400">In-person cash payment at your registered branch</p>
                  </button>
                </div>

                {/* Form Container */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-white/10 space-y-5">
                  {/* METHOD 1: BANK SLIP UPLOAD */}
                  {activePaymentMethod === 'slip' && (
                    <div className="space-y-4">
                      {/* Official 4 Bank Accounts Tabs */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                            <Landmark className="w-3.5 h-3.5 text-cyan-400" /> Select Official Sithma Bank Account:
                          </span>
                          <span className="text-[11px] text-slate-400">Choose your preferred deposit bank</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SITHMA_OFFICIAL_BANKS.map((b) => {
                            const isSelected = selectedBankId === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => handleSelectBank(b)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400'
                                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/25'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  <span>{b.id}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                                </div>
                                <div className="text-xs font-bold truncate text-white">{b.shortName}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Bank Account Details Card with Copy Button */}
                      {(() => {
                        const b = SITHMA_OFFICIAL_BANKS.find((x) => x.id === selectedBankId) || SITHMA_OFFICIAL_BANKS[0];
                        return (
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{b.name}</span>
                                <span className="badge badge-info text-[9px]">{b.badge}</span>
                              </div>
                              <div className="text-slate-300">
                                Account Name: <strong className="text-white">{b.accountName}</strong>
                              </div>
                              <div className="text-slate-400 text-[11px]">Branch: {b.branch}</div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
                              <div>
                                <div className="text-[10px] text-slate-400">Account Number</div>
                                <div className="font-mono font-bold text-cyan-300 text-sm">{b.accountNo}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyAcc(b.accountNo)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                                title="Copy Account Number"
                              >
                                {copiedBankAcc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Slip File Upload */}
                      <div className="pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Upload Deposit Slip / Transfer Screenshot <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleSlipFileChange}
                              className="hidden"
                              id="package-slip-file-input"
                            />
                            <label
                              htmlFor="package-slip-file-input"
                              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-white/25 rounded-xl text-xs text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer bg-slate-900/80 transition-colors"
                            >
                              <Upload className="w-4 h-4 text-cyan-400" />
                              <span>{slipFile ? slipFile.name : 'Choose Slip Image / PDF'}</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Live Image Preview if File Chosen */}
                      {slipPreview && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={slipPreview} alt="Deposit Slip Preview" className="w-12 h-12 rounded-lg object-cover border border-white/20" />
                            <div className="text-xs">
                              <p className="font-bold text-white truncate max-w-xs">{slipFile?.name}</p>
                              <p className="text-[10px] text-slate-400">{(slipFile?.size / 1024).toFixed(1)} KB • Ready for upload</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveSlip}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handlePackagePaymentSubmit}
                          disabled={submittingPkgPayment}
                          className="btn-accent py-3 px-6 text-xs font-bold shadow-lg flex items-center gap-2"
                        >
                          {submittingPkgPayment ? 'Submitting Payment Slip...' : 'Submit Deposit Slip for Verification'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* METHOD 2: ONLINE CARD PAYMENT GATEWAY */}
                  {activePaymentMethod === 'online' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        {/* Live Credit Card Graphic */}
                        <div className="lg:col-span-5">
                          <div className="w-full max-w-sm mx-auto aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-slate-950 via-purple-950 to-slate-900 p-5 border border-purple-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden text-white">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs tracking-wider text-purple-300">SITHMA SECURE PAY</span>
                              <Wifi className="w-4 h-4 text-purple-300 rotate-90" />
                            </div>
                            <div className="w-8 h-6 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center text-[8px] font-mono text-slate-950 font-bold">
                              CHIP
                            </div>
                            <div className="font-mono text-base tracking-widest text-slate-100 font-bold">
                              {cardForm.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="flex justify-between items-end text-[10px] text-slate-300">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-slate-400">Cardholder</span>
                                <span className="font-bold uppercase tracking-wider text-white">
                                  {cardForm.cardHolder || profile?.name || 'STUDENT NAME'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expires</span>
                                <span className="font-bold text-white">{cardForm.expDate || 'MM/YY'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Inputs */}
                        <div className="lg:col-span-7 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Cardholder Full Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Name on card"
                              value={cardForm.cardHolder || profile?.name || ''}
                              onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950 text-white rounded-xl text-xs outline-none focus:border-purple-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Card Number (Visa / Mastercard) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="4532 8921 4421 9012"
                              value={cardForm.cardNumber}
                              onChange={handleCardNumberChange}
                              className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950 text-white rounded-xl text-xs font-mono outline-none focus:border-purple-400"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Expiry Date <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardForm.expDate}
                                onChange={(e) => setCardForm({ ...cardForm, expDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950 text-white rounded-xl text-xs font-mono outline-none focus:border-purple-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                CVV / CVC <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="882"
                                value={cardForm.cvv}
                                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950 text-white rounded-xl text-xs font-mono outline-none focus:border-purple-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>256-Bit Bank-Grade SSL Encryption • Instant Lesson Unlock</span>
                        </div>
                        <button
                          type="button"
                          onClick={handlePackagePaymentSubmit}
                          disabled={submittingPkgPayment || cardProcessing}
                          className="btn-accent py-3 px-6 text-xs font-bold shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        >
                          {cardProcessing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Processing Secure Payment...</span>
                            </>
                          ) : (
                            <>
                              <span>Pay Online (Instant Unlock)</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* METHOD 3: PAY AT BRANCH (PHYSICAL CASH) */}
                  {activePaymentMethod === 'physical' && (
                    <div className="space-y-4">
                      {(() => {
                        const branchKey = profile?.branch || user?.branch || 'Maharagama';
                        const branchInfo = SITHMA_BRANCHES[branchKey] || SITHMA_BRANCHES.Maharagama;
                        const cashCode = `CASH-PKG-${branchKey.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
                        return (
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-white text-sm">
                                  <Building2 className="w-4 h-4 text-amber-400" />
                                  <span>{branchKey} Branch Cash Counter</span>
                                </div>
                                <div className="text-slate-300 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {branchInfo.address}
                                </div>
                                <div className="text-slate-400 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {branchInfo.phone} • {branchInfo.hours}
                                </div>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-white/10 text-right self-start sm:self-auto min-w-[200px]">
                                <span className="text-[10px] text-slate-400 block">Payment Reference Code:</span>
                                <span className="font-mono font-bold text-amber-300 text-sm">{cashCode}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              You can visit our <strong>{branchKey} Branch</strong> during operating hours ({branchInfo.hours}) to make your cash payment at the front counter. Our staff will look up your account with this reference code and verify your payment instantly.
                            </p>
                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={handlePackagePaymentSubmit}
                                disabled={submittingPkgPayment}
                                className="btn-accent py-3 px-6 text-xs font-bold shadow-lg flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                              >
                                {submittingPkgPayment ? 'Registering Cash Intent...' : 'Confirm In-Person Cash Payment Intent'}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid: DMT Official Read-Only Milestones View (US-06) + Course Balance & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: DMT Timeline & Consolidated Read-Only Records (US-06) */}
        <div className="lg:col-span-2 space-y-6">
          {/* US-06: Consolidated View of Trial, Learner Exam, and Medical Dates (Type 1 New Learners Only) */}
          {isType1 && (
            <div className="card p-6 space-y-4 border border-cyan-400/30 bg-slate-900/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
              <div>
                <span className="badge badge-info text-[10px] font-bold uppercase mb-1">
                  DMT Milestone Tracking
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" /> Government DMT Milestone Schedule
                </h2>
                <p className="text-xs text-slate-400">
                  {isType1
                    ? 'Track and update your official medical exam, learner registration, and written exam dates.'
                    : 'Verified DMT records for practical trial readiness.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {profile?.branch} Branch
                </span>
                {isType1 && (
                  <button
                    type="button"
                    onClick={openMilestoneModal}
                    className="btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Update Milestone Dates</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* 1. Medical Exam */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> 1. DMT Medical Exam
                  </span>
                  <span className={`badge text-[10px] ${profile?.dmtDates?.medicalDone || profile?.dmtDates?.medicalExamPassed || isType2 ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.dmtDates?.medicalDone || profile?.dmtDates?.medicalExamPassed || isType2 ? '✓ Cleared' : 'Pending'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  Scheduled Date:{' '}
                  <span className="text-white font-bold">
                    {profile?.dmtDates?.medicalExamDate
                      ? new Date(profile.dmtDates.medicalExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : (isType2 ? 'Cleared Prior to Enrolling' : 'Not Yet Assigned by Staff')}
                  </span>
                </div>
                {isType1 && (
                  <button
                    type="button"
                    disabled={togglingMilestone}
                    onClick={() => handleToggleMilestone('medicalDone', profile?.dmtDates?.medicalDone)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      profile?.dmtDates?.medicalDone
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-cyan-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{profile?.dmtDates?.medicalDone ? '✓ Medical Marked as Done (Click to undo)' : 'Mark Medical as Done ✓'}</span>
                  </button>
                )}
              </div>

              {/* 2. Learner Registration */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <FileText className="w-4 h-4 text-blue-400" /> 2. DMT Registration
                  </span>
                  <span className={`badge text-[10px] ${profile?.dmtDates?.registrationDone || profile?.dmtDates?.learnerRegistrationDate ? 'badge-info' : 'badge-warning'}`}>
                    {profile?.dmtDates?.registrationDone ? '✓ Completed' : (profile?.dmtDates?.learnerRegistrationDate ? 'Enrolled' : 'Pending')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  DMT Submission Date:{' '}
                  <span className="text-white font-bold">
                    {profile?.dmtDates?.learnerRegistrationDate
                      ? new Date(profile.dmtDates.learnerRegistrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : (isType2 ? 'Registered with DMT' : 'Not Yet Assigned by Staff')}
                  </span>
                </div>
                {isType1 && (
                  <button
                    type="button"
                    disabled={togglingMilestone}
                    onClick={() => handleToggleMilestone('registrationDone', profile?.dmtDates?.registrationDone)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      profile?.dmtDates?.registrationDone
                        ? 'bg-blue-500/15 border-blue-400/40 text-blue-300 hover:bg-blue-500/25'
                        : 'bg-white/5 hover:bg-white/10 border-white/15 text-cyan-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{profile?.dmtDates?.registrationDone ? '✓ Registration Marked as Done (Click to undo)' : 'Mark Registration as Done ✓'}</span>
                  </button>
                )}
              </div>

              {/* 3. Learner Written Theory Exam (Full Width on 2-col layout) */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-purple-400/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">3. DMT Written Theory Exam</h4>
                      <p className="text-[11px] text-slate-400">
                        Official theory examination at DMT. Maximum of 3 attempts allowed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs font-bold ${
                      isExamPassed
                        ? 'badge-success'
                        : profile?.learnerExamStatus === 'failed'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}>
                      {isExamPassed
                        ? `✓ PASSED (${profile?.dmtDates?.learnerExamMarks || profile?.learnerExamMarks || 'Pass'} Marks)`
                        : profile?.learnerExamStatus === 'failed'
                        ? `Attempt ${attemptsCount}/3 Failed`
                        : `Attempt 1 of 3 (Pending)`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Scheduled Exam Date:</span>
                    <span className="font-bold text-white text-sm">
                      {profile?.dmtDates?.learnerExamDate
                        ? new Date(profile.dmtDates.learnerExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : (isType2 ? 'Cleared Prior to Enrolling' : 'Date Not Yet Assigned by Staff')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Attempts Status:</span>
                    <span className="font-bold text-white text-sm">
                      {isExamPassed
                        ? '✓ Cleared — Practical Lessons Unlocked'
                        : `${remainingAttempts} attempt(s) remaining before auto-cancellation`}
                    </span>
                  </div>
                </div>

                {/* 3 Attempts Indicator Badges */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-bold">Attempts Track:</span>
                    {[1, 2, 3].map((num) => {
                      const att = profile?.learnerExamAttempts?.find((a) => a.attemptNumber === num);
                      const isPassedAttempt = att?.result === 'passed';
                      const isFailedAttempt = att?.result === 'failed';
                      const isCurrentPending = !att && num === attemptsCount + 1 && !isExamPassed;

                      return (
                        <span
                          key={num}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                            isPassedAttempt
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : isFailedAttempt
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300 line-through'
                              : isCurrentPending
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-slate-500'
                          }`}
                        >
                          Attempt {num}
                          {isPassedAttempt && ' ✓'}
                          {isFailedAttempt && ` (${att.marks || 'F'})`}
                        </span>
                      );
                    })}
                  </div>

                  {/* Student Result & Next Date Action Buttons */}
                  {isType1 && !isExamPassed && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setExamForm({
                            result: 'passed',
                            marks: '',
                            examDate: new Date().toISOString().split('T')[0],
                            notes: '',
                          });
                          setIsExamModalOpen(true);
                        }}
                        className="btn-accent text-xs py-1.5 px-3.5 font-bold shadow-md flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Record Exam Result (Pass / Fail & Marks)</span>
                      </button>

                      {profile?.learnerExamStatus === 'failed' && remainingAttempts > 0 && (
                        <button
                          type="button"
                          onClick={openMilestoneModal}
                          className="btn-secondary text-xs py-1.5 px-3 font-bold border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Update Next Exam Date (From Staff)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Practical Trial Exam */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Car className="w-4 h-4 text-accent" /> 4. DMT Practical Driving Trial
                  </span>
                  <span className={`badge text-[10px] ${profile?.trial?.licenseObtained ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.trial?.licenseObtained ? 'Licensed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {profile?.trial?.deadlineDate
                    ? `1.5-Yr Deadline: ${new Date(profile.trial.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : (isType2 ? 'Ready for Practical Trial' : (isExamPassed ? 'Eligible to Schedule Trial with Instructor' : 'Pending Learner Theory Exam Pass'))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Stepper Timeline */}
          <DmtMilestoneTimeline student={profile} />
        </div>

        {/* Right 1 Col: Course Package, Lessons & Quick Links */}
        <div className="space-y-6">
          {/* Course Package Card - Hidden for Type 1 until Written Theory Exam is Passed */}
          {((isType2 && pkg.priceTotal > 0) || (isType1 && isExamPassed && isPackagePaymentConfirmed) || isPackagePaymentConfirmed) ? (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Course Package</h3>
                  <p className="text-xs text-slate-400">
                    {pkg.type ? pkg.type.replace('_', ' ') : 'Full Driving Training Package'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-accent">
                    {pkg.priceTotal > 0 ? `Rs. ${pkg.priceTotal.toLocaleString()}` : 'Advance: Rs. 5,000'}
                  </span>
                  {profile?.paymentPlan && (
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">
                      Plan: {profile.paymentPlan}
                    </div>
                  )}
                </div>
              </div>

              {/* Installment Plan Alert in Sidebar */}
              {hasUnfinishedInstallments && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Installment #{(profile?.installmentsPaidCount || 0) + 1} Due
                    </span>
                    <span className="badge badge-warning text-[9px]">3-Month Plan</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You have unlocked {unlockedLessons} lessons. Pay your next installment to unlock 5 more lessons.
                  </p>
                  <a
                    href="#package-selection-payment"
                    className="btn-accent text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 w-full shadow"
                  >
                    <span>Pay Installment #{(profile?.installmentsPaidCount || 0) + 1} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Single Lesson Completion Notice in Sidebar */}
              {hasCompletedSingleLesson && (
                <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-xs text-cyan-200 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Single Lesson Used (1/1)
                    </span>
                    <span className="badge badge-info text-[9px]">Completed</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Ready for your next driving lesson? You can pay for another single lesson or upgrade to a 15-lesson full course package.
                  </p>
                  <a
                    href="#package-selection-payment"
                    className="btn-accent text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 w-full shadow"
                  >
                    <span>Book Next Lesson / Upgrade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Monthly Plan 4-Lesson Cap Banner */}
              {profile?.paymentPlan === 'monthly' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200">
                  <strong>Monthly Plan Active:</strong> Max 4 lessons unlocked per billing month (Server-enforced cap). Total lessons used: {usedLessons}/{unlockedLessons}.
                </div>
              )}

              {/* Lessons Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Lessons Used vs Unlocked:</span>
                  <span className="text-cyan-300 font-bold">
                    {usedLessons} / {unlockedLessons} Lessons
                  </span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden border border-white/15 p-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{remainingLessons} lesson(s) available to book</span>
                  <span className="font-mono text-cyan-300 font-bold">{progressPercent}% Completed</span>
                </div>
              </div>

              {/* Bonus Lessons (if applicable) */}
              {(pkg.bonusLessons?.bike > 0 || pkg.bonusLessons?.threeWheeler > 0) && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Gift className="w-4 h-4 text-accent" /> Bonus Package Lessons Included:
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>🛵 Free Motorbike Lessons:</span>
                    <span className="font-bold text-amber-300">{pkg.bonusLessons.bike} Lessons</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>🛺 Free Three-Wheeler Lessons:</span>
                    <span className="font-bold text-amber-300">{pkg.bonusLessons.threeWheeler} Lessons</span>
                  </div>
                </div>
              )}

              {/* Payment & Registration Status Pill */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Package Status:</span>
                <span
                  className={`badge ${
                    isPackagePaymentConfirmed
                      ? 'badge-success'
                      : isPackagePaymentPending
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}
                >
                  {isPackagePaymentConfirmed
                    ? 'Payment Verified'
                    : isPackagePaymentPending
                    ? 'Pending Officer Review'
                    : 'Awaiting Package Payment'}
                </span>
              </div>

              {/* Need More Practice? Buy Additional Lessons Quick Link */}
              <div className="pt-2 border-t border-white/10">
                <Link
                  to="/student/profile"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-xs text-cyan-300 font-bold transition-all group"
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-cyan-400" /> Need more driving practice?
                  </span>
                  <span className="text-[11px] text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Buy Extra Lessons <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          ) : (!isPackagePaymentConfirmed && (isType2 || (isType1 && isExamPassed))) ? (
            <div className="card p-5 bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-950/90 border border-amber-400/30 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Next Step: Select Package & Pay</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isType1
                  ? '🎉 Congratulations on passing your Theory Exam! Please select your vehicle package and choose your payment plan below to unlock practical lessons.'
                  : 'Your advance payment is verified! Please select your vehicle package and payment plan below to unlock practical lessons.'}
              </p>
              <a
                href="#package-selection-payment"
                className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 w-full shadow-md"
              >
                <span>Choose Package & Pay Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : isType1 && !isExamPassed ? (
            <div className="card p-5 bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-950/80 border border-purple-500/25 space-y-3">
              <div className="flex items-center gap-2.5 text-purple-300 font-bold text-sm">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Stage 1: Theory Exam Stage</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practical vehicle packages and driving lesson bookings will unlock after you pass your official DMT Written Theory Examination.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Current Goal:</span>
                <span className="text-cyan-300 font-bold">Pass DMT Written Exam</span>
              </div>
              <Link
                to="/student/quiz"
                className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 w-full shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Practice DMT Exam Quizzes</span>
              </Link>
            </div>
          ) : null}

          {/* Quick Actions Card (With Type 1 Scope Restriction Applied) */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Student Quick Hub
            </h3>
            <div className="space-y-2 text-xs">
              {/* Type 1 Exclusive Access: Exam/Quiz practice is available for Type 1 learners */}
              {isType1 && (
                <Link
                  to="/student/quiz"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-cyan-500/10 to-transparent hover:from-purple-500/25 border border-purple-400/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-300" />
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-white block">
                        DMT Exam Practice Quiz
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sinhala, Tamil & English • Multilingual Quizzes
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-accent text-[10px] font-bold">Practice Now</span>
                </Link>
              )}

              {isType1 && !isTrialEligible ? (
                <div
                  onClick={() =>
                    toast.error(
                      '🔒 DMT Requirement (US-09): Learner written exam must be marked Passed before booking practical trial lessons.'
                    )
                  }
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 opacity-60 border border-white/10 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-400">
                      Book Driving Lessons (Locked)
                    </span>
                  </div>
                  <span className="badge badge-warning text-[10px]">Exam Required</span>
                </div>
              ) : (
                <Link
                  to="/student/lessons"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      Book Driving Lessons
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-300 font-bold">{remainingLessons} Available</span>
                </Link>
              )}

              <Link
                to="/student/profile"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    Buy Additional Lessons
                  </span>
                </div>
                <span className="text-[11px] text-accent font-bold">Profile Shop</span>
              </Link>

              <Link
                to="/student/payments"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    Payment History & Slips
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Bank Slips</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {renderEditModal()}
      {renderMilestoneModal()}
      {renderExamResultModal()}
      {renderVerifiedCelebrationModal()}
    </div>
  );
}

