import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenReceived, setTokenReceived] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setSubmitted(true);
        if (res.data.resetToken) {
          setTokenReceived(res.data.resetToken);
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to generate reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-white border border-[#D4EEF8] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] mx-auto flex items-center justify-center shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#152026]">
            Forgot Your Password?
          </h2>
          <p className="text-xs text-[#6A97C0]">
            Self-service secure password recovery for Sithma learners.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset Token Generated</span>
              </div>
              <p className="text-emerald-950/80 leading-relaxed">
                If an account matches <strong className="text-[#152026]">{email}</strong>, a secure one-time password reset token has been issued with a 1-hour validity window.
              </p>
            </div>

            {tokenReceived && (
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] text-xs space-y-2">
                <span className="text-[#6A97C0] font-bold block">
                  Your Security Reset Token:
                </span>
                <code className="block p-2.5 rounded-xl bg-white font-mono text-[#1B3D59] font-bold text-xs break-all select-all border border-[#D4EEF8]">
                  {tokenReceived}
                </code>
                <div className="pt-2">
                  <Link
                    to={`/reset-password?token=${tokenReceived}`}
                    className="btn-primary w-full py-2.5 text-xs font-bold text-center block shadow-sm"
                  >
                    Proceed to Reset Password →
                  </Link>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#6A97C0] hover:text-[#152026] inline-flex items-center gap-1.5 font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#152026]">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-sm focus:border-[#1B3D59] outline-none placeholder:text-[#6A97C0]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Generating Token...' : 'Send Reset Instructions'}{' '}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 border-t border-[#D4EEF8]">
              <Link
                to="/login"
                className="text-xs text-[#6A97C0] hover:text-[#152026] inline-flex items-center gap-1.5 font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
