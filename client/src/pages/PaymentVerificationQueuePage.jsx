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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Payment Slip Verification Queue
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Review uploaded bank transfer slips, cross-check transaction amounts, and confirm student registrations.
          </p>
        </div>

        <button onClick={fetchPendingPayments} className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-textMain">Filter by Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-1.5 border border-borderColor rounded-lg text-xs bg-white font-bold text-primary outline-none"
          >
            <option value="All">All Branches</option>
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>
        </div>

        <span className="badge badge-warning text-xs">
          {payments.length} Slips Awaiting Review
        </span>
      </div>

      {/* Payments Grid / Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading payment queue...
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-12 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
          <p className="text-sm font-semibold text-textMain">All payments verified!</p>
          <p className="text-xs text-textMuted">There are currently no pending slips awaiting staff review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((p) => {
            const studentUser = p.studentId?.userId;

            return (
              <div key={p._id} className="card card-hover p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-info">{p.studentId?.branch} Branch</span>
                    <span className="badge badge-warning">Pending Review</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-textMain">{studentUser?.name}</h3>
                    <p className="text-xs text-textMuted">{studentUser?.phone} • {studentUser?.email}</p>
                  </div>

                  <div className="p-3 bg-neutralBg rounded-xl border border-borderColor text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-textMuted">Amount Paid:</span>
                      <span className="font-bold text-primary">Rs. {p.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textMuted">Bank:</span>
                      <span>{p.bankName}</span>
                    </div>
                    {p.transactionReference && (
                      <div className="flex justify-between">
                        <span className="text-textMuted">Ref / Txn:</span>
                        <span className="font-mono text-[11px]">{p.transactionReference}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-textMuted pt-1 border-t border-borderColor">
                      <span>Uploaded:</span>
                      <span>{format(new Date(p.uploadedAt), 'yyyy-MM-dd • hh:mm a')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-borderColor flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review Slip & Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal with Slip Image */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <div>
                <h3 className="text-base font-bold text-textMain">Review Bank Payment Slip</h3>
                <p className="text-xs text-textMuted">
                  Student: <strong>{selectedPayment.studentId?.userId?.name}</strong> • Amount: <strong>Rs. {selectedPayment.amount?.toLocaleString()}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Slip Image View */}
            <div className="bg-slate-100 p-2 rounded-xl border border-borderColor max-h-96 overflow-auto text-center">
              <img
                src={selectedPayment.slipImageUrl}
                alt="Bank Transfer Slip"
                className="max-h-80 mx-auto rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/0B5FA5/FFFFFF?text=Bank+Deposit+Slip+Image';
                }}
              />
            </div>

            {/* Rejection reason box */}
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">
                Rejection Reason (Only if rejecting):
              </label>
              <input
                type="text"
                placeholder="e.g. Deposit amount does not match package fee"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-borderColor">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="btn-secondary py-2 px-3 text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleVerify('rejected')}
                  className="px-4 py-2 rounded-lg bg-danger-light text-danger-dark font-bold text-xs hover:bg-danger hover:text-white transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject Slip
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleVerify('confirmed')}
                  className="btn-primary py-2 px-4 text-xs font-bold bg-success hover:bg-success-dark flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Approve Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
