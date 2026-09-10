import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForcePasswordChangeModal({ onComplete }) {
  const { changePassword, user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword, confirmNewPassword);
    setLoading(false);

    if (res && res.success) {
      if (onComplete) onComplete();
    } else {
      setError(res?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-400/40 shadow-[0_20px_60px_rgba(245,158,11,0.25)] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-heading">
              Password Change Required
            </h3>
            <p className="text-xs text-amber-300">
              First-time login security verification
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 leading-relaxed space-y-1">
          <p>
            Hello <strong className="text-white">{user?.name}</strong>. As a newly provisioned{' '}
            <strong className="text-amber-300 uppercase">{user?.role}</strong> account, system security policies require you to change your initial password before accessing your workspace.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Current / Initial Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter the initial temporary password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              New Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-sm outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Must be at least 8 characters with upper, lower, and numeric characters.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-xs py-2.5 px-4 font-semibold"
            >
              Sign Out
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-lg"
            >
              {loading ? 'Updating...' : 'Set New Password'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
