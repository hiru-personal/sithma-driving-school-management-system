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
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PaymentVerificationQueuePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Preview & Verification Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    fetchPendingPayments();
  }, [selectedBranch]);

  const handleVerify = async (status) => {
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/payments/${selectedPayment._id}/verify`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : '',
      });

      if (res.data.success) {
        toast.success(res.data.message);
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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Financial Ledger & Approvals
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <CreditCard className="w-6 h-6 text-amber-400" /> Payment Slip Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review uploaded bank transfer slips, cross-check transaction amounts, and confirm student registrations.
          </p>
        </div>

        <button onClick={fetchPendingPayments} className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Filter by Branch:</label>
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
        <span className="badge badge-warning text-[10px]">
          {payments.length} Slips Awaiting Review
        </span>
      </div>

      {/* Slips Table */}
      <div className="card p-0 overflow-hidden shadow-2xl border border-white/10">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading pending slips...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">All pending payment slips are verified!</p>
            <p className="text-xs text-slate-400">There are no unverified slips in the queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Branch</th>
                  <th className="px-4 py-3.5">Bank & Slip Details</th>
                  <th className="px-4 py-3.5">Amount (LKR)</th>
                  <th className="px-4 py-3.5">Uploaded Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-white">
                      <div className="text-sm">{p.userId?.name || 'Unknown Student'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {p.userId?.phone} • {p.userId?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge badge-info text-[10px]">{p.branch} Branch</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-200">{p.bankName}</div>
                      <div className="text-[11px] text-slate-400">Ref / Slip: {p.slipFileName || 'Uploaded Image'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-black text-accent">
                        Rs. {p.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {p.uploadedAt ? format(new Date(p.uploadedAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="btn-secondary text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-300" /> Review Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Verification Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" /> Review Bank Slip: {selectedPayment.userId?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedPayment.branch} Branch • {selectedPayment.userId?.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Details & Image Preview */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400">Claimed Bank:</span>
                  <p className="font-bold text-white mt-0.5">{selectedPayment.bankName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Deposit Amount:</span>
                  <p className="font-black text-accent text-sm mt-0.5">
                    Rs. {selectedPayment.amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Uploaded Date:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    {selectedPayment.uploadedAt
                      ? format(new Date(selectedPayment.uploadedAt), 'MMM dd, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Bank Transfer Slip Preview */}
              <div className="border border-white/15 rounded-2xl p-2 bg-slate-900/90 text-center">
                <p className="text-[11px] font-semibold text-slate-400 mb-2">Uploaded Slip Document Preview</p>
                <div className="max-h-72 overflow-y-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
                  <img
                    src={
                      selectedPayment.slipUrl?.startsWith('http')
                        ? selectedPayment.slipUrl
                        : selectedPayment.slipUrl
                        ? `http://localhost:5001${selectedPayment.slipUrl}`
                        : 'https://placehold.co/600x400/0f172a/ffffff?text=Bank+Transfer+Receipt+Slip'
                    }
                    alt="Bank Deposit Slip"
                    className="max-h-64 object-contain rounded-lg border border-white/10 shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/0f172a/ffffff?text=Receipt+Image';
                    }}
                  />
                </div>
              </div>

              {/* Rejection Note Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection Reason (Only if rejecting this slip):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deposit amount does not match bank record, blurry receipt..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/15 text-white rounded-xl text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleVerify('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject Slip
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleVerify('confirmed')}
                  className="btn-primary text-xs py-2 px-5 font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Confirm & Verify Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
