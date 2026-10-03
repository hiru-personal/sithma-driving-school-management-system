import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
        confirmNewPassword,
      });

      if (res.data.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-white border border-[#D4EEF8] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#152026]">
            Set New Password
          </h2>
          <p className="text-xs text-[#6A97C0]">
            Create a strong new password for your Sithma student account.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-[#152026]">Password Reset Complete</h3>
              <p className="text-emerald-950/80 leading-relaxed">
                Your account password has been updated securely. You can now sign in using your new credentials.
              </p>
            </div>
            <Link to="/login" className="btn-primary w-full py-3 text-xs font-bold block shadow-sm">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#152026]">
                Security Reset Token <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste the reset token"
                className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-xs font-mono outline-none focus:border-[#1B3D59] placeholder:text-[#6A97C0]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#152026]">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars with upper, lower, and digit"
                className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-sm outline-none focus:border-[#1B3D59] placeholder:text-[#6A97C0]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#152026]">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-sm outline-none focus:border-[#1B3D59] placeholder:text-[#6A97C0]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}{' '}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 border-t border-[#D4EEF8]">
              <Link
                to="/login"
                className="text-xs text-[#6A97C0] hover:text-[#152026] inline-flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
