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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Bank Payment Slip Upload & Verification
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Upload your bank transfer slip or deposit receipt for administrative verification.
          </p>
        </div>

        <button onClick={fetchPayments} className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Grid: Bank Details & Upload Form (Left) + Status & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Bank Info & Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Bank Account Details */}
          <div className="bg-gradient-to-r from-primaryDark to-primary text-white rounded-2xl p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="badge bg-white/20 text-white border border-white/20 text-[10px]">
                Official Driving School Account
              </span>
              <Building2 className="w-5 h-5 text-accent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <p className="text-blue-200">Bank & Branch:</p>
                <p className="font-bold text-sm text-white">Bank of Ceylon (BOC)</p>
                <p className="text-[11px] text-blue-100">Maharagama Branch</p>
              </div>
              <div>
                <p className="text-blue-200">Account Name:</p>
                <p className="font-bold text-sm text-white">Sithma Driving School (Pvt) Ltd</p>
              </div>
              <div>
                <p className="text-blue-200">Account Number:</p>
                <p className="font-mono font-black text-sm text-accent tracking-wider">
                  8472910394
                </p>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h2 className="text-base font-bold text-textMain flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" /> Upload New Payment Slip
              </h2>
              <span className="text-xs font-bold text-primary">
                Package Due: Rs. {student?.package?.priceTotal?.toLocaleString() || '45,000'}
              </span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    Amount Paid (LKR) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-borderColor rounded-lg font-bold text-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    Paying Bank Name:
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. Bank of Ceylon / Commercial Bank"
                    className="w-full px-3 py-2.5 border border-borderColor rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-textMain mb-1">
                    Bank Reference / Transaction ID (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-TXN-98471203"
                    value={formData.transactionReference}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionReference: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-borderColor rounded-lg"
                  />
                </div>
              </div>

              {/* File Drop Area */}
              <div>
                <label className="block font-semibold text-textMain mb-1">
                  Upload Slip Image or PDF <span className="text-danger">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-primary/60 rounded-2xl p-6 text-center transition-colors bg-neutralBg">
                  <input
                    type="file"
                    id="slipFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slipFile" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-primary mx-auto" />
                    <p className="font-semibold text-textMain text-xs">
                      {selectedFile ? selectedFile.name : 'Click to select bank payment slip file'}
                    </p>
                    <p className="text-[11px] text-textMuted">JPG, PNG, WEBP, or PDF up to 5MB</p>
                  </label>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {previewUrl && (
                <div className="p-3 bg-slate-50 border border-borderColor rounded-xl flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Slip Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-textMain">Slip Image Ready</p>
                    <p className="text-textMuted">{selectedFile?.name}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn-accent w-full py-3 font-bold text-sm shadow-md"
              >
                {uploading ? 'Uploading Slip...' : 'Submit Payment Slip for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Status & History */}
        <div className="space-y-6">
          {/* Latest Status Card */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Current Verification Status
            </h3>

            {latestPayment ? (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs ${
                  latestPayment.status === 'confirmed'
                    ? 'bg-success-light border-success/30'
                    : latestPayment.status === 'rejected'
                    ? 'bg-danger-light border-danger/30'
                    : 'bg-warning-light border-warning/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-textMain">Rs. {latestPayment.amount?.toLocaleString()}</span>
                  <span
                    className={`badge ${
                      latestPayment.status === 'confirmed'
                        ? 'badge-success'
                        : latestPayment.status === 'rejected'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {latestPayment.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] text-textMuted">
                  Uploaded: {format(new Date(latestPayment.uploadedAt), 'MMM dd, yyyy • hh:mm a')}
                </p>

                {latestPayment.status === 'rejected' && (
                  <p className="text-danger font-semibold mt-1">
                    Rejection Reason: {latestPayment.rejectionReason}
                  </p>
                )}

                {latestPayment.status === 'confirmed' && (
                  <p className="text-success-dark font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Registration Confirmed
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-textMuted">
                No payment slips uploaded yet. Please upload your slip on the left.
              </div>
            )}
          </div>

          {/* Past Payments List */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-textMain">Payment History</h3>
            {loading ? (
              <p className="text-xs text-textMuted">Loading history...</p>
            ) : payments.length === 0 ? (
              <p className="text-xs text-textMuted italic">No previous payments recorded.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 bg-neutralBg rounded-lg border border-borderColor text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-textMain">Rs. {p.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-textMuted">
                        {format(new Date(p.uploadedAt), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <span
                      className={`badge text-[10px] py-0 px-2 ${
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
