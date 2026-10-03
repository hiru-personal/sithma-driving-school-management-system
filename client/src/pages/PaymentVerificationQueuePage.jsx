import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  User,
  Building2,
  Calendar,
  Sparkles,
  X,
  FileText,
  ExternalLink,
  DollarSign,
  GraduationCap,
  Award,
  Clock,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy • hh:mm a', fallback = 'N/A') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

export default function PaymentVerificationQueuePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Preview & Verification Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Direct Cash Approval Modal State
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [unverifiedStudents, setUnverifiedStudents] = useState([]);
  const [cashStudentId, setCashStudentId] = useState('');
  const [cashBranch, setCashBranch] = useState('Maharagama');
  const [cashNotes, setCashNotes] = useState('');
  const [cashLoading, setCashLoading] = useState(false);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/pending', {
        params: { branch: selectedBranch },
      });
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnverifiedStudents = async () => {
    try {
      const res = await api.get('/students');
      if (res.data.success && res.data.students) {
        const unverified = res.data.students.filter(
          (s) =>
            s.account_status !== 'Verified' &&
            s.accountStatus !== 'active' &&
            !s.isAdvancePaid
        );
        setUnverifiedStudents(unverified);
      }
    } catch (e) {
      console.warn('Could not fetch student directory', e);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, [selectedBranch]);

  useEffect(() => {
    if (cashModalOpen) {
      fetchUnverifiedStudents();
    }
  }, [cashModalOpen]);

  const handleVerify = async (status) => {
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/payments/${selectedPayment._id}/verify`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : '',
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Payment updated successfully');
        setSelectedPayment(null);
        setRejectionReason('');
        fetchPendingPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectCashApprove = async (e) => {
    e.preventDefault();
    if (!cashStudentId) {
      toast.error('Please select a student for cash approval');
      return;
    }

    setCashLoading(true);
    try {
      const res = await api.post('/payments/cash-approve', {
        studentId: cashStudentId,
        branch: cashBranch,
        notes: cashNotes,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Cash payment approved & account activated!');
        setCashModalOpen(false);
        setCashStudentId('');
        setCashNotes('');
        fetchPendingPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record cash approval');
    } finally {
      setCashLoading(false);
    }
  };

  // Filter payments by search & method
  const filteredPayments = payments.filter((p) => {
    const studentName = p.userId?.name || p.studentId?.userId?.name || '';
    const email = p.userId?.email || '';
    const phone = p.userId?.phone || '';
    const ref = p.transactionReference || p.gateway_transaction_reference || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      studentName.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      phone.toLowerCase().includes(term) ||
      ref.toLowerCase().includes(term);

    const method = p.payment_method || p.paymentMethod || 'bank_slip';
    const matchesMethod = selectedMethod === 'All' || method === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full text-[#152026]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Step 4: Financial Verification & Officer Ledger
          </div>
          <h1 className="text-2xl font-extrabold text-[#152026] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1B3D59]" /> Advance Payment Verification Queue
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Review submitted bank deposit slips, online gateway payments, and record on-the-spot physical branch cash payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Direct Cash Payment Button */}
          <button
            onClick={() => setCashModalOpen(true)}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-bold shadow-xs cursor-pointer transition-all"
          >
            <DollarSign className="w-4 h-4" /> Record Cash Payment
          </button>

          <button
            onClick={fetchPendingPayments}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold cursor-pointer transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 bg-white border border-[#D4EEF8] rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#152026]">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-2 border border-[#D4EEF8] rounded-xl text-xs bg-white font-bold text-[#152026] outline-none focus:border-[#1B3D59] cursor-pointer"
            >
              <option value="All">All Branches</option>
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#152026]">Method:</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3.5 py-2 border border-[#D4EEF8] rounded-xl text-xs bg-white font-bold text-[#152026] outline-none focus:border-[#1B3D59] cursor-pointer"
            >
              <option value="All">All Methods</option>
              <option value="online_gateway">Online Gateway (Card)</option>
              <option value="bank_slip">Bank Deposit Slip</option>
              <option value="physical_branch">Physical Cash</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6A97C0]" />
            <input
              type="text"
              placeholder="Search name, phone, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl text-xs text-[#152026] placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59]"
            />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 text-[11px] font-bold self-end sm:self-center">
          {filteredPayments.length} Payment(s) Pending Review
        </span>
      </div>

      {/* Slips & Payments Table */}
      <div className="card p-0 overflow-hidden shadow-sm border border-[#D4EEF8] bg-white rounded-3xl">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#6A97C0] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading pending verification queue...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-[#152026]">All payments are up to date!</p>
            <p className="text-xs text-[#6A97C0]">There are no unverified advance payments in the queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-[#1B3D59] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Student Type</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Amount (LKR)</th>
                  <th className="px-4 py-3.5">Reference / Slip</th>
                  <th className="px-4 py-3.5">Date Submitted</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4EEF8]">
                {filteredPayments.map((p) => {
                  const student = p.studentId;
                  const user = p.userId || student?.userId;
                  const isType2 =
                    student?.student_type === 'Type 2' ||
                    student?.studentType === 'Type 2' ||
                    student?.studentType === 'Type2_TrialOnly' ||
                    user?.student_type === 'Type 2';

                  const method = p.payment_method || p.paymentMethod || 'bank_slip';

                  return (
                    <tr key={p._id} className="hover:bg-[#D4EEF8]/30 transition-colors">
                      {/* Student Details */}
                      <td className="px-4 py-3.5 font-semibold text-[#152026]">
                        <div className="text-sm font-bold">{user?.name || 'Unknown Student'}</div>
                        <div className="text-[11px] text-[#6A97C0] font-normal">
                          {user?.phone || 'No phone'} • {user?.email}
                        </div>
                        <div className="text-[10px] text-[#1B3D59] font-semibold mt-0.5">
                          {student?.branch || user?.branch || 'Maharagama'} Branch
                        </div>
                      </td>

                      {/* Student Type Badge */}
                      <td className="px-4 py-3.5">
                        {isType2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40">
                            <Award className="w-3 h-3 text-[#152026]" />
                            Type 2 (Trial Only)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                            <GraduationCap className="w-3 h-3 text-[#1B3D59]" />
                            Type 1 (Full Course)
                          </span>
                        )}
                      </td>

                      {/* Payment Method Badge */}
                      <td className="px-4 py-3.5">
                        {method === 'online_gateway' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                            <CreditCard className="w-3 h-3 text-[#1B3D59]" />
                            Online Gateway
                          </span>
                        ) : method === 'physical_branch' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40">
                            <Building2 className="w-3 h-3 text-[#152026]" />
                            Physical Cash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                            <Landmark className="w-3 h-3 text-[#1B3D59]" />
                            Bank Slip ({p.bankName?.split('(')[0]?.trim() || 'Bank Transfer'})
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black text-emerald-700">
                          Rs. {Number(p.amount || 5000).toLocaleString()}
                        </span>
                      </td>

                      {/* Ref */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-[11px] font-bold text-[#152026]">
                          {p.transactionReference || p.gateway_transaction_reference || 'N/A'}
                        </div>
                        <div className="text-[10px] text-[#6A97C0]">
                          Status: {p.payment_status || p.status}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-[#6A97C0] text-[11px]">
                        {safeFormatDate(p.createdAt || p.uploadedAt, 'MMM dd, yyyy • hh:mm a', 'N/A')}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="py-1.5 px-3 rounded-xl border border-[#D4EEF8] hover:border-[#1B3D59] bg-white text-[#1B3D59] font-bold text-xs inline-flex items-center gap-1 cursor-pointer hover:bg-[#D4EEF8]/40 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1B3D59]" />
                          <span>Review & Verify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in text-[#152026]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1B3D59]" />
                  Review Payment: {selectedPayment.userId?.name || 'Student'}
                </h3>
                <p className="text-xs text-[#6A97C0]">
                  {selectedPayment.studentId?.branch || selectedPayment.userId?.branch || '—'} Branch •{' '}
                  {selectedPayment.userId?.phone || selectedPayment.userId?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#6A97C0] hover:text-[#152026] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] text-xs">
              <div>
                <span className="text-[#6A97C0]">Student Type:</span>
                <p className="font-extrabold text-[#1B3D59] mt-0.5">
                  {selectedPayment.studentId?.student_type ||
                    selectedPayment.studentId?.studentType ||
                    selectedPayment.userId?.student_type ||
                    'Type 1'}
                </p>
              </div>
              <div>
                <span className="text-[#6A97C0]">Method:</span>
                <p className="font-bold text-[#152026] mt-0.5 capitalize">
                  {(selectedPayment.payment_method || selectedPayment.paymentMethod || 'bank_slip').replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-[#6A97C0]">Advance Amount:</span>
                <p className="font-black text-emerald-700 text-sm mt-0.5">
                  Rs. {Number(selectedPayment.amount || 5000).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[#6A97C0]">Reference:</span>
                <p className="font-mono text-[#152026] font-bold mt-0.5 truncate">
                  {selectedPayment.transactionReference || 'N/A'}
                </p>
              </div>
            </div>

            {/* If Physical Cash Intent */}
            {(selectedPayment.payment_method === 'physical_branch' ||
              selectedPayment.paymentMethod === 'physical_branch') && (
              <div className="p-4 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/40 text-xs text-[#152026] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#152026]">
                  <Building2 className="w-4 h-4 text-[#152026]" />
                  Physical Cash Payment Intent at {selectedPayment.studentId?.branch || 'Maharagama'} Branch
                </div>
                <p className="text-[#152026]/90 font-medium">
                  The student indicated they will visit the branch counter in person. Once you physically receive the LKR 5,000 cash at the counter, click <strong>"Confirm & Verify Payment"</strong> below to activate their account.
                </p>
              </div>
            )}

            {/* If Online Card Gateway Payment */}
            {(selectedPayment.payment_method === 'online_gateway' ||
              selectedPayment.paymentMethod === 'online_gateway') && (
              <div className="border border-[#D4EEF8] rounded-2xl p-4 bg-[#FAFCFE] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#152026] border-b border-[#D4EEF8] pb-2.5">
                  <span className="flex items-center gap-1.5 text-[#1B3D59]">
                    <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Online Gateway Payment Details
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Authorized & Captured
                  </span>
                </div>

                {/* Virtual Card & Gateway Snapshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1B3D59] to-[#152026] text-white shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#D4EEF8] tracking-wider text-[11px]">Sithma Pay Gateway</span>
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-white/15 text-white border border-white/20">
                        {selectedPayment.cardBrand || 'Visa / Mastercard'}
                      </span>
                    </div>
                    <div className="font-mono text-base font-black tracking-widest text-[#F3EED8]">
                      •••• •••• •••• {selectedPayment.cardLast4 || selectedPayment.slipImageUrl?.match(/\*\*\*\*(\d{4})/)?.[1] || '4242'}
                    </div>
                    <div className="flex justify-between items-end text-[11px] text-[#D4EEF8]">
                      <div>
                        <span className="text-[9px] uppercase text-[#6A97C0] block">Cardholder</span>
                        <span className="font-bold text-white uppercase">{selectedPayment.cardHolder || selectedPayment.userId?.name || 'Student'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-[#6A97C0] block">Gateway Status</span>
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid Online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] flex flex-col justify-between space-y-2 text-xs">
                    <div>
                      <span className="text-[#6A97C0] block text-[11px]">Gateway Transaction Ref</span>
                      <span className="font-mono font-bold text-[#1B3D59] text-xs break-all">
                        {selectedPayment.gateway_transaction_reference || selectedPayment.transactionReference || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6A97C0] block text-[11px]">Gateway Provider</span>
                      <span className="font-bold text-[#152026]">
                        {selectedPayment.bankName || 'Sithma Pay Online Gateway'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6A97C0] block text-[11px]">Submission Time</span>
                      <span className="font-medium text-[#152026]">
                        {safeFormatDate(selectedPayment.uploadedAt || selectedPayment.createdAt, 'PPP • pp', 'Just now')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Action Notice */}
                <div className="p-3 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-xs text-[#152026] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B3D59] shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    This online card payment of <strong className="text-[#1B3D59]">Rs. {Number(selectedPayment.amount || 5000).toLocaleString()}</strong> was captured via online gateway. Click <strong>"Confirm & Verify Account"</strong> below to complete verification and activate the student's account.
                  </p>
                </div>
              </div>
            )}

            {/* If Bank Slip: Slip Preview */}
            {(selectedPayment.payment_method === 'bank_slip' ||
              selectedPayment.paymentMethod === 'bank_slip' ||
              (!selectedPayment.payment_method && !selectedPayment.paymentMethod)) && (
              (() => {
                const rawUrl = selectedPayment.slipImageUrl || selectedPayment.slip_file_reference;
                const fullUrl = rawUrl?.startsWith('http')
                  ? rawUrl
                  : rawUrl
                  ? `http://localhost:5001${rawUrl}`
                  : null;
                const isPdf = rawUrl?.toLowerCase().includes('.pdf');

                return (
                  <div className="border border-[#D4EEF8] rounded-2xl p-3 bg-[#FAFCFE] text-center space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#152026] px-1">
                      <span>{isPdf ? 'Uploaded PDF Bank Slip Document' : 'Uploaded Bank Receipt Image'}</span>
                      {fullUrl && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1B3D59] hover:underline inline-flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Full File
                        </a>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto flex flex-col items-center justify-center bg-white rounded-xl p-2 border border-[#D4EEF8]">
                      {isPdf && fullUrl ? (
                        <div className="w-full space-y-2 text-center p-2">
                          <FileText className="w-10 h-10 text-rose-500 mx-auto" />
                          <p className="text-xs font-bold text-[#152026]">PDF Bank Slip Document</p>
                          <iframe src={fullUrl} title="Slip Document Preview" className="w-full h-44 rounded-lg" />
                        </div>
                      ) : (
                        <img
                          src={fullUrl || 'https://placehold.co/600x400/f8fafc/152026?text=Bank+Transfer+Receipt+Slip'}
                          alt="Bank Deposit Slip"
                          className="max-h-64 object-contain rounded-lg border border-[#D4EEF8] shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Rejection Note Field */}
            <div>
              <label className="block text-xs font-semibold text-[#152026] mb-1">
                Rejection Reason (Required only if rejecting):
              </label>
              <input
                type="text"
                placeholder="e.g. Deposit slip illegible, amount mismatch, invalid reference..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs focus:outline-none focus:border-[#1B3D59]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleVerify('rejected')}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject Payment
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleVerify('confirmed')}
                className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 rounded-xl font-bold cursor-pointer shadow-md transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Confirm & Verify Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct On-The-Spot Cash Payment Approval Modal */}
      {cashModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#1B3D59]" /> Record On-The-Spot Cash Payment
                </h3>
                <p className="text-xs text-[#6A97C0]">
                  Approve LKR 5,000 physical cash and instantly activate student account
                </p>
              </div>
              <button
                onClick={() => setCashModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#6A97C0] hover:text-[#152026] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectCashApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-1.5">
                  Select Unverified Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cashStudentId}
                  onChange={(e) => setCashStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] rounded-xl text-xs text-[#152026] focus:outline-none focus:border-[#1B3D59] cursor-pointer"
                >
                  <option value="">-- Choose Student --</option>
                  {unverifiedStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name || s.name} ({s.student_type || s.studentType || 'Type 1'} • {s.branch} • {s.phone || s.userId?.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6A97C0] mt-1">
                  Lists students currently in Unverified / Pending Payment status.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-1.5">
                    Branch Received <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cashBranch}
                    onChange={(e) => setCashBranch(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] rounded-xl text-xs text-[#152026] focus:outline-none focus:border-[#1B3D59] cursor-pointer"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-1.5">
                    Amount Received
                  </label>
                  <input
                    type="text"
                    value="LKR 5,000 (Fixed)"
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl text-xs text-emerald-700 font-black cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-1.5">
                  Receipt Notes / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                  placeholder="e.g. Received at counter by Officer Kasun"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4EEF8] rounded-xl text-xs text-[#152026] focus:outline-none focus:border-[#1B3D59]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#D4EEF8]/40 border border-[#B3D5F1] text-xs text-[#1B3D59] flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
                <span>
                  Instantly sets student <strong>account_status = 'Verified'</strong> and unlocks dashboard.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCashModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cashLoading}
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 rounded-xl font-bold cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  {cashLoading ? 'Approving...' : 'Approve Cash & Activate Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
