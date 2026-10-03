import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  PlusCircle,
  FileCheck,
  Sparkles,
  ShieldCheck,
  X,
  CreditCard,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  DollarSign,
  Clock,
  ExternalLink,
  XCircle,
  File,
  Package as PackageIcon,
  Car,
  Info,
  Gift,
  Upload,
  History,
  RotateCcw,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Lock,
  EyeOff,
  Bike,
  Truck,
  Layers,
  Plus,
  Minus,
  Check,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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

const formatTrialDateDisplay = (dateVal, fallback = 'Not Scheduled') => {
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

const formatShortTrialDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return format(d, hasTime ? 'MMM dd • hh:mm a' : 'MMM dd');
  } catch {
    return '';
  }
};

// Official Vehicle Training Package Catalog for Sithma Driving School
const WALK_IN_FALLBACK_PACKAGES = [
  // A. Individual / Private Single Lessons (Pay-Per-Lesson)
  { type: 'Bike_Individual', name: 'Bike (Individual / Private)', categoryGroup: 'A', vehicleCategory: 'Bike', lessons: 1, price: 2000, isPerLesson: true, desc: '1-on-1 private lesson with dedicated instructor. LKR 2,000 / lesson.' },
  { type: 'ThreeWheeler_Individual', name: 'Three-Wheel (Individual / Private)', categoryGroup: 'A', vehicleCategory: 'Three-Wheel', lessons: 1, price: 2500, isPerLesson: true, desc: '1-on-1 private lesson with dedicated instructor. LKR 2,500 / lesson.' },
  { type: 'Car_Individual', name: 'Car (Auto / Manual — Individual / Private)', categoryGroup: 'A', vehicleCategory: 'Car', lessons: 1, price: 3000, isPerLesson: true, desc: '1-on-1 private lesson with dual-control vehicle. LKR 3,000 / lesson.' },
  { type: 'HeavyVehicle_Individual', name: 'Heavy Vehicle (Individual / Private)', categoryGroup: 'A', vehicleCategory: 'Heavy', lessons: 1, price: 3500, isPerLesson: true, desc: '1-on-1 private heavy vehicle commercial training. LKR 3,500 / lesson.' },

  // B. Standard Single Lessons (Pay-Per-Lesson)
  { type: 'Bike_Standard', name: 'Bike (Standard Single Lesson)', categoryGroup: 'B', vehicleCategory: 'Bike', lessons: 1, price: 800, isPerLesson: true, desc: 'Standard single practice lesson. LKR 800 / lesson.' },
  { type: 'ThreeWheeler_Standard', name: 'Three-Wheel (Standard Single Lesson)', categoryGroup: 'B', vehicleCategory: 'Three-Wheel', lessons: 1, price: 1500, isPerLesson: true, desc: 'Standard single practice lesson. LKR 1,500 / lesson.' },
  { type: 'Car_Standard', name: 'Car (Standard Single Lesson)', categoryGroup: 'B', vehicleCategory: 'Car', lessons: 1, price: 2000, isPerLesson: true, desc: 'Standard single practice session (Auto/Manual). LKR 2,000 / lesson.' },
  { type: 'HeavyVehicle_Standard', name: 'Heavy Vehicle (Standard Single Lesson)', categoryGroup: 'B', vehicleCategory: 'Heavy', lessons: 1, price: 2500, isPerLesson: true, desc: 'Standard single heavy vehicle session. LKR 2,500 / lesson.' },

  // C. Full Course Packages (Includes 15 Standard Lessons)
  { type: 'Car_Full', name: 'Car Package (Auto Car OR Manual Car)', categoryGroup: 'C', vehicleCategory: 'Car', lessons: 15, price: 40000, isPerLesson: false, bonusText: 'Includes 2 FREE Bike lessons + 2 FREE Three-Wheel lessons.', bonusLessons: { bike: 2, threeWheeler: 2 }, desc: 'Includes 15 standard lessons + 2 FREE Bike lessons + 2 FREE Three-Wheel lessons.' },
  { type: 'Combo_Full', name: 'Combo Package (Car + Bike + Three-Wheel)', categoryGroup: 'C', vehicleCategory: 'Combo', lessons: 15, price: 65000, isPerLesson: false, bonusText: 'Includes full access to 15 standard lessons across all three categories.', bonusLessons: { bike: 0, threeWheeler: 0 }, desc: 'Includes full access to 15 standard lessons across all three categories.' },
  { type: 'HeavyVehicle_Full', name: 'Heavy Vehicle Full Package', categoryGroup: 'C', vehicleCategory: 'Heavy', lessons: 15, price: 70000, isPerLesson: false, bonusText: 'Includes 15 standard heavy vehicle training lessons.', bonusLessons: { bike: 0, threeWheeler: 0 }, desc: 'Includes 15 standard heavy vehicle training lessons.' },
];


export default function StaffStudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Student for Detail / Update Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit_dmt' | 'record_trial' | 'lifecycle'

  // DMT Learner License Lifecycle & Final License State (Admin Controls - US Requirement 11)
  const [markingPassed, setMarkingPassed] = useState(false);
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [adminLicenseFile, setAdminLicenseFile] = useState(null);
  const [adminLicensePreview, setAdminLicensePreview] = useState(null);
  const [adminLicenseNumber, setAdminLicenseNumber] = useState('');
  const [adminAutoVerify, setAdminAutoVerify] = useState(true);
  const [uploadingAdminLicense, setUploadingAdminLicense] = useState(false);
  const [rejectLicenseReason, setRejectLicenseReason] = useState('');
  const [showRejectLicenseInput, setShowRejectLicenseInput] = useState(false);

  // Payment Verification & Slip Review Modal State
  const [verifyModalStudent, setVerifyModalStudent] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [studentPaymentsList, setStudentPaymentsList] = useState([]);
  const [loadingStudentPayments, setLoadingStudentPayments] = useState(false);

  // Walk-in Student Registration Modal State (US-03)
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInStep, setWalkInStep] = useState(1);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [showWalkInPassword, setShowWalkInPassword] = useState(false);
  const [walkInSelectedTier, setWalkInSelectedTier] = useState('C');
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    dob: '',
    email: '',
    phone: '',
    nic: '',
    branch: 'Maharagama',
    studentType: 'Type1_NewLearner',
    packageType: 'Car_Full',
    lessonQty: 1,
    password: 'Password@123',
    advancePaymentCollected: true,
    skipVerificationQueue: true,
    advanceAmount: 5000,
  });

  const walkInCalculatedAge = React.useMemo(() => {
    if (!walkInForm.dob) return null;
    const dob = new Date(walkInForm.dob);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [walkInForm.dob]);

  const walkInDisplayedPackages = React.useMemo(() => {
    return WALK_IN_FALLBACK_PACKAGES.map((fallback) => {
      const live = availablePackages.find((p) => p.type === fallback.type);
      return {
        ...fallback,
        _id: live?._id || fallback.type,
        price: live?.price || fallback.price,
        name: live?.name || fallback.name,
      };
    });
  }, [availablePackages]);

  const walkInActivePackagesForTier = React.useMemo(() => {
    return walkInDisplayedPackages.filter((p) => p.categoryGroup === walkInSelectedTier);
  }, [walkInDisplayedPackages, walkInSelectedTier]);

  const activeWalkInPackage = React.useMemo(() => {
    return walkInDisplayedPackages.find((p) => p.type === walkInForm.packageType) || walkInDisplayedPackages[0];
  }, [walkInDisplayedPackages, walkInForm.packageType]);

  const getWalkInVehicleIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('bike')) return <Bike className="w-5 h-5 text-[#1B3D59]" />;
    if (cat.includes('heavy') || cat.includes('bus') || cat.includes('truck')) return <Truck className="w-5 h-5 text-[#1B3D59]" />;
    if (cat.includes('combo')) return <Layers className="w-5 h-5 text-[#1B3D59]" />;
    return <Car className="w-5 h-5 text-[#1B3D59]" />;
  };

  // Form State for Recording Trial Attempt
  const [trialForm, setTrialForm] = useState({
    attemptDate: new Date().toISOString().split('T')[0],
    result: 'passed',
    score: '',
    examinerNotes: '',
  });

  // Form State for Setting Practical Trial Date (Shared for Type 1 & Type 2)
  const [trialDateInput, setTrialDateInput] = useState('');
  const [trialTimeInput, setTrialTimeInput] = useState('09:00');
  const [savingTrialDate, setSavingTrialDate] = useState(false);

  // Form State for Updating DMT Dates (US-04, US-05, US-09)
  const [dmtForm, setDmtForm] = useState({
    medicalExamDate: '',
    medicalExamPassed: false,
    medicalDone: false,
    learnerRegistrationDate: '',
    registrationDone: false,
    learnerExamDate: '',
    learnerExamPassed: false,
    learnerExamStatus: 'not_taken',
    learnerExamPassedDate: '',
    learnerExamMarks: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (branchFilter !== 'All') params.branch = branchFilter;
      if (typeFilter) params.studentType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      toast.error('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRescheduleRequests();
    // Load packages for walk-in form (US-13, US-14)
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages) {
        setAvailablePackages(res.data.packages);
      }
    }).catch(() => {});

    // Periodic polling for incoming student reschedule requests
    const interval = setInterval(() => {
      fetchRescheduleRequests();
    }, 20000);
    return () => clearInterval(interval);
  }, [branchFilter, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleRegisterWalkIn = async (e) => {
    if (e) e.preventDefault();

    if (!walkInForm.name.trim()) {
      toast.error('Please enter student full name');
      setWalkInStep(2);
      return;
    }

    if (!walkInForm.dob) {
      toast.error('Please enter student date of birth');
      setWalkInStep(2);
      return;
    }

    if (walkInCalculatedAge !== null && walkInCalculatedAge < 18) {
      toast.error('Under DMT regulations, applicant must be at least 18 years old.');
      setWalkInStep(2);
      return;
    }

    if (!walkInForm.nic.trim()) {
      toast.error('Please enter student NIC / Passport number');
      setWalkInStep(2);
      return;
    }

    if (!walkInForm.phone.trim()) {
      toast.error('Please enter contact phone number');
      setWalkInStep(2);
      return;
    }

    if (!walkInForm.email.trim() || !walkInForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      setWalkInStep(2);
      return;
    }

    setSubmittingWalkIn(true);
    try {
      const isType2 = walkInForm.studentType === 'Type2_TrialReady' || walkInForm.studentType === 'Type 2';
      const activePkg = walkInDisplayedPackages.find((p) => p.type === walkInForm.packageType);

      const payload = {
        name: walkInForm.name.trim(),
        email: walkInForm.email.trim().toLowerCase(),
        phone: walkInForm.phone.trim(),
        nic: walkInForm.nic.trim(),
        dob: walkInForm.dob || undefined,
        branch: walkInForm.branch,
        studentType: isType2 ? 'Type2_TrialReady' : 'Type1_NewLearner',
        packageType: isType2 ? walkInForm.packageType : null,
        packageId: isType2 && activePkg ? activePkg._id : null,
        lessonQty: isType2 && activePkg?.isPerLesson ? (walkInForm.lessonQty || 1) : (activePkg?.lessons || 15),
        password: walkInForm.password || 'Password@123',
        advancePaymentCollected: Boolean(walkInForm.advancePaymentCollected),
        skipVerificationQueue: Boolean(walkInForm.advancePaymentCollected && walkInForm.skipVerificationQueue),
        advanceAmount: walkInForm.advanceAmount || 5000,
      };

      const res = await api.post('/students/walk-in', payload);
      if (res.data.success) {
        toast.success(`Walk-in student ${res.data.student?.userId?.name || walkInForm.name} registered successfully!`);
        if (res.data.student) {
          setStudents((prev) => [res.data.student, ...prev]);
        } else {
          fetchStudents();
        }
        setShowWalkInModal(false);
        setWalkInStep(1);
        setWalkInForm({
          name: '',
          dob: '',
          email: '',
          phone: '',
          nic: '',
          branch: 'Maharagama',
          studentType: 'Type1_NewLearner',
          packageType: 'Car_Full',
          lessonQty: 1,
          password: 'Password@123',
          advancePaymentCollected: true,
          skipVerificationQueue: true,
          advanceAmount: 5000,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register walk-in student');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  const openStudentModal = (student, mode = 'view') => {
    setSelectedStudent(student);
    setModalMode(mode);
    if (student.dmtDates) {
      setDmtForm({
        medicalExamDate: student.dmtDates.medicalExamDate
          ? student.dmtDates.medicalExamDate.split('T')[0]
          : '',
        medicalExamPassed: student.dmtDates.medicalExamPassed || student.dmtDates.medicalDone || false,
        medicalDone: student.dmtDates.medicalDone || student.dmtDates.medicalExamPassed || false,
        learnerRegistrationDate: student.dmtDates.learnerRegistrationDate
          ? student.dmtDates.learnerRegistrationDate.split('T')[0]
          : '',
        registrationDone: student.dmtDates.registrationDone || false,
        learnerExamDate: student.dmtDates.learnerExamDate
          ? student.dmtDates.learnerExamDate.split('T')[0]
          : '',
        learnerExamPassed: student.dmtDates.learnerExamPassed || false,
        learnerExamStatus: student.learnerExamStatus || (student.dmtDates.learnerExamPassed ? 'passed' : 'not_taken'),
        learnerExamPassedDate: student.dmtDates.learnerExamPassedDate
          ? student.dmtDates.learnerExamPassedDate.split('T')[0]
          : '',
        learnerExamMarks: student.learnerExamMarks || student.dmtDates.learnerExamMarks || '',
      });
    }
    if (student.trial_date) {
      try {
        const d = new Date(student.trial_date);
        if (!isNaN(d.getTime())) {
          setTrialDateInput(d.toLocaleDateString('en-CA'));
          const hrs = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          setTrialTimeInput(`${hrs}:${mins}`);
        } else {
          setTrialDateInput(new Date().toLocaleDateString('en-CA'));
          setTrialTimeInput('09:00');
        }
      } catch {
        setTrialDateInput(new Date().toLocaleDateString('en-CA'));
        setTrialTimeInput('09:00');
      }
    } else {
      setTrialDateInput(new Date().toLocaleDateString('en-CA'));
      setTrialTimeInput('09:00');
    }
    setTrialForm({
      attemptDate: student.trial_date ? student.trial_date.split('T')[0] : new Date().toISOString().split('T')[0],
      result: 'passed',
      score: '',
      examinerNotes: '',
    });

    // Initialize DMT Learner License Lifecycle & Final License fields
    if (student.finalLicense) {
      setAdminLicenseNumber(student.finalLicense.licenseNumber || '');
      setAdminLicensePreview(
        student.finalLicense.photoUrl
          ? (student.finalLicense.photoUrl.startsWith('http')
              ? student.finalLicense.photoUrl
              : `http://localhost:5001${student.finalLicense.photoUrl}`)
          : null
      );
    } else {
      setAdminLicenseNumber('');
      setAdminLicensePreview(null);
    }
    setAdminLicenseFile(null);
    setShowRejectLicenseInput(false);
    setRejectLicenseReason('');
  };

  const handleSaveTrialDate = async (e) => {
    e.preventDefault();
    if (!trialDateInput) {
      toast.error('Please select a valid trial date');
      return;
    }
    setSavingTrialDate(true);
    try {
      const combinedTrialDate = trialTimeInput
        ? `${trialDateInput}T${trialTimeInput}:00`
        : trialDateInput;
      const res = await api.patch(`/students/${selectedStudent._id}/trial-date`, {
        trialDate: combinedTrialDate,
      });
      if (res.data.success) {
        toast.success('Practical trial date & time scheduled successfully!');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set trial date');
    } finally {
      setSavingTrialDate(false);
    }
  };

  // Explicit Admin action to mark student as PASSED (US Requirement 5 & 11)
  const handleMarkPassed = async (studentId) => {
    if (
      !window.confirm(
        'Are you sure you want to mark this learner as PASSED? This signifies successful completion of all written and licensing requirements.'
      )
    ) {
      return;
    }
    setMarkingPassed(true);
    try {
      const res = await api.patch(`/students/${studentId}/final-pass`);
      if (res.data.success) {
        toast.success(res.data.message || 'Learner marked as PASSED successfully!');
        setSelectedStudent(res.data.student);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark learner as passed');
    } finally {
      setMarkingPassed(false);
    }
  };

  const [reRegisteringId, setReRegisteringId] = useState(null);

  // Staff / Admin action to re-register student (Rules 10, 11, 15)
  const handleStaffReRegister = async (studentId) => {
    if (
      !window.confirm(
        'Are you sure you want to initialize a new Registration Cycle for this learner? This resets exam & trial attempts to 0/3, generates a brand new 18-month validity period, and requires the Rs. 5,000 advance payment to activate.'
      )
    ) {
      return;
    }

    setReRegisteringId(studentId);
    try {
      const res = await api.post(`/students/${studentId}/re-register`);
      if (res.data.success) {
        toast.success(res.data.message || 'New registration cycle created successfully!');
        if (selectedStudent && selectedStudent._id === studentId && res.data.student) {
          setSelectedStudent(res.data.student);
        }
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to re-register learner');
    } finally {
      setReRegisteringId(null);
    }
  };

  // Staff / Admin verification of final driving license photo (US Requirement 6, 7 & 11)
  const handleVerifyFinalLicense = async (studentId, action, notes = '') => {
    setVerifyingLicense(true);
    try {
      const res = await api.patch(`/students/${studentId}/final-license/verify`, {
        action,
        verificationNotes: notes,
      });
      if (res.data.success) {
        toast.success(
          res.data.message ||
            `Driving license photo ${action === 'verify' ? 'verified' : 'rejected'} successfully!`
        );
        setSelectedStudent(res.data.student);
        setShowRejectLicenseInput(false);
        setRejectLicenseReason('');
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update license verification');
    } finally {
      setVerifyingLicense(false);
    }
  };

  // Staff / Admin upload or replace driving license photo (US Requirement 6, 7 & 11)
  const handleStaffUploadFinalLicense = async (e) => {
    e.preventDefault();
    if (!adminLicenseFile && !selectedStudent?.finalLicense?.photoUrl) {
      toast.error('Please select a driving license image to upload');
      return;
    }
    setUploadingAdminLicense(true);
    try {
      const formData = new FormData();
      if (adminLicenseFile) {
        formData.append('licensePhoto', adminLicenseFile);
      }
      if (adminLicenseNumber) {
        formData.append('licenseNumber', adminLicenseNumber);
      }
      if (adminAutoVerify) {
        formData.append('autoVerify', 'true');
      }

      const res = await api.post(`/students/${selectedStudent._id}/final-license`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Driving license photo uploaded successfully!');
        setSelectedStudent(res.data.student);
        setAdminLicenseFile(null);
        if (res.data.student?.finalLicense?.photoUrl) {
          const pUrl = res.data.student.finalLicense.photoUrl;
          setAdminLicensePreview(pUrl.startsWith('http') ? pUrl : `http://localhost:5001${pUrl}`);
        }
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload license photo');
    } finally {
      setUploadingAdminLicense(false);
    }
  };

  // Reschedule Requests State (Medical, Registration, Written Exam & Practical Trial)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [reviewNewTrialDate, setReviewNewTrialDate] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Tab & Filters for Reschedule Management
  const [activeViewTab, setActiveViewTab] = useState('students'); // 'students' | 'reschedules'
  const [rescheduleMilestoneFilter, setRescheduleMilestoneFilter] = useState('All');
  const [rescheduleStatusFilter, setRescheduleStatusFilter] = useState('All');

  const milestoneMeta = {
    medical: { label: '🩺 DMT Medical Exam', badgeBg: 'bg-emerald-500/20', textCol: 'text-emerald-300', borderCol: 'border-emerald-400/30' },
    registration: { label: '📄 DMT Registration', badgeBg: 'bg-blue-500/20', textCol: 'text-blue-300', borderCol: 'border-blue-400/30' },
    theory_exam: { label: '📖 Written Theory Exam', badgeBg: 'bg-amber-500/20', textCol: 'text-amber-300', borderCol: 'border-amber-400/30' },
    trial: { label: '🚗 Practical Driving Trial', badgeBg: 'bg-purple-500/20', textCol: 'text-purple-300', borderCol: 'border-purple-400/30' },
  };

  const getMilestoneLabel = (type) => milestoneMeta[type]?.label || 'Milestone';

  const fetchRescheduleRequests = async () => {
    setLoadingReschedule(true);
    try {
      const res = await api.get('/students/reschedule-requests/all');
      if (res.data.success) {
        setRescheduleRequests(res.data.requests);
      }
    } catch (err) {
      console.warn('Failed to load reschedule requests:', err.message);
    } finally {
      setLoadingReschedule(false);
    }
  };

  const handleReviewReschedule = async (status) => {
    if (!reviewingRequest) return;
    const mType = reviewingRequest.milestone_type || 'trial';
    const mLabel = getMilestoneLabel(mType);

    if (status === 'Approved' && !reviewNewTrialDate) {
      toast.error(`Please select the new ${mLabel} date`);
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await api.patch(`/students/reschedule-requests/${reviewingRequest._id}/review`, {
        status,
        newDate: reviewNewTrialDate,
        newTrialDate: reviewNewTrialDate,
        reviewNotes,
      });
      if (res.data.success) {
        toast.success(
          status === 'Approved'
            ? (res.data.message || `${mLabel} date rescheduled successfully!`)
            : 'Reschedule request rejected.'
        );
        setReviewingRequest(null);
        setReviewNewTrialDate('');
        setReviewNotes('');
        fetchRescheduleRequests();
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review reschedule request');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSaveDmtDates = async (e) => {
    e.preventDefault();

    // Client-side validation:
    // 1. Registration Date and Medical Exam Date CAN be the exact same date (or either order).
    // 2. Theory (Written) Exam Date MUST be strictly after both Registration Date and Medical Exam Date.
    if (dmtForm.learnerExamDate) {
      const exam = new Date(dmtForm.learnerExamDate).setHours(0, 0, 0, 0);

      if (dmtForm.learnerRegistrationDate) {
        const reg = new Date(dmtForm.learnerRegistrationDate).setHours(0, 0, 0, 0);
        if (exam <= reg) {
          toast.error('Theory Exam Date must be after the Registration Date');
          return;
        }
      }

      if (dmtForm.medicalExamDate) {
        const med = new Date(dmtForm.medicalExamDate).setHours(0, 0, 0, 0);
        if (exam <= med) {
          toast.error('Theory Exam Date must be after the Medical Exam Date');
          return;
        }
      }
    }

    try {
      const payload = {
        medicalExamDate: dmtForm.medicalExamDate,
        learnerRegistrationDate: dmtForm.learnerRegistrationDate,
        learnerExamDate: dmtForm.learnerExamDate,
        learnerExamStatus: dmtForm.learnerExamStatus,
        learnerExamPassed: dmtForm.learnerExamStatus === 'passed',
      };
      const res = await api.patch(`/students/${selectedStudent._id}/dmt-dates`, payload);
      if (res.data.success) {
        toast.success('DMT Dates updated successfully');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update DMT dates');
    }
  };

  const handleRecordTrial = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/students/${selectedStudent._id}/trial-attempt`, trialForm);
      if (res.data.success) {
        toast.success('Trial attempt recorded successfully!');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record trial attempt');
    }
  };

  const openVerifyPaymentModal = async (student) => {
    setVerifyModalStudent(student);
    setShowRejectInput(false);
    setRejectionReason('');
    setStudentPaymentsList(student.payments || (student.latestPayment ? [student.latestPayment] : []));
    setLoadingStudentPayments(true);
    try {
      const res = await api.get(`/payments/student/${student._id}`);
      if (res.data.success && res.data.payments?.length > 0) {
        setStudentPaymentsList(res.data.payments);
      }
    } catch (err) {
      console.log('Error fetching student payments:', err);
    } finally {
      setLoadingStudentPayments(false);
    }
  };

  const handleVerifyStudentPayment = async (studentId, action = 'verify') => {
    setVerifyingPayment(true);
    try {
      const res = await api.patch(`/students/${studentId}/toggle-premium`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason : '',
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setVerifyModalStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setVerifyingPayment(false);
    }
  };

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 space-y-6 max-w-[1920px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBE2EF] border border-[#3F72AF]/30 text-[#112D4E] font-bold text-xs sm:text-sm mb-2.5">
            <Sparkles className="w-4 h-4 text-[#3F72AF]" /> Learner Registry & Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B2447] font-heading flex items-center gap-3">
            <Users className="w-8 h-8 text-[#3F72AF]" /> Student Records & DMT Milestone Management
          </h1>
          <p className="text-sm sm:text-base text-[#4B6584] mt-1">
            Manage registrations, track DMT milestone progress, and record practical trial examination attempts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              fetchRescheduleRequests();
              setShowRescheduleModal(true);
            }}
            className="btn-secondary text-sm py-3 px-5 flex items-center gap-2 font-bold shadow-sm"
          >
            <Clock className="w-4 h-4 text-[#3F72AF]" />
            📅 Date Reschedule Requests
            {rescheduleRequests.filter((r) => r.status === 'Pending').length > 0 && (
              <span className="badge badge-warning text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {rescheduleRequests.filter((r) => r.status === 'Pending').length} Pending
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setWalkInStep(1);
              setShowWalkInModal(true);
            }}
            className="btn-accent text-sm py-3 px-5 flex items-center gap-2 font-bold shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Register Walk-In Student
          </button>
          <button
            onClick={fetchStudents}
            className="btn-secondary text-sm py-3 px-5 flex items-center gap-2 font-bold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh List
          </button>
        </div>
      </div>

      {/* Prominent Pending Reschedule Banner for DEO */}
      {rescheduleRequests.filter((r) => r.status === 'Pending').length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-6 h-6 text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-[#0B2447] text-base">
                  Student Date Reschedule Requests Awaiting Review
                </h3>
                <span className="badge bg-amber-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow">
                  {rescheduleRequests.filter((r) => r.status === 'Pending').length} Pending Action
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6584] mt-1">
                Latest:{' '}
                <strong className="text-[#112D4E]">
                  {rescheduleRequests.find((r) => r.status === 'Pending')?.student_id?.userId?.name ||
                    rescheduleRequests.find((r) => r.status === 'Pending')?.requested_by?.name ||
                    'A student'}
                </strong>{' '}
                requested another date for{' '}
                <strong className="text-amber-800">
                  {getMilestoneLabel(rescheduleRequests.find((r) => r.status === 'Pending')?.milestone_type || 'trial')}
                </strong>
                {rescheduleRequests.find((r) => r.status === 'Pending')?.preferred_date
                  ? ` (Preferred Date: ${safeFormatDate(
                      rescheduleRequests.find((r) => r.status === 'Pending').preferred_date,
                      'MMM dd, yyyy'
                    )})`
                  : ''}
                {rescheduleRequests.find((r) => r.status === 'Pending')?.reason
                  ? ` — "${rescheduleRequests.find((r) => r.status === 'Pending').reason}"`
                  : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                fetchRescheduleRequests();
                setActiveViewTab('reschedules');
              }}
              className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" /> Switch to Requests Tab
            </button>
            <button
              type="button"
              onClick={() => {
                fetchRescheduleRequests();
                setShowRescheduleModal(true);
              }}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
            >
              Open Review Modal
            </button>
          </div>
        </div>
      )}

      {/* View Switcher Tabs: Student Registry vs Date Reschedule Requests */}
      <div className="flex items-center gap-3 border-b border-[#DBE2EF] pb-2">
        <button
          type="button"
          onClick={() => setActiveViewTab('students')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeViewTab === 'students'
              ? 'bg-[#3F72AF] text-white shadow-md'
              : 'text-[#4B6584] hover:text-[#112D4E] hover:bg-[#DBE2EF]/60 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4" /> All Students & DMT Milestones
          <span className={`badge ${activeViewTab === 'students' ? 'bg-white/20 text-white' : 'bg-[#DBE2EF] text-[#112D4E]'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            fetchRescheduleRequests();
            setActiveViewTab('reschedules');
          }}
          className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeViewTab === 'reschedules'
              ? 'bg-[#112D4E] text-white shadow-md'
              : 'text-[#4B6584] hover:text-[#112D4E] hover:bg-[#DBE2EF]/60 border border-transparent'
          }`}
        >
          <Clock className="w-4 h-4" /> Student Date Reschedule Requests
          {rescheduleRequests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="badge bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
              {rescheduleRequests.filter((r) => r.status === 'Pending').length} Pending
            </span>
          )}
        </button>
      </div>

      {activeViewTab === 'reschedules' ? (
        /* Dedicated Full-Screen Date Reschedule Requests Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950/60 rounded-2xl border border-white/10 flex-wrap">
            {/* Milestone Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-bold mr-1">Milestone:</span>
              {[
                { id: 'All', label: 'All Milestones' },
                { id: 'medical', label: '🩺 Medical Exam' },
                { id: 'registration', label: '📄 Registration' },
                { id: 'theory_exam', label: '📖 Written Exam' },
                { id: 'trial', label: '🚗 Practical Trial' },
              ].map((tab) => {
                const count = tab.id === 'All'
                  ? rescheduleRequests.length
                  : rescheduleRequests.filter((r) => (r.milestone_type || 'trial') === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRescheduleMilestoneFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      rescheduleMilestoneFilter === tab.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {tab.label}
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-bold mr-1">Status:</span>
              {[
                { id: 'All', label: 'All' },
                { id: 'Pending', label: 'Pending' },
                { id: 'Approved', label: 'Approved' },
                { id: 'Rejected', label: 'Rejected' },
              ].map((tab) => {
                const count = tab.id === 'All'
                  ? rescheduleRequests.length
                  : rescheduleRequests.filter((r) => r.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRescheduleStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      rescheduleStatusFilter === tab.id
                        ? 'bg-white/20 text-cyan-300 border border-white/30 shadow'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    {tab.label}
                    <span className="text-[10px] font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Reschedule Cards */}
          {loadingReschedule ? (
            <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
              Loading reschedule requests...
            </div>
          ) : rescheduleRequests.filter((r) => {
              const m = r.milestone_type || 'trial';
              if (rescheduleMilestoneFilter !== 'All' && m !== rescheduleMilestoneFilter) return false;
              if (rescheduleStatusFilter !== 'All' && r.status !== rescheduleStatusFilter) return false;
              return true;
            }).length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm space-y-2 card bg-slate-950/40 border-white/10">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-200 text-base">No Date Reschedule Requests Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When students request another date for their DMT Medical Exam, DMT Registration, Written Theory Exam, or Practical Trial Exam, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rescheduleRequests
                .filter((r) => {
                  const m = r.milestone_type || 'trial';
                  if (rescheduleMilestoneFilter !== 'All' && m !== rescheduleMilestoneFilter) return false;
                  if (rescheduleStatusFilter !== 'All' && r.status !== rescheduleStatusFilter) return false;
                  return true;
                })
                .map((req) => {
                  const studentUser = req.student_id?.userId || req.requested_by;
                  const isPending = req.status === 'Pending';
                  const isBeingReviewed = reviewingRequest?._id === req._id;
                  const mType = req.milestone_type || 'trial';
                  const mLabel = getMilestoneLabel(mType);
                  const meta = milestoneMeta[mType] || milestoneMeta.trial;

                  return (
                    <div
                      key={req._id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isPending
                          ? 'bg-purple-950/25 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-white/5 border-white/10'
                      } space-y-3.5`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-base">{studentUser?.name || 'Student'}</span>
                            <span className={`badge ${meta.badgeBg} ${meta.borderCol} ${meta.textCol} text-xs font-bold border`}>
                              {mLabel}
                            </span>
                            <span className="badge bg-white/10 text-slate-300 text-xs font-mono">
                              {req.student_id?.branch || studentUser?.branch || 'Branch'}
                            </span>
                            {req.student_id?.nic && (
                              <span className="badge bg-white/5 text-slate-400 text-xs font-mono">
                                NIC: {req.student_id?.nic}
                              </span>
                            )}
                            <span
                              className={`badge text-xs font-black ${
                                req.status === 'Approved'
                                  ? 'badge-success'
                                  : req.status === 'Rejected'
                                  ? 'badge-error'
                                  : 'badge-warning animate-pulse'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {studentUser?.phone || 'No phone'} • {studentUser?.email}
                          </p>
                        </div>
                        <div className="text-xs text-slate-400 text-right">
                          <span className="block text-[11px] text-slate-500">Submitted:</span>
                          <span className="font-bold text-slate-200">
                            {safeFormatDate(req.requested_at, 'MMM dd, yyyy HH:mm', 'N/A')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/5">
                          <span className="text-[11px] text-slate-400 block font-semibold">Previous Scheduled Date:</span>
                          <span className="font-bold text-rose-300 font-mono text-sm">
                            {safeFormatDate(req.previous_date || req.previous_trial_date, 'MMM dd, yyyy', 'None Assigned')}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/5">
                          <span className="text-[11px] text-slate-400 block font-semibold">Requested / Preferred Date:</span>
                          <span className="font-bold text-cyan-300 font-mono text-sm">
                            {safeFormatDate(req.preferred_date, 'MMM dd, yyyy', 'No date preference')}
                          </span>
                        </div>
                        {(req.new_date || req.new_trial_date) && (
                          <div className="p-3 bg-slate-950/70 rounded-2xl border border-emerald-500/30">
                            <span className="text-[11px] text-emerald-400 block font-semibold">Approved New Date:</span>
                            <span className="font-black text-emerald-300 font-mono text-sm">
                              {safeFormatDate(req.new_date || req.new_trial_date, 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>

                      {req.reason && (
                        <div className="text-xs p-3.5 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-slate-400 font-bold block mb-1">Student's Stated Reason:</span>
                          <p className="text-slate-200 italic font-medium">"{req.reason}"</p>
                        </div>
                      )}

                      {!isPending && (
                        <div className="text-xs text-slate-400 flex items-center justify-between border-t border-white/5 pt-2.5">
                          <span>Reviewed by: <strong className="text-white">{req.reviewed_by?.name || 'Officer'}</strong></span>
                          <span>Date: {safeFormatDate(req.reviewed_at, 'MMM dd, yyyy', 'N/A')}</span>
                          {req.review_notes && <span className="text-slate-300">Notes: {req.review_notes}</span>}
                        </div>
                      )}

                      {isPending && (
                        <div className="pt-2 border-t border-white/10">
                          {isBeingReviewed ? (
                            <div className="p-4 bg-purple-950/50 rounded-2xl border border-purple-400/50 space-y-3">
                              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-purple-400" /> DEO Review & Decision ({mLabel})
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-slate-300 font-semibold mb-1 text-xs">
                                    Assign New {mLabel} Date <span className="text-rose-400">*</span>
                                  </label>
                                  <div className="relative flex items-center">
                                    <Calendar className="w-4 h-4 text-[#3F72AF] absolute left-3 pointer-events-none" />
                                    <input
                                      type="date"
                                      value={reviewNewTrialDate}
                                      onChange={(e) => setReviewNewTrialDate(e.target.value)}
                                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl text-xs font-bold outline-none focus:border-cyan-400 cursor-pointer"
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Required for Approval. Will update student's {mLabel} date in database.
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-slate-300 font-semibold mb-1 text-xs">
                                    Officer Review Notes (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Rescheduled as per student request"
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl text-xs outline-none focus:border-cyan-400"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setReviewingRequest(null)}
                                  disabled={reviewSubmitting}
                                  className="btn-secondary text-xs py-2 px-3"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewReschedule('Rejected')}
                                  disabled={reviewSubmitting}
                                  className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 font-bold text-xs"
                                >
                                  Reject Request
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewReschedule('Approved')}
                                  disabled={reviewSubmitting}
                                  className="btn-accent text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                                >
                                  {reviewSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  Approve & Assign New Date
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingRequest(req);
                                setReviewNewTrialDate(
                                  req.preferred_date ? req.preferred_date.split('T')[0] : ''
                                );
                                setReviewNotes('');
                              }}
                              className="btn-accent text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Review & Reschedule {mLabel} Date
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        /* Standard Student Registry View */
        <>
      {/* Filter & Search Bar */}
      <div className="card p-6 space-y-4 bg-white border border-[#D4EEF8] rounded-2xl shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#D4EEF8] text-[#152026] placeholder-slate-400 rounded-xl text-sm sm:text-base focus:border-[#1B3D59] focus:ring-2 focus:ring-[#1B3D59]/20 outline-none"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-3 border border-[#D4EEF8] rounded-xl text-sm sm:text-base bg-white text-[#152026] outline-none font-semibold focus:border-[#1B3D59] focus:ring-2 focus:ring-[#1B3D59]/20"
          >
            <option value="All">All Branches</option>
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>

          {/* Student Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border border-[#D4EEF8] rounded-xl text-sm sm:text-base bg-white text-[#152026] outline-none font-semibold focus:border-[#1B3D59] focus:ring-2 focus:ring-[#1B3D59]/20"
          >
            <option value="">All Categories (Type 1 & 2)</option>
            <option value="Type1_NewLearner">Type 1 — New Learner</option>
            <option value="Type2_TrialReady">Type 2 — Trial-Ready</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-[#D4EEF8] rounded-xl text-sm sm:text-base bg-white text-[#152026] outline-none font-semibold focus:border-[#1B3D59] focus:ring-2 focus:ring-[#1B3D59]/20"
          >
            <option value="">All Progress Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="registered">Registered</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed / Licensed</option>
          </select>
        </form>
      </div>

      {/* Student List Table */}
      <div className="card p-0 overflow-hidden shadow-xs border border-[#D4EEF8] bg-white rounded-2xl">
        {loading ? (
          <div className="py-16 text-center text-sm sm:text-base text-[#475569] flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-[#1B3D59]" /> Loading student database...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-lg font-bold text-[#152026]">No students found matching your filters</p>
            <p className="text-sm text-[#475569]">Try adjusting your search query or branch filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1B3D59] border-b border-[#D4EEF8] text-white uppercase text-xs font-black tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Student Name</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Branch & Category</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Package / Lessons</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">DMT Learner Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px] text-center">Trial Attempts</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[260px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4EEF8]">
                {students.map((st) => {
                  const isLicensed = st.trial?.licenseObtained;
                  const attemptsCount = st.trial?.attempts?.length || 0;
                  const isType2 =
                    st.studentType === 'Type2_TrialReady' ||
                    st.studentType === 'Type 2' ||
                    st.studentType === 'type2' ||
                    st.student_type === 'Type 2';

                  const studentPendingReq = rescheduleRequests.find(
                    (r) =>
                      (r.student_id?._id === st._id || r.student_id === st._id) &&
                      r.status === 'Pending'
                  );

                  return (
                    <tr key={st._id} className="hover:bg-[#D4EEF8]/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-4 py-3 font-semibold text-[#152026]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm sm:text-base font-extrabold text-[#152026]">{st.userId?.name || 'Unknown Student'}</div>
                          {studentPendingReq && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingRequest(studentPendingReq);
                                setReviewNewTrialDate(
                                  studentPendingReq.preferred_date ? studentPendingReq.preferred_date.split('T')[0] : ''
                                );
                                setReviewNotes('');
                                setShowRescheduleModal(true);
                              }}
                              className="px-2 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[10px] font-extrabold animate-pulse hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                              title="Click to review student's reschedule request"
                            >
                              <Clock className="w-3 h-3 text-amber-700" />
                              📅 {getMilestoneLabel(studentPendingReq.milestone_type || 'trial')} Reschedule Requested
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-[#475569] font-medium mt-0.5">
                          {st.userId?.phone} • {st.userId?.email}
                        </div>
                      </td>

                      {/* Branch & Type */}
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-xs sm:text-sm text-[#152026]">{st.branch}</div>
                        <span
                          className={`inline-block text-[11px] py-0.5 px-2 mt-1 font-bold rounded-full border ${
                            isType2
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border-[#6A97C0]/40'
                              : 'bg-white text-[#152026] border-[#D4EEF8]'
                          }`}
                        >
                          {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                        </span>
                        {st.trial_date && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#D4EEF8]/60 text-[#1B3D59] border border-[#6A97C0]/30 text-[10px] font-bold">
                              📅 Trial: {formatShortTrialDate(st.trial_date)}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Package */}
                      <td className="px-4 py-3">
                        {st.package?.type ? (
                          <>
                            <div className="font-bold text-xs sm:text-sm text-[#152026]">{st.package.type.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-[#475569] font-medium mt-0.5">
                              {st.package.lessonsUsed || 0} / {st.package.lessonsTotal || 0} used
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-xs text-[#1B3D59]">Pending Theory Exam</div>
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5">Selected at Step 5</div>
                          </>
                        )}
                      </td>

                      {/* DMT Learner Exam */}
                      <td className="px-4 py-3">
                        {isType2 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">Pre-Cleared</span>
                        ) : st.registrationStatus === 'cancelled' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-bold">Failed 3/3 Attempts</span>
                        ) : st.dmtDates?.learnerExamPassed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            Passed {st.learnerExamMarks ? `(${st.learnerExamMarks}/40)` : 'Written Exam'}
                          </span>
                        ) : st.learnerExamAttemptsCount > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-bold">Failed ({st.learnerExamAttemptsCount}/3)</span>
                            {st.dmtDates?.learnerExamDate && (
                              <span className="text-[10px] text-amber-700 font-bold">
                                Next: {safeFormatDate(st.dmtDates.learnerExamDate, 'MMM dd')}
                              </span>
                            )}
                          </div>
                        ) : st.dmtDates?.learnerExamDate ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-xs font-bold">
                            Exam: {safeFormatDate(st.dmtDates.learnerExamDate, 'MMM dd')}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold">Exam Pending</span>
                        )}
                      </td>

                      {/* Trial Attempts Pills */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {[1, 2, 3].map((num) => {
                            const att = st.trial?.attempts?.find((a) => a.attemptNumber === num);
                            let bg = 'bg-slate-100 text-slate-500 border border-slate-200';
                            if (att) {
                              bg =
                                att.result === 'passed'
                                  ? 'bg-emerald-600 text-white font-black border-emerald-500 shadow-xs'
                                  : 'bg-red-600 text-white font-black border-red-500 shadow-xs';
                            }

                            return (
                              <span
                                key={num}
                                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-extrabold transition-transform hover:scale-105 ${bg}`}
                                title={
                                  att
                                    ? `Attempt ${num}: ${att.result?.toUpperCase()} on ${safeFormatDate(
                                        att.attemptDate || att.date || att.createdAt,
                                        'MMM dd, yyyy',
                                        'Recorded'
                                      )}`
                                    : `Attempt ${num}: Available`
                                }
                              >
                                {num}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isLicensed
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : st.registrationStatus === 'cancelled'
                                ? 'bg-red-50 text-red-800 border border-red-300'
                                : st.registrationStatus === 'registered' || st.registrationStatus === 'in_progress'
                                ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30'
                                : 'bg-[#F3EED8] text-[#152026] border border-amber-300'
                            }`}
                          >
                            {isLicensed ? 'Licensed' : st.registrationStatus === 'cancelled' ? '❌ CANCELLED' : st.registrationStatus?.replace('_', ' ')}
                          </span>

                          {st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                              👑 Premium User
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                              🔒 Advance Pending
                            </span>
                          )}

                          {st.latestPayment?.slipImageUrl && !st.isAdvancePaid && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#1B3D59] bg-[#D4EEF8] px-2 py-0.5 rounded-full border border-[#6A97C0]/30 font-bold">
                              <FileText className="w-3 h-3 text-[#1B3D59]" /> Slip Uploaded
                            </span>
                          )}

                          {/* DMT Learner License Lifecycle & Completion Status */}
                          {st.learnerLicenseStatus === 'completed' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                              ✓ License Completed
                            </span>
                          )}
                          {st.learnerLicenseStatus === 'passed' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/40 text-[10px] font-extrabold flex items-center gap-1">
                              ★ Passed (Upload DL)
                            </span>
                          )}
                          {st.learnerLicenseStatus === 'expired' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300 text-[10px] font-extrabold flex items-center gap-1">
                              ⚠️ 18M Expired
                            </span>
                          )}
                          {st.learnerLicenseStatus === 'attempts_exhausted' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300 text-[10px] font-extrabold flex items-center gap-1">
                              ❌ 3 Attempts Failed
                            </span>
                          )}
                          {st.learnerLicenseStatus === 'expiring_soon' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                              ⏳ Expiring Soon
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          {/* DMT Learner License Lifecycle & Completion Management */}
                          <button
                            onClick={() => openStudentModal(st, 'lifecycle')}
                            className="p-2 rounded-xl bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] border border-[#6A97C0]/30 transition-all cursor-pointer shadow-xs"
                            title="DMT License Lifecycle (18M Validity, 3 Attempts, Final Pass & License Upload)"
                          >
                            <FileCheck className="w-4 h-4 text-[#1B3D59]" />
                          </button>

                          {/* Re-Register Action Button for Cancelled / Expired Students (Rules 10 & 15) */}
                          {(st.registrationStatus === 'cancelled' ||
                            st.accountStatus === 'cancelled' ||
                            st.learnerLicenseStatus === 'attempts_exhausted' ||
                            st.learnerLicenseStatus === 'expired') && (
                            <button
                              type="button"
                              onClick={() => handleStaffReRegister(st._id)}
                              disabled={reRegisteringId === st._id}
                              className="p-2 rounded-xl bg-[#F3EED8] hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-xs"
                              title="Re-Register Student (Start New 18-Month Cycle & Reset Attempts)"
                            >
                              <RotateCcw className={`w-4 h-4 ${reRegisteringId === st._id ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {/* Direct Date Reschedule Review Action Button */}
                          {studentPendingReq && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingRequest(studentPendingReq);
                                setReviewNewTrialDate(
                                  studentPendingReq.preferred_date ? studentPendingReq.preferred_date.split('T')[0] : ''
                                );
                                setReviewNotes('');
                                setShowRescheduleModal(true);
                              }}
                              className="p-2 rounded-xl bg-[#F3EED8] hover:bg-amber-100 text-[#152026] border border-amber-300 animate-pulse transition-all shadow-xs cursor-pointer"
                              title={`Action Required: Review ${getMilestoneLabel(studentPendingReq.milestone_type || 'trial')} Reschedule Request`}
                            >
                              <Clock className="w-4 h-4 text-amber-700" />
                            </button>
                          )}

                          {/* Inspect Details Button */}
                          <button
                            onClick={() => openVerifyPaymentModal(st)}
                            className="p-2 rounded-xl bg-[#F0F4F8] hover:bg-blue-50 text-[#3F72AF] hover:text-[#0B2447] border border-[#DBE2EF] transition-all cursor-pointer shadow-xs"
                            title="Inspect Student Registration Details & Payment Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Verify Payment Button */}
                          <button
                            onClick={() => openVerifyPaymentModal(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                              st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 shadow-xs animate-pulse'
                            }`}
                            title={
                              st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                                ? 'View Payment Slip & Registration Records'
                                : 'Review Payment Slip, Student Details & Verify Payment'
                            }
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                                ? 'Verified'
                                : 'Verify Pay'}
                            </span>
                          </button>

                          {/* Schedule Practical Trial Date (Shared for Type 1 & Type 2) */}
                          <button
                            onClick={() => openStudentModal(st, 'set_trial_date')}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all cursor-pointer shadow-xs"
                            title="Schedule or Reschedule Practical Trial Date"
                          >
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </button>

                          {/* DMT Milestone Dates (Only for Type 1 New Learners) */}
                          {!isType2 && (
                            <button
                              onClick={() => openStudentModal(st, 'edit_dmt')}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3F72AF] border border-blue-200 transition-all cursor-pointer shadow-xs"
                              title="Update DMT Milestone Dates (Type 1 Only)"
                            >
                              <Calendar className="w-4 h-4 text-[#3F72AF]" />
                            </button>
                          )}

                          {/* Record Practical Trial Result */}
                          <button
                            onClick={() => openStudentModal(st, 'record_trial')}
                            disabled={isLicensed || attemptsCount >= 3}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                            title="Record Practical Trial Result"
                          >
                            <Award className="w-4 h-4 text-amber-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Modal Dialog: Edit DMT Dates / Record Trial Attempt */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl ${modalMode === 'lifecycle' ? 'max-w-3xl' : 'max-w-lg'} w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto text-[#152026]`}>
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                  {modalMode === 'edit_dmt' ? (
                    <>
                      <Calendar className="w-5 h-5 text-[#1B3D59]" /> DMT Regulatory Dates: {selectedStudent.userId?.name}
                    </>
                  ) : modalMode === 'set_trial_date' ? (
                    <>
                      <Calendar className="w-5 h-5 text-[#1B3D59]" /> Practical Trial Date: {selectedStudent.userId?.name}
                    </>
                  ) : modalMode === 'lifecycle' ? (
                    <>
                      <FileCheck className="w-5 h-5 text-[#1B3D59]" /> DMT License Lifecycle & Completion: {selectedStudent.userId?.name}
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5 text-[#1B3D59]" /> Record Practical Trial Attempt: {selectedStudent.userId?.name}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedStudent.branch} Branch • {selectedStudent.studentType}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Set Practical Trial Date Form (Shared for Type 1 & Type 2) */}
            {modalMode === 'set_trial_date' && (
              <form onSubmit={handleSaveTrialDate} className="space-y-4 text-xs">
                {/* Pending Trial Reschedule Banner */}
                {selectedStudent &&
                  rescheduleRequests.find(
                    (r) =>
                      (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                      (r.milestone_type === 'trial' || !r.milestone_type) &&
                      r.status === 'Pending'
                  ) && (
                    <div className="p-3.5 bg-[#F3EED8] border border-[#E2D8B3] rounded-2xl space-y-2 text-[#152026]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#152026] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#1B3D59] animate-pulse" />
                          Student Submitted Practical Trial Reschedule Request
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E2D8B3] text-[#152026] text-[10px] font-bold">
                          Pending
                        </span>
                      </div>
                      <div className="text-xs text-[#152026]">
                        Preferred Date:{' '}
                        <strong className="text-[#1B3D59] font-mono">
                          {safeFormatDate(
                            rescheduleRequests.find(
                              (r) =>
                                (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                                (r.milestone_type === 'trial' || !r.milestone_type) &&
                                r.status === 'Pending'
                            )?.preferred_date,
                            'MMM dd, yyyy',
                            'No date preference'
                          )}
                        </strong>
                      </div>
                      {rescheduleRequests.find(
                        (r) =>
                          (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                          (r.milestone_type === 'trial' || !r.milestone_type) &&
                          r.status === 'Pending'
                      )?.reason && (
                        <div className="text-slate-600 italic text-[11px]">
                          "{rescheduleRequests.find(
                            (r) =>
                              (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                              (r.milestone_type === 'trial' || !r.milestone_type) &&
                              r.status === 'Pending'
                          ).reason}"
                        </div>
                      )}
                      {rescheduleRequests.find(
                        (r) =>
                          (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                          (r.milestone_type === 'trial' || !r.milestone_type) &&
                          r.status === 'Pending'
                      )?.preferred_date && (
                        <button
                          type="button"
                          onClick={() => {
                            const req = rescheduleRequests.find(
                              (r) =>
                                (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                                (r.milestone_type === 'trial' || !r.milestone_type) &&
                                r.status === 'Pending'
                            );
                            if (req?.preferred_date) {
                              const pDate = req.preferred_date.split('T')[0];
                              setTrialDateInput(pDate);
                              toast.success(`Applied preferred date (${pDate}) to input!`);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-white hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] font-bold text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Apply Student's Preferred Trial Date
                        </button>
                      )}
                    </div>
                  )}

                <div className="p-3.5 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl space-y-1">
                  <p className="font-bold text-[#1B3D59] text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#1B3D59]" /> Schedule Practical Driving Trial Exam
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Setting the official practical trial date allows the student to book lesson sessions up until this date. If not set (for Type 2) or passed, booking will be locked.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#152026] text-xs mb-1">
                      Practical Trial Date: <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                      <input
                        type="date"
                        required
                        min={new Date().toLocaleDateString('en-CA')}
                        value={trialDateInput}
                        onChange={(e) => setTrialDateInput(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D4EEF8] rounded-xl text-[#152026] font-bold outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] cursor-pointer text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#152026] text-xs mb-1">
                      Practical Trial Time:
                    </label>
                    <div className="relative flex items-center">
                      <Clock className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                      <input
                        type="time"
                        value={trialTimeInput}
                        onChange={(e) => setTrialTimeInput(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D4EEF8] rounded-xl text-[#152026] font-bold outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                </div>

                {selectedStudent.trial_date && (
                  <div className="text-[11px] text-slate-600 p-2.5 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8]">
                    Currently Assigned: <strong className="text-[#152026]">{formatTrialDateDisplay(selectedStudent.trial_date)}</strong>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTrialDate || !trialDateInput}
                    className="btn-primary text-xs py-2 px-5 font-bold shadow-md disabled:opacity-50"
                  >
                    {savingTrialDate ? 'Saving...' : 'Set Practical Trial Date'}
                  </button>
                </div>
              </form>
            )}

            {/* DMT Dates Edit Form (US-04, US-05, US-09) */}
            {modalMode === 'edit_dmt' && (
              <form onSubmit={handleSaveDmtDates} className="space-y-4 text-xs">
                {/* Pending Reschedule Request Banner inside DMT Modal */}
                {selectedStudent &&
                  rescheduleRequests.find(
                    (r) =>
                      (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                      r.status === 'Pending' &&
                      ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                  ) && (
                    <div className="p-3.5 bg-[#F3EED8] border border-[#E2D8B3] rounded-2xl space-y-2 text-xs text-[#152026]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#152026] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#1B3D59] animate-pulse" />
                          Student Submitted Reschedule Request for{' '}
                          {getMilestoneLabel(
                            rescheduleRequests.find(
                              (r) =>
                                (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                                r.status === 'Pending' &&
                                ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                            )?.milestone_type
                          )}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E2D8B3] text-[#152026] text-[10px] font-bold">
                          Pending DEO Action
                        </span>
                      </div>
                      <div className="text-[#152026]">
                        Preferred Date:{' '}
                        <strong className="text-[#1B3D59] font-mono">
                          {safeFormatDate(
                            rescheduleRequests.find(
                              (r) =>
                                (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                                r.status === 'Pending' &&
                                ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                            )?.preferred_date,
                            'MMM dd, yyyy',
                            'No date preference'
                          )}
                        </strong>
                      </div>
                      {rescheduleRequests.find(
                        (r) =>
                          (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                          r.status === 'Pending' &&
                          ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                      )?.reason && (
                        <div className="text-slate-600 italic text-[11px]">
                          "{rescheduleRequests.find(
                            (r) =>
                              (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                              r.status === 'Pending' &&
                              ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                          ).reason}"
                        </div>
                      )}
                      {rescheduleRequests.find(
                        (r) =>
                          (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                          r.status === 'Pending' &&
                          ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                      )?.preferred_date && (
                        <button
                          type="button"
                          onClick={() => {
                            const req = rescheduleRequests.find(
                              (r) =>
                                (r.student_id?._id === selectedStudent._id || r.student_id === selectedStudent._id) &&
                                r.status === 'Pending' &&
                                ['medical', 'registration', 'theory_exam'].includes(r.milestone_type)
                            );
                            if (req?.preferred_date) {
                              const pDate = req.preferred_date.split('T')[0];
                              if (req.milestone_type === 'medical') {
                                setDmtForm((prev) => ({ ...prev, medicalExamDate: pDate }));
                              } else if (req.milestone_type === 'registration') {
                                setDmtForm((prev) => ({ ...prev, learnerRegistrationDate: pDate }));
                              } else if (req.milestone_type === 'theory_exam') {
                                setDmtForm((prev) => ({ ...prev, learnerExamDate: pDate }));
                              }
                              toast.success(
                                `Applied requested date (${pDate}) to form. Click "Save DMT Dates" below to approve!`
                              );
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] font-bold text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Apply Student's Requested Date to Form
                        </button>
                      )}
                    </div>
                  )}

                {selectedStudent.registrationStatus === 'cancelled' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                    <div className="font-bold text-rose-700 flex items-center gap-1.5 text-xs">
                      <XCircle className="w-4 h-4 text-rose-600" /> Registration Auto-Cancelled (3 Failed Written Exam Attempts)
                    </div>
                    <p className="text-[11px] text-slate-600">
                      This learner has failed all 3 allowed DMT written exam attempts. Their registration was cancelled and account locked. They need to re-register as a new learner and pay the Rs. 5,000 advance fee to restart.
                    </p>
                  </div>
                )}

                {/* DMT Date Sequence Order Notice */}
                <div className="p-3 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl text-[#152026] text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[#1B3D59]">
                    <Info className="w-4 h-4 text-[#1B3D59]" /> DMT Date Validation Sequence (Server-Enforced)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <strong>Registration Date</strong> and <strong>Medical Exam Date</strong> can be on the same date. <strong>Theory (Written) Exam Date</strong> must be scheduled after both dates.
                  </p>
                </div>

                {/* 1. Registration Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#152026]">
                      1. DMT Learner Registration Date (US-05):
                    </label>
                    {selectedStudent.dmtDates?.registrationDone && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Student Marked Done
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={dmtForm.learnerRegistrationDate}
                      onChange={(e) => setDmtForm({ ...dmtForm, learnerRegistrationDate: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl cursor-pointer focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    />
                  </div>
                </div>

                {/* 2. Medical Examination Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#152026]">
                      2. DMT Medical Examination Date (US-04) <span className="text-slate-600 font-mono text-[11px] font-medium">(Can be same date as Registration)</span>:
                    </label>
                    {selectedStudent.dmtDates?.medicalDone && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Student Marked Done
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={dmtForm.medicalExamDate}
                      onChange={(e) => setDmtForm({ ...dmtForm, medicalExamDate: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl cursor-pointer focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    />
                  </div>
                </div>

                {/* 3. Learner Written Exam Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#152026]">
                      3. DMT Learner Written Theory Exam Date <span className="text-slate-600 font-mono text-[11px] font-medium">(&gt; Registration &amp; Medical Dates)</span>:
                    </label>
                    <span className="text-[10px] text-[#1B3D59] font-mono font-bold">
                      {selectedStudent.learnerExamAttempts?.length || 0}/3 Attempts Used
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={dmtForm.learnerExamDate}
                      onChange={(e) => setDmtForm({ ...dmtForm, learnerExamDate: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl cursor-pointer focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    />
                  </div>
                </div>

                {/* 4. Learner Exam Status (Auto-reflected from Student Dashboard) */}
                {(() => {
                  const isStudentPassed = Boolean(
                    selectedStudent.learnerExamStatus === 'passed' || selectedStudent.dmtDates?.learnerExamPassed
                  );
                  const isStudentFailed = Boolean(
                    selectedStudent.learnerExamStatus === 'failed' ||
                    (selectedStudent.learnerExamAttempts &&
                      selectedStudent.learnerExamAttempts.length > 0 &&
                      selectedStudent.learnerExamAttempts[selectedStudent.learnerExamAttempts.length - 1]?.result === 'failed')
                  );

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-semibold text-slate-800 text-xs">
                          4. Learner Exam Status:
                        </label>
                        <span className="text-[11px] text-slate-500 font-medium">
                          (Auto-updated from Student Dashboard)
                        </span>
                      </div>

                      {isStudentPassed ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-emerald-950 text-sm block truncate">
                                  Passed Written Theory Exam
                                </span>
                              </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap">
                              ✓ Passed
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800/90 pl-10.5 leading-relaxed">
                            Student marked their exam as passed on the dashboard. Practical driving lessons and trials are unlocked.
                          </p>
                        </div>
                      ) : isStudentFailed ? (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
                                <XCircle className="w-4 h-4 text-rose-600" />
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-rose-950 text-sm block truncate">
                                  Failed Exam Attempt
                                </span>
                              </div>
                            </div>
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-2xs whitespace-nowrap">
                              ✕ Failed
                            </span>
                          </div>
                          <p className="text-xs text-rose-800/90 pl-10.5 leading-relaxed">
                            Student recorded a failed attempt on their dashboard. Date reschedule is required for the next attempt.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                              </div>
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-bold text-amber-950 text-sm whitespace-nowrap">
                                  In Progress
                                </span>
                                <span className="text-[11px] text-amber-800/80 font-medium truncate hidden sm:inline">
                                  • Awaiting Student Result
                                </span>
                              </div>
                            </div>
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                              ⏳ In Progress
                            </span>
                          </div>
                          <p className="text-xs text-amber-900/90 pl-10.5 leading-relaxed">
                            Dates are scheduled. Once the student faces their exam and selects Passed or Failed on their dashboard, this status will automatically update here.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Exam Attempt History List */}
                {selectedStudent.learnerExamAttempts && selectedStudent.learnerExamAttempts.length > 0 && (
                  <div className="p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl space-y-2">
                    <div className="font-bold text-[#152026] text-xs flex items-center justify-between">
                      <span>Recorded Written Exam Attempts:</span>
                      <span className="text-[#1B3D59] font-mono font-bold">
                        {selectedStudent.learnerExamAttempts.length} of 3
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedStudent.learnerExamAttempts.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-2 bg-white rounded-xl border border-[#D4EEF8]"
                        >
                          <span className="font-semibold text-[#152026]">
                            Attempt #{att.attemptNumber} ({safeFormatDate(att.date || att.attemptDate, 'MMM dd, yyyy', 'No date')})
                          </span>
                          <div className="flex items-center gap-2">
                            {att.marks !== undefined && att.marks !== null && (
                              <span className="font-mono text-[#1B3D59] font-bold">{att.marks}/40</span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                att.result === 'passed'
                                   ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                   : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {att.result?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                    Save DMT Changes
                  </button>
                </div>
              </form>
            )}

            {/* Practical Trial Result Form */}
            {modalMode === 'record_trial' && (
              <form onSubmit={handleRecordTrial} className="space-y-4 text-xs">
                {/* 3-Attempt Rule & 18-Month Validity Banner */}
                <div className="p-4 bg-[#F3EED8] border border-[#E2D8B3] rounded-2xl space-y-2 text-[#152026]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-extrabold text-[#1B3D59] flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-[#1B3D59]" /> DMT 3-Attempt & 18-Month Rule
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B3D59] text-white">
                      Attempt #{Math.min(3, (selectedStudent.trial?.attempts?.length || 0) + 1)} of 3
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-xl border border-[#E2D8B3]/60">
                      <span className="text-slate-500 block text-[10px]">Attempts Used:</span>
                      <strong className="text-[#152026]">{selectedStudent.trial?.attempts?.length || 0} / 3</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-[#E2D8B3]/60">
                      <span className="text-slate-500 block text-[10px]">Attempts Remaining:</span>
                      <strong className="text-emerald-700">
                        {Math.max(0, 3 - (selectedStudent.trial?.attempts?.length || 0))} Remaining
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-[#E2D8B3]/60 col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block text-[10px]">18-Month Expiry:</span>
                      <strong className="text-[#1B3D59]">
                        {selectedStudent.learnerLicenseExpiryDate
                          ? new Date(selectedStudent.learnerLicenseExpiryDate).toLocaleDateString()
                          : '18 Months'}
                      </strong>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[10.5px] leading-relaxed pt-1">
                    Failed attempts 1 and 2 do not cancel registration. Registration is only cancelled if all 3 attempts are failed OR the 18-month validity expires.
                  </p>
                </div>

                {/* Previous Attempts History */}
                {selectedStudent.trial?.attempts && selectedStudent.trial.attempts.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-bold text-[#152026]">
                      Previous Trial Attempts Recorded ({selectedStudent.trial.attempts.length} of 3):
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedStudent.trial.attempts.map((att, idx) => (
                        <div
                          key={att._id || idx}
                          className="p-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#152026]">Attempt #{att.attemptNumber || idx + 1}: </span>
                            <span className="text-slate-600">{new Date(att.date).toLocaleDateString()}</span>
                            {att.score && (
                              <span className="text-[#1B3D59] font-semibold ml-2">• Score: {att.score}</span>
                            )}
                            {att.examinerNotes && (
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{att.examinerNotes}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              att.result === 'passed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {att.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Practical Trial Examination Date:
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={trialForm.attemptDate}
                      onChange={(e) => setTrialForm({ ...trialForm, attemptDate: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl cursor-pointer focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#152026] mb-1">Trial Outcome:</label>
                    <select
                      value={trialForm.result}
                      onChange={(e) => setTrialForm({ ...trialForm, result: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] font-bold rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    >
                      <option value="passed">PASSED (Issue Driver's License)</option>
                      <option value="failed">FAILED (Requires Re-trial Scheduling)</option>
                      <option value="absent">ABSENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#152026] mb-1">Score / Marks (Optional):</label>
                    <input
                      type="text"
                      placeholder="e.g. 85% or Pass Grade A"
                      value={trialForm.score || ''}
                      onChange={(e) => setTrialForm({ ...trialForm, score: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Examiner Notes / Feedback:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Reverse parking cleared, minor observation on lane switching..."
                    value={trialForm.examinerNotes}
                    onChange={(e) => setTrialForm({ ...trialForm, examinerNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                    Record Trial Result
                  </button>
                </div>
              </form>
            )}

            {/* DMT Learner License Lifecycle & Completion Management (Requirements 1 - 11) */}
            {modalMode === 'lifecycle' && (() => {
              const cycleNum = selectedStudent.currentCycleNumber || 1;
              const startDate =
                selectedStudent.learnerLicenseStartDate ||
                selectedStudent.dmtDates?.learnerRegistrationDate ||
                selectedStudent.createdAt;
              let expiryDate = selectedStudent.learnerLicenseExpiryDate;
              if (!expiryDate && startDate) {
                try {
                  const d = new Date(startDate);
                  if (!isNaN(d.getTime())) {
                    d.setMonth(d.getMonth() + 18);
                    expiryDate = d.toISOString();
                  }
                } catch {
                  expiryDate = null;
                }
              }

              const now = new Date();
              const expDateObj = expiryDate ? new Date(expiryDate) : null;
              const isExpired = expDateObj && now > expDateObj;
              const diffDays = expDateObj
                ? Math.ceil((expDateObj - now) / (1000 * 60 * 60 * 24))
                : null;

              const attempts = selectedStudent.learnerExamAttempts || [];
              const failedTheoryCount = attempts.filter((a) => a.result === 'failed').length;
              const trialAttempts = selectedStudent.trial?.attempts || [];
              const failedTrialCount = trialAttempts.filter((a) => a.result === 'failed').length;
              const is3AttemptsFailed =
                failedTheoryCount >= 3 ||
                failedTrialCount >= 3 ||
                selectedStudent.learnerLicenseStatus === 'attempts_exhausted';
              const isCancelled =
                isExpired ||
                is3AttemptsFailed ||
                selectedStudent.registrationStatus === 'cancelled' ||
                selectedStudent.accountStatus === 'cancelled';
              const isFinalPassed =
                selectedStudent.isPassed ||
                selectedStudent.learnerLicenseStatus === 'passed' ||
                selectedStudent.learnerLicenseStatus === 'completed';
              const isLicenseCompleted =
                selectedStudent.learnerLicenseStatus === 'completed' ||
                selectedStudent.finalLicense?.verificationStatus === 'verified';
              const isExpiringSoon = diffDays !== null && diffDays <= 30 && diffDays > 0;

              return (
                <div className="space-y-6 text-xs text-[#152026]">
                  {/* Top Status & Cycle Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8]">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] font-black text-xs">
                        Registration Cycle #{cycleNum}
                      </span>
                      <span className="text-slate-600 text-[11px]">
                        NIC: <strong className="text-[#152026] font-mono">{selectedStudent.nic || selectedStudent.userId?.nic || 'N/A'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLicenseCompleted ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> License Completed
                        </span>
                      ) : isFinalPassed ? (
                        <span className="px-3 py-1 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#1B3D59]" /> Passed (Upload Final License)
                        </span>
                      ) : isCancelled ? (
                        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />{' '}
                          {isExpired
                            ? '18M Expired'
                            : is3AttemptsFailed
                            ? '3 Attempts Failed'
                            : 'Registration Cancelled'}
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-[#E2D8B3] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#1B3D59]" /> Expiring Soon ({diffDays}d)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Learner License Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1. 1.5-Year Validity Period Tracker (Sections 1 & 2) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#1B3D59]" />
                        1.5-Year Learner License Validity Period
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono font-medium">
                        Rule: Start Date + 18 Months
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-[#D4EEF8]">
                        <span className="text-[11px] text-slate-500 block font-medium">License Start / Reg Date</span>
                        <span className="text-sm font-bold text-[#152026] font-mono mt-0.5 block">
                          {safeFormatDate(startDate, 'yyyy-MM-dd', 'Not Set')}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D4EEF8]">
                        <span className="text-[11px] text-slate-500 block font-medium">Auto-Calculated Expiry (18M)</span>
                        <span className="text-sm font-bold text-[#1B3D59] font-mono mt-0.5 block">
                          {safeFormatDate(expiryDate, 'yyyy-MM-dd', 'Not Calculated')}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D4EEF8]">
                        <span className="text-[11px] text-slate-500 block font-medium">Validity Remaining</span>
                        <span
                          className={`text-sm font-bold font-mono mt-0.5 block ${
                            isExpired
                              ? 'text-rose-600 font-black'
                              : isExpiringSoon
                              ? 'text-[#1B3D59] font-black'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isExpired
                            ? 'EXPIRED'
                            : diffDays !== null
                            ? `${diffDays} Days Remaining`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {isExpired && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <div className="font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          License Status: Expired (UNREGISTERED / EXPIRED)
                        </div>
                        <p className="text-rose-700 text-[11px]">
                          This learner license has exceeded the 1.5-year (18 months) validity limit.
                          The current cycle is closed. <strong>Action: Register Again</strong> — learner must create a new registration cycle.
                        </p>
                      </div>
                    )}

                    {isExpiringSoon && !isExpired && (
                      <div className="p-3 bg-[#F3EED8] border border-[#E2D8B3] rounded-xl space-y-1">
                        <div className="font-bold text-[#152026] flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#1B3D59] animate-pulse" />
                          Learner License Expiring Soon
                        </div>
                        <p className="text-slate-700 text-[11px]">
                          Remaining: <strong>{diffDays} Days</strong>. Ensure exams and licensing milestones are completed before expiration.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2. Written Theory Exam Attempts (Sections 3 & 4) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-[#1B3D59]" />
                        Written Theory Exam Attempts (Max 3 Allowed in Cycle #{cycleNum})
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Attempts Used: <strong className="text-[#152026]">{attempts.length} of 3</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[1, 2, 3].map((num) => {
                        const att = attempts.find((a) => a.attemptNumber === num);
                        return (
                          <div
                            key={num}
                            className={`p-3 rounded-xl border ${
                              att
                                ? att.result === 'passed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-900'
                                : 'bg-white border-[#D4EEF8] text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs">Attempt {num}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  att
                                    ? att.result === 'passed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {att ? att.result.toUpperCase() : 'Available'}
                              </span>
                            </div>

                            {att ? (
                              <div className="space-y-0.5 text-[11px]">
                                <div>
                                  Date:{' '}
                                  <strong className="text-[#152026]">
                                    {safeFormatDate(att.attemptDate || att.date, 'yyyy-MM-dd', 'N/A')}
                                  </strong>
                                </div>
                                <div>
                                  Score:{' '}
                                  <strong className="text-[#152026]">
                                    {att.score !== undefined ? `${att.score}/40` : 'N/A'}
                                  </strong>
                                </div>
                                {att.examinerNotes && (
                                  <div className="text-slate-500 italic text-[10px] mt-1 line-clamp-2">
                                    "{att.examinerNotes}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic mt-1">
                                Not recorded yet
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {failedTheoryCount >= 3 && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <div className="font-bold text-rose-800 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          3 Theory Exam Attempts Failed — Cycle Unsuccessful
                        </div>
                        <p className="text-rose-700 text-[11px]">
                          All 3 written theory attempts have been used. The learner cannot receive additional attempts under Cycle #{cycleNum}.
                          <strong> Action: Register Again</strong> — a new registration cycle will reset attempts to 0 of 3.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2b. Practical Trial Exam Attempts (Rules 5, 6, 7 & 15) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-[#1B3D59]" />
                        Practical Driving Trial Attempts (Max 3 Allowed in Cycle #{cycleNum})
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Attempts Used: <strong className="text-[#152026]">{trialAttempts.length} of 3</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[1, 2, 3].map((num) => {
                        const att = trialAttempts.find(
                          (a, idx) => (a.attemptNumber || idx + 1) === num
                        );
                        return (
                          <div
                            key={num}
                            className={`p-3 rounded-xl border ${
                              att
                                ? att.result === 'passed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-900'
                                : 'bg-white border-[#D4EEF8] text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs">Trial Attempt {num}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  att
                                    ? att.result === 'passed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {att ? att.result.toUpperCase() : 'Available'}
                              </span>
                            </div>

                            {att ? (
                              <div className="space-y-0.5 text-[11px]">
                                <div>
                                  Date:{' '}
                                  <strong className="text-[#152026]">
                                    {att.date ? format(new Date(att.date), 'yyyy-MM-dd') : 'N/A'}
                                  </strong>
                                </div>
                                {att.score && (
                                  <div>
                                    Score: <strong className="text-[#152026]">{att.score}</strong>
                                  </div>
                                )}
                                {att.examinerNotes && (
                                  <div className="text-slate-500 italic text-[10px] mt-1 line-clamp-2">
                                    "{att.examinerNotes}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic mt-1">
                                Not recorded yet
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {failedTrialCount >= 3 && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                        <div className="font-bold text-rose-800 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          3 Trial Exam Attempts Failed — Cycle Cancelled
                        </div>
                        <p className="text-rose-700 text-[11px]">
                          All 3 practical trial attempts have been failed. Registration is cancelled in accordance with DMT rules.
                          <strong> Action: Re-Register Student</strong> to create a new registration cycle.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Staff Re-Registration Action Banner (Rules 10, 11, 15) */}
                  {isCancelled && (
                    <div className="p-4 bg-[#F3EED8] border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-[#152026] flex items-center gap-1.5 text-xs">
                          <RotateCcw className="w-4 h-4 text-[#1B3D59]" /> Staff Action: Re-Register Learner (Start New Cycle #{cycleNum + 1})
                        </div>
                        <p className="text-slate-700 text-[11px] max-w-xl">
                          Archives current cycle records permanently and unlocks a clean, brand-new <strong>18-month validity period</strong> with <strong>3 fresh exam & trial attempts</strong>. (Pending Rs. 5,000 advance payment).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStaffReRegister(selectedStudent._id)}
                        disabled={reRegisteringId === selectedStudent._id}
                        className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${reRegisteringId === selectedStudent._id ? 'animate-spin' : ''}`} />
                        {reRegisteringId === selectedStudent._id ? 'Initializing...' : 'Re-Register Learner'}
                      </button>
                    </div>
                  )}

                  {/* 3. Final Pass Status & Admin Action (Section 5) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <ShieldCheck className="w-4 h-4 text-[#1B3D59]" />
                        Final Pass Status (Admin Action)
                      </div>
                      {isFinalPassed ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASSED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                          Pending Admin Pass
                        </span>
                      )}
                    </div>

                    {isFinalPassed ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" /> Learner Marked as PASSED
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Passed On:{' '}
                            <strong className="text-[#152026]">
                              {safeFormatDate(selectedStudent.passedAt, 'MMM dd, yyyy hh:mm a', 'Verified')}
                            </strong>
                            {' '}• Please ensure the final driving license photo is uploaded below.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5 text-slate-600 text-[11px]">
                          <p>
                            Learner has not been marked as passed yet. When the learner clears all required written & trial evaluations, click below to mark as Passed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMarkPassed(selectedStudent._id)}
                          disabled={markingPassed}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all shrink-0 disabled:opacity-50"
                        >
                          {markingPassed ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Marking Passed...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" /> Mark Learner as PASSED
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. Final Driving License Photo Upload & Verification (Sections 6 & 7) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <FileCheck className="w-4 h-4 text-[#1B3D59]" />
                        Driving License / Final License Record
                      </div>

                      <div>
                        {selectedStudent.finalLicense?.photoUrl ? (
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                              selectedStudent.finalLicense?.verificationStatus === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : selectedStudent.finalLicense?.verificationStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-[#F3EED8] text-[#152026] border-[#E2D8B3]'
                            }`}
                          >
                            {selectedStudent.finalLicense?.verificationStatus === 'verified' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> License Photo: Uploaded ✓ (Verified)
                              </>
                            ) : selectedStudent.finalLicense?.verificationStatus === 'rejected' ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> License Photo: Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-[#1B3D59]" /> License Photo: Uploaded ✓ (Pending Verification)
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                            License Photo: Not Uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* License Photo View & Verification Card (if uploaded) */}
                    {selectedStudent.finalLicense?.photoUrl && (
                      <div className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="md:col-span-1">
                          <a
                            href={
                              selectedStudent.finalLicense.photoUrl.startsWith('http')
                                ? selectedStudent.finalLicense.photoUrl
                                : `http://localhost:5001${selectedStudent.finalLicense.photoUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative overflow-hidden rounded-xl border border-[#D4EEF8] bg-slate-100 aspect-video md:aspect-4/3 flex items-center justify-center cursor-pointer"
                          >
                            <img
                              src={
                                selectedStudent.finalLicense.photoUrl.startsWith('http')
                                ? selectedStudent.finalLicense.photoUrl
                                : `http://localhost:5001${selectedStudent.finalLicense.photoUrl}`
                              }
                              alt="Final Driving License"
                              className="w-full h-full object-contain transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-[#152026]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-1 text-[11px]">
                              <ExternalLink className="w-3.5 h-3.5" /> View Full Image
                            </div>
                          </a>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 block">License Number:</span>
                              <strong className="text-[#1B3D59] font-mono text-xs">
                                {selectedStudent.finalLicense.licenseNumber || 'Not provided'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Uploaded By:</span>
                              <strong className="text-[#152026] capitalize">
                                {selectedStudent.finalLicense.uploadedBy || 'Admin'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Upload Date:</span>
                              <strong className="text-[#152026]">
                                {safeFormatDate(selectedStudent.finalLicense?.uploadedAt, 'MMM dd, yyyy', 'N/A')}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Verification Status:</span>
                              <strong className="text-[#152026] capitalize">
                                {selectedStudent.finalLicense.verificationStatus || 'pending'}
                              </strong>
                            </div>
                          </div>

                          {selectedStudent.finalLicense.verificationNotes && (
                            <div className="p-2 bg-[#FAFCFE] rounded-lg border border-[#D4EEF8] text-slate-600 text-[11px]">
                              Note: {selectedStudent.finalLicense.verificationNotes}
                            </div>
                          )}

                          {/* Verification Actions for Staff / Admin */}
                          {selectedStudent.finalLicense.verificationStatus !== 'verified' && (
                            <div className="pt-2 flex flex-wrap gap-2 border-t border-[#D4EEF8]">
                              <button
                                type="button"
                                onClick={() => handleVerifyFinalLicense(selectedStudent._id, 'verify')}
                                disabled={verifyingLicense}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Complete License
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowRejectLicenseInput(!showRejectLicenseInput)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject Photo
                              </button>
                            </div>
                          )}

                          {showRejectLicenseInput && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 mt-2">
                              <label className="block text-[11px] text-rose-800 font-bold">
                                Reason for Rejection:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Blurry photo, corners cut off, wrong side..."
                                value={rejectLicenseReason}
                                onChange={(e) => setRejectLicenseReason(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-[#152026] text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowRejectLicenseInput(false)}
                                  className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerifyFinalLicense(
                                      selectedStudent._id,
                                      'reject',
                                      rejectLicenseReason
                                    )
                                  }
                                  disabled={verifyingLicense}
                                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                                >
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload / Replace License Photo Form */}
                    <form
                      onSubmit={handleStaffUploadFinalLicense}
                      className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] space-y-3"
                    >
                      <div className="font-bold text-[#152026] text-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#1B3D59]" />
                        {selectedStudent.finalLicense?.photoUrl
                          ? 'Replace / Update Final License Photo'
                          : 'Upload Official Final Driving License Photo'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Driving License Number (optional):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B1234567"
                            value={adminLicenseNumber}
                            onChange={(e) => setAdminLicenseNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-mono text-xs focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            License Photo File (JPG, PNG, WEBP, max 10MB):
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  toast.error('File size must be under 10MB');
                                  return;
                                }
                                setAdminLicenseFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAdminLicensePreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4EEF8] file:text-[#1B3D59] hover:file:bg-[#B3D5F1] file:cursor-pointer"
                          />
                        </div>
                      </div>

                      {adminLicensePreview && (
                        <div className="flex items-center gap-3 p-2 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8]">
                          <img
                            src={adminLicensePreview}
                            alt="Selected License Preview"
                            className="w-20 h-14 object-cover rounded-lg border border-[#D4EEF8]"
                          />
                          <div className="text-[11px] text-slate-600">
                            <span className="font-bold text-[#152026] block">Preview Selected</span>
                            {adminLicenseFile ? `${adminLicenseFile.name} (${(adminLicenseFile.size / 1024).toFixed(0)} KB)` : 'Current Photo'}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D4EEF8]">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                          <input
                            type="checkbox"
                            checked={adminAutoVerify}
                            onChange={(e) => setAdminAutoVerify(e.target.checked)}
                            className="rounded border-[#D4EEF8] text-[#1B3D59] focus:ring-[#1B3D59]"
                          />
                          <span>Auto-verify and complete license upon upload</span>
                        </label>

                        <button
                          type="submit"
                          disabled={uploadingAdminLicense}
                          className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {uploadingAdminLicense ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" /> Upload License Photo
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 5. Complete Registration Cycles History (Sections 4 & 10) */}
                  <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#152026] flex items-center gap-2 text-sm">
                        <History className="w-4 h-4 text-[#1B3D59]" />
                        Complete Registration Cycles History ({selectedStudent.registrationCycles?.length || 0})
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Active Cycle: <strong className="text-[#152026]">#{cycleNum}</strong>
                      </span>
                    </div>

                    {selectedStudent.registrationCycles && selectedStudent.registrationCycles.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedStudent.registrationCycles.map((cycle, idx) => (
                          <div
                            key={cycle.cycleId || idx}
                            className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] space-y-2 text-[11px]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-[#D4EEF8]">
                              <span className="font-bold text-[#152026] flex items-center gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5 text-[#1B3D59]" /> Cycle #{cycle.cycleNumber || idx + 1}
                                <span className="font-mono text-slate-500 text-[10px]">({cycle.cycleId})</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold capitalize">
                                {cycle.reasonForClose ? cycle.reasonForClose.replace(/_/g, ' ') : 'Closed'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Start Date:</span>
                                <span className="font-mono text-[#152026]">
                                  {safeFormatDate(cycle.startDate, 'yyyy-MM-dd', 'N/A')}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">18M Expiry:</span>
                                <span className="font-mono text-[#1B3D59]">
                                  {safeFormatDate(cycle.expiryDate, 'yyyy-MM-dd', 'N/A')}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Closed Date:</span>
                                <span className="font-mono text-[#152026]">
                                  {safeFormatDate(cycle.cycleEndedAt, 'yyyy-MM-dd', 'N/A')}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Advance Fee:</span>
                                <span className="font-bold text-emerald-700">
                                  Rs. {Number(cycle.advancePaymentAmount || 5000).toLocaleString()}.00
                                </span>
                              </div>
                            </div>

                            {/* Cycle Exam Attempts */}
                            {cycle.examAttempts && cycle.examAttempts.length > 0 && (
                              <div className="pt-2 border-t border-[#D4EEF8] space-y-1">
                                <span className="text-[10px] text-slate-500 font-bold block">
                                  Recorded Written Exam Attempts ({cycle.examAttempts.length} of 3):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {cycle.examAttempts.map((att, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className={`px-2 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 ${
                                        att.result === 'passed'
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                          : 'bg-rose-50 border-rose-200 text-rose-800'
                                      }`}
                                    >
                                      <strong>Attempt {att.attemptNumber || aIdx + 1}:</strong>{' '}
                                      {att.result?.toUpperCase()}
                                      {att.score !== undefined && ` (${att.score}/40)`}
                                      {(att.attemptDate || att.date) && ` on ${safeFormatDate(att.attemptDate || att.date, 'MMM dd')}`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Cycle Practical Trial Attempts (Rules 5, 12) */}
                            {cycle.trialAttempts && cycle.trialAttempts.length > 0 && (
                              <div className="pt-2 border-t border-[#D4EEF8] space-y-1">
                                <span className="text-[10px] text-slate-500 font-bold block">
                                  Recorded Practical Trial Attempts ({cycle.trialAttempts.length} of 3):
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {cycle.trialAttempts.map((att, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className={`px-2 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1.5 ${
                                        att.result === 'passed'
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                          : 'bg-rose-50 border-rose-200 text-rose-800'
                                      }`}
                                    >
                                      <strong>Trial #{att.attemptNumber || aIdx + 1}:</strong>{' '}
                                      {att.result?.toUpperCase()}
                                      {att.score && ` (Score: ${att.score})`}
                                      {att.date && ` on ${format(new Date(att.date), 'MMM dd')}`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-[#D4EEF8] text-slate-500 text-center text-[11px]">
                        No previous registration cycles on record. Learner is currently active in Cycle #1.
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end pt-3 border-t border-[#D4EEF8]">
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="btn-secondary text-xs py-2 px-5"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Walk-In Student Registration Modal (Full Multi-Step Process) */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#152026] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Direct Branch Intake • Walk-In Registration
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-[#1B3D59]" /> Complete Student Registration Process
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Enroll new applicants directly at the branch office with legal profile verification & training allocation.
                </p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 border-b border-[#D4EEF8] pb-4">
              {[
                { step: 1, label: '1. Category', desc: 'Type 1 / Type 2' },
                { step: 2, label: '2. Profile Details', desc: 'Legal & Contact Info' },
                { step: 3, label: '3. Package', desc: 'Curriculum & Tier' },
                { step: 4, label: '4. Desk Intake', desc: 'Payment & Review' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (s.step > 2 && (!walkInForm.name.trim() || !walkInForm.dob || !walkInForm.nic.trim() || !walkInForm.phone.trim() || !walkInForm.email.trim())) {
                      toast.error('Please complete student personal details first');
                      setWalkInStep(2);
                      return;
                    }
                    setWalkInStep(s.step);
                  }}
                  className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    walkInStep === s.step
                      ? 'bg-[#1B3D59] text-white border-[#1B3D59] shadow-sm'
                      : walkInStep > s.step
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold'
                      : 'bg-[#FAFCFE] text-slate-600 border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {walkInStep > s.step ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                        walkInStep === s.step ? 'bg-white text-[#1B3D59]' : 'bg-[#D4EEF8] text-[#1B3D59]'
                      }`}>
                        {s.step}
                      </span>
                    )}
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate hidden sm:block ${
                    walkInStep === s.step ? 'text-[#D4EEF8]' : 'text-slate-500'
                  }`}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Step 1: Category Selection */}
            {walkInStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-black text-[#152026]">Step 1: Select Student Enrollment Category</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto">
                    Determine whether the applicant is starting from scratch (New Learner) or already has a valid DMT Learner Permit (Trial-Ready).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Option A: Type 1 */}
                  <div
                    onClick={() => setWalkInForm({ ...walkInForm, studentType: 'Type1_NewLearner' })}
                    className={`cursor-pointer p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col justify-between text-left ${
                      walkInForm.studentType === 'Type1_NewLearner'
                        ? 'border-[#1B3D59] bg-[#FAFCFE] shadow-md ring-2 ring-[#1B3D59]/20'
                        : 'border-[#D4EEF8] bg-white hover:border-[#1B3D59]/50 hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] flex items-center justify-center shadow-xs">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                          Type 1 Student
                        </span>
                      </div>

                      <h5 className="text-base font-extrabold text-[#152026]">Full Course Learner</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                        Complete driving curriculum from scratch for beginner applicants.
                      </p>

                      <div className="mt-4 space-y-2 border-t border-[#D4EEF8] pt-3 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>DMT Medical Examination & Registration (US-04)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Written Theory Exam Training & Quizzes (US-05)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Vehicle package selected after passing theory exam</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#D4EEF8] flex items-center justify-between text-xs font-bold text-[#1B3D59]">
                      <span>{walkInForm.studentType === 'Type1_NewLearner' ? '✓ Selected Category' : 'Click to Select Type 1'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Option B: Type 2 */}
                  <div
                    onClick={() => setWalkInForm({ ...walkInForm, studentType: 'Type2_TrialReady' })}
                    className={`cursor-pointer p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col justify-between text-left ${
                      walkInForm.studentType === 'Type2_TrialReady'
                        ? 'border-[#1B3D59] bg-[#FAFCFE] shadow-md ring-2 ring-[#1B3D59]/20'
                        : 'border-[#D4EEF8] bg-white hover:border-[#1B3D59]/50 hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#F3EED8] border border-amber-300 text-amber-800 flex items-center justify-center shadow-xs">
                          <Award className="w-6 h-6 text-amber-800" />
                        </div>
                        <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300">
                          Type 2 Student
                        </span>
                      </div>

                      <h5 className="text-base font-extrabold text-[#152026]">Trial-Ready Learner</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                        Applicant already holds a valid Sri Lankan DMT Learner Permit.
                      </p>

                      <div className="mt-4 space-y-2 border-t border-[#D4EEF8] pt-3 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Theory Exam Pre-Cleared Elsewhere</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Direct Vehicle Training Package Selection (Step 3)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Immediate Trial Prep & Practical Scheduling</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#D4EEF8] flex items-center justify-between text-xs font-bold text-[#1B3D59]">
                      <span>{walkInForm.studentType === 'Type2_TrialReady' ? '✓ Selected Category' : 'Click to Select Type 2'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#D4EEF8]/40 border border-[#B3D5F1] flex items-center gap-2.5 text-xs text-[#1B3D59]">
                  <ShieldCheck className="w-4 h-4 text-[#1B3D59] shrink-0" />
                  <span>DMT Requirement: All registered applicants must be at least 18 years of age.</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInStep(2)}
                    className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    Next: Personal Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {walkInStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#152026]">Step 2: Student Profile & Verification</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Enter legal identification and contact details for the applicant.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                    {walkInForm.studentType === 'Type1_NewLearner' ? 'Type 1 Full Course' : 'Type 2 Trial Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#152026] mb-1">
                      Full Legal Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kasun Chamara Perera"
                      value={walkInForm.name}
                      onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] font-medium rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Must match the applicant's official NIC or Passport exactly.</p>
                  </div>

                  {/* Date of Birth & Live Age Calculation */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={walkInForm.dob}
                        onChange={(e) => setWalkInForm({ ...walkInForm, dob: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] font-bold rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Age Badge */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      DMT Age Eligibility (18+ Rule)
                    </label>
                    <div className={`py-2 px-3 rounded-xl border flex items-center gap-2 min-h-[38px] ${
                      walkInCalculatedAge === null
                        ? 'bg-[#FAFCFE] border-[#D4EEF8] text-slate-500'
                        : walkInCalculatedAge >= 18
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    }`}>
                      {walkInCalculatedAge === null ? (
                        <span>Select DOB to calculate age</span>
                      ) : walkInCalculatedAge >= 18 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{walkInCalculatedAge} Years Old — Eligible under DMT</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>{walkInCalculatedAge} Years Old — Underage (Must be 18+)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* NIC Number */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      NIC / Passport Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 200012345678 or 981234567V"
                      value={walkInForm.nic}
                      onChange={(e) => setWalkInForm({ ...walkInForm, nic: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] font-mono font-bold rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      Contact Phone <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 077 123 4567"
                      value={walkInForm.phone}
                      onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@gmail.com"
                      value={walkInForm.email}
                      onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none"
                    />
                  </div>

                  {/* Assigned Branch */}
                  <div>
                    <label className="block font-bold text-[#152026] mb-1">
                      Assigned Branch <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={walkInForm.branch}
                      onChange={(e) => setWalkInForm({ ...walkInForm, branch: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#D4EEF8] bg-white text-[#152026] font-bold rounded-xl focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] outline-none cursor-pointer"
                    >
                      <option value="Maharagama">Maharagama (Headquarters & Ground)</option>
                      <option value="Werahara">Werahara (DMT Hub)</option>
                      <option value="Delgoda">Delgoda (Branch Center)</option>
                    </select>
                  </div>

                  {/* Default Student Portal Password */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#152026] mb-1">
                      Student Portal Login Password
                    </label>
                    <div className="relative">
                      <input
                        type={showWalkInPassword ? 'text' : 'password'}
                        value={walkInForm.password}
                        onChange={(e) => setWalkInForm({ ...walkInForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWalkInPassword(!showWalkInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#152026] cursor-pointer"
                      >
                        {showWalkInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Default set to <code>Password@123</code>. The student uses their email and this password to log in.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setWalkInStep(1)}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!walkInForm.name.trim()) return toast.error('Full name is required');
                      if (!walkInForm.dob) return toast.error('Date of birth is required');
                      if (walkInCalculatedAge !== null && walkInCalculatedAge < 18) {
                        return toast.error('Applicant must be at least 18 years old under DMT Sri Lanka rules.');
                      }
                      if (!walkInForm.nic.trim()) return toast.error('NIC number is required');
                      if (!walkInForm.phone.trim()) return toast.error('Phone number is required');
                      if (!walkInForm.email.trim() || !walkInForm.email.includes('@')) {
                        return toast.error('Valid email is required');
                      }
                      setWalkInStep(3);
                    }}
                    className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    Next: Training Package <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Training Package Selection */}
            {walkInStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#152026]">Step 3: Vehicle Training Package Selection</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Configure vehicle curriculum, lesson bundle, or hourly practice slots.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                    {walkInForm.studentType === 'Type1_NewLearner' ? 'Type 1 Full Course' : 'Type 2 Trial Ready'}
                  </span>
                </div>

                {/* If Type 1: Informational Card */}
                {walkInForm.studentType === 'Type1_NewLearner' ? (
                  <div className="p-6 rounded-3xl bg-[#D4EEF8]/40 border-2 border-[#B3D5F1] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B3D59] text-white flex items-center justify-center shadow-md">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-base font-black text-[#152026]">Course Package Not Required at Registration</h5>
                        <span className="text-xs text-[#1B3D59] font-bold">Standard Sri Lanka DMT Milestone Sequence (US-04 & US-05)</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Under Sithma Academy protocol, <strong>Type 1 (Full Course)</strong> students enroll for the official Ministry & DMT medical clearance and theory test preparation first. The physical vehicle training package (Auto Car, Manual Car, Bike, or Combo) will be selected in <strong>Milestone Step 5</strong> after the learner successfully passes the DMT written exam.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-[#D4EEF8]">
                        <span className="text-slate-500 font-medium block text-[11px]">Immediate Stage</span>
                        <strong className="text-[#152026] font-bold">Medical & Written Exam Intake</strong>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#D4EEF8]">
                        <span className="text-slate-500 font-medium block text-[11px]">Advance Deposit Required</span>
                        <strong className="text-emerald-700 font-bold">LKR 5,000 Advance Fee</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If Type 2: Rich Tiered Package Selector */
                  <div className="space-y-4">
                    {/* Category Tier Selector: C (Full Course), A (Individual), B (Standard) */}
                    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8]">
                      <button
                        type="button"
                        onClick={() => {
                          setWalkInSelectedTier('C');
                          const firstInTier = walkInDisplayedPackages.find((p) => p.categoryGroup === 'C');
                          if (firstInTier) setWalkInForm({ ...walkInForm, packageType: firstInTier.type });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                          walkInSelectedTier === 'C'
                            ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/40'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          <Layers className="w-3.5 h-3.5" /> Full Packages
                        </span>
                        <span className="text-[10px] opacity-85">Group C • 15 Lessons</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWalkInSelectedTier('A');
                          const firstInTier = walkInDisplayedPackages.find((p) => p.categoryGroup === 'A');
                          if (firstInTier) setWalkInForm({ ...walkInForm, packageType: firstInTier.type });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                          walkInSelectedTier === 'A'
                            ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/40'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          <Award className="w-3.5 h-3.5" /> Individual / Private
                        </span>
                        <span className="text-[10px] opacity-85">Group A • Hourly</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWalkInSelectedTier('B');
                          const firstInTier = walkInDisplayedPackages.find((p) => p.categoryGroup === 'B');
                          if (firstInTier) setWalkInForm({ ...walkInForm, packageType: firstInTier.type });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                          walkInSelectedTier === 'B'
                            ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                            : 'text-[#152026] hover:bg-[#D4EEF8]/40'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Standard Single
                        </span>
                        <span className="text-[10px] opacity-85">Group B • Hourly</span>
                      </button>
                    </div>

                    {/* Package Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                      {walkInActivePackagesForTier.map((pkg) => {
                        const isSelected = walkInForm.packageType === pkg.type;
                        return (
                          <div
                            key={pkg.type}
                            onClick={() => setWalkInForm({ ...walkInForm, packageType: pkg.type })}
                            className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#FAFCFE] border-2 border-[#1B3D59] shadow-sm'
                                : 'bg-white border border-[#D4EEF8] hover:border-[#1B3D59]/50'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    isSelected ? 'bg-[#1B3D59] text-white' : 'bg-[#D4EEF8] text-[#1B3D59]'
                                  }`}>
                                    {getWalkInVehicleIcon(pkg.vehicleCategory || pkg.type)}
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-black text-[#152026] leading-snug">{pkg.name}</h6>
                                    <span className="text-[10px] text-slate-600 font-medium">
                                      {pkg.isPerLesson ? 'Pay-Per-Lesson' : `${pkg.lessons} Lessons Package`}
                                    </span>
                                  </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-[#1B3D59] text-white' : 'border border-[#D4EEF8]'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>

                              <div className="pt-2 flex items-baseline justify-between border-t border-[#D4EEF8]">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Rate</span>
                                <span className="text-xs font-black text-[#1B3D59] font-mono">
                                  Rs. {Number(pkg.price).toLocaleString()}
                                  {pkg.isPerLesson && <span className="text-[10px] text-slate-500 font-normal"> / hr</span>}
                                </span>
                              </div>

                              {pkg.bonusText && (
                                <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 flex items-center gap-1.5">
                                  <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">{pkg.bonusText}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stepper for Pay-Per-Lesson quantity */}
                    {activeWalkInPackage?.isPerLesson && (
                      <div className="p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-[#152026] block">Session Hours / Lessons:</label>
                          <span className="text-[10px] text-slate-600">
                            LKR {Number(activeWalkInPackage.price).toLocaleString()} × {walkInForm.lessonQty} = <strong className="text-[#1B3D59]">LKR {(Number(activeWalkInPackage.price) * (walkInForm.lessonQty || 1)).toLocaleString()}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setWalkInForm({ ...walkInForm, lessonQty: Math.max(1, (walkInForm.lessonQty || 1) - 1) })}
                            className="w-7 h-7 rounded-xl bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8] flex items-center justify-center font-black text-xs cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-black text-sm">{walkInForm.lessonQty || 1}</span>
                          <button
                            type="button"
                            onClick={() => setWalkInForm({ ...walkInForm, lessonQty: Math.min(20, (walkInForm.lessonQty || 1) + 1) })}
                            className="w-7 h-7 rounded-xl bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8] flex items-center justify-center font-black text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setWalkInStep(2)}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInStep(4)}
                    className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    Next: Intake & Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Desk Intake & Payment Collection */}
            {walkInStep === 4 && (
              <form onSubmit={handleRegisterWalkIn} className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#152026]">Step 4: Branch Desk Intake & Advance Fee</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Review registration details and record on-the-spot physical cash payment.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Final Confirmation
                  </span>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Applicant</span>
                      <strong className="text-[#152026] text-xs truncate block">{walkInForm.name || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">NIC / Age</span>
                      <strong className="text-[#152026] text-xs block font-mono">{walkInForm.nic || '—'} {walkInCalculatedAge ? `(${walkInCalculatedAge} yrs)` : ''}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Category</span>
                      <strong className="text-[#1B3D59] text-xs block">
                        {walkInForm.studentType === 'Type1_NewLearner' ? 'Type 1 Full Course' : 'Type 2 Trial Only'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px] uppercase">Branch Center</span>
                      <strong className="text-[#152026] text-xs block">{walkInForm.branch} Branch</strong>
                    </div>
                  </div>

                  {walkInForm.studentType === 'Type2_TrialReady' && activeWalkInPackage && (
                    <div className="pt-2 border-t border-[#D4EEF8] flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Selected Training Package:</span>
                      <strong className="text-[#1B3D59]">
                        {activeWalkInPackage.name} {activeWalkInPackage.isPerLesson ? `(${walkInForm.lessonQty} hrs)` : '(15 Lessons)'} • LKR {activeWalkInPackage.isPerLesson ? ((activeWalkInPackage.price || 0) * (walkInForm.lessonQty || 1)).toLocaleString() : (activeWalkInPackage.price || 0).toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Desk Payment Collection Options */}
                <div className="p-4 rounded-2xl bg-[#F3EED8] border border-amber-300 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#152026]">
                    <DollarSign className="w-5 h-5 text-[#1B3D59]" />
                    <span>In-Person Physical Cash Advance Payment (Counter Intake)</span>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkInForm.advancePaymentCollected}
                      onChange={(e) => setWalkInForm({ ...walkInForm, advancePaymentCollected: e.target.checked })}
                      className="w-4 h-4 text-[#1B3D59] rounded border-slate-300 mt-0.5"
                    />
                    <div>
                      <strong className="text-[#152026] block">
                        Collected LKR 5,000 Advance Fee in physical cash at the branch desk
                      </strong>
                      <span className="text-[11px] text-slate-700">
                        Generates a verified counter payment entry with official reference <code>WALKIN-ADV-...</code>.
                      </span>
                    </div>
                  </label>

                  {walkInForm.advancePaymentCollected && (
                    <div className="pl-6 pt-2 border-t border-amber-200">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={walkInForm.skipVerificationQueue}
                          onChange={(e) => setWalkInForm({ ...walkInForm, skipVerificationQueue: e.target.checked })}
                          className="w-4 h-4 text-[#1B3D59] rounded border-slate-300 mt-0.5"
                        />
                        <div>
                          <strong className="text-emerald-900 block font-bold">
                            ✓ Immediately Activate Student Account (Instant Registration)
                          </strong>
                          <span className="text-[11px] text-slate-700">
                            Student account becomes Active right now. The student can immediately log into the student portal, start online theory revision, and schedule practice sessions.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#D4EEF8]">
                  <button
                    type="button"
                    onClick={() => setWalkInStep(3)}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Package
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWalkIn}
                    className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {submittingWalkIn ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Registering Student...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Complete Walk-In Registration
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payment Verification & Slip Review Modal */}
      {verifyModalStudent && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto text-[#152026]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-[#E2D8B3] text-xs font-bold uppercase tracking-wider">
                    Registration &amp; Slip Review
                  </span>
                  <span className="text-xs font-mono text-[#1B3D59] bg-[#D4EEF8] px-2.5 py-0.5 rounded-full border border-[#B3D5F1]">
                    Ref: {verifyModalStudent.latestPayment?.transactionReference || verifyModalStudent.advancePaymentReference || 'ADV-PENDING'}
                  </span>
                  {verifyModalStudent.isAdvancePaid && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      👑 Account Active &amp; Verified
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2.5">
                  <CreditCard className="w-6 h-6 text-[#1B3D59]" /> Verify Student Payment &amp; Review Slip
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Inspect student registration details, check the bank deposit slip document, and verify to activate student portal access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalStudent(null)}
                className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Details (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1B3D59] border-b border-[#D4EEF8] pb-2">
                  <User className="w-4 h-4 text-[#1B3D59]" /> Student Profile &amp; Enrollment Records
                </div>

                <div className="space-y-3 bg-[#FAFCFE] p-4 rounded-2xl border border-[#D4EEF8] text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-semibold">Full Name</span>
                    <span className="text-sm font-bold text-[#152026]">{verifyModalStudent.userId?.name || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4EEF8]">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">Contact Phone</span>
                      <span className="font-semibold text-[#152026]">{verifyModalStudent.userId?.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">NIC / Passport</span>
                      <span className="font-mono text-[#1B3D59] font-bold">{verifyModalStudent.nic || verifyModalStudent.userId?.nic || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-[#D4EEF8]">
                    <span className="text-slate-500 block text-[11px] font-semibold">Email Address</span>
                    <span className="text-[#152026] font-medium break-all">{verifyModalStudent.userId?.email || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4EEF8]">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">Registered Branch</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] font-bold text-xs mt-0.5 inline-block">{verifyModalStudent.branch} Branch</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">Learner Category</span>
                      <span className="text-xs font-bold text-[#1B3D59] mt-0.5 block">
                        {verifyModalStudent.studentType?.includes('Type2') ? 'Category 2: Trial-Ready' : 'Category 1: New Learner'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D4EEF8] space-y-1">
                    <span className="text-slate-500 block text-[11px] font-semibold">Enrolled Course Package</span>
                    <div className="p-2.5 rounded-xl bg-white border border-[#D4EEF8]">
                      <div className="text-xs font-black text-[#152026]">
                        {verifyModalStudent.package?.packageId?.name ||
                          (verifyModalStudent.package?.type?.replace(/_/g, ' ')) ||
                          (verifyModalStudent.studentType?.includes('Type2') || verifyModalStudent.student_type === 'Type 2'
                            ? 'Trial Practical Package'
                            : 'Not selected yet (DMT Theory Phase)')}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                        <span className="text-[#1B3D59] font-semibold">
                          {verifyModalStudent.package?.lessonsTotal ? `${verifyModalStudent.package.lessonsTotal} Practical Lessons` : '0 Practical Lessons (Theory First)'}
                        </span>
                        <span className="text-[#152026] font-mono font-bold">
                          {verifyModalStudent.package?.priceTotal > 0
                            ? `Course Fee: Rs. ${Number(verifyModalStudent.package.priceTotal).toLocaleString()}`
                            : 'Advance Deposit: Rs. 5,000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D4EEF8] flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Advance Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${verifyModalStudent.isAdvancePaid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-[#F3EED8] text-[#152026] border-[#E2D8B3]'}`}>
                        {verifyModalStudent.isAdvancePaid ? 'Verified & Active' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Advance Required</span>
                      <span className="text-sm font-extrabold text-[#1B3D59]">
                        Rs. {Number(verifyModalStudent.advancePaymentAmount || 5000).toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* DMT Clearance Proof for Type 2 Student (US-02) */}
                  {verifyModalStudent.dmt_clearance_proof && (
                    <div className="pt-2 border-t border-[#D4EEF8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#1B3D59] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#1B3D59]" /> DMT Clearance Proof
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            verifyModalStudent.dmt_clearance_verified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-[#F3EED8] text-[#152026] border border-[#E2D8B3]'
                          }`}
                        >
                          {verifyModalStudent.dmt_clearance_verified ? 'Verified' : 'Pending Review'}
                        </span>
                      </div>
                      <a
                        href={
                          verifyModalStudent.dmt_clearance_proof.startsWith('http')
                            ? verifyModalStudent.dmt_clearance_proof
                            : `http://localhost:5001${verifyModalStudent.dmt_clearance_proof}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-[#D4EEF8] border border-[#D4EEF8] flex items-center justify-between text-xs text-[#1B3D59] transition-colors group"
                      >
                        <span className="truncate max-w-[180px] font-mono text-[11px]">
                          {verifyModalStudent.dmt_clearance_proof.split('/').pop()}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Payment Slip Inspection (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1B3D59]">
                    <FileText className="w-4 h-4 text-[#1B3D59]" /> Submitted Payment Slip &amp; Bank Transfer
                  </div>
                  {loadingStudentPayments && (
                    <span className="text-[11px] text-slate-600 flex items-center gap-1 font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Fetching latest slips...
                    </span>
                  )}
                </div>

                {/* Slip Metadata Card */}
                {(() => {
                  const currentPayment =
                    studentPaymentsList.find((p) => p.status === 'pending') ||
                    studentPaymentsList[0] ||
                    verifyModalStudent.latestPayment ||
                    null;

                  const slipUrl = currentPayment?.slipImageUrl || null;
                  const isPdf = slipUrl?.toLowerCase().includes('.pdf');
                  const fullSlipUrl = slipUrl?.startsWith('http')
                    ? slipUrl
                    : slipUrl
                    ? `http://localhost:5001${slipUrl}`
                    : null;

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Deposited Amount</span>
                          <span className="text-base font-black text-emerald-700">
                            Rs. {Number(currentPayment?.amount || verifyModalStudent.advancePaymentAmount || 5000).toLocaleString()}.00
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Bank Name</span>
                          <span className="font-bold text-[#152026]">{currentPayment?.bankName || 'Bank of Ceylon'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Reference / Slip No.</span>
                          <span className="font-mono text-[#1B3D59] font-bold break-all">
                            {currentPayment?.transactionReference || verifyModalStudent.advancePaymentReference || 'ADV-DESK'}
                          </span>
                        </div>
                      </div>

                      {/* Slip Document / Image Display */}
                      <div className="border border-[#D4EEF8] rounded-2xl p-3 bg-[#FAFCFE] text-center space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#152026] px-1">
                          <span className="flex items-center gap-1.5">
                            {isPdf ? <File className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4 text-[#1B3D59]" />}
                            {isPdf ? 'Uploaded PDF Bank Slip Document' : 'Uploaded Bank Receipt / Slip Photo'}
                          </span>
                          {fullSlipUrl && (
                            <a
                              href={fullSlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-[#1B3D59] hover:text-[#152026] inline-flex items-center gap-1 hover:underline bg-white px-2.5 py-1 rounded-lg border border-[#D4EEF8]"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Full Document
                            </a>
                          )}
                        </div>

                        {fullSlipUrl ? (
                          isPdf ? (
                            <div className="bg-white rounded-xl p-4 border border-[#D4EEF8] text-center space-y-3">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                                <FileText className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#152026]">PDF Bank Slip Document Uploaded</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  File: {slipUrl.split('/').pop()}
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-3 pt-1">
                                <a
                                  href={fullSlipUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2 font-bold"
                                >
                                  <ExternalLink className="w-4 h-4 text-[#1B3D59]" /> Open PDF in New Tab
                                </a>
                              </div>
                              <iframe
                                src={fullSlipUrl}
                                title="Bank Slip PDF"
                                className="w-full h-48 rounded-xl border border-[#D4EEF8] bg-white mt-2"
                              />
                            </div>
                          ) : (
                            <div className="relative group bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[220px] max-h-[320px] border border-[#D4EEF8]">
                              <img
                                src={fullSlipUrl}
                                alt="Payment Deposit Slip"
                                className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm transition-transform hover:scale-[1.02]"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/600x400/f8fafc/152026?text=Deposit+Slip+Document';
                                }}
                              />
                            </div>
                          )
                        ) : (
                          <div className="py-8 px-4 bg-white rounded-xl border border-dashed border-[#D4EEF8] text-slate-500 text-xs space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-[#1B3D59] mx-auto" />
                            <p className="font-bold text-[#152026]">Manual / Desk Registration</p>
                            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                              No electronic slip was uploaded. The student was registered with Reference:
                              <strong className="text-[#1B3D59] font-mono"> {verifyModalStudent.advancePaymentReference || 'ADV-DESK'}</strong>.
                              You can verify their cash/bank deposit directly.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Rejection reason box if opened */}
                      {showRejectInput && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs animate-in fade-in">
                          <label className="block font-bold text-rose-800">
                            Reason for Rejecting Slip / Payment:
                          </label>
                          <textarea
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Deposit amount is less than Rs. 5,000, reference number illegible, or slip expired..."
                            className="w-full px-3 py-2 bg-white border border-rose-300 text-[#152026] rounded-lg outline-none text-xs focus:ring-1 focus:ring-rose-500"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowRejectInput(false)}
                              className="text-slate-500 hover:text-slate-800 px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={verifyingPayment}
                              onClick={() => handleVerifyStudentPayment(verifyModalStudent._id, 'reject')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D4EEF8]">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Staff action will update student status and unlock full driving portal features.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={verifyingPayment}
                  onClick={() => setVerifyModalStudent(null)}
                  className="btn-secondary text-xs py-2.5 px-4 font-bold"
                >
                  Close
                </button>

                {!verifyModalStudent.isAdvancePaid && !showRejectInput && (
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                  >
                    Reject Slip
                  </button>
                )}

                <button
                  type="button"
                  disabled={verifyingPayment}
                  onClick={() => handleVerifyStudentPayment(verifyModalStudent._id, 'verify')}
                  className="btn-primary text-xs py-2.5 px-6 font-extrabold flex items-center gap-2 shadow-md"
                >
                  {verifyingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> {verifyModalStudent.isAdvancePaid ? 'Re-confirm Verified Status' : 'Verify Payment & Activate Student'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Date Reschedule Requests Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-[#152026]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#152026]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D4EEF8] flex items-center justify-between bg-[#FAFCFE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                  <Clock className="w-5 h-5 text-[#1B3D59]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#152026]">Student Date Reschedule Requests</h3>
                  <p className="text-xs text-slate-600">
                    Review student reschedule submissions for Medical Exams, Registration, Written Theory Exams, or Practical Trials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setReviewingRequest(null);
                }}
                className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Milestone & Status Filter Bar */}
            <div className="px-6 py-3 border-b border-[#D4EEF8] bg-[#FAFCFE] flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-600 font-bold mr-1">Milestone:</span>
                {[
                  { id: 'All', label: 'All' },
                  { id: 'medical', label: '🩺 Medical' },
                  { id: 'registration', label: '📄 Reg' },
                  { id: 'theory_exam', label: '📖 Exam' },
                  { id: 'trial', label: '🚗 Trial' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRescheduleMilestoneFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      rescheduleMilestoneFilter === tab.id
                        ? 'bg-[#1B3D59] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-[#D4EEF8] hover:bg-[#D4EEF8]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-bold mr-1">Status:</span>
                {['All', 'Pending', 'Approved', 'Rejected'].map((stTab) => (
                  <button
                    key={stTab}
                    type="button"
                    onClick={() => setRescheduleStatusFilter(stTab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      rescheduleStatusFilter === stTab
                        ? 'bg-[#1B3D59] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-[#D4EEF8] hover:bg-[#D4EEF8]'
                    }`}
                  >
                    {stTab}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingReschedule ? (
                <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1B3D59]" />
                  Loading reschedule requests...
                </div>
              ) : rescheduleRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm space-y-2">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-semibold text-[#152026]">No Reschedule Requests Found</p>
                  <p className="text-xs text-slate-500">When students submit a request to reschedule their practical trial exam, they will appear here for DEO review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rescheduleRequests.map((req) => {
                    const studentUser = req.student_id?.userId || req.requested_by;
                    const isPending = req.status === 'Pending';
                    const isBeingReviewed = reviewingRequest?._id === req._id;
                    const milestoneLabels = {
                      medical: '🩺 DMT Medical Exam',
                      registration: '📄 DMT Registration',
                      theory_exam: '📖 DMT Written Theory Exam',
                      trial: '🚗 Practical Driving Trial',
                    };
                    const mType = req.milestone_type || 'trial';
                    const mLabel = milestoneLabels[mType] || 'Practical Trial';

                    return (
                      <div
                        key={req._id}
                        className={`p-5 rounded-2xl border transition-colors ${
                          isPending ? 'bg-[#F3EED8]/40 border-[#E2D8B3]' : 'bg-white border-[#D4EEF8]'
                        } space-y-3`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4EEF8] pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#152026] text-sm">{studentUser?.name || 'Student'}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] text-[11px] font-bold">
                                {mLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
                                {req.student_id?.branch || studentUser?.branch || 'Branch'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                req.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-[#F3EED8] text-[#152026] border-[#E2D8B3]'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {studentUser?.email} • {studentUser?.phone || 'No phone'}
                            </p>
                          </div>
                          <div className="text-xs text-slate-500 text-right">
                            <span className="block text-[11px]">Submitted:</span>
                            <span className="font-medium text-[#152026]">
                              {safeFormatDate(req.requested_at, 'MMM dd, yyyy HH:mm', 'N/A')}
                            </span>
                          </div>
                        </div>

                        {/* Dates & Reason Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8]">
                            <span className="text-[11px] text-slate-500 block font-semibold">Previous Scheduled Date:</span>
                            <span className="font-bold text-rose-600 font-mono">
                              {safeFormatDate(req.previous_date || req.previous_trial_date, 'MMM dd, yyyy', 'None Assigned')}
                            </span>
                          </div>
                          <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8]">
                            <span className="text-[11px] text-slate-500 block font-semibold">Requested / Preferred Date:</span>
                            <span className="font-bold text-[#1B3D59] font-mono">
                              {safeFormatDate(req.preferred_date, 'MMM dd, yyyy', 'No preference')}
                            </span>
                          </div>
                          {(req.new_date || req.new_trial_date) && (
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                              <span className="text-[11px] text-emerald-800 block font-semibold">Approved New Date:</span>
                              <span className="font-black text-emerald-700 font-mono">
                                {safeFormatDate(req.new_date || req.new_trial_date, 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>

                        {req.reason && (
                          <div className="text-xs p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8]">
                            <span className="text-slate-500 font-semibold block mb-0.5">Student's Stated Reason:</span>
                            <p className="text-slate-700 italic">"{req.reason}"</p>
                          </div>
                        )}

                        {/* If already reviewed, display reviewer info */}
                        {!isPending && (
                          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-[#D4EEF8] pt-2">
                            <span>Reviewed by: <strong className="text-[#152026]">{req.reviewed_by?.name || 'Officer'}</strong></span>
                            <span>Date: {safeFormatDate(req.reviewed_at, 'MMM dd, yyyy', 'N/A')}</span>
                            {req.review_notes && <span className="text-slate-700">Notes: {req.review_notes}</span>}
                          </div>
                        )}

                        {/* Review Action Form for Pending Requests */}
                        {isPending && (
                          <div className="pt-2 border-t border-[#D4EEF8]">
                            {isBeingReviewed ? (
                              <div className="p-4 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-3">
                                <h4 className="font-bold text-[#152026] text-xs flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-[#1B3D59]" /> DEO Review & Decision ({mLabel})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[#152026] font-semibold mb-1 text-xs">
                                      New {mLabel} Date <span className="text-rose-600">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                      <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3 pointer-events-none" />
                                      <input
                                        type="date"
                                        value={reviewNewTrialDate}
                                        onChange={(e) => setReviewNewTrialDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs font-bold cursor-pointer focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                                      />
                                    </div>
                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                      Required for Approval. Will update student's {mLabel} date in system.
                                    </span>
                                  </div>
                                  <div>
                                    <label className="block text-[#152026] font-semibold mb-1 text-xs">
                                      Officer Review Notes (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g., Scheduled as per DMT batch availability"
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setReviewingRequest(null)}
                                    disabled={reviewSubmitting}
                                    className="btn-secondary text-xs py-2 px-3"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewReschedule('Rejected')}
                                    disabled={reviewSubmitting}
                                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                                  >
                                    Reject Request
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewReschedule('Approved')}
                                    disabled={reviewSubmitting}
                                    className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-md"
                                  >
                                    {reviewSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Approve & Assign New Date
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewingRequest(req);
                                  setReviewNewTrialDate(
                                    req.preferred_date ? req.preferred_date.split('T')[0] : ''
                                  );
                                  setReviewNotes('');
                                }}
                                className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow"
                              >
                                Review & Reschedule Trial Date
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D4EEF8] bg-[#FAFCFE] flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {rescheduleRequests.filter((r) => r.status === 'Pending').length} pending request(s) awaiting officer action.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setReviewingRequest(null);
                }}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
