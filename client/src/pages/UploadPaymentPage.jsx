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
  ExternalLink,
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto w-full text-[#152026]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Fees & Invoicing
          </div>
          <h1 className="text-2xl font-extrabold text-[#152026] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1B3D59]" /> Bank Payment Slip Upload & Verification
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Upload your bank transfer slip or deposit receipt for administrative verification.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5 font-bold text-xs rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </button>
      </div>

      {/* Grid: Bank Details & Upload Form (Left) + Status & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Bank Info & Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official Bank Account Details */}
          <div className="bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] text-white rounded-3xl p-6 border border-[#1B3D59]/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/20 text-[#D4EEF8] border border-[#B3D5F1]/30 text-[10px] font-bold uppercase tracking-wider">
                Official Driving School Account
              </span>
              <Building2 className="w-5 h-5 text-[#B3D5F1]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <p className="text-[#D4EEF8]/70">Bank & Branch:</p>
                <p className="font-bold text-sm text-white">Bank of Ceylon (BOC)</p>
                <p className="text-[11px] text-[#B3D5F1]">Maharagama Branch</p>
              </div>
              <div>
                <p className="text-[#D4EEF8]/70">Account Name:</p>
                <p className="font-bold text-sm text-white">Sithma Driving School (Pvt) Ltd</p>
              </div>
              <div>
                <p className="text-[#D4EEF8]/70">Account Number:</p>
                <p className="font-mono font-black text-sm text-[#B3D5F1] tracking-wider">
                  8472910394
                </p>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="card p-6 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h2 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1B3D59]" /> Upload New Payment Slip
              </h2>
              <span className="text-xs font-bold text-[#1B3D59]">
                Package Due: Rs. {student?.package?.priceTotal?.toLocaleString() || '45,000'}
              </span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Amount Paid (LKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-bold text-sm outline-none focus:border-[#1B3D59]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Paying Bank Name:
                  </label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl outline-none font-medium cursor-pointer focus:border-[#1B3D59]"
                  >
                    <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                    <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                    <option value="People's Bank">People's Bank</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#152026] mb-1">
                    Bank Reference / Transaction ID (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-TXN-98471203"
                    value={formData.transactionReference}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionReference: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                  />
                </div>
              </div>

              {/* File Drop Area */}
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Upload Slip Image or PDF <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#D4EEF8] hover:border-[#1B3D59] rounded-2xl p-6 text-center transition-colors bg-[#FAFCFE] cursor-pointer">
                  <input
                    type="file"
                    id="slipFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="slipFile" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-[#1B3D59] mx-auto" />
                    <p className="font-semibold text-[#152026] text-xs">
                      {selectedFile ? selectedFile.name : 'Click to select bank payment slip file'}
                    </p>
                    <p className="text-[11px] text-[#6A97C0]">JPG, PNG, WEBP, or PDF up to 5MB</p>
                  </label>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {previewUrl && (
                <div className="p-3.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl flex items-center gap-3">
                  {selectedFile?.type === 'application/pdf' || selectedFile?.name?.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Slip Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-[#D4EEF8]"
                    />
                  )}
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-bold text-[#152026] truncate">{selectedFile?.name}</p>
                    <p className="text-[11px] text-[#6A97C0]">
                      {selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1B3D59] hover:underline inline-flex items-center gap-1 font-bold mt-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" /> View Selected Document
                    </a>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full bg-[#1B3D59] hover:bg-[#152026] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading Slip...' : 'Submit Payment Slip for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Status & Payment Log */}
        <div className="space-y-6">
          {/* Latest Status Pill Card */}
          <div className="card p-5 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B3D59]" /> Current Verification Status
            </h3>

            {latestPayment ? (
              <div className="p-4 rounded-2xl border border-[#D4EEF8] bg-[#FAFCFE] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#152026]">Latest Submission:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                      latestPayment.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : latestPayment.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                    }`}
                  >
                    {latestPayment.status}
                  </span>
                </div>
                <p className="text-[#6A97C0]">
                  Amount: <strong className="text-[#152026]">Rs. {latestPayment.amount?.toLocaleString()}</strong>
                </p>
                <p className="text-[#6A97C0]">
                  Date: {latestPayment.uploadedAt ? format(new Date(latestPayment.uploadedAt), 'MMM dd, yyyy') : 'N/A'}
                </p>
                {latestPayment.rejectionReason && (
                  <p className="text-rose-600 font-semibold mt-1">
                    Note: {latestPayment.rejectionReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#6A97C0] italic">No payment slips uploaded yet.</p>
            )}
          </div>

          {/* Payment History List */}
          <div className="card p-5 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#152026]">Payment Submission Log</h3>
            {loading ? (
              <p className="text-xs text-[#6A97C0]">Loading history...</p>
            ) : payments.length === 0 ? (
              <p className="text-xs text-[#6A97C0] italic">No previous payments.</p>
            ) : (
              <div className="divide-y divide-[#D4EEF8] text-xs">
                {payments.map((p) => (
                  <div key={p._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#152026]">{p.bankName}</p>
                      <p className="text-[10px] text-[#6A97C0]">
                        {p.uploadedAt ? format(new Date(p.uploadedAt), 'MMM dd, yyyy') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#152026]">Rs. {p.amount?.toLocaleString()}</span>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 border capitalize ${
                            p.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : p.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
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
