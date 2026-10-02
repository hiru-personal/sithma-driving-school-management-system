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

export default function DmtMilestoneTimeline({ student }) {
  if (!student) return null;

  const { studentType, dmtDates = {}, trial = {} } = student;
  const isType2 = studentType === 'Type2_TrialReady';

  // Calculate Trial deadline status
  let deadlineWarning = null;
  if (trial.deadlineDate) {
    const daysLeft = differenceInDays(new Date(trial.deadlineDate), new Date());
    const isOverdue = isPast(new Date(trial.deadlineDate)) && !trial.licenseObtained;

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
      date: student.createdAt ? format(new Date(student.createdAt), 'MMM dd, yyyy') : 'Completed',
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
              ? `Scheduled for: ${format(new Date(dmtDates.medicalExamDate), 'MMM dd, yyyy')}`
              : 'Awaiting DMT Medical Date',
            date: dmtDates.medicalExamDate
              ? format(new Date(dmtDates.medicalExamDate), 'MMM dd, yyyy')
              : 'Pending',
            status: dmtDates.medicalExamPassed ? 'completed' : dmtDates.medicalExamDate ? 'in_progress' : 'pending',
            icon: Stethoscope,
          },
          {
            id: 'learner_exam',
            title: 'DMT Learner Written Exam',
            desc: dmtDates.learnerExamPassed
              ? `Passed on ${format(new Date(dmtDates.learnerExamPassedDate || dmtDates.learnerExamDate), 'MMM dd, yyyy')}`
              : dmtDates.learnerExamDate
              ? `Scheduled for: ${format(new Date(dmtDates.learnerExamDate), 'MMM dd, yyyy')}`
              : 'Awaiting DMT Written Exam Date',
            date: dmtDates.learnerExamPassedDate
              ? format(new Date(dmtDates.learnerExamPassedDate), 'MMM dd, yyyy')
              : dmtDates.learnerExamDate
              ? format(new Date(dmtDates.learnerExamDate), 'MMM dd, yyyy')
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
        : trial.eligibleFromDate && new Date() < new Date(trial.eligibleFromDate)
        ? `Eligible for Trial from: ${format(new Date(trial.eligibleFromDate), 'MMM dd, yyyy')} (3-month DMT waiting period)`
        : `Attempts Used: ${trial.attemptsUsed || 0} of 3 maximum attempts`,
      date: trial.deadlineDate
        ? `Deadline: ${format(new Date(trial.deadlineDate), 'MMM dd, yyyy')}`
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
        ? `Issued on ${format(new Date(trial.licenseIssuedDate || new Date()), 'MMM dd, yyyy')}`
        : 'Awarded upon passing the Practical Trial',
      date: trial.licenseObtained ? 'Finalized' : 'Pending Trial Pass',
      status: trial.licenseObtained ? 'completed' : 'pending',
      icon: Award,
    },
  ];

  return (
    <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 space-y-6 shadow-sm text-[#152026]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4EEF8] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#152026] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1B3D59]" /> DMT Regulatory Milestone Stepper
          </h2>
          <p className="text-xs text-[#6A97C0] font-medium">
            {isType2
              ? 'Type 2 (Trial-Ready) Track — Learner Exam pre-cleared, tracking practical trial attempts & 1.5-yr window'
              : 'Type 1 (New Learner) Track — Tracking Medical, Learner Exam, and Practical Trial Progression'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] text-xs font-bold">
            {student.branch} Branch
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 text-xs font-bold">
            {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
          </span>
        </div>
      </div>

      {/* Deadline Alert Banner */}
      {deadlineWarning && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
            deadlineWarning.type === 'danger'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#1B3D59]" />
          <span>{deadlineWarning.message}</span>
        </div>
      )}

      {/* Timeline Stepper */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D4EEF8]">
        {milestones.map((m) => {
          const Icon = m.icon;
          const isCompleted = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';

          return (
            <div key={m.id} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : isInProgress
                    ? 'bg-[#1B3D59] text-white border-[#6A97C0]'
                    : 'bg-[#FAFCFE] text-[#6A97C0] border-[#D4EEF8]'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              {/* Step Content */}
              <div className="bg-[#FAFCFE] p-4 rounded-2xl border border-[#D4EEF8] hover:border-[#1B3D59] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-[#152026] flex items-center gap-2">
                    {m.title}
                  </h3>
                  <span className="text-xs text-[#6A97C0] font-semibold">{m.date}</span>
                </div>
                <p className="text-xs text-[#152026]/80 leading-relaxed font-medium">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
