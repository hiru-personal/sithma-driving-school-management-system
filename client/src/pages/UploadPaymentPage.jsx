import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  RefreshCw,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UploadPaymentPage() {
  const { student, updateStudentData } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    amount: student?.package?.priceTotal || 45000,
    bankName: 'Bank of Ceylon (BOC)',
    transactionReference: '',
  });

  const fetchPayments = async () => {
    if (!student?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/payments/student/${student._id}`);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a payment slip image or document');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('slipImage', selectedFile);
    data.append('amount', formData.amount);
    data.append('bankName', formData.bankName);
    data.append('transactionReference', formData.transactionReference);

    try {
      const res = await api.post('/payments/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('🎉 Payment slip uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchPayments();

        if (student?._id) {
          const profileRes = await api.get(`/students/${student._id}`);
          if (profileRes.data.success) {
            updateStudentData(profileRes.data.student);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload payment slip');
    } finally {
      setUploading(false);
    }
  };

  const latestPayment = payments[0];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Fees & Invoicing
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <CreditCard className="w-6 h-6 text-amber-400" /> Bank Payment Slip Upload & Verification
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload your bank transfer slip or deposit receipt for administrative verification.
          </p>
        </div>

        <button onClick={fetchPayments} className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Grid: Bank Details & Upload Form (Left) + Status & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Bank Info & Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Bank Account Details */}
          <div className="backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/70 to-slate-900/90 text-white rounded-3xl p-6 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] space-y-3 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="badge bg-white/15 text-cyan-300 border border-white/20 text-[10px]">
                Official Driving School Account
              </span>
              <Building2 className="w-5 h-5 text-accent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <p className="text-slate-400">Bank & Branch:</p>
                <p className="font-bold text-sm text-white">Bank of Ceylon (BOC)</p>
                <p className="text-[11px] text-cyan-300">Maharagama Branch</p>
              </div>
              <div>
                <p className="text-slate-400">Account Name:</p>
                <p className="font-bold text-sm text-white">Sithma Driving School (Pvt) Ltd</p>
              </div>
              <div>
                <p className="text-slate-400">Account Number:</p>
                <p className="font-mono font-black text-sm text-accent tracking-wider">
                  8472910394
                </p>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" /> Upload New Payment Slip
              </h2>
              <span className="text-xs font-bold text-accent">
                Package Due: Rs. {student?.package?.priceTotal?.toLocaleString() || '45,000'}
              </span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Amount Paid (LKR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 rounded-xl font-bold text-accent text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Paying Bank Name:
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. Bank of Ceylon / Commercial Bank"
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Bank Reference / Transaction ID (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-TXN-98471203"
                    value={formData.transactionReference}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionReference: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* File Drop Area */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Upload Slip Image or PDF <span className="text-rose-400">*</span>
                </label>
                <div className="border-2 border-dashed border-white/20 hover:border-cyan-400/60 rounded-2xl p-6 text-center transition-colors bg-white/5 cursor-pointer">
                  <input
                    type="file"
                    id="slipFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slipFile" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                    <p className="font-semibold text-white text-xs">
                      {selectedFile ? selectedFile.name : 'Click to select bank payment slip file'}
                    </p>
                    <p className="text-[11px] text-slate-400">JPG, PNG, WEBP, or PDF up to 5MB</p>
                  </label>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {previewUrl && (
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Slip Preview"
                    className="w-16 h-16 object-cover rounded-xl border border-white/10"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-white">Slip Image Ready</p>
                    <p className="text-slate-400">{selectedFile?.name}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn-accent w-full py-3 font-bold text-sm shadow-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading Slip...' : 'Submit Payment Slip for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Status & Payment Log */}
        <div className="space-y-6">
          {/* Latest Status Pill Card */}
          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Current Verification Status
            </h3>

            {latestPayment ? (
              <div className="p-4 rounded-2xl border bg-white/5 border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Latest Submission:</span>
                  <span
                    className={`badge ${
                      latestPayment.status === 'confirmed'
                        ? 'badge-success'
                        : latestPayment.status === 'rejected'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {latestPayment.status}
                  </span>
                </div>
                <p className="text-slate-400">
                  Amount: <strong className="text-accent">Rs. {latestPayment.amount?.toLocaleString()}</strong>
                </p>
                <p className="text-slate-400">
                  Date: {latestPayment.uploadedAt ? format(new Date(latestPayment.uploadedAt), 'MMM dd, yyyy') : 'N/A'}
                </p>
                {latestPayment.rejectionReason && (
                  <p className="text-rose-400 font-semibold mt-1">
                    Note: {latestPayment.rejectionReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No payment slips uploaded yet.</p>
            )}
          </div>

          {/* Payment History List */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-white">Payment Submission Log</h3>
            {loading ? (
              <p className="text-xs text-slate-400">Loading history...</p>
            ) : payments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous payments.</p>
            ) : (
              <div className="divide-y divide-white/10 text-xs">
                {payments.map((p) => (
                  <div key={p._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{p.bankName}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.uploadedAt ? format(new Date(p.uploadedAt), 'MMM dd, yyyy') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-accent">Rs. {p.amount?.toLocaleString()}</span>
                      <div>
                        <span
                          className={`badge text-[9px] py-0 px-2 mt-0.5 ${
                            p.status === 'confirmed'
                              ? 'badge-success'
                              : p.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
