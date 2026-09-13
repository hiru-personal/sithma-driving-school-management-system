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
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StaffStudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Student for Detail / Update Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit_dmt' | 'record_trial'

  // Payment Verification & Slip Review Modal State
  const [verifyModalStudent, setVerifyModalStudent] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [studentPaymentsList, setStudentPaymentsList] = useState([]);
  const [loadingStudentPayments, setLoadingStudentPayments] = useState(false);

  // Walk-in Student Registration Modal State (US-03)
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    branch: 'Maharagama',
    studentType: 'Type1_NewLearner',
    packageType: 'Car_Full',
    advancePaymentCollected: false,
    advanceAmount: 5000,
  });

  // Form State for Recording Trial Attempt
  const [trialForm, setTrialForm] = useState({
    attemptDate: new Date().toISOString().split('T')[0],
    result: 'passed',
    examinerNotes: '',
  });

  // Form State for Updating DMT Dates (US-04, US-05, US-09)
  const [dmtForm, setDmtForm] = useState({
    medicalExamDate: '',
    medicalExamPassed: false,
    learnerRegistrationDate: '',
    learnerExamDate: '',
    learnerExamPassed: false,
    learnerExamStatus: 'not_taken',
    learnerExamPassedDate: '',
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
    // Load packages for walk-in form (US-13, US-14)
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages) {
        setAvailablePackages(res.data.packages);
      }
    }).catch(() => {});
  }, [branchFilter, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleRegisterWalkIn = async (e) => {
    e.preventDefault();
    setSubmittingWalkIn(true);
    try {
      const res = await api.post('/students/walk-in', walkInForm);
      if (res.data.success) {
        toast.success(`Walk-in student ${res.data.student.userId?.name} registered successfully!`);
        setStudents((prev) => [res.data.student, ...prev]);
        setShowWalkInModal(false);
        setWalkInForm({
          name: '',
          email: '',
          phone: '',
          nic: '',
          branch: 'Maharagama',
          studentType: 'Type1_NewLearner',
          packageType: 'Car_Full',
          advancePaymentCollected: false,
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
        medicalExamPassed: student.dmtDates.medicalExamPassed || false,
        learnerRegistrationDate: student.dmtDates.learnerRegistrationDate
          ? student.dmtDates.learnerRegistrationDate.split('T')[0]
          : '',
        learnerExamDate: student.dmtDates.learnerExamDate
          ? student.dmtDates.learnerExamDate.split('T')[0]
          : '',
        learnerExamPassed: student.dmtDates.learnerExamPassed || false,
        learnerExamStatus: student.learnerExamStatus || (student.dmtDates.learnerExamPassed ? 'passed' : 'not_taken'),
        learnerExamPassedDate: student.dmtDates.learnerExamPassedDate
          ? student.dmtDates.learnerExamPassedDate.split('T')[0]
          : '',
      });
    }
    setTrialForm({
      attemptDate: new Date().toISOString().split('T')[0],
      result: 'passed',
      examinerNotes: '',
    });
  };

  const handleSaveDmtDates = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/students/${selectedStudent._id}/dmt-dates`, dmtForm);
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
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-xs sm:text-sm mb-2.5">
            <Sparkles className="w-4 h-4" /> Learner Registry & Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading flex items-center gap-3 drop-shadow">
            <Users className="w-8 h-8 text-cyan-400" /> Student Records & DMT Milestone Management
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Manage registrations, track DMT milestone progress, and record practical trial examination attempts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="btn-accent text-sm py-3 px-5 flex items-center gap-2 font-bold shadow-lg shadow-purple-950/40"
          >
            <PlusCircle className="w-4 h-4" /> Register Walk-In Student
          </button>
          <button
            onClick={fetchStudents}
            className="btn-secondary text-sm py-3 px-5 flex items-center gap-2 font-bold shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Refresh List
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-purple-400/20 text-white placeholder-slate-400 rounded-2xl text-sm sm:text-base focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-cyan-300 outline-none font-bold"
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
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-slate-100 outline-none font-semibold"
          >
            <option value="">All Categories (Type 1 & 2)</option>
            <option value="Type1_NewLearner">Type 1 — New Learner</option>
            <option value="Type2_TrialReady">Type 2 — Trial-Ready</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-slate-100 outline-none font-semibold"
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
      <div className="card p-0 overflow-hidden shadow-2xl border border-purple-300/20">
        {loading ? (
          <div className="py-16 text-center text-sm sm:text-base text-slate-300 flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading student database...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-lg font-bold text-white">No students found matching your filters</p>
            <p className="text-sm text-slate-400">Try adjusting your search query or branch filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/90 border-b border-purple-300/20 text-slate-300 uppercase text-xs sm:text-sm font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Branch & Category</th>
                  <th className="px-6 py-4">Package / Lessons</th>
                  <th className="px-6 py-4">DMT Learner Status</th>
                  <th className="px-6 py-4">Trial Attempts</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-300/15">
                {students.map((st) => {
                  const isLicensed = st.trial?.licenseObtained;
                  const attemptsCount = st.trial?.attempts?.length || 0;
                  const isType2 = st.studentType === 'Type2_TrialReady';

                  return (
                    <tr key={st._id} className="hover:bg-white/5 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="text-base sm:text-lg font-bold text-white">{st.userId?.name || 'Unknown Student'}</div>
                        <div className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                          {st.userId?.phone} • {st.userId?.email}
                        </div>
                      </td>

                      {/* Branch & Type */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm sm:text-base text-cyan-300">{st.branch}</div>
                        <span
                          className={`badge text-xs py-0.5 px-2.5 mt-1 ${
                            isType2 ? 'badge-accent' : 'badge-info'
                          }`}
                        >
                          {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                        </span>
                      </td>

                      {/* Package */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm sm:text-base text-white">{st.package?.type?.replace('_', ' ')}</div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                          {st.package?.lessonsUsed || 0} / {st.package?.lessonsTotal || 15} used
                        </div>
                      </td>

                      {/* DMT Learner Exam */}
                      <td className="px-6 py-4">
                        {isType2 ? (
                          <span className="badge badge-success text-xs">Pre-Cleared</span>
                        ) : st.dmtDates?.learnerExamPassed ? (
                          <span className="badge badge-success text-xs">Passed Written Exam</span>
                        ) : st.dmtDates?.learnerExamDate ? (
                          <span className="badge badge-warning text-xs">
                            Exam: {format(new Date(st.dmtDates.learnerExamDate), 'MMM dd')}
                          </span>
                        ) : (
                          <span className="badge badge-danger text-xs">Exam Pending</span>
                        )}
                      </td>

                      {/* Trial Attempts Pills */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((num) => {
                            const att = st.trial?.attempts?.find((a) => a.attemptNumber === num);
                            let bg = 'bg-slate-800 text-slate-400 border border-white/10';
                            if (att) {
                              bg =
                                att.result === 'passed'
                                  ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-rose-500 text-white font-black border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
                            }

                            return (
                              <span
                                key={num}
                                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${bg}`}
                                title={
                                  att
                                    ? `Attempt ${num}: ${att.result.toUpperCase()} on ${format(
                                        new Date(att.attemptDate),
                                        'MMM dd, yyyy'
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`badge text-xs ${
                              isLicensed
                                ? 'badge-success'
                                : st.registrationStatus === 'registered' || st.registrationStatus === 'in_progress'
                                ? 'badge-info'
                                : 'badge-warning'
                            }`}
                          >
                            {isLicensed ? 'Licensed' : st.registrationStatus?.replace('_', ' ')}
                          </span>

                          {st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment' ? (
                            <span className="badge badge-success text-[10px] py-0 px-2 font-bold flex items-center gap-1">
                              👑 Premium User
                            </span>
                          ) : (
                            <span className="badge badge-warning text-[10px] py-0 px-2 font-extrabold flex items-center gap-1">
                              🔒 Advance Pending
                            </span>
                          )}

                          {st.latestPayment?.slipImageUrl && !st.isAdvancePaid && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-medium">
                              <FileText className="w-3 h-3 text-cyan-400" /> Slip Uploaded
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openVerifyPaymentModal(st)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border border-white/20 transition-all"
                            title="Inspect Student Registration Details & Payment Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openVerifyPaymentModal(st)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                              st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                            }`}
                            title={
                              st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                                ? 'View Payment Slip & Registration Records'
                                : 'Review Payment Slip, Student Details & Verify Payment'
                            }
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-300" />
                            {st.isAdvancePaid || st.isPremium || st.registrationStatus !== 'pending_payment'
                              ? 'Verified Premium'
                              : 'Verify Payment & Upgrade User'}
                          </button>

                          <button
                            onClick={() => openStudentModal(st, 'edit_dmt')}
                            className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border border-white/20 transition-all"
                            title="Update DMT Exam Dates"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStudentModal(st, 'record_trial')}
                            disabled={isLicensed || attemptsCount >= 3}
                            className="p-2 rounded-xl bg-white/10 hover:bg-amber-500/20 text-amber-300 border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Record Practical Trial Result"
                          >
                            <Award className="w-4 h-4" />
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

      {/* Modal Dialog: Edit DMT Dates / Record Trial Attempt */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {modalMode === 'edit_dmt' ? (
                    <>
                      <Calendar className="w-5 h-5 text-cyan-400" /> DMT Regulatory Dates: {selectedStudent.userId?.name}
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5 text-amber-400" /> Record Practical Trial Attempt: {selectedStudent.userId?.name}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudent.branch} Branch • {selectedStudent.studentType}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DMT Dates Edit Form (US-04, US-05, US-09) */}
            {modalMode === 'edit_dmt' && (
              <form onSubmit={handleSaveDmtDates} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    1. DMT Medical Examination Date (US-04):
                  </label>
                  <input
                    type="date"
                    value={dmtForm.medicalExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, medicalExamDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="staffMedPassed"
                    checked={dmtForm.medicalExamPassed}
                    onChange={(e) =>
                      setDmtForm({ ...dmtForm, medicalExamPassed: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="staffMedPassed" className="font-medium text-slate-200 cursor-pointer">
                    Passed DMT Medical Examination
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    2. DMT Learner Registration Date (US-05):
                  </label>
                  <input
                    type="date"
                    value={dmtForm.learnerRegistrationDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, learnerRegistrationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    3. DMT Learner Written Exam Date:
                  </label>
                  <input
                    type="date"
                    value={dmtForm.learnerExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, learnerExamDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    4. Learner Exam Status (US-09 — Trial Eligibility Gate):
                  </label>
                  <select
                    value={dmtForm.learnerExamStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDmtForm({
                        ...dmtForm,
                        learnerExamStatus: val,
                        learnerExamPassed: val === 'passed',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl font-bold"
                  >
                    <option value="not_taken">Not Taken / In Progress</option>
                    <option value="passed">PASSED (Unlocks Practical Trial Lessons - US-09)</option>
                    <option value="failed">FAILED</option>
                  </select>
                </div>

                {dmtForm.learnerExamStatus === 'passed' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Trial Lesson Access Unlocked
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Marking as Passed satisfies US-09. If this is a Type 1 learner, they will now be able to book practical Trial lessons.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
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
                <div className="p-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> DMT 3-Attempt Rule:
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Current attempts recorded: {selectedStudent.trial?.attempts?.length || 0} of 3 maximum allowed attempts.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Practical Trial Examination Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={trialForm.attemptDate}
                    onChange={(e) => setTrialForm({ ...trialForm, attemptDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trial Outcome:</label>
                  <select
                    value={trialForm.result}
                    onChange={(e) => setTrialForm({ ...trialForm, result: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white font-bold rounded-xl"
                  >
                    <option value="passed">PASSED (Issue Driver's License)</option>
                    <option value="failed">FAILED (Requires Re-trial Scheduling)</option>
                    <option value="absent">ABSENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Examiner Notes / Feedback:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Reverse parking cleared, minor observation on lane switching..."
                    value={trialForm.examinerNotes}
                    onChange={(e) => setTrialForm({ ...trialForm, examinerNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-accent text-xs py-2 px-5 font-bold">
                    Record Trial Result
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Walk-In Student Registration Modal (US-03) */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-cyan-400/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-cyan-400" /> Register Walk-In Student (US-03)
                </h3>
                <p className="text-xs text-slate-400">
                  Direct branch office intake for in-person applicants.
                </p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimal Perera"
                    value={walkInForm.name}
                    onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    NIC Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 200119203948"
                    value={walkInForm.nic}
                    onChange={(e) => setWalkInForm({ ...walkInForm, nic: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0771234567"
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gmail.com"
                    value={walkInForm.email}
                    onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={walkInForm.branch}
                    onChange={(e) => setWalkInForm({ ...walkInForm, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Student Category
                  </label>
                  <select
                    value={walkInForm.studentType}
                    onChange={(e) => setWalkInForm({ ...walkInForm, studentType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl font-bold text-cyan-300"
                  >
                    <option value="Type1_NewLearner">Type 1 — New Learner</option>
                    <option value="Type2_TrialReady">Type 2 — Trial Ready</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Enrolled Course Package (US-14)
                </label>
                <select
                  value={walkInForm.packageType}
                  onChange={(e) => setWalkInForm({ ...walkInForm, packageType: e.target.value })}
                  className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                >
                  {availablePackages.length > 0 ? (
                    availablePackages.map((pkg) => (
                      <option key={pkg._id} value={pkg.type}>
                        {pkg.name} — Rs. {pkg.price?.toLocaleString()} ({pkg.lessons} lessons)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Car_Full">Car — Full License Package (15 lessons, Rs. 45,000)</option>
                      <option value="Car_Refresher">Car — Refresher Package (6 lessons, Rs. 15,000)</option>
                      <option value="HeavyVehicle_Bus">Heavy Vehicle (Bus) Package (15 lessons, Rs. 65,000)</option>
                      <option value="Car_Individual">Car Individual Package (Rs. 3,000/hr)</option>
                    </>
                  )}
                </select>
              </div>

              {walkInForm.studentType === 'Type2_TrialReady' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Type 2 Advance Payment Collection
                  </div>
                  <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkInForm.advancePaymentCollected}
                      onChange={(e) => setWalkInForm({ ...walkInForm, advancePaymentCollected: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <span>Collected Rs. 5,000 Advance Payment in cash/slip at desk</span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    If checked, the student account will be activated immediately upon registration.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn}
                  className="btn-accent text-xs py-2 px-5 font-bold shadow-lg"
                >
                  {submittingWalkIn ? 'Registering...' : 'Complete Walk-In Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Verification & Slip Review Modal */}
      {verifyModalStudent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="badge badge-warning text-xs font-bold uppercase tracking-wider">
                    Registration &amp; Slip Review
                  </span>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                    Ref: {verifyModalStudent.latestPayment?.transactionReference || verifyModalStudent.advancePaymentReference || 'ADV-PENDING'}
                  </span>
                  {verifyModalStudent.isAdvancePaid && (
                    <span className="badge badge-success text-xs font-bold">
                      👑 Account Active &amp; Verified
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <CreditCard className="w-6 h-6 text-amber-400" /> Verify Student Payment &amp; Review Slip
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Inspect student registration details, check the bank deposit slip document, and verify to activate student portal access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalStudent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Details (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300 border-b border-white/10 pb-2">
                  <User className="w-4 h-4 text-cyan-400" /> Student Profile &amp; Enrollment Records
                </div>

                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Full Name</span>
                    <span className="text-sm font-bold text-white">{verifyModalStudent.userId?.name || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Contact Phone</span>
                      <span className="font-semibold text-white">{verifyModalStudent.userId?.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">NIC / Passport</span>
                      <span className="font-mono text-cyan-300 font-bold">{verifyModalStudent.nic || verifyModalStudent.userId?.nic || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-white/5">
                    <span className="text-slate-400 block text-[11px] font-semibold">Email Address</span>
                    <span className="text-white font-medium break-all">{verifyModalStudent.userId?.email || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Registered Branch</span>
                      <span className="badge badge-info text-xs font-bold mt-0.5">{verifyModalStudent.branch} Branch</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Learner Category</span>
                      <span className="text-xs font-bold text-cyan-300 mt-0.5 block">
                        {verifyModalStudent.studentType?.includes('Type2') ? 'Category 2: Trial-Ready' : 'Category 1: New Learner'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-slate-400 block text-[11px] font-semibold">Enrolled Course Package</span>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                      <div className="text-xs font-black text-white">
                        {verifyModalStudent.package?.packageId?.name || (verifyModalStudent.package?.type?.replace(/_/g, ' ')) || 'Car — Full License Package'}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                        <span className="text-cyan-300 font-semibold">{verifyModalStudent.package?.lessonsTotal || 15} Practical Lessons</span>
                        <span className="text-amber-300 font-mono font-bold">
                          Course Fee: Rs. {Number(verifyModalStudent.package?.priceTotal || 45000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Advance Status</span>
                      <span className={`badge text-[11px] font-extrabold ${verifyModalStudent.isAdvancePaid ? 'badge-success' : 'badge-warning'}`}>
                        {verifyModalStudent.isAdvancePaid ? 'Verified & Active' : 'Pending Verification'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Advance Required</span>
                      <span className="text-sm font-extrabold text-amber-300">
                        Rs. {Number(verifyModalStudent.advancePaymentAmount || 5000).toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Slip Inspection (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                    <FileText className="w-4 h-4 text-amber-400" /> Submitted Payment Slip &amp; Bank Transfer
                  </div>
                  {loadingStudentPayments && (
                    <span className="text-[11px] text-cyan-300 flex items-center gap-1 font-bold">
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Deposited Amount</span>
                          <span className="text-base font-black text-accent">
                            Rs. {Number(currentPayment?.amount || verifyModalStudent.advancePaymentAmount || 5000).toLocaleString()}.00
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Bank Name</span>
                          <span className="font-bold text-white">{currentPayment?.bankName || 'Bank of Ceylon'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Reference / Slip No.</span>
                          <span className="font-mono text-cyan-300 font-bold break-all">
                            {currentPayment?.transactionReference || verifyModalStudent.advancePaymentReference || 'ADV-DESK'}
                          </span>
                        </div>
                      </div>

                      {/* Slip Document / Image Display */}
                      <div className="border border-white/15 rounded-2xl p-3 bg-slate-900/90 text-center space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                          <span className="flex items-center gap-1.5">
                            {isPdf ? <File className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                            {isPdf ? 'Uploaded PDF Bank Slip Document' : 'Uploaded Bank Receipt / Slip Photo'}
                          </span>
                          {fullSlipUrl && (
                            <a
                              href={fullSlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 hover:underline bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Full Document
                            </a>
                          )}
                        </div>

                        {fullSlipUrl ? (
                          isPdf ? (
                            <div className="bg-black/50 rounded-xl p-4 border border-white/10 text-center space-y-3">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
                                <FileText className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">PDF Bank Slip Document Uploaded</p>
                                <p className="text-xs text-slate-400 mt-0.5">
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
                                  <ExternalLink className="w-4 h-4 text-cyan-400" /> Open PDF in New Tab
                                </a>
                              </div>
                              <iframe
                                src={fullSlipUrl}
                                title="Bank Slip PDF"
                                className="w-full h-48 rounded-xl border border-white/10 bg-white/90 mt-2"
                              />
                            </div>
                          ) : (
                            <div className="relative group bg-black/50 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[220px] max-h-[320px]">
                              <img
                                src={fullSlipUrl}
                                alt="Payment Deposit Slip"
                                className="max-h-[300px] w-auto object-contain rounded-lg shadow-2xl transition-transform hover:scale-[1.02]"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/600x400/0f172a/ffffff?text=Deposit+Slip+Document';
                                }}
                              />
                            </div>
                          )
                        ) : (
                          <div className="py-8 px-4 bg-black/30 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
                            <p className="font-bold text-white">Manual / Desk Registration</p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                              No electronic slip was uploaded. The student was registered with Reference:
                              <strong className="text-cyan-300 font-mono"> {verifyModalStudent.advancePaymentReference || 'ADV-DESK'}</strong>.
                              You can verify their cash/bank deposit directly.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Rejection reason box if opened */}
                      {showRejectInput && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs animate-in fade-in">
                          <label className="block font-bold text-rose-300">
                            Reason for Rejecting Slip / Payment:
                          </label>
                          <textarea
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Deposit amount is less than Rs. 5,000, reference number illegible, or slip expired..."
                            className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 text-white rounded-lg outline-none text-xs"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowRejectInput(false)}
                              className="text-slate-400 hover:text-white px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={verifyingPayment}
                              onClick={() => handleVerifyStudentPayment(verifyModalStudent._id, 'reject')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
                    className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors"
                  >
                    Reject Slip
                  </button>
                )}

                <button
                  type="button"
                  disabled={verifyingPayment}
                  onClick={() => handleVerifyStudentPayment(verifyModalStudent._id, 'verify')}
                  className="btn-accent text-xs py-2.5 px-6 font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-950/40"
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
    </div>
  );
}
