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
      {/* Light Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Step 1: Choose Your Enrollment Category
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How Would You Like to Register?
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            Please select the enrollment category that matches your current licensing status under Department of Motor Traffic (DMT) regulations.
          </p>
        </div>

        {/* 2 Big Distinct Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Option A: Type 1 */}
          <div
            onClick={() => handleSelect('Type 1')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-slate-50/80 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Type 1
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">
                Full Course Learner
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                For new beginners who have not yet cleared DMT medical or written theory exams.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>DMT Medical & Learner Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Written Theory Exam Prep & Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Full Course Practical Driving Training</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              <span>Select Full Course</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option B: Type 2 */}
          <div
            onClick={() => handleSelect('Type 2')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-slate-50/80 border-2 border-amber-300 hover:border-amber-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Type 2
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                Trial Only Learner
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                For students who have already passed DMT medical & theory exams elsewhere.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>DMT Exam Cleared Elsewhere</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Exclusive Trial Driving Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Direct Trial Lesson Booking Upon Verification</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Select Trial Only</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-6 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            Under DMT Sri Lanka regulations, all applicants must be 18 years of age or older at the time of registration.
          </span>
        </div>
      </div>
    </div>
  );
}
