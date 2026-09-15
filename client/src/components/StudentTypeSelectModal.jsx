import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  X,
  ShieldCheck,
  Sparkles,
  Car,
  FileCheck,
} from 'lucide-react';

export default function StudentTypeSelectModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (type) => {
    onClose();
    navigate(`/register?type=${encodeURIComponent(type)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-purple-400/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        {/* Glow accents */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Step 1: Choose Your Enrollment Category
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Would You Like to Register?
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Please select the enrollment category that matches your current licensing status under Department of Motor Traffic (DMT) regulations.
          </p>
        </div>

        {/* 2 Big Distinct Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Option A: Type 1 */}
          <div
            onClick={() => handleSelect('Type 1')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  Type 1
                </span>
              </div>

              <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                Full Course Learner
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                For new beginners who have not yet cleared DMT medical or written theory exams.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>DMT Medical & Learner Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Written Theory Exam Prep & Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Full Course Practical Driving Training</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
              <span>Select Full Course</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option B: Type 2 */}
          <div
            onClick={() => handleSelect('Type 2')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-2 border-amber-500/30 hover:border-amber-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Type 2
                </span>
              </div>

              <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                Trial Only Learner
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                For students who have already passed DMT medical & theory exams elsewhere.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>DMT Exam Cleared Elsewhere</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Exclusive Trial Driving Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Direct Trial Lesson Booking Upon Verification</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>Select Trial Only</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-6 p-3 rounded-xl bg-purple-900/20 border border-purple-400/20 flex items-center gap-3 text-xs text-purple-200">
          <ShieldCheck className="w-4 h-4 text-purple-300 flex-shrink-0" />
          <span>
            Under DMT Sri Lanka regulations, all applicants must be 18 years of age or older at the time of registration.
          </span>
        </div>
      </div>
    </div>
  );
}
