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
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 mx-auto flex items-center justify-center font-black shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            Set New Password
          </h2>
          <p className="text-xs text-slate-400">
            Create a strong new password for your Sithma student account.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Password Reset Complete</h3>
              <p className="text-slate-300 leading-relaxed">
                Your account password has been updated securely. You can now sign in using your new credentials.
              </p>
            </div>
            <Link to="/login" className="btn-accent w-full py-3 text-xs font-bold block">
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">
                Security Reset Token <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste the 64-char reset token"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-xs font-mono outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">
                New Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars with upper, lower, and digit"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-300">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3 font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}{' '}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 border-t border-white/10">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5"
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
