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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#D4EEF8] shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#152026]">
              Password Change Required
            </h3>
            <p className="text-xs text-[#6A97C0] font-bold">
              First-time login security verification
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/30 text-xs text-[#152026] leading-relaxed space-y-1">
          <p>
            Hello <strong className="text-[#152026]">{user?.name}</strong>. As a newly provisioned{' '}
            <strong className="text-[#1B3D59] uppercase">{user?.role}</strong> account, system security policies require you to change your initial password before accessing your workspace.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#152026] mb-1">
              Current / Initial Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter the initial temporary password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] text-sm outline-none focus:border-[#1B3D59]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#152026] mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] text-sm outline-none focus:border-[#1B3D59]"
            />
            <p className="text-[10px] text-[#6A97C0] mt-1">
              Must be at least 8 characters with upper, lower, and numeric characters.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#152026] mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] text-sm outline-none focus:border-[#1B3D59]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-xs py-2.5 px-4 font-bold"
            >
              Sign Out
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-sm"
            >
              {loading ? 'Updating...' : 'Set New Password'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
