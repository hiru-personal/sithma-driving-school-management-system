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
        className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white border border-[#D4EEF8] rounded-3xl p-5 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6A97C0] hover:text-[#152026] rounded-full bg-[#D4EEF8]/50 hover:bg-[#D4EEF8] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" />
            Step 1: Choose Your Enrollment Category
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#152026] tracking-tight">
            How Would You Like to Register?
          </h2>
          <p className="text-sm text-[#475569] mt-2 max-w-lg mx-auto">
            Please select the enrollment category that matches your current licensing status under Department of Motor Traffic (DMT) regulations.
          </p>
        </div>

        {/* 2 Big Distinct Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Option A: Type 1 */}
          <div
            onClick={() => handleSelect('Type 1')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-white border-2 border-[#D4EEF8] hover:border-[#1B3D59] transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30">
                  Type 1
                </span>
              </div>

              <h3 className="text-lg font-black text-[#152026] group-hover:text-[#1B3D59] transition-colors">
                Full Course Learner
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                For new beginners who have not yet cleared DMT medical or written theory exams.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-[#D4EEF8] pt-3 text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
                  <span>DMT Medical & Learner Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
                  <span>Written Theory Exam Prep & Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
                  <span>Full Course Practical Driving Training</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-[#1B3D59] group-hover:translate-x-1 transition-transform">
              <span>Select Full Course</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option B: Type 2 */}
          <div
            onClick={() => handleSelect('Type 2')}
            className="group relative cursor-pointer p-6 rounded-2xl bg-white border-2 border-amber-300 hover:border-amber-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col justify-between text-left"
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3EED8] border border-amber-300 text-amber-700 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300">
                  Type 2
                </span>
              </div>

              <h3 className="text-lg font-black text-[#152026] group-hover:text-amber-800 transition-colors">
                Trial Only Learner
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                For students who have already passed DMT medical & theory exams elsewhere.
              </p>

              {/* Inclusions */}
              <div className="mt-4 space-y-2 border-t border-[#D4EEF8] pt-3 text-xs text-[#475569]">
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

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
              <span>Select Trial Only</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-6 p-3 rounded-xl bg-[#D4EEF8]/40 border border-[#D4EEF8] flex items-center gap-3 text-xs text-[#1B3D59]">
          <ShieldCheck className="w-4 h-4 text-[#1B3D59] flex-shrink-0" />
          <span>
            Under DMT Sri Lanka regulations, all applicants must be 18 years of age or older at the time of registration.
          </span>
        </div>
      </div>
    </div>
  );
}
