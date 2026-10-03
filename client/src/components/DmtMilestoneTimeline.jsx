import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Stethoscope,
  BookOpen,
  Car,
  Award,
  Calendar,
} from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy', fallback = '') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

export default function DmtMilestoneTimeline({ student }) {
  if (!student) return null;

  const { studentType, dmtDates = {}, trial = {} } = student;
  const isType2 = studentType === 'Type2_TrialReady';

  // Calculate Trial deadline status
  let deadlineWarning = null;
  if (trial?.deadlineDate && !isNaN(new Date(trial.deadlineDate).getTime())) {
    const deadlineObj = new Date(trial.deadlineDate);
    const daysLeft = differenceInDays(deadlineObj, new Date());
    const isOverdue = isPast(deadlineObj) && !trial.licenseObtained;

    if (isOverdue) {
      deadlineWarning = {
        type: 'danger',
        message: 'Trial 1.5-Year Deadline has expired! Please contact the branch office.',
      };
    } else if (daysLeft <= 60 && !trial.licenseObtained) {
      deadlineWarning = {
        type: 'warning',
        message: `Only ${daysLeft} days remaining before the 1.5-year DMT Trial deadline!`,
      };
    }
  }

  const milestones = [
    {
      id: 'reg',
      title: 'Registration with Sithma',
      desc: isType2 ? 'Type 2: Trial-Ready Student' : 'Type 1: New Learner Student',
      date: student.createdAt ? safeFormatDate(student.createdAt, 'MMM dd, yyyy', 'Completed') : 'Completed',
      status: 'completed',
      icon: FileText,
    },
    ...(!isType2
      ? [
          {
            id: 'medical',
            title: 'DMT Medical Exam',
            desc: dmtDates.medicalExamPassed
              ? 'Passed medical examination'
              : dmtDates.medicalExamDate
              ? `Scheduled for: ${safeFormatDate(dmtDates.medicalExamDate, 'MMM dd, yyyy', 'Pending')}`
              : 'Awaiting DMT Medical Date',
            date: dmtDates.medicalExamDate
              ? safeFormatDate(dmtDates.medicalExamDate, 'MMM dd, yyyy', 'Pending')
              : 'Pending',
            status: dmtDates.medicalExamPassed ? 'completed' : dmtDates.medicalExamDate ? 'in_progress' : 'pending',
            icon: Stethoscope,
          },
          {
            id: 'learner_exam',
            title: 'DMT Learner Written Exam',
            desc: dmtDates.learnerExamPassed
              ? `Passed on ${safeFormatDate(dmtDates.learnerExamPassedDate || dmtDates.learnerExamDate, 'MMM dd, yyyy', 'Passed')}`
              : dmtDates.learnerExamDate
              ? `Scheduled for: ${safeFormatDate(dmtDates.learnerExamDate, 'MMM dd, yyyy', 'Pending')}`
              : 'Awaiting DMT Written Exam Date',
            date: dmtDates.learnerExamPassedDate
              ? safeFormatDate(dmtDates.learnerExamPassedDate, 'MMM dd, yyyy', 'Passed')
              : dmtDates.learnerExamDate
              ? safeFormatDate(dmtDates.learnerExamDate, 'MMM dd, yyyy', 'Pending')
              : 'Pending',
            status: dmtDates.learnerExamPassed ? 'completed' : dmtDates.learnerExamDate ? 'in_progress' : 'pending',
            icon: BookOpen,
          },
        ]
      : []),
    {
      id: 'trial',
      title: 'Practical Driving Trial',
      desc: trial.licenseObtained
        ? 'Passed Trial Exam successfully!'
        : trial.eligibleFromDate && !isNaN(new Date(trial.eligibleFromDate).getTime()) && new Date() < new Date(trial.eligibleFromDate)
        ? `Eligible for Trial from: ${safeFormatDate(trial.eligibleFromDate, 'MMM dd, yyyy')} (3-month DMT waiting period)`
        : `Attempts Used: ${trial.attemptsUsed || 0} of 3 maximum attempts`,
      date: trial.deadlineDate
        ? `Deadline: ${safeFormatDate(trial.deadlineDate, 'MMM dd, yyyy', 'Pending')}`
        : 'Pending Learner Exam',
      status: trial.licenseObtained
        ? 'completed'
        : trial.attemptsUsed > 0
        ? 'in_progress'
        : dmtDates.learnerExamPassed || isType2
        ? 'in_progress'
        : 'pending',
      icon: Car,
    },
    {
      id: 'license',
      title: 'Driving License Issued',
      desc: trial.licenseObtained
        ? `Issued on ${safeFormatDate(trial.licenseIssuedDate || new Date(), 'MMM dd, yyyy', 'Finalized')}`
        : 'Awarded upon passing the Practical Trial',
      date: trial.licenseObtained ? 'Finalized' : 'Pending Trial Pass',
      status: trial.licenseObtained ? 'completed' : 'pending',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DBE2EF] pb-4">
        <div>
          <h2 className="text-lg font-black text-[#0B2447] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1B3D59]" /> DMT Regulatory Milestone Stepper
          </h2>
          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
            {isType2
              ? 'Type 2 (Trial-Ready) Track — Learner Exam pre-cleared, tracking practical trial attempts & 1.5-yr window'
              : 'Type 1 (New Learner) Track — Tracking Medical, Learner Exam, and Practical Trial Progression'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info font-bold">{student.branch} Branch</span>
          <span className={`badge ${isType2 ? 'badge-accent' : 'badge-success'} font-bold`}>
            {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
          </span>
        </div>
      </div>

      {/* Deadline Alert Banner */}
      {deadlineWarning && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold ${
            deadlineWarning.type === 'danger'
              ? 'bg-rose-50 text-rose-900 border border-rose-200'
              : 'bg-amber-50 text-amber-900 border border-amber-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{deadlineWarning.message}</span>
        </div>
      )}

      {/* Timeline Stepper */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#B3D5F1]">
        {milestones.map((m) => {
          const Icon = m.icon;
          const isCompleted = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';

          return (
            <div key={m.id} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : isInProgress
                    ? 'bg-[#1B3D59] text-white border-blue-300 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              {/* Step Content */}
              <div className="bg-[#FAFBFC] p-4 rounded-xl border border-[#D4EEF8] hover:border-[#6A97C0] transition-colors shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-black text-sm text-[#0B2447] flex items-center gap-2">
                    {m.title}
                  </h3>
                  <span className="text-xs text-[#1B3D59] font-black font-mono">{m.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
