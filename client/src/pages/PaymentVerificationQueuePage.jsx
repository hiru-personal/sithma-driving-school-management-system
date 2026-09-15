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

export default function PaymentVerificationQueuePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All');
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

  // Filter payments by search
  const filteredPayments = payments.filter((p) => {
    const studentName = p.userId?.name || p.studentId?.userId?.name || '';
    const email = p.userId?.email || '';
    const phone = p.userId?.phone || '';
    const ref = p.transactionReference || p.gateway_transaction_reference || '';
    const term = searchTerm.toLowerCase();

    return (
      studentName.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      phone.toLowerCase().includes(term) ||
      ref.toLowerCase().includes(term)
    );
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Step 4: Financial Verification & Officer Ledger
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <CreditCard className="w-6 h-6 text-amber-400" /> Advance Payment Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review submitted bank deposit slips, online gateway payments, and record on-the-spot physical branch cash payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Direct Cash Payment Button */}
          <button
            onClick={() => setCashModalOpen(true)}
            className="btn-accent text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-md cursor-pointer"
          >
            <DollarSign className="w-4 h-4" /> Record Cash Payment
          </button>

          <button
            onClick={fetchPendingPayments}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-2 border border-white/15 rounded-xl text-xs bg-slate-950/80 font-bold text-cyan-300 outline-none"
            >
              <option value="All">All Branches</option>
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <span className="badge badge-warning text-[10px] self-end sm:self-center">
          {filteredPayments.length} Payment(s) Pending Review
        </span>
      </div>

      {/* Slips & Payments Table */}
      <div className="card p-0 overflow-hidden shadow-2xl border border-white/10">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading pending verification queue...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">All payments are up to date!</p>
            <p className="text-xs text-slate-400">There are no unverified advance payments in the queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
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
              <tbody className="divide-y divide-white/10">
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
                    <tr key={p._id} className="hover:bg-white/5 transition-colors">
                      {/* Student Details */}
                      <td className="px-4 py-3.5 font-semibold text-white">
                        <div className="text-sm font-bold">{user?.name || 'Unknown Student'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {user?.phone || 'No phone'} • {user?.email}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-semibold mt-0.5">
                          {student?.branch || user?.branch || 'Maharagama'} Branch
                        </div>
                      </td>

                      {/* Student Type Badge */}
                      <td className="px-4 py-3.5">
                        {isType2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <Award className="w-3 h-3 text-amber-400" />
                            Type 2 (Trial Only)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <GraduationCap className="w-3 h-3 text-cyan-400" />
                            Type 1 (Full Course)
                          </span>
                        )}
                      </td>

                      {/* Payment Method Badge */}
                      <td className="px-4 py-3.5">
                        {method === 'online_gateway' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                            <CreditCard className="w-3 h-3 text-purple-400" />
                            Online Gateway
                          </span>
                        ) : method === 'physical_branch' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                            <Building2 className="w-3 h-3 text-amber-400" />
                            Physical Cash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                            <Landmark className="w-3 h-3 text-blue-400" />
                            Bank Slip ({p.bankName?.split('(')[0]?.trim() || 'Bank Transfer'})
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black text-emerald-400">
                          Rs. {Number(p.amount || 5000).toLocaleString()}
                        </span>
                      </td>

                      {/* Ref */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-[11px] font-bold text-slate-300">
                          {p.transactionReference || p.gateway_transaction_reference || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Status: {p.payment_status || p.status}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {p.createdAt || p.uploadedAt
                          ? format(new Date(p.createdAt || p.uploadedAt), 'MMM dd, yyyy • hh:mm a')
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1 cursor-pointer hover:border-cyan-400"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-300" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Review Payment: {selectedPayment.userId?.name || 'Student'}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedPayment.studentId?.branch || selectedPayment.userId?.branch || '—'} Branch •{' '}
                  {selectedPayment.userId?.phone || selectedPayment.userId?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-slate-400">Student Type:</span>
                <p className="font-extrabold text-cyan-300 mt-0.5">
                  {selectedPayment.studentId?.student_type ||
                    selectedPayment.studentId?.studentType ||
                    selectedPayment.userId?.student_type ||
                    'Type 1'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Method:</span>
                <p className="font-bold text-white mt-0.5 capitalize">
                  {(selectedPayment.payment_method || selectedPayment.paymentMethod || 'bank_slip').replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Advance Amount:</span>
                <p className="font-black text-emerald-400 text-sm mt-0.5">
                  Rs. {Number(selectedPayment.amount || 5000).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Reference:</span>
                <p className="font-mono text-amber-300 font-bold mt-0.5 truncate">
                  {selectedPayment.transactionReference || 'N/A'}
                </p>
              </div>
            </div>

            {/* If Physical Cash Intent */}
            {(selectedPayment.payment_method === 'physical_branch' ||
              selectedPayment.paymentMethod === 'physical_branch') && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Physical Cash Payment Intent at {selectedPayment.studentId?.branch || 'Maharagama'} Branch
                </div>
                <p className="text-amber-300/90">
                  The student indicated they will visit the branch counter in person. Once you physically receive the LKR 5,000 cash at the counter, click <strong>"Confirm & Verify Payment"</strong> below to activate their account.
                </p>
              </div>
            )}

            {/* If Bank Slip: Slip Preview */}
            {(selectedPayment.payment_method === 'bank_slip' ||
              selectedPayment.paymentMethod === 'bank_slip' ||
              !selectedPayment.payment_method) && (
              (() => {
                const rawUrl = selectedPayment.slipImageUrl || selectedPayment.slip_file_reference;
                const fullUrl = rawUrl?.startsWith('http')
                  ? rawUrl
                  : rawUrl
                  ? `http://localhost:5001${rawUrl}`
                  : null;
                const isPdf = rawUrl?.toLowerCase().includes('.pdf');

                return (
                  <div className="border border-white/15 rounded-2xl p-3 bg-slate-900/90 text-center space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 px-1">
                      <span>{isPdf ? 'Uploaded PDF Bank Slip Document' : 'Uploaded Bank Receipt Image'}</span>
                      {fullUrl && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 font-bold underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Full File
                        </a>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto flex flex-col items-center justify-center bg-black/40 rounded-xl p-2">
                      {isPdf && fullUrl ? (
                        <div className="w-full space-y-2 text-center p-2">
                          <FileText className="w-10 h-10 text-rose-400 mx-auto" />
                          <p className="text-xs font-bold text-white">PDF Bank Slip Document</p>
                          <iframe src={fullUrl} title="Slip Document Preview" className="w-full h-44 rounded-lg" />
                        </div>
                      ) : (
                        <img
                          src={fullUrl || 'https://placehold.co/600x400/0f172a/ffffff?text=Bank+Transfer+Receipt+Slip'}
                          alt="Bank Deposit Slip"
                          className="max-h-64 object-contain rounded-lg border border-white/10 shadow-lg"
                        />
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Rejection Note Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rejection Reason (Required only if rejecting):
              </label>
              <input
                type="text"
                placeholder="e.g. Deposit slip illegible, amount mismatch, invalid reference..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/15 text-white rounded-xl text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleVerify('rejected')}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject Payment
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleVerify('confirmed')}
                className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Confirm & Verify Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct On-The-Spot Cash Payment Approval Modal */}
      {cashModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Record On-The-Spot Cash Payment
                </h3>
                <p className="text-xs text-slate-400">
                  Approve LKR 5,000 physical cash and instantly activate student account
                </p>
              </div>
              <button
                onClick={() => setCashModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectCashApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Unverified Student <span className="text-rose-400">*</span>
                </label>
                <select
                  value={cashStudentId}
                  onChange={(e) => setCashStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose Student --</option>
                  {unverifiedStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name || s.name} ({s.student_type || s.studentType || 'Type 1'} • {s.branch} • {s.phone || s.userId?.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lists students currently in Unverified / Pending Payment status.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Branch Received <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={cashBranch}
                    onChange={(e) => setCashBranch(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Amount Received
                  </label>
                  <input
                    type="text"
                    value="LKR 5,000 (Fixed)"
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-xs text-emerald-400 font-black cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Receipt Notes / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                  placeholder="e.g. Received at counter by Officer Kasun"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Instantly sets student <strong>account_status = 'Verified'</strong> and unlocks dashboard.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCashModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cashLoading}
                  className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
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
