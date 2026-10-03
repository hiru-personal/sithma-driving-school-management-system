import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
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
  XCircle,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { SITHMA_OFFICIAL_BANKS } from './PaymentGatewayPage';

const safeFormatDate = (dateVal, formatStr = 'EEEE, MMMM dd, yyyy', fallback = 'None') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

const formatTrialDateDisplay = (dateVal, fallback = 'None') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return format(d, hasTime ? 'EEEE, MMMM dd, yyyy • hh:mm a' : 'EEEE, MMMM dd, yyyy');
  } catch {
    return fallback;
  }
};

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

  // Re-registration after 3 failed attempts
  const [reRegistering, setReRegistering] = useState(false);

  // Dynamic Packages & Payment States (Groups A, B, C & 3 Installments / Single Lesson)
  const [availablePackages, setAvailablePackages] = useState(FALLBACK_PACKAGES);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('C');
  const [selectedPkgId, setSelectedPkgId] = useState('pkg_car_full');

  // Date Reschedule Request State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMilestone, setRescheduleMilestone] = useState('trial');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [preferredRescheduleDate, setPreferredRescheduleDate] = useState('');
  const [preferredRescheduleTime, setPreferredRescheduleTime] = useState('');
  const [rescheduleConfirmed, setRescheduleConfirmed] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [myRescheduleRequests, setMyRescheduleRequests] = useState([]);

  const fetchMyRescheduleRequests = async () => {
    try {
      const res = await api.get('/students/trial-date/reschedule');
      if (res.data.success) {
        setMyRescheduleRequests(res.data.requests);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMyRescheduleRequests();
  }, []);

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    setSubmittingReschedule(true);
    try {
      const res = await api.post('/students/trial-date/reschedule', {
        milestoneType: rescheduleMilestone,
        reason: rescheduleReason,
        preferredDate: preferredRescheduleDate || null,
        preferredTime: preferredRescheduleTime || null,
      });
      if (res.data.success) {
        if (rescheduleMilestone === 'trial') {
          toast.success('Trial Date Request Submitted');
        } else {
          toast.success(res.data.message || 'Date reschedule request submitted successfully!');
        }
        setRescheduleReason('');
        setPreferredRescheduleDate('');
        setPreferredRescheduleTime('');
        setRescheduleConfirmed(false);
        setShowRescheduleModal(false);
        fetchMyRescheduleRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reschedule request');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Trial Outcome Self-Update State (US Trial Exam update by student, no scores)
  const [showTrialResultModal, setShowTrialResultModal] = useState(false);
  const [submittingTrialResult, setSubmittingTrialResult] = useState(false);
  const [trialOutcomeForm, setTrialOutcomeForm] = useState({
    result: 'passed',
    attemptDate: new Date().toISOString().split('T')[0],
    examinerNotes: '',
  });

  const handleStudentTrialSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTrialResult(true);
    try {
      // IMPORTANT: Use the Student document _id (not the auth User _id — they are different)
      const studentId = profile?._id || student?._id;
      if (!studentId) {
        toast.error('Student profile not loaded. Please refresh the page and try again.');
        setSubmittingTrialResult(false);
        return;
      }
      const res = await api.post(`/students/${studentId}/trial-attempt`, {
        result: trialOutcomeForm.result,
        attemptDate: trialOutcomeForm.attemptDate,
        examinerNotes: trialOutcomeForm.examinerNotes,
      });

      if (res.data.success) {
        if (trialOutcomeForm.result === 'passed') {
          toast.success('🎉 Congratulations! Trial recorded as PASSED! Please upload your Driving License Certificate to complete the process.');
        } else if (res.data.registrationStatus === 'cancelled') {
          toast.error('⚠️ Maximum 3 trial attempts failed. Registration has been cancelled.');
        } else {
          toast(`⚠️ Trial attempt recorded as ${trialOutcomeForm.result.toUpperCase()}. ${res.data.attemptsRemaining} attempt(s) remaining.`, {
            icon: '⚠️',
          });
        }

        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        } else {
          fetchProfile();
        }
        setShowTrialResultModal(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to record trial outcome';
      toast.error(errMsg);
      console.error('Trial submit error:', err.response?.data || err.message);
    } finally {
      setSubmittingTrialResult(false);
    }
  };
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
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#package-selection-payment' || location.state?.openPaymentForm) {
      setShowPaymentFormOverride(true);
      setTimeout(() => {
        const el = document.getElementById('package-selection-payment');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [location.hash, location.state]);

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

  // Final Driving License Photo State (US Requirements 6 & 7)
  const [licensePhotoFile, setLicensePhotoFile] = useState(null);
  const [licensePhotoPreview, setLicensePhotoPreview] = useState(null);
  const [licenseNumberInput, setLicenseNumberInput] = useState('');
  const [uploadingLicensePhoto, setUploadingLicensePhoto] = useState(false);
  const [showCycleHistoryModal, setShowCycleHistoryModal] = useState(false);

  useEffect(() => {
    if (profile?.finalLicense?.licenseNumber) {
      setLicenseNumberInput(profile.finalLicense.licenseNumber);
    }
  }, [profile?.finalLicense?.licenseNumber]);

  const handleLicensePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      toast.error('Only JPG, JPEG, PNG, or WEBP image formats are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be 10MB or less.');
      return;
    }
    setLicensePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLicensePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFinalLicense = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!licensePhotoFile && !profile?.finalLicense?.licensePhotoUrl) {
      toast.error('Please choose a license photo to upload.');
      return;
    }
    setUploadingLicensePhoto(true);
    try {
      const studentId = profile?._id || student?._id;
      const formData = new FormData();
      if (licensePhotoFile) {
        formData.append('licensePhoto', licensePhotoFile);
      }
      if (licenseNumberInput) {
        formData.append('licenseNumber', licenseNumberInput.trim());
      }
      const res = await api.post(`/students/${studentId}/final-license`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Final Driving License photo uploaded successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        } else {
          fetchProfile();
        }
        setLicensePhotoFile(null);
        setLicensePhotoPreview(null);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to upload driving license photo';
      toast.error(errMsg);
      console.error('License upload error:', err.response?.data || err.message);
    } finally {
      setUploadingLicensePhoto(false);
    }
  };

  const [updatingExamStatus, setUpdatingExamStatus] = useState(false);

  const handleUpdateExamStatus = async (status) => {
    const studentId = profile?._id || student?._id;
    if (!studentId) return;

    setUpdatingExamStatus(true);
    try {
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        learnerExamStatus: status,
      });
      if (res.data.success) {
        if (status === 'passed') {
          toast.success('🎉 Exam marked as PASSED! Practical trial lessons are now unlocked.');
        } else {
          toast('Exam marked as FAILED. You can request a date reschedule from your milestones dashboard.', { icon: 'ℹ️' });
        }
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update exam status');
    } finally {
      setUpdatingExamStatus(false);
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
            studentId: res.data.student?._id || profile?._id || student?._id,
            userId: user?.id || user?._id,
            branch: profile?.branch || user?.branch,
            amount: 5000,
            paymentType: 'advance',
            studentType: res.data.student?.studentType || profile?.studentType || 'Type 1',
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
      if (!isType2Student && !editForm.packageId) {
        // If Type 1 and no package was chosen, remove empty package fields
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

          const hasSubmitted = Boolean(
            st?.hasSubmittedPayment ||
            st?.latestPayment ||
            (st?.advancePaymentStatus && st.advancePaymentStatus !== 'none') ||
            st?.isAdvancePaid
          );

          if (!isNowVerified && !hasSubmitted) {
            navigate('/payment-gateway', {
              replace: true,
              state: {
                studentName: user?.name || st.name,
                studentId: st._id,
                userId: user?._id || user?.id,
                branch: st.branch || user?.branch,
                nic: st.nic || user?.nic,
                email: user?.email,
                studentType: st.student_type || st.studentType || user?.student_type,
                advanceAmount: st.advancePaymentAmount || 5000,
                registrationReference: st.advancePaymentReference,
              },
            });
            return;
          }

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

  // Type 2 students stay on Dashboard to select course packages and payment plans (Full, Monthly Installments, or Daily Pay-Per-Lesson) once trial date is assigned

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

        const cardDigits = (cardForm.cardNum || '').replace(/\s/g, '');
        const res = await api.post('/payments/package-payment', {
          packageId: selectedPkg._id,
          packageType: selectedPkg.type,
          paymentPlan: finalPlan,
          installmentNumber: finalPlan === 'installments' ? currentInstDue : undefined,
          amount: payAmount,
          paymentMethod: 'online_gateway',
          cardLast4: cardDigits.slice(-4) || '4242',
          cardBrand: cardDigits.startsWith('4') ? 'Visa' : (cardDigits.startsWith('5') ? 'Mastercard' : 'Visa / Mastercard'),
          cardHolder: cardForm.holderName || user?.name,
          bankName: 'Online Payment Gateway (Visa/Mastercard)',
          transactionReference: `CARD-PKG-${Date.now().toString().slice(-8)}`,
        });

        if (res.data?.success) {
          toast.success('🎉 Online card payment submitted! Your payment is pending verification by the branch officer. Lessons will unlock once approved.');
          if (res.data.student) {
            setProfile(res.data.student);
            updateStudentData(res.data.student);
          }
          setShowPaymentFormOverride(false);
          if (fetchProfile) fetchProfile();
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
  // isExamPassed: always derive from attempts array first (any passed attempt = PASSED, regardless of earlier failures)
  const isExamPassed = Boolean(
    profile?.learnerExamStatus === 'passed' ||
    profile?.dmtDates?.learnerExamPassed ||
    (profile?.learnerExamAttempts && profile.learnerExamAttempts.some((a) => a.result === 'passed'))
  );
  const currentTrialDate = profile?.trial_date || profile?.trial?.trialDate || profile?.dmtDates?.trialExamDate || null;
  const hasTrialDate = Boolean(currentTrialDate);
  const isTrialEligible = Boolean((isType2 && hasTrialDate) || (!isType2 && isExamPassed));

  // DMT 1.5-Year Learner License Lifecycle & Multi-Cycle Tracking
  const licenseStartDate =
    profile?.learnerLicenseStartDate ||
    profile?.registration_date ||
    profile?.dmtDates?.learnerRegistrationDate ||
    profile?.createdAt ||
    null;

  const licenseExpiryDate = useMemo(() => {
    if (profile?.learnerLicenseExpiryDate) {
      const d = new Date(profile.learnerLicenseExpiryDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (licenseStartDate) {
      const d = new Date(licenseStartDate);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + 18);
        return d;
      }
    }
    return null;
  }, [profile?.learnerLicenseExpiryDate, licenseStartDate]);

  const remainingDays = useMemo(() => {
    if (!licenseExpiryDate || isNaN(licenseExpiryDate.getTime())) return null;
    const diff = licenseExpiryDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [licenseExpiryDate]);

  const isExpired = Boolean(
    profile?.learnerLicenseStatus === 'expired' ||
    (remainingDays !== null && remainingDays <= 0 && profile?.learnerLicenseStatus !== 'completed' && profile?.learnerLicenseStatus !== 'passed')
  );

  const trialAttemptsList = profile?.trial?.attempts || [];
  const trialAttemptsUsed = trialAttemptsList.length;
  const trialAttemptsRemaining = Math.max(0, 3 - trialAttemptsUsed);
  const latestTrialAttempt = trialAttemptsList.length > 0 ? trialAttemptsList[trialAttemptsList.length - 1] : null;

  const isTrial3AttemptsFailed = Boolean(
    trialAttemptsUsed >= 3 && !trialAttemptsList.some((a) => a.result === 'passed')
  );

  const isTrialPassed = Boolean(
    profile?.trial?.licenseObtained ||
    profile?.isPassed ||
    trialAttemptsList.some((a) => a.result === 'passed')
  );

  const isTrialFailed = Boolean(!isTrialPassed && latestTrialAttempt && latestTrialAttempt.result === 'failed');

  const isLicenseCertificateUploaded = Boolean(
    profile?.finalLicense?.licensePhotoUrl ||
    profile?.finalLicense?.verificationStatus === 'verified' ||
    profile?.finalLicense?.verificationStatus === 'uploaded'
  );

  const isProcessCompleted = Boolean(isTrialPassed && isLicenseCertificateUploaded);

  const isLicenseCompleted = Boolean(
    (profile?.registrationStatus === 'completed' || profile?.learnerLicenseStatus === 'completed') &&
    isLicenseCertificateUploaded
  );

  const is3AttemptsFailed = Boolean(
    profile?.learnerLicenseStatus === 'attempts_exhausted' ||
    (profile?.learnerExamAttempts && profile.learnerExamAttempts.length >= 3 && !profile.learnerExamAttempts.some((a) => a.result === 'passed')) ||
    isTrial3AttemptsFailed
  );

  const isFinalPassed = Boolean(
    profile?.learnerLicenseStatus === 'passed' ||
    isTrialPassed ||
    (isExamPassed && profile?.learnerLicenseStatus !== 'active' && profile?.learnerLicenseStatus !== 'expiring_soon' && profile?.learnerLicenseStatus !== 'pending_payment')
  );

  const isExpiringSoon = Boolean(
    !isExpired && !is3AttemptsFailed && !isFinalPassed && !isLicenseCompleted &&
    (profile?.learnerLicenseStatus === 'expiring_soon' || (remainingDays !== null && remainingDays <= 30 && remainingDays > 0))
  );

  const isLicenseActive = Boolean(
    !isExpired && !is3AttemptsFailed && !isFinalPassed && !isLicenseCompleted && !isExpiringSoon
  );

  const currentRegistrationCycle = useMemo(() => {
    if (!profile?.registrationCycles || profile.registrationCycles.length === 0) return null;
    return (
      profile.registrationCycles.find((c) => c.cycleNumber === profile.currentCycleNumber) ||
      profile.registrationCycles[profile.registrationCycles.length - 1]
    );
  }, [profile?.registrationCycles, profile?.currentCycleNumber]);

  const isCancelled = Boolean(
    isExpired ||
    is3AttemptsFailed ||
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

  const hasSubmittedPayment = Boolean(
    profile?.hasSubmittedPayment ||
    profile?.latestPayment ||
    student?.hasSubmittedPayment ||
    student?.latestPayment ||
    (profile?.advancePaymentStatus && profile.advancePaymentStatus !== 'none') ||
    (student?.advancePaymentStatus && student.advancePaymentStatus !== 'none') ||
    profile?.isAdvancePaid ||
    student?.isAdvancePaid
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
    !isTrialPassed &&
    (showPaymentFormOverride ||
      ((!isPackagePaymentConfirmed || hasUnfinishedInstallments || hasCompletedSingleLesson) &&
        (
          // Type 2: can select package & pay as soon as they are a verified/active student (no trial date needed)
          (isType2 && isVerifiedAccount) ||
          // Type 1: can select package after passing the written exam
          (isType1 && isExamPassed)
        )));


  const renderEditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="card max-w-lg w-full p-6 sm:p-8 bg-white border border-[#D4EEF8] shadow-2xl space-y-6 relative rounded-3xl max-h-[90vh] overflow-y-auto text-[#152026]">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
            <div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-1">
                Correction / Update
              </span>
              <h3 className="text-xl font-black text-[#152026] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1B3D59]" /> Edit Registration Details
              </h3>
              <p className="text-xs text-[#6A97C0] mt-1">
                Correct any errors in your personal or branch enrollment records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-8 h-8 rounded-full bg-[#D4EEF8]/40 flex items-center justify-center text-[#6A97C0] hover:text-[#152026] hover:bg-[#D4EEF8] transition-colors text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#152026]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] placeholder-[#94A3B8] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
                  placeholder="e.g. Kasun Perera"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#152026]">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] placeholder-[#94A3B8] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
                    placeholder="e.g. kasun@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#152026]">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] placeholder-[#94A3B8] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
                    placeholder="e.g. 077 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* NIC */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#152026]">
                National Identity Card (NIC) / Passport
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={editForm.nic}
                  onChange={(e) => setEditForm({ ...editForm, nic: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] placeholder-[#94A3B8] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none font-mono"
                  placeholder="e.g. 200012345678 or 981234567V"
                />
              </div>
            </div>

            {/* Branch & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#152026]">
                  Registered Branch
                </label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
                >
                  <option value="Maharagama">Maharagama Branch</option>
                  <option value="Werahara">Werahara Branch</option>
                  <option value="Delgoda">Delgoda Branch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#152026]">
                  Learner Category
                </label>
                <select
                  value={
                    editForm.studentType === 'Type2_TrialReady' || editForm.studentType === 'Type 2'
                      ? 'Type 2'
                      : 'Type 1'
                  }
                  onChange={(e) => setEditForm({ ...editForm, studentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
                >
                  <option value="Type 1">Category 1: New Learner</option>
                  <option value="Type 2">Category 2: Trial-Ready</option>
                </select>
              </div>
            </div>

            {/* Course Training Package - Only for Type 2 (Trial-Ready) students at registration stage. Type 1 students do NOT select package at registration stage. */}
            {Boolean(editForm.studentType?.includes('Type2') || editForm.studentType === 'Type 2') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#152026] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PackageIcon className="w-3.5 h-3.5 text-[#1B3D59]" /> Enrolled Training Package <span className="text-rose-500">*</span>
                  </span>
                  {editForm.packageId && availablePackages.find((p) => p._id === editForm.packageId) && (
                    <span className="text-[#1B3D59] font-extrabold text-xs">
                      Rs. {Number(availablePackages.find((p) => p._id === editForm.packageId)?.price || 0).toLocaleString()}.00
                    </span>
                  )}
                </label>
                <div className="relative">
                  <PackageIcon className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={editForm.packageId}
                    onChange={(e) => setEditForm({ ...editForm, packageId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-sm focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] outline-none"
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
                    <div className="text-xs text-[#475569] bg-[#D4EEF8]/40 rounded-xl p-3 border border-[#D4EEF8] space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#1B3D59]">
                          {sel.lessons} Practical Driving Lessons ({sel.vehicleCategory || 'Light'} Vehicle)
                        </span>
                        <span className="text-[#152026] font-mono font-bold">
                          {sel.isPerLesson ? `Rs. ${sel.price}/lesson` : `Total Rs. ${Number(sel.price).toLocaleString()}`}
                        </span>
                      </div>
                      {sel.notes && (
                        <p className="text-[11px] text-[#6A97C0] leading-normal">{sel.notes}</p>
                      )}
                      {sel.bonusLessons?.bike > 0 && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                          <Gift className="w-3 h-3" /> Includes {sel.bonusLessons.bike} Bike &amp; {sel.bonusLessons.threeWheeler} Three-Wheeler bonus lessons
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4EEF8]">
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
                className="btn-primary text-xs py-2.5 px-5 font-extrabold flex items-center gap-2 shadow-xs disabled:opacity-50"
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



  const renderVerifiedCelebrationModal = () => {
    if (!showVerifiedCelebrationModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
        <div className="card max-w-lg w-full p-5 sm:p-8 bg-white border border-[#D4EEF8] shadow-2xl space-y-6 relative rounded-3xl text-center max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xs animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <span className="badge badge-success text-[11px] font-extrabold uppercase tracking-wider py-1 px-3">
              Account Verified Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#152026]">
              Now You Are a Verified User! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-md mx-auto">
              Ayubowan, <strong>{user?.name}</strong>! Your Rs. 5,000 advance deposit has been approved by our branch officer.
              {isType1
                ? ' You now have full access to your Type 1 DMT Milestone Schedule, Theory Exam practice, and student dashboard!'
                : ' You now have full access to your student dashboard and practical trial training!'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] text-xs text-left grid grid-cols-2 gap-3">
            <div>
              <span className="text-[#6A97C0] block text-[11px]">Enrolled Category</span>
              <span className="font-bold text-[#152026]">
                {isType1 ? 'Type 1: New Learner' : 'Type 2: Trial-Ready'}
              </span>
            </div>
            <div>
              <span className="text-[#6A97C0] block text-[11px]">Registered Branch</span>
              <span className="font-bold text-[#152026]">
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
            className="w-full btn-primary text-sm py-3.5 font-extrabold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="relative rounded-3xl bg-white border-2 border-red-200 p-6 sm:p-10 shadow-sm overflow-hidden space-y-6">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-red-500" />
          
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  {isExpired ? 'License Status: Expired' : '3 Attempts Failed'}
                </span>
                <span className="text-xs text-[#6A97C0] font-mono">
                  Cycle #{profile?.currentCycleNumber || 1} • {currentRegistrationCycle?.cycleId || 'CYCLE-1'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#152026]">
                {isExpired
                  ? 'Registration Expired'
                  : isTrial3AttemptsFailed
                  ? 'All 3 Trial Exam Attempts Used'
                  : 'All 3 Exam Attempts Used'}
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
                {isExpired ? (
                  <>
                    <strong className="text-[#152026]">Please register again.</strong> According to Department of Motor Traffic (DMT) regulations, once registered, a learner has a maximum of <strong>1.5 years (18 months)</strong> to complete the required licensing process. Your validity period ended on{' '}
                    <strong className="text-[#152026] underline">{licenseExpiryDate ? safeFormatDate(licenseExpiryDate, 'dd MMMM yyyy', 'Expired') : 'Expired'}</strong>.
                  </>
                ) : isTrial3AttemptsFailed ? (
                  <>
                    <strong className="text-[#152026]">Registration Cancelled.</strong> All 3 Trial Exam attempts have been used and were unsuccessful. In accordance with DMT regulations, your current registration cycle has ended. Please start a new registration.
                  </>
                ) : (
                  <>
                    <strong className="text-[#152026]">Registration Cancelled.</strong> In accordance with DMT regulations, candidates are allowed a maximum of <strong>3 attempts</strong> per registration cycle. All 3 attempts have been exhausted. Please start a new registration.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Registration Cycle & Dates Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] space-y-1">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">License Start Date</span>
              <span className="font-bold text-[#152026] font-mono">
                {licenseStartDate ? safeFormatDate(licenseStartDate, 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] space-y-1">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">18-Month Expiry Date</span>
              <span className="font-bold text-red-600 font-mono">
                {licenseExpiryDate ? safeFormatDate(licenseExpiryDate, 'MMM dd, yyyy') : 'Expired'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] space-y-1">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">Exam Attempts Count</span>
              <span className="font-bold text-[#152026] font-mono">
                {attemptsCount} of 3 Attempts Recorded
              </span>
            </div>
          </div>

          {/* Attempts History Table */}
          <div className="rounded-2xl bg-[#D4EEF8]/20 border border-[#D4EEF8] p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[#1B3D59] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B3D59]" /> Examination Attempts History ({attemptsCount} of 3 Used)
              </h3>
              {profile?.registrationCycles && profile.registrationCycles.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowCycleHistoryModal(true)}
                  className="text-xs text-[#1B3D59] hover:underline font-bold flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" /> View Past Registration Cycles ({profile.registrationCycles.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => {
                const att = profile?.learnerExamAttempts?.find((a) => a.attemptNumber === num);
                const hasAtt = Boolean(att);
                const marks = att?.marks;
                const date = att?.date || att?.attemptDate
                  ? safeFormatDate(att.date || att.attemptDate, 'MMM dd, yyyy', 'Not Attempted')
                  : 'Not Attempted';
                return (
                  <div key={num} className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#152026] font-bold">Attempt {num} of 3</span>
                      {hasAtt ? (
                        <span className="badge bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold">
                          FAILED
                        </span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-500 text-[10px]">
                          UNUSED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6A97C0]">{date}</div>
                    <div className="text-xs font-semibold text-red-600">
                      Score: {hasAtt && marks !== null && marks !== undefined ? `${marks} / 40` : (hasAtt ? 'Failed' : '—')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to Re-register */}
          <div className="p-5 rounded-2xl bg-[#F3EED8] border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#152026] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1B3D59]" /> Action: Register Again
              </h4>
              <p className="text-xs text-[#152026]/80 max-w-xl">
                Starting a new registration cycle resets your trial attempt count to <strong>Attempt 1 of 3</strong>, grants a brand new <strong>18-month validity period</strong>, and requires the Rs. 5,000 advance payment. All previous registration records and attempts remain securely stored.
              </p>
            </div>
            <button
              type="button"
              disabled={reRegistering}
              onClick={handleReRegister}
              className="btn-primary text-xs sm:text-sm py-3 px-6 font-bold flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${reRegistering ? 'animate-spin' : ''}`} />
              {reRegistering ? 'Initializing New Cycle...' : 'Register Again (New 18-Month Cycle)'}
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
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#D4EEF8]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3EED8] text-[#152026] border border-amber-300">
              {profile?.branch || user?.branch} Branch
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30">
              {isType2 ? 'Category 2: Trial-Ready' : 'Category 1: New Learner'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal()}
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1B3D59]" /> Edit Registration Details
            </button>
            <button
              onClick={() => fetchProfile(true)}
              disabled={checkingStatus}
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${checkingStatus ? 'animate-spin' : ''}`} />
              {checkingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>

        {/* Primary Warning Hero Card */}
        <div className={`relative rounded-3xl bg-white border-2 ${!hasSubmittedPayment ? 'border-rose-400' : 'border-amber-300'} p-6 sm:p-10 shadow-sm overflow-hidden`}>
          <div className={`absolute inset-x-0 top-0 h-1.5 ${!hasSubmittedPayment ? 'bg-rose-500' : 'bg-amber-400'}`} />

          <div className="flex flex-col lg:flex-row items-start gap-6 relative z-10">
            {/* Glowing Icon Badge */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl ${!hasSubmittedPayment ? 'bg-rose-50 border-2 border-rose-300 text-rose-700' : 'bg-[#F3EED8] border-2 border-amber-300 text-amber-700'} flex items-center justify-center flex-shrink-0 shadow-xs`}>
              {!hasSubmittedPayment ? (
                <CreditCard className="w-9 h-9 sm:w-11 sm:h-11 text-rose-600" />
              ) : (
                <ShieldAlert className="w-9 h-9 sm:w-11 sm:h-11 text-amber-600" />
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                {!hasSubmittedPayment ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Advance Payment Required (Unpaid)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F3EED8] text-[#152026] border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" /> Payment Verification In Progress
                  </span>
                )}
                <span className="text-xs text-[#6A97C0] font-mono">
                  Ref: {profile?.advancePaymentReference || 'ADV-REQUIRED'}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#152026] tracking-tight">
                  {!hasSubmittedPayment
                    ? `Ayubowan, ${user?.name}! Complete Your Advance Payment`
                    : isPhysicalCash
                    ? `Ayubowan, ${user?.name}! Branch Advance Payment Pending`
                    : `Ayubowan, ${user?.name}! Payment Verification In Progress`}
                </h1>

                {/* EXACT REQUIRED STATUS PROMPT */}
                <div className={`p-4 sm:p-5 rounded-2xl ${!hasSubmittedPayment ? 'bg-rose-50/70 border-2 border-rose-300' : 'bg-[#F3EED8] border-2 border-amber-300'} shadow-xs`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 ${!hasSubmittedPayment ? 'text-rose-700' : 'text-amber-700'} flex-shrink-0 mt-0.5`} />
                    <div className="text-sm sm:text-base font-extrabold text-[#152026] leading-relaxed">
                      {!hasSubmittedPayment
                        ? 'Your registration details have been saved, but no advance payment or bank deposit slip has been submitted yet. Please complete your advance payment of LKR 5,000 to submit your registration for branch verification.'
                        : isPhysicalCash
                        ? 'Please visit your nearest branch to complete your advance payment of LKR 5,000. You will gain full system access once the payment is verified by our team.'
                        : 'Your payment is currently being verified by a Data Entry Officer. You cannot access the system until your account is verified.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Notice Details Box */}
              <div className="rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-[#152026] leading-relaxed">
                <p>
                  You have successfully logged in, but your <strong>Student Dashboard, Practical Lesson Bookings, and Course Package Scheduling</strong> are locked until your advance deposit of <strong className="text-[#1B3D59]">Rs. 5,000.00</strong> is paid and verified by our branch Staff Officer or Data Entry Officer.
                </p>
                <p className="text-[#475569] text-xs">
                  {!hasSubmittedPayment
                    ? 'You can pay instantly online via card, upload a bank transfer slip (BOC, People\'s, Commercial, or HNB), or pay in cash at the counter.'
                    : isPhysicalCash
                    ? 'Our staff will record your payment upon counter visit and immediately activate your account.'
                    : 'As soon as our Data Entry Officer approves your bank slip or gateway submission, your dashboard and practical lesson booking privileges will unlock automatically.'}
                </p>
              </div>

              {/* Real-time Status Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] text-xs shadow-xs">
                  <span className="text-[#6A97C0] block text-[11px] font-semibold">Enrolled Category</span>
                  <span className="font-bold text-[#152026]">
                    {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] text-xs shadow-xs">
                  <span className="text-[#6A97C0] block text-[11px] font-semibold">Advance Fee Amount</span>
                  <span className="font-bold text-[#1B3D59]">
                    Rs. {Number(profile?.advancePaymentAmount || 5000).toLocaleString()}.00
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] text-xs shadow-xs">
                  <span className="text-[#6A97C0] block text-[11px] font-semibold">Payment Status</span>
                  {!hasSubmittedPayment ? (
                    <span className="font-bold text-rose-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Payment Required (Unpaid)
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" /> Awaiting Officer Verification
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!hasSubmittedPayment ? (
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
                    className="btn-primary text-xs sm:text-sm py-3 px-6 font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-white" /> Complete Advance Payment Now (Rs. 5,000)
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fetchProfile(true)}
                      disabled={checkingStatus}
                      className="btn-primary text-xs sm:text-sm py-3 px-6 font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
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
                      className="btn-secondary text-xs sm:text-sm py-3 px-5 font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Re-upload / Change Payment Slip
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary of Submitted Details */}
        <div className="rounded-3xl bg-white border border-[#D4EEF8] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
            <h3 className="text-base font-bold text-[#1B3D59] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6A97C0]" /> Your Submitted Registration Profile
            </h3>
            <button
              onClick={openEditModal}
              className="text-xs text-[#1B3D59] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1B3D59]" /> Correct Typo / Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#D4EEF8]/30 border border-[#D4EEF8]">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">Full Name</span>
              <span className="font-bold text-[#152026]">{user?.name || profile?.name || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#D4EEF8]/30 border border-[#D4EEF8]">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">NIC Number</span>
              <span className="font-bold text-[#152026] font-mono">{profile?.nic || user?.nic || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#D4EEF8]/30 border border-[#D4EEF8]">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">Contact Phone</span>
              <span className="font-bold text-[#152026]">{user?.phone || profile?.phone || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#D4EEF8]/30 border border-[#D4EEF8]">
              <span className="text-[#6A97C0] block text-[11px] font-semibold">Registered Branch</span>
              <span className="font-bold text-[#1B3D59]">{profile?.branch || user?.branch} Branch</span>
            </div>
          </div>
        </div>

        {/* ─── CONTACT DETAILS SECTION (REQUIRED BY USER) ────────────────────────── */}
        <div className="rounded-3xl bg-white border border-[#D4EEF8] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[11px] font-bold uppercase tracking-wider mb-1 inline-block">
                Official Support &amp; Verification Helpdesk
              </span>
              <h3 className="text-xl font-black text-[#152026] flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#1B3D59]" /> Contact Sithma Driving School
              </h3>
              <p className="text-xs text-[#475569] mt-1">
                If your payment is urgent or if you have any questions regarding your verification, contact our branch officers directly.
              </p>
            </div>
            <a
              href="https://wa.me/94772849201?text=Hello%20Sithma%20Driving%20School,%20I%20have%20submitted%20my%20advance%20payment%20and%20am%20waiting%20for%20verification."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center gap-2 transition-all self-start sm:self-center shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Verification Support
            </a>
          </div>

          {/* 3 Branch Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Maharagama Branch */}
            <div className="p-5 rounded-2xl bg-white border border-[#D4EEF8] hover:border-[#6A97C0] transition-all space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1B3D59]" /> Maharagama Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">
                  Main Office
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#475569]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0 mt-0.5" />
                  <span>High Level Road, Maharagama</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
                  <a href="tel:0112849201" className="font-bold text-[#1B3D59] hover:underline">011-2849201</a>
                  <span className="text-slate-400">/</span>
                  <a href="tel:0772849201" className="font-bold text-[#1B3D59] hover:underline">077-2849201</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-[#6A97C0] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
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
            <div className="p-5 rounded-2xl bg-white border border-[#D4EEF8] hover:border-[#6A97C0] transition-all space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1B3D59]" /> Werahara Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">
                  DMT Central
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#475569]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0 mt-0.5" />
                  <span>Near DMT Central Office, Werahara</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
                  <a href="tel:0112518492" className="font-bold text-[#1B3D59] hover:underline">011-2518492</a>
                  <span className="text-slate-400">/</span>
                  <a href="tel:0772518492" className="font-bold text-[#1B3D59] hover:underline">077-2518492</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-[#6A97C0] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
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
            <div className="p-5 rounded-2xl bg-white border border-[#D4EEF8] hover:border-[#6A97C0] transition-all space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1B3D59]" /> Delgoda Branch
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">
                  Branch Office
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#475569]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0 mt-0.5" />
                  <span>Main Street, Delgoda</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
                  <a href="tel:0112974820" className="font-bold text-[#1B3D59] hover:underline">011-2974820</a>
                  <span className="text-slate-400">/</span>
                  <a href="tel:0772974820" className="font-bold text-[#1B3D59] hover:underline">077-2974820</a>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-[#6A97C0] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#6A97C0] flex-shrink-0" />
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
          <div className="p-4 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1B3D59]" />
              <span>General inquiries: <a href="mailto:info@sithmadrivingschool.lk" className="text-[#1B3D59] font-bold hover:underline">info@sithmadrivingschool.lk</a></span>
            </div>
            <p className="text-[11px] text-[#6A97C0] text-center sm:text-right">
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
      <div className="relative bg-gradient-to-r from-[#0F2231] via-[#1B3D59] to-[#0F2231] rounded-3xl p-6 sm:p-8 text-white border border-[#6A97C0]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#3F72AF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#6A97C0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 shadow-xs backdrop-blur-xs">
              {profile?.branch} Branch
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#B3D5F1] text-[#0B2447] border border-[#B3D5F1] shadow-xs">
              {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
            </span>
            {profile?.nic && (
              <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-white/15 text-white border border-white/25 shadow-xs">
                NIC: {profile.nic}
              </span>
            )}
            {isAdvancePaymentPending ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#F3EED8] text-[#152026] border border-amber-300 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" /> Status: Pending Verification
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-emerald-500/30 text-emerald-100 border border-emerald-400/50 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Status: Active Learner
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black !text-white tracking-tight leading-tight" style={{ color: '#FFFFFF' }}>
            <span className="text-[#F3EED8]" style={{ color: '#F3EED8' }}>Ayubowan</span>, <span className="text-white" style={{ color: '#FFFFFF' }}>{user?.name}</span>!
          </h1>
          <p className="text-[#D4EEF8] text-xs sm:text-sm max-w-xl leading-relaxed font-normal">
            Welcome to your driving portal. Track official DMT milestones, review your course lesson balance, and book your practical driving sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 sm:self-center relative z-10">
          <button
            onClick={openEditModal}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-xs"
          >
            <Edit3 className="w-4 h-4 text-[#D4EEF8]" /> Edit Details
          </button>
          <button
            onClick={fetchProfile}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#D4EEF8]" /> Refresh
          </button>

          {isProcessCompleted ? (
            <div className="px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Driving License Process Completed ✓
            </div>
          ) : isTrialPassed ? (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-white" /> Trial Passed ✓ (Upload Certificate)
            </div>
          ) : isAdvancePaymentPending ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 Advance Payment Pending: Practical lesson booking is restricted until your advance deposit is approved by your branch officer.'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-amber-500/25 border border-amber-300/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-xs"
              title="Lesson booking locked until advance payment is verified"
            >
              <Lock className="w-4 h-4 text-amber-300" /> Booking Locked (Payment Pending)
            </button>
          ) : isType1 && !isExamPassed ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 DMT Requirement (US-09): Practical & trial lessons can only be booked after passing your Learner Written Exam (marked Passed by your branch officer).'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-xs"
              title="Practical lessons locked until Learner Written Exam is passed"
            >
              <Lock className="w-4 h-4 text-amber-300" /> Lessons Locked (Exam Pending)
            </button>
          ) : isType2 && !hasTrialDate ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 Practical Trial Date Pending: Your branch Data Entry Officer must schedule your official trial date before practical lesson sessions can be booked.'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-xs"
              title="Lessons locked until practical trial date is scheduled"
            >
              <Lock className="w-4 h-4 text-[#D4EEF8]" /> Lessons Locked (Trial Date Pending)
            </button>
          ) : !isPackagePaymentConfirmed && (profile?.lessonsUnlocked || 0) <= 0 ? (
            <a
              href="#package-selection-payment"
              className="px-4 py-2.5 rounded-xl bg-white text-[#1B3D59] hover:bg-[#D4EEF8] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Select Package & Pay
            </a>
          ) : (
            <Link
              to="/student/lessons/book"
              className="px-4 py-2.5 rounded-xl bg-white text-[#1B3D59] hover:bg-[#D4EEF8] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#1B3D59]" /> Book a Lesson
            </Link>
          )}
        </div>
      </div>

      {/* ─── DMT LEARNER LICENSE LIFECYCLE & COMPLETION CARD (US REQUIREMENTS 1, 2, 5, 6, 7, 8, 9) ─── */}
      <div className={`card p-6 sm:p-7 rounded-3xl border-2 transition-all space-y-6 shadow-sm bg-white ${
        isLicenseCompleted
          ? 'border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
          : isFinalPassed
          ? 'border-[#6A97C0] shadow-[0_4px_20px_rgba(106,151,192,0.1)]'
          : isExpiringSoon
          ? 'border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
          : 'border-[#D4EEF8]'
      }`}>
        {/* Top cycle & validity bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
              isLicenseCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isFinalPassed
                ? 'bg-[#D4EEF8] text-[#1B3D59] border-[#6A97C0]/50'
                : isExpiringSoon
                ? 'bg-[#F3EED8] text-[#152026] border-amber-300'
                : 'bg-[#D4EEF8] text-[#1B3D59] border-[#6A97C0]/30'
            }`}>
              {isLicenseCompleted
                ? 'License Completed'
                : isFinalPassed
                ? 'Passed'
                : isExpiringSoon
                ? 'Expiring Soon'
                : 'Active'}
            </span>
            <span className="text-xs text-[#6A97C0] font-mono">
              Registration Cycle #{profile?.currentCycleNumber || 1} • {currentRegistrationCycle?.cycleId || 'CYCLE-1'}
            </span>
          </div>

          {profile?.registrationCycles && profile.registrationCycles.length > 1 && (
            <button
              type="button"
              onClick={() => setShowCycleHistoryModal(true)}
              className="text-xs text-[#1B3D59] hover:underline font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#1B3D59]" /> View Past Cycles ({profile.registrationCycles.length})
            </button>
          )}
        </div>

        {/* Status Header Content */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
            isLicenseCompleted
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : isFinalPassed
              ? 'bg-[#D4EEF8] border-[#6A97C0]/40 text-[#1B3D59]'
              : isExpiringSoon
              ? 'bg-[#F3EED8] border-amber-300 text-amber-700 animate-pulse'
              : 'bg-[#D4EEF8] border-[#6A97C0]/30 text-[#1B3D59]'
          }`}>
            {isLicenseCompleted ? (
              <Award className="w-8 h-8" />
            ) : isFinalPassed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : isExpiringSoon ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#152026]">
              {isLicenseCompleted
                ? 'License Completed'
                : isFinalPassed
                ? 'Passed'
                : isExpiringSoon
                ? 'Learner License Expiring Soon'
                : 'Learner License Active'}
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
              {isLicenseCompleted
                ? 'Your driving license information has been successfully completed.'
                : isFinalPassed
                ? 'Congratulations! You have passed the required process.'
                : isExpiringSoon
                ? `Remaining: ${remainingDays} Days`
                : 'Learner License Active'}
            </p>
          </div>
        </div>

        {/* Recent Trial Result Banner (if failed/absent and still has attempts) */}
        {latestTrialAttempt && latestTrialAttempt.result !== 'passed' && trialAttemptsRemaining > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-amber-950">
                Trial Exam Attempt #{latestTrialAttempt.attemptNumber} – {latestTrialAttempt.result === 'failed' ? 'Failed' : 'Absent'}
              </p>
              <p className="text-amber-800 leading-relaxed">
                You have <strong>{trialAttemptsRemaining} of 3 attempts remaining</strong>. Your registration remains active until{' '}
                <strong>{licenseExpiryDate ? safeFormatDate(licenseExpiryDate, 'dd MMMM yyyy') : '18 months'}</strong>. You may schedule a new trial date to re-take your practical trial exam.
              </p>
            </div>
          </div>
        )}

        {/* 18-Month Validity Period & Attempt Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px] font-semibold">18-Month Registration Validity</span>
            <span className={`font-bold font-mono text-sm ${isExpiringSoon ? 'text-amber-700' : 'text-[#1B3D59]'}`}>
              {licenseExpiryDate ? safeFormatDate(licenseExpiryDate, 'dd MMMM yyyy') : 'In 18 Months'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {remainingDays !== null ? `${remainingDays} Days Remaining` : 'Active'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px] font-semibold">Practical Trial Attempts</span>
            <span className={`font-bold text-sm ${trialAttemptsRemaining === 1 ? 'text-amber-700' : trialAttemptsRemaining === 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {trialAttemptsRemaining} of 3 Remaining
            </span>
            <span className="text-[10px] text-slate-500 block">
              {trialAttemptsUsed} / 3 Attempts Used
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px] font-semibold">Written Exam Attempts</span>
            <span className="font-bold text-[#152026] text-sm">
              {attemptsCount} of 3 Attempts Used
            </span>
            <span className="text-[10px] text-slate-500 block">
              {isExamPassed ? '✓ Theory Exam Passed' : 'Pending Theory Pass'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px] font-semibold">Registration Status</span>
            <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registration Active
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              Cycle #{profile?.currentCycleNumber || 1}
            </span>
          </div>
        </div>

        {/* ─── DRIVING LICENSE / FINAL LICENSE SECTION (US REQUIREMENTS 6 & 7) ─── */}
        {(isFinalPassed || isLicenseCompleted || profile?.finalLicense?.licensePhotoUrl) && (
          <div className="rounded-2xl bg-[#D4EEF8]/20 border border-[#D4EEF8] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1B3D59] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1B3D59]" /> Driving License / Final License
                </h3>
                <p className="text-xs text-[#475569] mt-0.5">
                  Official physical driving license details and document verification.
                </p>
              </div>
              <div>
                {profile?.finalLicense?.licensePhotoUrl ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    isLicenseCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#D4EEF8] text-[#1B3D59] border-[#6A97C0]/40'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> License Photo: Uploaded ✓
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3EED8] text-[#152026] border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" /> License Photo: Not Uploaded
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Photo Preview / Upload Form */}
              <form onSubmit={handleUploadFinalLicense} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#152026] font-semibold mb-1">
                    License Number (if applicable):
                  </label>
                  <input
                    type="text"
                    value={licenseNumberInput}
                    onChange={(e) => setLicenseNumberInput(e.target.value)}
                    placeholder="e.g. B1234567"
                    disabled={isLicenseCompleted}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-mono focus:border-[#1B3D59] focus:outline-none disabled:opacity-70"
                  />
                </div>

                {!isLicenseCompleted && (
                  <div className="space-y-2">
                    <label className="block text-[#152026] font-semibold">
                      {profile?.finalLicense?.licensePhotoUrl ? 'Replace Driving License Photo:' : 'Upload Driving License Photo (JPG, PNG, WEBP — Max 10MB):'}
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleLicensePhotoSelect}
                      className="w-full text-xs text-[#475569] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4EEF8] file:text-[#1B3D59] hover:file:bg-[#B3D5F1] cursor-pointer"
                    />
                  </div>
                )}

                {!isLicenseCompleted && (
                  <button
                    type="submit"
                    disabled={uploadingLicensePhoto || (!licensePhotoFile && licenseNumberInput === (profile?.finalLicense?.licenseNumber || ''))}
                    className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className={`w-3.5 h-3.5 ${uploadingLicensePhoto ? 'animate-spin' : ''}`} />
                    {uploadingLicensePhoto
                      ? 'Uploading...'
                      : profile?.finalLicense?.licensePhotoUrl
                      ? 'Update License Information'
                      : 'Upload License Photo'}
                  </button>
                )}
              </form>

              {/* Photo Display Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#D4EEF8] space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#152026] font-semibold">License Photo Preview:</span>
                  <span className="text-[#6A97C0] font-mono text-[11px]">
                    {profile?.finalLicense?.verificationStatus === 'verified'
                      ? 'Verified by Admin ✓'
                      : profile?.finalLicense?.licensePhotoUrl
                      ? 'Pending Admin Verification'
                      : 'Awaiting Upload'}
                  </span>
                </div>

                {licensePhotoPreview || profile?.finalLicense?.licensePhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#D4EEF8] bg-slate-50 group">
                    <img
                      src={licensePhotoPreview || profile.finalLicense.licensePhotoUrl}
                      alt="Driving License"
                      className="w-full max-h-56 object-contain mx-auto"
                    />
                    <a
                      href={licensePhotoPreview || profile.finalLicense.licensePhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-[#1B3D59]/90 hover:bg-[#152026] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-white" /> View Original
                    </a>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-[#D4EEF8] rounded-xl text-center space-y-2">
                    <CreditCard className="w-10 h-10 text-[#6A97C0] mx-auto" />
                    <p className="text-xs text-[#475569]">
                      No driving license photo uploaded yet. Select a photo to preview and submit.
                    </p>
                  </div>
                )}

                {profile?.finalLicense?.uploadedAt && (
                  <div className="text-[11px] text-[#6A97C0] flex items-center justify-between pt-1 border-t border-[#D4EEF8]">
                    <span>Uploaded: {safeFormatDate(profile.finalLicense.uploadedAt, 'MMM dd, yyyy')}</span>
                    {profile.finalLicense.licenseNumber && (
                      <span className="font-mono text-[#1B3D59] font-bold">No: {profile.finalLicense.licenseNumber}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── PAST REGISTRATION CYCLES HISTORY MODAL (US REQUIREMENTS 2, 4, 10) ─── */}
      {showCycleHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1B3D59] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1B3D59]" /> Registration Cycles &amp; Attempt History
                </h3>
                <p className="text-xs text-[#475569]">
                  Complete historical records of all DMT enrollment cycles for this learner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCycleHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {profile?.registrationCycles?.map((cycle, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    cycle.cycleNumber === profile.currentCycleNumber
                      ? 'bg-[#D4EEF8]/30 border-[#6A97C0]/60'
                      : 'bg-white border-[#D4EEF8]'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#152026] text-sm">
                        Cycle #{cycle.cycleNumber} ({cycle.cycleId || `CYCLE-${cycle.cycleNumber}`})
                      </span>
                      {cycle.cycleNumber === profile.currentCycleNumber && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/40 text-[10px] font-bold">
                          Current Cycle
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-bold">
                      Status: {cycle.status || 'Archived'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#475569]">
                    <div>
                      <span className="text-[#6A97C0] block text-[10px] font-semibold">Start Date:</span>
                      <span className="font-mono text-[#152026] font-bold">{safeFormatDate(cycle.startDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-[#6A97C0] block text-[10px] font-semibold">18-Month Expiry:</span>
                      <span className="font-mono text-[#152026] font-bold">{safeFormatDate(cycle.expiryDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-[#6A97C0] block text-[10px] font-semibold">Exam Attempts:</span>
                      <span className="font-mono text-[#152026] font-bold">{cycle.examAttempts?.length || 0} of 3</span>
                    </div>
                    <div>
                      <span className="text-[#6A97C0] block text-[10px] font-semibold">Advance Deposit:</span>
                      <span className="font-mono text-emerald-700 font-bold">{cycle.isAdvancePaid ? 'Paid ✓' : 'Pending'}</span>
                    </div>
                  </div>

                  {cycle.examAttempts && cycle.examAttempts.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-[#D4EEF8]">
                      <span className="text-[10px] font-bold text-[#6A97C0] uppercase tracking-wider block">
                        Cycle Exam Attempts:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {cycle.examAttempts.map((att, aIdx) => (
                          <div key={aIdx} className="p-2.5 rounded-xl bg-white border border-[#D4EEF8] text-[11px] space-y-0.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#152026]">Attempt {att.attemptNumber}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                att.result === 'passed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {att.result?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-[#6A97C0] text-[10px]">
                              {safeFormatDate(att.date, 'MMM dd, yyyy', 'No Date')}
                            </div>
                            {att.marks !== undefined && att.marks !== null && (
                              <div className="font-mono text-[#1B3D59] font-bold text-[10px]">
                                Score: {att.marks}/40
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setShowCycleHistoryModal(false)}
                className="btn-secondary text-xs py-2 px-5 font-bold cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TYPE 2: AWAITING PRACTICAL TRIAL DATE SCHEDULING NOTICE */}
      {isType2 && !hasTrialDate && (
        <div className="card p-6 bg-white border-2 border-amber-300 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Calendar className="w-6 h-6 text-amber-700 animate-pulse" />
              </div>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                  Type 2: Trial-Ready Student • Step 1: Trial Date Assignment
                </span>
                <h3 className="text-lg font-extrabold text-[#152026] flex items-center gap-2">
                  Awaiting Official DMT Practical Trial Date
                </h3>
                <p className="text-xs text-[#475569] mt-1 max-w-2xl leading-relaxed">
                  As a <strong>Type 2 (Trial-Ready)</strong> student holding an existing learner permit, you are <strong>exempt from DMT Medical, Registration, and Written Theory Exam</strong>.
                  Your branch Data Entry Officer will schedule your official Practical Driving Trial Date. In the meantime, you can <strong>select your course package and complete payment below</strong> — this will allow us to prepare your lesson schedule. <strong>Lesson booking will unlock once your trial date is assigned.</strong>
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-[#D4EEF8]/30 rounded-2xl border border-[#D4EEF8] text-left sm:text-right self-stretch sm:self-auto sm:min-w-[190px]">
              <span className="text-[10px] text-[#6A97C0] font-semibold block">DMT Milestones:</span>
              <span className="text-xs font-black text-emerald-700 flex items-center justify-start sm:justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Exempt / Complete
              </span>
              <span className="text-[10px] text-[#6A97C0] font-semibold block mt-2">Trial Date Status:</span>
              <span className="text-xs font-black text-amber-800">
                Pending Branch Scheduling
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Shared Practical Trial Date & Reschedule Banner (Active for both Type 1 & Type 2) */}
      {(hasTrialDate || (isTrialEligible && trialAttemptsUsed > 0) || isTrialPassed || isTrialFailed) && (
        <div className="card p-6 border-2 border-[#D4EEF8] bg-white rounded-3xl shadow-sm hover:border-[#6A97C0] transition-all flex flex-col gap-5">
          {(() => {
            const finalLicense = profile?.finalLicense || {};
            const isCertificateUploaded = Boolean(
              finalLicense?.licensePhotoUrl ||
              finalLicense?.verificationStatus === 'verified' ||
              finalLicense?.verificationStatus === 'uploaded'
            );
            const isProcessCompleted = Boolean(isTrialPassed && isCertificateUploaded);

            return (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                      isProcessCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isTrialPassed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isTrialFailed
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30'
                    }`}>
                      {isProcessCompleted || isTrialPassed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : isTrialFailed ? (
                        <XCircle className="w-6 h-6 text-rose-600" />
                      ) : (
                        <Calendar className="w-6 h-6 text-[#1B3D59]" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-[#1B3D59]">
                          {isType2 ? 'Type 2 Practical Driving Trial' : 'Official DMT Practical Trial'}
                        </span>
                        {isProcessCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Driving License Process Completed ✓
                          </span>
                        ) : isTrialPassed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Practical Trial PASSED ✓ (Upload Certificate)
                          </span>
                        ) : isTrialFailed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" /> Practical Trial FAILED ({trialAttemptsRemaining} Remaining)
                          </span>
                        ) : isTrial3AttemptsFailed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold">
                            All 3 Trial Attempts Failed
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${trialAttemptsUsed > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                            {trialAttemptsUsed}/3 Attempts Used
                          </span>
                        )}
                        {myRescheduleRequests.find((r) => r.status === 'Pending') && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700 animate-pulse" /> Reschedule Pending DEO Review
                          </span>
                        )}
                      </div>

                      {/* Prominent Result Header (Exact styling requested) */}
                      {isTrialPassed ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-xs text-[#475569] font-medium flex-wrap">
                            <span>Attempts Used: <strong className="text-[#152026] font-mono text-sm">{trialAttemptsUsed} / 3</strong></span>
                            <span>Trial Date: <strong className="text-[#152026] font-mono text-sm">{formatTrialDateDisplay(currentTrialDate)}</strong></span>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A97C0] block">Result:</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 flex items-center gap-2">
                              PASSED ✓
                            </h2>
                          </div>
                        </div>
                      ) : isTrialFailed ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-xs text-[#475569] font-medium flex-wrap">
                            <span>Attempts Used: <strong className="text-[#152026] font-mono text-sm">{trialAttemptsUsed} / 3</strong></span>
                            <span>Attempts Remaining: <strong className="text-rose-900 font-bold text-sm bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">{trialAttemptsRemaining}</strong></span>
                            <span>Trial Date: <strong className="text-[#152026] font-mono text-sm">{formatTrialDateDisplay(currentTrialDate)}</strong></span>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A97C0] block">Result:</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-rose-700 flex items-center gap-2">
                              FAILED
                            </h2>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-xs text-[#475569] font-medium flex-wrap">
                            <span>Attempts Used: <strong className="text-[#152026] font-mono text-sm">{trialAttemptsUsed} / 3</strong></span>
                            {currentTrialDate && (
                              <span>Trial Date: <strong className="text-[#152026] font-mono text-sm">{formatTrialDateDisplay(currentTrialDate)}</strong></span>
                            )}
                            <span className="text-xs font-bold text-[#1B3D59] bg-[#D4EEF8] px-2.5 py-0.5 rounded-full">
                              Status: Scheduled
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-[#152026]">
                            {currentTrialDate
                              ? `Scheduled Trial Date: ${formatTrialDateDisplay(currentTrialDate)}`
                              : 'Practical Trial Assigned (Awaiting Date)'}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#475569] max-w-xl leading-relaxed mt-0.5">
                            You can book practical driving lessons up until your scheduled trial date. After your trial exam at DMT, update your trial outcome below.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {/* If Failed with attempts remaining: Book Lesson + Request Another Trial Date + Update Outcome */}
                    {isTrialFailed && trialAttemptsRemaining > 0 && (
                      <>
                        <Link
                          to="/student/lessons/book"
                          className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-xs bg-[#19376D] hover:bg-[#0B2447] text-white"
                        >
                          <Car className="w-4 h-4 text-blue-200" />
                          <span>🚗 Book Lesson</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleMilestone('trial');
                            setRescheduleReason(`Requesting re-trial date after Attempt #${trialAttemptsUsed} result.`);
                            setPreferredRescheduleDate('');
                            setPreferredRescheduleTime('08:30 AM');
                            setRescheduleConfirmed(false);
                            setShowRescheduleModal(true);
                          }}
                          className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-[#1B3D59]" />
                          <span>📅 Request Another Trial Date</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTrialOutcomeForm({
                              result: 'passed',
                              attemptDate: currentTrialDate ? currentTrialDate.split('T')[0] : new Date().toISOString().split('T')[0],
                              examinerNotes: '',
                            });
                            setShowTrialResultModal(true);
                          }}
                          className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Award className="w-4 h-4 text-white" /> Update Trial Result
                        </button>
                      </>
                    )}

                    {/* If Scheduled (not passed and not failed) */}
                    {!isTrialPassed && !isTrialFailed && !isTrial3AttemptsFailed && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTrialOutcomeForm({
                              result: 'passed',
                              attemptDate: currentTrialDate ? currentTrialDate.split('T')[0] : new Date().toISOString().split('T')[0],
                              examinerNotes: '',
                            });
                            setShowTrialResultModal(true);
                          }}
                          className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Award className="w-4 h-4 text-white" /> Update Trial Result
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleMilestone('trial');
                            setPreferredRescheduleDate('');
                            setPreferredRescheduleTime('08:30 AM');
                            setRescheduleConfirmed(false);
                            setShowRescheduleModal(true);
                          }}
                          className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-[#1B3D59]" /> Request Trial Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* PASSED FLOW: 3 Steps + Process Completed or Certificate Upload */}
                {isTrialPassed && (
                  <div className="space-y-4 pt-3 border-t border-[#D4EEF8]">
                    {/* 3-Step Progression */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-100/80 border border-emerald-300 flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          ✓
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-800 uppercase font-bold">Step 1: Practical Trial</div>
                          <div className="text-xs font-black text-emerald-950">PASSED ✓</div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                        isCertificateUploaded
                          ? 'bg-emerald-100/80 border-emerald-300'
                          : 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 animate-pulse'
                      }`}>
                        <div className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 ${
                          isCertificateUploaded ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {isCertificateUploaded ? '✓' : '2'}
                        </div>
                        <div>
                          <div className={`text-[10px] uppercase font-bold ${isCertificateUploaded ? 'text-emerald-800' : 'text-amber-800'}`}>
                            Step 2: License Certificate
                          </div>
                          <div className={`text-xs font-black ${isCertificateUploaded ? 'text-emerald-950' : 'text-amber-950'}`}>
                            {isCertificateUploaded ? 'Uploaded ✓' : 'Upload Required'}
                          </div>
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                        isProcessCompleted
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <div className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 ${
                          isProcessCompleted ? 'bg-white text-emerald-700' : 'bg-slate-300 text-slate-700'
                        }`}>
                          {isProcessCompleted ? '✓' : '3'}
                        </div>
                        <div>
                          <div className={`text-[10px] uppercase font-bold ${isProcessCompleted ? 'text-emerald-100' : 'text-slate-400'}`}>
                            Step 3: Final Status
                          </div>
                          <div className="text-xs font-black">
                            {isProcessCompleted ? 'Process Completed ✓' : 'Pending Upload'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Process Completed Banner */}
                    {isProcessCompleted ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-black text-sm sm:text-base flex items-center gap-2">
                              Driving License Process Completed ✓
                            </h4>
                            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                              Congratulations! You have passed your practical driving trial and uploaded your driving license certificate. Your driver's license journey is officially complete.
                            </p>
                            {finalLicense?.licenseNumber && (
                              <div className="text-xs font-mono font-bold bg-white/15 px-2 py-0.5 rounded inline-block mt-1">
                                License No: {finalLicense.licenseNumber}
                              </div>
                            )}
                          </div>
                        </div>

                        {finalLicense?.licensePhotoUrl && (
                          <a
                            href={finalLicense.licensePhotoUrl.startsWith('http') ? finalLicense.licensePhotoUrl : `http://localhost:5001${finalLicense.licensePhotoUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-4 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-center cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-emerald-700" />
                            <span>View Uploaded Certificate</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      /* Step 2 Form: Upload Certificate */
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-4">
                        <div>
                          <h4 className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#1B3D59]" /> Driving License Certificate
                          </h4>
                          <p className="text-xs text-[#475569] mt-1 font-medium leading-relaxed">
                            Congratulations! You have passed your practical driving trial. Please upload your driving license certificate to complete the process.
                          </p>
                        </div>

                        <form onSubmit={handleUploadFinalLicense} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[#152026] font-semibold mb-1">
                                License Number (Optional):
                              </label>
                              <input
                                type="text"
                                value={licenseNumberInput}
                                onChange={(e) => setLicenseNumberInput(e.target.value)}
                                placeholder="e.g. B8942156"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-mono text-xs font-bold focus:border-[#1B3D59] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[#152026] font-semibold mb-1">
                                Upload Driving License Certificate <span className="text-rose-500">*</span>:
                              </label>
                              <input
                                type="file"
                                required
                                accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                                onChange={handleLicensePhotoSelect}
                                className="w-full text-xs text-[#475569] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4EEF8] file:text-[#1B3D59] hover:file:bg-[#B3D5F1] cursor-pointer"
                              />
                            </div>
                          </div>

                          {licensePhotoPreview && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-[#D4EEF8] flex items-center gap-3">
                              <img
                                src={licensePhotoPreview}
                                alt="Certificate Preview"
                                className="w-20 h-14 object-cover rounded-lg border border-[#B3D5F1] shadow-xs"
                              />
                              <div>
                                <span className="text-xs font-bold text-[#152026] block">Selected Certificate Image</span>
                                <span className="text-[11px] text-emerald-700 font-semibold">Ready to upload</span>
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={uploadingLicensePhoto || !licensePhotoFile}
                            className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Upload className={`w-4 h-4 ${uploadingLicensePhoto ? 'animate-spin' : ''}`} />
                            <span>{uploadingLicensePhoto ? 'Uploading Certificate...' : 'Upload Driving License Certificate'}</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}

          {/* Recorded Trial Attempts History (No Scores) */}
          {trialAttemptsList.length > 0 && (
            <div className="w-full pt-4 border-t border-[#D4EEF8]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#152026]">
                  Recorded Practical Trial Attempts ({trialAttemptsList.length} of 3):
                </span>
                <span className="text-[11px] text-[#6A97C0] font-semibold">
                  {trialAttemptsRemaining} attempt{trialAttemptsRemaining === 1 ? '' : 's'} remaining
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {trialAttemptsList.map((att, idx) => (
                  <div
                    key={att._id || idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      att.result === 'passed'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[#152026]">Attempt #{att.attemptNumber || idx + 1}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {safeFormatDate(att.date || att.attemptDate, 'MMM dd, yyyy', 'Recorded')}
                      </div>
                      {att.examinerNotes && (
                        <p className="text-[10px] text-slate-600 italic mt-0.5 line-clamp-1 max-w-[180px]">
                          "{att.examinerNotes}"
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        att.result === 'passed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {att.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TYPE 1: US-09 DMT LEARNER EXAM GATE & STATUS SELECTOR BANNER */}
      {isType1 && (
        <div className="card p-6 bg-white border-2 border-[#DBE2EF] space-y-4 shadow-sm hover:border-[#3F72AF]/40 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                isExamPassed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-[#DBE2EF]/70 border border-[#3F72AF]/30 text-[#112D4E]'
              }`}>
                {isExamPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-[#3F72AF] animate-pulse" />
                )}
              </div>
              <div className="space-y-1.5">
                <span className={`badge text-[10px] font-bold uppercase tracking-wider ${
                  isExamPassed ? 'badge-success' : 'badge-warning'
                }`}>
                  {isExamPassed ? '✓ DMT Theory Exam Cleared' : 'US-09 DMT Regulation Active • Theory Exam Gate'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#0B2447] flex items-center gap-2">
                  {isExamPassed
                    ? 'DMT Theory Exam Passed — Practical Trial Lessons Unlocked!'
                    : 'Practical Trial Lessons Locked Until Learner\'s Exam Passed'}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B6584] max-w-2xl leading-relaxed">
                  {isExamPassed
                    ? 'Congratulations! You have successfully passed the DMT Written Theory Exam. You are eligible to book and schedule your practical trial training sessions.'
                    : 'As a Type 1 New Learner, in accordance with DMT regulations, on-road practical driving and trial lessons can only be booked after your Learner Written Exam is completed and passed.'}
                </p>
                <div className="pt-1.5">
                  <Link
                    to="/student/milestones"
                    className="btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Go to DMT Milestones Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#D4EEF8]/30 rounded-2xl border border-[#D4EEF8] text-left sm:text-right self-stretch sm:self-auto sm:min-w-[190px] shadow-xs">
              <span className="text-xs text-[#6A97C0] font-bold block mb-1">Your Exam Status:</span>
              <span
                className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full inline-block ${
                  isExamPassed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : profile?.learnerExamStatus === 'failed'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : profile?.dmtDates?.learnerExamDate
                    ? 'bg-[#F3EED8] text-[#152026] border border-amber-300'
                    : 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30'
                }`}
              >
                {isExamPassed
                  ? '✓ PASSED'
                  : profile?.learnerExamStatus === 'failed'
                  ? '✕ FAILED (Retake Required)'
                  : profile?.dmtDates?.learnerExamDate
                  ? '⏳ Scheduled / In Progress'
                  : 'Not Yet Faced'}
              </span>
            </div>
          </div>

          {/* Interactive Exam Outcome Selector for Student (Hidden once trial is passed) */}
          {!isTrialPassed && (
            <div className="pt-3.5 border-t border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFD]/70 -mx-6 -mb-6 p-4 rounded-b-2xl">
              <div>
                <span className="text-xs font-bold text-[#0B2447] block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#3F72AF]" /> Faced your DMT Written Theory Exam?
                </span>
                <span className="text-[11px] text-[#4B6584]">
                  Select your official exam outcome below to update your status across the school system:
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpdateExamStatus('passed')}
                  disabled={updatingExamStatus}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isExamPassed
                      ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-500'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Passed</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateExamStatus('failed')}
                  disabled={updatingExamStatus}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    profile?.learnerExamStatus === 'failed'
                      ? 'bg-rose-600 text-white shadow-rose-200 ring-2 ring-rose-500'
                      : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Failed</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COURSE PACKAGE SELECTION & PAYMENT BANNER (FOR TRIAL-READY STUDENTS) */}
      {showPackagePaymentBanner && (
        <div id="package-selection-payment" className="card p-6 sm:p-8 bg-white border-2 border-[#D4EEF8] space-y-6 shadow-sm rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-xs font-bold uppercase tracking-wider mb-1 inline-block">
                {hasUnfinishedInstallments
                  ? `Installment #${(profile?.installmentsPaidCount || 0) + 1} Due • Unlock 5 More Lessons`
                  : hasCompletedSingleLesson
                  ? 'Single Lesson Completed • Book Another or Upgrade to Full Course'
                  : isType2 && !hasTrialDate
                  ? 'Type 2 Student • Step 1: Select Course Package & Pay'
                  : isType2
                  ? 'Trial Date Scheduled • Step 2: Course Package Selection & Payment'
                  : 'Theory Exam Passed • Step 2: Course Package Selection & Payment'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[#1B3D59]" />
                {hasUnfinishedInstallments
                  ? `Pay Next Installment (Installment #${(profile?.installmentsPaidCount || 0) + 1} of 3)`
                  : 'Select Course Package & Choose Payment Plan'}
              </h2>
              <p className="text-xs text-[#475569] mt-1">
                {hasUnfinishedInstallments
                  ? `You have unlocked ${profile?.lessonsUnlocked || 5} lessons. Pay your next installment to unlock 5 additional lessons.`
                  : isType2 && !hasTrialDate
                  ? 'Select your vehicle training package and complete payment. Your lesson booking will be unlocked once your branch officer assigns your Practical Trial Date.'
                  : isType2
                  ? `Your practical trial is scheduled for ${currentTrialDate ? safeFormatDate(currentTrialDate, 'MMMM dd, yyyy') : 'your scheduled trial session'}. Select your vehicle package below and choose your payment plan (3 Monthly Installments, Full Course, or Daily Pay-Per-Lesson) to unlock lessons up until your trial date.`
                  : 'Congratulations on passing your DMT Written Examination! Select your package below and choose your payment plan (3 Monthly Installments, Full Course, or Daily Pay-Per-Lesson) to unlock practical driving lessons up until your trial date.'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isPackagePaymentPending && (
                <span className="px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-xs font-bold">
                  ⏳ Payment Slip Pending Verification
                </span>
              )}
              {showPaymentFormOverride && isPackagePaymentConfirmed && !hasUnfinishedInstallments && !hasCompletedSingleLesson && (
                <button
                  type="button"
                  onClick={() => setShowPaymentFormOverride(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ Close
                </button>
              )}
            </div>
          </div>

          {/* Active Installment Progress Tracker (if currently on installments) */}
          {hasUnfinishedInstallments && (
            <div className="p-4 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#152026] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1B3D59]" /> Active 3-Installment Plan:
                  <span className="text-[#1B3D59] font-mono ml-1 font-bold">{profile?.package?.type?.replace('_', ' ') || 'Car Package'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 text-[10px] font-bold">
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
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isCurrentDue
                          ? 'bg-[#F3EED8] border-amber-300 text-[#152026] ring-1 ring-amber-300 shadow-xs'
                          : 'bg-white border-[#D4EEF8] text-[#6A97C0]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span>Installment #{inst.num}</span>
                        {isPaid ? (
                          <span className="text-emerald-700 text-[10px]">✓ Paid</span>
                        ) : isCurrentDue ? (
                          <span className="text-amber-800 text-[10px]">Due Now</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Upcoming</span>
                        )}
                      </div>
                      <div className="font-black text-sm text-[#152026]">Rs. {inst.amount.toLocaleString()}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">Unlocks 5 Lessons</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Payment Notice */}
          {isPackagePaymentPending && !showPaymentFormOverride ? (
            <div className="p-5 rounded-2xl bg-[#F3EED8] border border-amber-300 text-xs text-[#152026] space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <div>
                  <strong className="text-[#152026] text-sm">Your course package payment slip is awaiting branch review.</strong>
                  <p className="text-[#475569] mt-0.5 leading-relaxed">
                    Our Data Entry Officer is verifying your bank deposit. Your lesson balance will unlock automatically upon verification.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-300/60 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#475569]">
                  Want to switch to online card payment for instant unlock?
                </span>
                <button
                  type="button"
                  onClick={() => setShowPaymentFormOverride(true)}
                  className="btn-primary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                    <label className="block text-xs font-bold text-[#152026] uppercase tracking-wider">
                      1. Choose Vehicle Training Package Category:
                    </label>
                    {/* Category Selector Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#D4EEF8]/40 rounded-xl border border-[#D4EEF8] self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryGroup('C')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedCategoryGroup === 'C'
                            ? 'bg-[#1B3D59] text-white shadow-xs'
                            : 'text-[#1B3D59] hover:bg-[#D4EEF8]'
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedCategoryGroup === 'B'
                            ? 'bg-[#1B3D59] text-white shadow-xs'
                            : 'text-[#1B3D59] hover:bg-[#D4EEF8]'
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedCategoryGroup === 'A'
                            ? 'bg-[#1B3D59] text-white shadow-xs'
                            : 'text-[#1B3D59] hover:bg-[#D4EEF8]'
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
                                ? 'border-[#1B3D59] bg-[#D4EEF8]/30 ring-2 ring-[#1B3D59] shadow-xs'
                                : 'border-[#D4EEF8] bg-white hover:border-[#6A97C0] hover:shadow-xs'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-[#152026] text-xs leading-snug">{pkgItem.name}</span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-[#1B3D59] flex-shrink-0 ml-1" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 ml-1" />
                              )}
                            </div>
                            <div className="text-base font-black text-[#1B3D59] mb-1">
                              Rs. {pkgItem.price?.toLocaleString()}
                              {pkgItem.isPerLesson && (
                                <span className="text-[10px] font-normal text-[#6A97C0] ml-1">/ lesson</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#475569] leading-relaxed mb-2">
                              {pkgItem.lessons} {pkgItem.lessons === 1 ? 'Lesson' : 'Lessons'} • {pkgItem.notes || 'Curriculum compliant'}
                            </p>
                            {pkgItem.bonusLessons && (pkgItem.bonusLessons.bike > 0 || pkgItem.bonusLessons.threeWheeler > 0) && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                                <Gift className="w-3 h-3 text-emerald-600" /> +{pkgItem.bonusLessons.bike} Bike & +{pkgItem.bonusLessons.threeWheeler} Three-Wheel Free
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
                  <label className="block text-xs font-bold text-[#152026] uppercase tracking-wider mb-2">
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
                                ? 'border-[#1B3D59] bg-[#D4EEF8]/30 ring-2 ring-[#1B3D59] shadow-xs'
                                : 'border-[#D4EEF8] bg-white text-[#475569] hover:border-[#6A97C0]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-[#152026] flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-[#1B3D59]" /> Option A: Full Upfront Payment
                              </span>
                              {selectedPlan === 'full' && <CheckCircle2 className="w-5 h-5 text-[#1B3D59]" />}
                            </div>
                            <div className="text-lg font-black text-[#1B3D59] mb-1">
                              Rs. {(activePkg?.price || 40000).toLocaleString()}
                            </div>
                            <p className="text-xs text-[#475569] leading-relaxed">
                              Pay the full course fee upfront. <strong className="text-[#152026]">Immediately unlocks all 15 included lessons</strong> so you can book any available time slot.
                            </p>
                            <div className="mt-3 text-[11px] text-[#1B3D59] font-bold flex items-center gap-1">
                              ✓ Unlocks All 15 Lessons Instantly
                            </div>
                          </div>

                          {/* Option B: 3 Installments */}
                          <div
                            onClick={() => setSelectedPlan('installments')}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                              selectedPlan === 'installments'
                                ? 'border-[#1B3D59] bg-[#D4EEF8]/30 ring-2 ring-[#1B3D59] shadow-xs'
                                : 'border-[#D4EEF8] bg-white text-[#475569] hover:border-[#6A97C0]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-[#152026] flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#1B3D59]" /> Option B: Pay in 3 Installments
                              </span>
                              {selectedPlan === 'installments' && <CheckCircle2 className="w-5 h-5 text-[#1B3D59]" />}
                            </div>
                            <div className="text-lg font-black text-[#1B3D59] mb-1">
                              1st Pay: Rs. {instSchedule[0].amount.toLocaleString()}
                            </div>
                            <p className="text-xs text-[#475569] leading-relaxed mb-3">
                              First pay big amount, finally small amount. Each payment unlocks 5 lessons.
                            </p>
                            {/* Installment breakdown pills */}
                            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                              <div className="p-1.5 rounded-lg bg-[#D4EEF8]/50 border border-[#D4EEF8] text-center">
                                <div className="font-bold text-[#1B3D59]">1st Month</div>
                                <div className="text-[#152026] font-bold">Rs. {instSchedule[0].amount.toLocaleString()}</div>
                                <div className="text-[#6A97C0] font-mono">+5 Lessons</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                                <div className="font-bold text-slate-700">2nd Month</div>
                                <div className="text-[#152026] font-bold">Rs. {instSchedule[1].amount.toLocaleString()}</div>
                                <div className="text-[#6A97C0] font-mono">+5 Lessons</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                                <div className="font-bold text-slate-700">3rd Month</div>
                                <div className="text-[#152026] font-bold">Rs. {instSchedule[2].amount.toLocaleString()}</div>
                                <div className="text-[#6A97C0] font-mono">+5 Lessons</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Single Lesson Selected (Groups A or B)
                    return (
                      <div className="p-4 rounded-2xl bg-[#D4EEF8]/30 border border-[#D4EEF8] text-xs text-[#152026] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#1B3D59] flex-shrink-0" />
                          <div>
                            <strong className="text-[#152026]">Pay-Per-Lesson Plan Selected:</strong>
                            <p className="text-[#475569] mt-0.5">
                              Paying for a single lesson unlocks exactly <strong>1 lesson</strong> for booking. You can pay again for future lessons as needed.
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#1B3D59] text-white text-xs font-black">
                          Rs. {(activePkg?.price || 2000).toLocaleString()} • 1 Lesson
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 3: Payment Method Selection & Form */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#D4EEF8] pt-4">
                  <div>
                    <label className="block text-xs font-bold text-[#152026] uppercase tracking-wider">
                      3. Select Payment Method:
                    </label>
                    <p className="text-[11px] text-[#6A97C0]">
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
                      <div className="px-3.5 py-1.5 rounded-xl bg-[#F3EED8] border border-amber-300 text-[#152026] text-xs font-bold self-start sm:self-auto flex items-center gap-2">
                        <span>Total To Pay Now:</span>
                        <span className="text-sm font-black text-[#1B3D59]">Rs. {amountDue.toLocaleString()}</span>
                        <span className="text-[10px] text-[#6A97C0]">({lessonsToUnlock} Lesson{lessonsToUnlock > 1 ? 's' : ''} Unlocked)</span>
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
                        ? 'bg-[#D4EEF8]/40 border-2 border-[#1B3D59] text-[#1B3D59] ring-1 ring-[#1B3D59]'
                        : 'bg-white border-[#D4EEF8] hover:border-[#6A97C0] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-[#152026] text-xs">
                      <Upload className={`w-4 h-4 ${activePaymentMethod === 'slip' ? 'text-[#1B3D59]' : 'text-[#6A97C0]'}`} />
                      <span>Upload Bank Slip</span>
                    </div>
                    <p className="text-[11px] text-[#6A97C0]">Deposit to official Sithma accounts & upload receipt</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('online')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePaymentMethod === 'online'
                        ? 'bg-[#D4EEF8]/40 border-2 border-[#1B3D59] text-[#1B3D59] ring-1 ring-[#1B3D59]'
                        : 'bg-white border-[#D4EEF8] hover:border-[#6A97C0] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-[#152026] text-xs">
                      <CreditCard className={`w-4 h-4 ${activePaymentMethod === 'online' ? 'text-[#1B3D59]' : 'text-[#6A97C0]'}`} />
                      <span>Pay Online (Card)</span>
                    </div>
                    <p className="text-[11px] text-[#6A97C0]">Visa / Mastercard instant approval & unlock</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('physical')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePaymentMethod === 'physical'
                        ? 'bg-[#D4EEF8]/40 border-2 border-[#1B3D59] text-[#1B3D59] ring-1 ring-[#1B3D59]'
                        : 'bg-white border-[#D4EEF8] hover:border-[#6A97C0] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-[#152026] text-xs">
                      <Building2 className={`w-4 h-4 ${activePaymentMethod === 'physical' ? 'text-[#1B3D59]' : 'text-[#6A97C0]'}`} />
                      <span>Pay at Branch</span>
                    </div>
                    <p className="text-[11px] text-[#6A97C0]">In-person cash payment at your registered branch</p>
                  </button>
                </div>

                {/* Form Container */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#D4EEF8]/15 border border-[#D4EEF8] space-y-5 shadow-xs">
                  {/* METHOD 1: BANK SLIP UPLOAD */}
                  {activePaymentMethod === 'slip' && (
                    <div className="space-y-4">
                      {/* Official 4 Bank Accounts Tabs */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1B3D59] flex items-center gap-1.5 uppercase tracking-wider">
                            <Landmark className="w-3.5 h-3.5 text-[#1B3D59]" /> Select Official Sithma Bank Account:
                          </span>
                          <span className="text-[11px] text-[#6A97C0]">Choose your preferred deposit bank</span>
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
                                    ? 'bg-[#1B3D59] border-[#1B3D59] text-white shadow-xs'
                                    : 'bg-white border-[#D4EEF8] text-[#152026] hover:border-[#6A97C0]'
                                }`}
                              >
                                <div className={`flex items-center justify-between text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-[#D4EEF8]' : 'text-[#6A97C0]'}`}>
                                  <span>{b.id}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4EEF8]" />}
                                </div>
                                <div className="text-xs font-bold truncate">{b.shortName}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Bank Account Details Card with Copy Button */}
                      {(() => {
                        const b = SITHMA_OFFICIAL_BANKS.find((x) => x.id === selectedBankId) || SITHMA_OFFICIAL_BANKS[0];
                        return (
                          <div className="p-4 rounded-xl bg-white border border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#152026] text-sm">{b.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[9px] font-bold">{b.badge}</span>
                              </div>
                              <div className="text-[#475569]">
                                Account Name: <strong className="text-[#152026]">{b.accountName}</strong>
                              </div>
                              <div className="text-[#6A97C0] text-[11px]">Branch: {b.branch}</div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto bg-[#D4EEF8]/30 px-3 py-2 rounded-xl border border-[#D4EEF8]">
                              <div>
                                <div className="text-[10px] text-[#6A97C0]">Account Number</div>
                                <div className="font-mono font-bold text-[#1B3D59] text-sm">{b.accountNo}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyAcc(b.accountNo)}
                                className="p-1.5 rounded-lg bg-white hover:bg-[#D4EEF8] text-[#1B3D59] transition-colors border border-[#D4EEF8] cursor-pointer"
                                title="Copy Account Number"
                              >
                                {copiedBankAcc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Slip File Upload */}
                      <div className="pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-[#152026] mb-1">
                            Upload Deposit Slip / Transfer Screenshot <span className="text-red-500">*</span>
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
                              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-[#6A97C0] rounded-xl text-xs text-[#1B3D59] hover:bg-[#D4EEF8]/20 cursor-pointer bg-white transition-colors"
                            >
                              <Upload className="w-4 h-4 text-[#1B3D59]" />
                              <span>{slipFile ? slipFile.name : 'Choose Slip Image / PDF'}</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Live Image Preview if File Chosen */}
                      {slipPreview && (
                        <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-3">
                            <img src={slipPreview} alt="Deposit Slip Preview" className="w-12 h-12 rounded-lg object-cover border border-[#D4EEF8]" />
                            <div className="text-xs">
                              <p className="font-bold text-[#152026] truncate max-w-xs">{slipFile?.name}</p>
                              <p className="text-[10px] text-[#6A97C0]">{(slipFile?.size / 1024).toFixed(1)} KB • Ready for upload</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveSlip}
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold border border-red-200 cursor-pointer"
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
                          className="btn-primary py-3 px-6 text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
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
                          <div className="w-full max-w-sm mx-auto aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-[#152026] via-[#1B3D59] to-[#152026] p-5 border border-[#6A97C0]/40 shadow-xl flex flex-col justify-between relative overflow-hidden text-white">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs tracking-wider text-[#D4EEF8]">SITHMA SECURE PAY</span>
                              <Wifi className="w-4 h-4 text-[#D4EEF8] rotate-90" />
                            </div>
                            <div className="w-8 h-6 rounded bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-[8px] font-mono text-[#152026] font-bold">
                              CHIP
                            </div>
                            <div className="font-mono text-base tracking-widest text-white font-bold">
                              {cardForm.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="flex justify-between items-end text-[10px] text-[#D4EEF8]">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-[#6A97C0]">Cardholder</span>
                                <span className="font-bold uppercase tracking-wider text-white">
                                  {cardForm.cardHolder || profile?.name || 'STUDENT NAME'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-[#6A97C0]">Expires</span>
                                <span className="font-bold text-white">{cardForm.expDate || 'MM/YY'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Inputs */}
                        <div className="lg:col-span-7 space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#152026] mb-1">
                              Cardholder Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Name on card"
                              value={cardForm.cardHolder || profile?.name || ''}
                              onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs outline-none focus:border-[#1B3D59]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#152026] mb-1">
                              Card Number (Visa / Mastercard) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="4532 8921 4421 9012"
                              value={cardForm.cardNumber}
                              onChange={handleCardNumberChange}
                              className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs font-mono outline-none focus:border-[#1B3D59]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#152026] mb-1">
                                Expiry Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardForm.expDate}
                                onChange={(e) => setCardForm({ ...cardForm, expDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs font-mono outline-none focus:border-[#1B3D59]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#152026] mb-1">
                                CVV / CVC <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="882"
                                value={cardForm.cvv}
                                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs font-mono outline-none focus:border-[#1B3D59]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#D4EEF8]">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>256-Bit Bank-Grade SSL Encryption • Instant Lesson Unlock</span>
                        </div>
                        <button
                          type="button"
                          onClick={handlePackagePaymentSubmit}
                          disabled={submittingPkgPayment || cardProcessing}
                          className="btn-primary py-3 px-6 text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
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
                            <div className="p-4 rounded-xl bg-white border border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-[#152026] text-sm">
                                  <Building2 className="w-4 h-4 text-[#1B3D59]" />
                                  <span>{branchKey} Branch Cash Counter</span>
                                </div>
                                <div className="text-[#475569] flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#6A97C0]" /> {branchInfo.address}
                                </div>
                                <div className="text-[#6A97C0] flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-[#6A97C0]" /> {branchInfo.phone} • {branchInfo.hours}
                                </div>
                              </div>
                              <div className="bg-[#D4EEF8]/30 p-3 rounded-xl border border-[#D4EEF8] text-left sm:text-right self-stretch sm:self-auto sm:min-w-[200px]">
                                <span className="text-[10px] text-[#6A97C0] block font-semibold">Payment Reference Code:</span>
                                <span className="font-mono font-bold text-[#1B3D59] text-sm">{cashCode}</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#475569] leading-relaxed">
                              You can visit our <strong>{branchKey} Branch</strong> during operating hours ({branchInfo.hours}) to make your cash payment at the front counter. Our staff will look up your account with this reference code and verify your payment instantly.
                            </p>
                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={handlePackagePaymentSubmit}
                                disabled={submittingPkgPayment}
                                className="btn-primary py-3 px-6 text-xs font-bold shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
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

      {/* Type 1 Dedicated Milestones Hub Card */}
      {isType1 && (
        <div className="card p-6 bg-white border border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm hover:border-[#3F72AF]/50 transition-all">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF]/70 border border-[#3F72AF]/30 flex items-center justify-center text-[#112D4E] flex-shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#3F72AF]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="badge badge-info text-[10px] font-bold uppercase">
                  Type 1 DMT Tracking
                </span>
                <span className="text-xs text-[#64748B] font-semibold">
                  {profile?.branch} Branch
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B2447]">
                Government DMT Milestone Schedule
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6584] max-w-xl leading-relaxed">
                Medical exam, DMT registration, written theory exam attempts, and practical trial readiness are organized in your dedicated DMT Milestones dashboard.
              </p>
            </div>
          </div>
          <Link
            to="/student/milestones"
            className="btn-accent text-xs py-2.5 px-5 font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-md self-start sm:self-auto shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Open DMT Milestones</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      )}

      {/* Grid: Course Package, Lessons & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Col 1: Course Package, Installments & Lesson Progress */}
        <div className="space-y-6">
          {/* Course Package Card - Hidden for Type 1 until Written Theory Exam is Passed */}
          {((isType2 && pkg.priceTotal > 0) || (isType1 && isExamPassed && isPackagePaymentConfirmed) || isPackagePaymentConfirmed) ? (
            <div className="card space-y-4 bg-white border border-[#D4EEF8] shadow-sm text-[#152026]">
              <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Course Package</h3>
                  <p className="text-xs text-[#6A97C0]">
                    {pkg.type ? pkg.type.replace('_', ' ') : 'Full Driving Training Package'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#1B3D59]">
                    {pkg.priceTotal > 0 ? `Rs. ${pkg.priceTotal.toLocaleString()}` : 'Advance: Rs. 5,000'}
                  </span>
                  {profile?.paymentPlan && (
                    <div className="text-[10px] text-[#6A97C0] font-semibold uppercase">
                      Plan: {profile.paymentPlan}
                    </div>
                  )}
                </div>
              </div>

              {/* Installment Plan Alert in Sidebar */}
              {hasUnfinishedInstallments && (
                <div className="p-3.5 rounded-xl bg-[#F3EED8] border border-[#E2D9B8] text-xs text-[#152026] space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#152026] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1B3D59]" />
                      Installment #{(profile?.installmentsPaidCount || 0) + 1} Due
                    </span>
                    <span className="badge badge-warning text-[9px]">3-Month Plan</span>
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    You have unlocked {unlockedLessons} lessons. Pay your next installment to unlock 5 more lessons.
                  </p>
                  <a
                    href="#package-selection-payment"
                    className="btn-primary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 w-full shadow-xs"
                  >
                    <span>Pay Installment #{(profile?.installmentsPaidCount || 0) + 1} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Single Lesson Completion Notice in Sidebar */}
              {hasCompletedSingleLesson && (
                <div className="p-3.5 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] text-xs text-[#1B3D59] space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#152026] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3D59]" /> Single Lesson Used (1/1)
                    </span>
                    <span className="badge badge-info text-[9px]">Completed</span>
                  </div>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    Ready for your next driving lesson? You can pay for another single lesson or upgrade to a 15-lesson full course package.
                  </p>
                  <a
                    href="#package-selection-payment"
                    className="btn-primary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 w-full shadow-xs"
                  >
                    <span>Book Next Lesson / Upgrade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Monthly Plan 4-Lesson Cap Banner */}
              {profile?.paymentPlan === 'monthly' && (
                <div className="p-3 rounded-xl bg-[#F3EED8] border border-[#E2D9B8] text-xs text-[#152026]">
                  <strong>Monthly Plan Active:</strong> Max 4 lessons unlocked per billing month (Server-enforced cap). Total lessons used: {usedLessons}/{unlockedLessons}.
                </div>
              )}

              {/* Lessons Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#6A97C0]">Lessons Used vs Unlocked:</span>
                  <span className="text-[#1B3D59] font-bold">
                    {usedLessons} / {unlockedLessons} Lessons
                  </span>
                </div>
                <div className="w-full bg-[#D4EEF8] rounded-full h-3 overflow-hidden border border-[#B3D5F1] p-0.5">
                  <div
                    className="bg-[#1B3D59] h-2 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6A97C0]">
                  <span>{remainingLessons} lesson(s) available to book</span>
                  <span className="font-mono text-[#1B3D59] font-bold">{progressPercent}% Completed</span>
                </div>
              </div>

              {/* Bonus Lessons (if applicable) */}
              {(pkg.bonusLessons?.bike > 0 || pkg.bonusLessons?.threeWheeler > 0) && (
                <div className="p-3.5 bg-[#F3EED8] border border-[#E2D9B8] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#152026]">
                    <Gift className="w-4 h-4 text-[#1B3D59]" /> Bonus Package Lessons Included:
                  </div>
                  <div className="text-xs text-[#475569] flex items-center justify-between">
                    <span>🛵 Free Motorbike Lessons:</span>
                    <span className="font-bold text-[#152026]">{pkg.bonusLessons.bike} Lessons</span>
                  </div>
                  <div className="text-xs text-[#475569] flex items-center justify-between">
                    <span>🛺 Free Three-Wheeler Lessons:</span>
                    <span className="font-bold text-[#152026]">{pkg.bonusLessons.threeWheeler} Lessons</span>
                  </div>
                </div>
              )}

              {/* Payment & Registration Status Pill */}
              <div className="pt-2 border-t border-[#D4EEF8] flex items-center justify-between text-xs">
                <span className="text-[#6A97C0]">Package Status:</span>
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
              <div className="pt-2 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentFormOverride(true);
                    setTimeout(() => {
                      document.getElementById('package-selection-payment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#D4EEF8]/40 hover:bg-[#D4EEF8] border border-[#D4EEF8] text-xs text-[#1B3D59] font-bold transition-all group text-left cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#1B3D59]" /> Need more driving practice?
                  </span>
                  <span className="text-[11px] text-[#152026] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Buy Additional Lessons <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          ) : (!isPackagePaymentConfirmed && ((isType1 && isExamPassed) || (isType2 && isVerifiedAccount))) ? (
            <div className="card p-5 bg-[#F3EED8] border border-[#E2D9B8] space-y-3 text-[#152026]">
              <div className="flex items-center gap-2.5 text-[#152026] font-bold text-sm">
                <CreditCard className="w-5 h-5 text-[#1B3D59]" />
                <span>Next Step: Select Package & Pay</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                {isType1
                  ? '🎉 Congratulations on passing your Theory Exam! Please select your vehicle package and choose your payment plan below to unlock practical lessons.'
                  : '📦 Select your vehicle training package and complete payment below. Lesson booking will unlock once your branch officer assigns your Practical Trial Date.'}
              </p>
              <a
                href="#package-selection-payment"
                className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 w-full shadow-xs"
              >
                <span>Choose Package & Pay Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : isType2 && isPackagePaymentConfirmed && !hasTrialDate ? (
            <div className="card p-5 bg-[#D4EEF8] border border-[#B3D5F1] space-y-3 text-[#152026]">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Package Paid ✓ — Awaiting Trial Date to Unlock Booking</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Your course package payment has been confirmed. Your branch Data Entry Officer will schedule your official Practical Driving Trial Date shortly. Lesson booking will unlock automatically once the trial date is assigned.
              </p>
              <div className="pt-2 border-t border-[#B3D5F1] flex items-center justify-between text-[11px] text-[#6A97C0]">
                <span>Payment Status:</span>
                <span className="text-emerald-700 font-bold">Confirmed ✓</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6A97C0]">
                <span>Trial Date:</span>
                <span className="text-[#152026] font-bold">Awaiting Branch Assignment</span>
              </div>
            </div>
          ) : isType1 && !isExamPassed ? (
            <div className="card p-6 bg-white border border-[#D4EEF8] space-y-4 shadow-sm hover:border-[#6A97C0] transition-all text-[#152026]">
              <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
                <div className="flex items-center gap-2.5 text-[#152026] font-black text-base">
                  <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span>Stage 1: Theory Exam Stage</span>
                </div>
                <span className="badge badge-warning text-[10px] font-bold">In Progress</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Practical vehicle packages and driving lesson bookings will unlock after you pass your official DMT Written Theory Examination.
              </p>
              <div className="p-3 bg-[#D4EEF8]/40 rounded-xl border border-[#D4EEF8] flex items-center justify-between text-xs">
                <span className="text-[#6A97C0] font-bold">Current Milestone Goal:</span>
                <span className="text-[#152026] font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pass DMT Written Exam
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  to="/student/quiz"
                  className="btn-primary text-xs sm:text-sm py-2.5 px-4 font-bold flex-1 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Take Practice Exam</span>
                </Link>
                <Link
                  to="/student/quiz/history"
                  className="btn-secondary text-xs sm:text-sm py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4 text-[#1B3D59]" />
                  <span>My Exams History</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* Col 2: Student Quick Hub & Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card (With Type 1 Scope Restriction Applied) */}
          <div className="card p-6 bg-white border border-[#D4EEF8] space-y-4 shadow-sm text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-black text-[#152026] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1B3D59]" /> Student Quick Hub
              </h3>
              <span className="text-xs text-[#6A97C0] font-semibold">Quick Actions</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Type 1 Exclusive Access: Dedicated DMT Milestones Dashboard */}
              {isType1 && (
                <Link
                  to="/student/milestones"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white transition-colors">
                      <ShieldCheck className="w-5 h-5 text-[#1B3D59] group-hover:text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] block text-sm">
                        DMT Milestone Dashboard
                      </span>
                      <span className="text-xs text-[#6A97C0]">
                        Medical, Registration & Theory Exam Tracking
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-info text-[10px] font-bold">Open</span>
                </Link>
              )}

              {/* Type 1 Exclusive Access: Exam/Quiz practice is available for Type 1 learners */}
              {isType1 && (
                <Link
                  to="/student/quiz"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5 text-[#1B3D59] group-hover:text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] block text-sm">
                        DMT Exam Practice Quiz
                      </span>
                      <span className="text-xs text-[#6A97C0]">
                        Sinhala, Tamil & English • Multiple Question Lists
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-accent text-[10px] font-bold">Practice Now</span>
                </Link>
              )}

              {/* Type 1 Exclusive Access: My Completed Practice Exams History */}
              {isType1 && (
                <Link
                  to="/student/quiz/history"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white transition-colors">
                      <History className="w-5 h-5 text-[#1B3D59] group-hover:text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] block text-sm">
                        My Practice Exams / History
                      </span>
                      <span className="text-xs text-[#6A97C0]">
                        Review completed exams, answers & scores
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-info text-[10px] font-bold">Review</span>
                </Link>
              )}

              {isTrialPassed ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] block text-sm">
                        Practical Training Completed
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold">
                        Practical trial passed ✓ (Lesson booking closed)
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success text-[10px] font-bold">Completed</span>
                </div>
              ) : isType1 && !isExamPassed ? (
                <div
                  onClick={() =>
                    toast.error(
                      '🔒 DMT Requirement (US-09): Learner written exam must be marked Passed before booking practical trial lessons.'
                    )
                  }
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-not-allowed opacity-85"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Lock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="font-bold text-[#64748B] block text-sm">
                        Book Driving Lessons (Locked)
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        Unlocks after passing Written Exam
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-warning text-[10px] font-bold">Exam Required</span>
                </div>
              ) : isType2 && !hasTrialDate ? (
                <div
                  onClick={() =>
                    toast.error(
                      '🔒 Practical Trial Date Pending: Your practical trial date must be scheduled by your branch officer before booking driving lessons.'
                    )
                  }
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-not-allowed opacity-85"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                      <Lock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-bold text-[#64748B] block text-sm">
                        Book Driving Lessons (Locked)
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        Unlocks when trial date is assigned
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-warning text-[10px] font-bold">Trial Date Required</span>
                </div>
              ) : (
                <Link
                  to="/student/lessons"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] group-hover:text-[#1B3D59] block text-sm">
                        Book Driving Lessons
                      </span>
                      <span className="text-xs text-[#6A97C0]">
                        Schedule your on-road practical slots
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success text-[10px] font-bold">{remainingLessons} Available</span>
                </Link>
              )}

              {!isTrialPassed && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentFormOverride(true);
                    setTimeout(() => {
                      document.getElementById('package-selection-payment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group text-left cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59] group-hover:bg-[#1B3D59] group-hover:text-white transition-colors">
                      <PlusCircle className="w-5 h-5 text-[#1B3D59] group-hover:text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#152026] group-hover:text-[#1B3D59] block text-sm">
                        Need Additional Practice Lessons?
                      </span>
                      <span className="text-xs text-[#6A97C0]">
                        Upgrade package or add single lessons
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1B3D59] group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <Link
                to="/student/payments"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4EEF8]/30 hover:bg-[#D4EEF8] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="font-bold text-[#152026] group-hover:text-[#1B3D59] block text-sm">
                      Payment History & Slips
                    </span>
                    <span className="text-xs text-[#6A97C0]">
                      Review verified bank deposit receipts
                    </span>
                  </div>
                </div>
                <span className="badge bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] text-[10px] font-bold">Bank Slips</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {renderEditModal()}
      {renderVerifiedCelebrationModal()}

      {/* Trial Date Reschedule Request Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-[#D4EEF8] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4EEF8]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1B3D59]" />
                <h3 className="font-bold text-[#1B3D59] text-base">Request Date Reschedule</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 rounded-lg text-[#6A97C0] hover:text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Select Milestone to Reschedule:
                </label>
                <select
                  value={rescheduleMilestone}
                  onChange={(e) => setRescheduleMilestone(e.target.value)}
                  disabled={isType2}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#1B3D59] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] text-xs font-bold disabled:opacity-80"
                >
                  {isType1 && <option value="medical">🩺 DMT Medical Exam</option>}
                  {isType1 && <option value="registration">📄 DMT Registration</option>}
                  {isType1 && <option value="theory_exam">📖 DMT Written Theory Exam</option>}
                  <option value="trial">🚗 Practical Driving Trial Exam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Current Scheduled Date:
                </label>
                <div className="p-3 rounded-xl bg-[#D4EEF8]/40 border border-[#D4EEF8] text-[#152026] font-bold text-sm font-mono">
                  {rescheduleMilestone === 'medical'
                    ? safeFormatDate(profile?.medical_date || profile?.dmtDates?.medicalExamDate, 'MMMM dd, yyyy')
                    : rescheduleMilestone === 'registration'
                    ? safeFormatDate(profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate, 'MMMM dd, yyyy')
                    : rescheduleMilestone === 'theory_exam'
                    ? safeFormatDate(profile?.written_exam_date || profile?.dmtDates?.learnerExamDate, 'MMMM dd, yyyy')
                    : safeFormatDate(profile?.trial_date || profile?.trial?.trialDate, 'MMMM dd, yyyy')}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Reason for Reschedule Request: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g., Medical reasons, exam clash, or need more practical preparation..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#152026]">
                    Preferred New Date:
                  </label>
                  {rescheduleMilestone === 'trial' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          setPreferredRescheduleDate(todayStr);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                          preferredRescheduleDate === new Date().toISOString().split('T')[0]
                            ? 'bg-[#1B3D59] text-white border-[#1B3D59]'
                            : 'bg-white text-[#152026] border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
                        }`}
                      >
                        ⚡ Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setPreferredRescheduleDate(tomorrow.toISOString().split('T')[0]);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                          (() => {
                            const t = new Date();
                            t.setDate(t.getDate() + 1);
                            return preferredRescheduleDate === t.toISOString().split('T')[0];
                          })()
                            ? 'bg-[#1B3D59] text-white border-[#1B3D59]'
                            : 'bg-white text-[#152026] border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
                        }`}
                      >
                        🌅 Tomorrow
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredRescheduleDate}
                    onChange={(e) => setPreferredRescheduleDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] text-xs font-bold cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-[#6A97C0] block mt-1">
                  You can request another time today, tomorrow, or any available future date.
                </span>
              </div>

              {/* Time Slot Selection (Requirements 7 & 8) */}
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Select Preferred Time Slot:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    '08:30 AM',
                    '10:00 AM',
                    '11:30 AM',
                    '01:00 PM',
                    '02:30 PM',
                    '04:00 PM',
                  ].map((timeOption) => (
                    <button
                      key={timeOption}
                      type="button"
                      onClick={() => setPreferredRescheduleTime(timeOption)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        preferredRescheduleTime === timeOption
                          ? 'bg-[#1B3D59] text-white border-[#1B3D59] shadow-xs'
                          : 'bg-white border-[#D4EEF8] text-[#152026] hover:bg-[#D4EEF8]/30'
                      }`}
                    >
                      🕒 {timeOption}
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#6A97C0]">
                  <span>Preferred slot: <strong className="text-[#152026]">{preferredRescheduleTime || 'Any Available Time'}</strong></span>
                  {preferredRescheduleTime && (
                    <button
                      type="button"
                      onClick={() => setPreferredRescheduleTime('')}
                      className="text-[#1B3D59] underline font-medium cursor-pointer"
                    >
                      Clear Slot
                    </button>
                  )}
                </div>
              </div>

              {/* Pre-submission Confirmation Card (Requirement 8) */}
              <div className="p-3.5 rounded-2xl bg-[#D4EEF8]/40 border border-[#D4EEF8] space-y-2">
                <div className="text-[11px] font-extrabold text-[#152026] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Request Summary & Confirmation:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#475569]">
                  <div>
                    <span className="text-[10px] text-[#6A97C0] block font-semibold">Preferred Date:</span>
                    <strong className="font-mono text-[#152026]">
                      {preferredRescheduleDate
                        ? safeFormatDate(preferredRescheduleDate, 'MMM dd, yyyy')
                        : 'Earliest Available'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6A97C0] block font-semibold">Preferred Time:</span>
                    <strong className="font-mono text-[#152026]">
                      {preferredRescheduleTime || 'Any Available Time'}
                    </strong>
                  </div>
                </div>
                <label className="flex items-center gap-2 pt-1.5 border-t border-[#D4EEF8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rescheduleConfirmed}
                    onChange={(e) => setRescheduleConfirmed(e.target.checked)}
                    className="rounded text-[#1B3D59] focus:ring-[#1B3D59]"
                  />
                  <span className="text-[11px] font-bold text-[#152026]">
                    I confirm my preferred date and available time slot selection.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={submittingReschedule}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !rescheduleReason.trim() || !rescheduleConfirmed}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingReschedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Reschedule Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Practical Trial Outcome Modal (US DMT Practical Trial Outcome Update) */}
      {showTrialResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#D4EEF8] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4EEF8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#152026]">Record Practical Trial Outcome</h3>
                  <p className="text-xs text-[#6A97C0]">
                    Attempt #{Math.min(3, trialAttemptsUsed + 1)} of 3 • Official DMT Practical Exam
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrialResultModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentTrialSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-[#1B3D59] space-y-1">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Update Your Trial Status
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Record the outcome of your practical driving trial at the Department of Motor Traffic. Passing completes your driver's license process.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Practical Trial Examination Date:
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={trialOutcomeForm.attemptDate}
                    onChange={(e) => setTrialOutcomeForm({ ...trialOutcomeForm, attemptDate: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] text-xs font-bold cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">Trial Outcome:</label>
                <select
                  value={trialOutcomeForm.result}
                  onChange={(e) => setTrialOutcomeForm({ ...trialOutcomeForm, result: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] font-bold rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                >
                  <option value="passed">PASSED (Issue Driver's License)</option>
                  <option value="failed">FAILED (Requires Re-trial Scheduling)</option>
                  <option value="absent">ABSENT</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Note: Practical trial examinations have a Pass or Fail result (no score or marks).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Examiner Notes / Feedback (Optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Reverse parking cleared, minor observation on lane switching..."
                  value={trialOutcomeForm.examinerNotes}
                  onChange={(e) => setTrialOutcomeForm({ ...trialOutcomeForm, examinerNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowTrialResultModal(false)}
                  disabled={submittingTrialResult}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTrialResult}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {submittingTrialResult ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Trial Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

