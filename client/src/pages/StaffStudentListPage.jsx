import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  PlusCircle,
  FileCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StaffStudentListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Student for Detail / Update Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit_dmt' | 'record_trial'

  // Form State for Recording Trial Attempt
  const [trialForm, setTrialForm] = useState({
    attemptDate: new Date().toISOString().split('T')[0],
    result: 'passed',
    examinerNotes: '',
  });

  // Form State for Updating DMT Dates
  const [dmtForm, setDmtForm] = useState({
    medicalExamDate: '',
    medicalExamPassed: false,
    learnerRegistrationDate: '',
    learnerExamDate: '',
    learnerExamPassed: false,
    learnerExamPassedDate: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (branchFilter !== 'All') params.branch = branchFilter;
      if (typeFilter) params.studentType = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      toast.error('Failed to load students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const openStudentModal = (student, mode = 'view') => {
    setSelectedStudent(student);
    setModalMode(mode);
    if (student.dmtDates) {
      setDmtForm({
        medicalExamDate: student.dmtDates.medicalExamDate
          ? student.dmtDates.medicalExamDate.split('T')[0]
          : '',
        medicalExamPassed: student.dmtDates.medicalExamPassed || false,
        learnerRegistrationDate: student.dmtDates.learnerRegistrationDate
          ? student.dmtDates.learnerRegistrationDate.split('T')[0]
          : '',
        learnerExamDate: student.dmtDates.learnerExamDate
          ? student.dmtDates.learnerExamDate.split('T')[0]
          : '',
        learnerExamPassed: student.dmtDates.learnerExamPassed || false,
        learnerExamPassedDate: student.dmtDates.learnerExamPassedDate
          ? student.dmtDates.learnerExamPassedDate.split('T')[0]
          : '',
      });
    }
    setTrialForm({
      attemptDate: new Date().toISOString().split('T')[0],
      result: 'passed',
      examinerNotes: '',
    });
  };

  const handleSaveDmtDates = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/students/${selectedStudent._id}/dmt-dates`, dmtForm);
      if (res.data.success) {
        toast.success('DMT Dates updated successfully');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update DMT dates');
    }
  };

  const handleRecordTrial = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/students/${selectedStudent._id}/trial-attempt`, trialForm);
      if (res.data.success) {
        toast.success('Trial attempt recorded successfully!');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record trial attempt');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-xs sm:text-sm mb-2.5">
            <Sparkles className="w-4 h-4" /> Learner Registry & Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading flex items-center gap-3 drop-shadow">
            <Users className="w-8 h-8 text-cyan-400" /> Student Records & DMT Milestone Management
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Manage registrations, track DMT milestone progress, and record practical trial examination attempts.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="btn-secondary text-sm py-3 px-5 self-start sm:self-auto flex items-center gap-2 font-bold shadow-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh List
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-purple-400/20 text-white placeholder-slate-400 rounded-2xl text-sm sm:text-base focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-cyan-300 outline-none font-bold"
          >
            <option value="All">All Branches</option>
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>

          {/* Student Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-slate-100 outline-none font-semibold"
          >
            <option value="">All Categories (Type 1 & 2)</option>
            <option value="Type1_NewLearner">Type 1 — New Learner</option>
            <option value="Type2_TrialReady">Type 2 — Trial-Ready</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3.5 border border-purple-400/20 rounded-2xl text-sm sm:text-base bg-slate-950/80 text-slate-100 outline-none font-semibold"
          >
            <option value="">All Progress Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="registered">Registered</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed / Licensed</option>
          </select>
        </form>
      </div>

      {/* Student List Table */}
      <div className="card p-0 overflow-hidden shadow-2xl border border-purple-300/20">
        {loading ? (
          <div className="py-16 text-center text-sm sm:text-base text-slate-300 flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading student database...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-lg font-bold text-white">No students found matching your filters</p>
            <p className="text-sm text-slate-400">Try adjusting your search query or branch filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/90 border-b border-purple-300/20 text-slate-300 uppercase text-xs sm:text-sm font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Branch & Category</th>
                  <th className="px-6 py-4">Package / Lessons</th>
                  <th className="px-6 py-4">DMT Learner Status</th>
                  <th className="px-6 py-4">Trial Attempts</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-300/15">
                {students.map((st) => {
                  const isLicensed = st.trial?.licenseObtained;
                  const attemptsCount = st.trial?.attempts?.length || 0;
                  const isType2 = st.studentType === 'Type2_TrialReady';

                  return (
                    <tr key={st._id} className="hover:bg-white/5 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="text-base sm:text-lg font-bold text-white">{st.userId?.name || 'Unknown Student'}</div>
                        <div className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                          {st.userId?.phone} • {st.userId?.email}
                        </div>
                      </td>

                      {/* Branch & Type */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm sm:text-base text-cyan-300">{st.branch}</div>
                        <span
                          className={`badge text-xs py-0.5 px-2.5 mt-1 ${
                            isType2 ? 'badge-accent' : 'badge-info'
                          }`}
                        >
                          {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                        </span>
                      </td>

                      {/* Package */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm sm:text-base text-white">{st.package?.type?.replace('_', ' ')}</div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                          {st.package?.lessonsUsed || 0} / {st.package?.lessonsTotal || 15} used
                        </div>
                      </td>

                      {/* DMT Learner Exam */}
                      <td className="px-6 py-4">
                        {isType2 ? (
                          <span className="badge badge-success text-xs">Pre-Cleared</span>
                        ) : st.dmtDates?.learnerExamPassed ? (
                          <span className="badge badge-success text-xs">Passed Written Exam</span>
                        ) : st.dmtDates?.learnerExamDate ? (
                          <span className="badge badge-warning text-xs">
                            Exam: {format(new Date(st.dmtDates.learnerExamDate), 'MMM dd')}
                          </span>
                        ) : (
                          <span className="badge badge-danger text-xs">Exam Pending</span>
                        )}
                      </td>

                      {/* Trial Attempts Pills */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((num) => {
                            const att = st.trial?.attempts?.find((a) => a.attemptNumber === num);
                            let bg = 'bg-slate-800 text-slate-400 border border-white/10';
                            if (att) {
                              bg =
                                att.result === 'passed'
                                  ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-rose-500 text-white font-black border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
                            }

                            return (
                              <span
                                key={num}
                                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${bg}`}
                                title={
                                  att
                                    ? `Attempt ${num}: ${att.result.toUpperCase()} on ${format(
                                        new Date(att.attemptDate),
                                        'MMM dd, yyyy'
                                      )}`
                                    : `Attempt ${num}: Available`
                                }
                              >
                                {num}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`badge text-xs ${
                            isLicensed
                              ? 'badge-success'
                              : st.registrationStatus === 'registered' || st.registrationStatus === 'in_progress'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          {isLicensed ? 'Licensed' : st.registrationStatus?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openStudentModal(st, 'edit_dmt')}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border border-white/20 transition-all"
                          title="Update DMT Exam Dates"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStudentModal(st, 'record_trial')}
                          disabled={isLicensed || attemptsCount >= 3}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-amber-500/20 text-amber-300 border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          title="Record Practical Trial Result"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog: Edit DMT Dates / Record Trial Attempt */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {modalMode === 'edit_dmt' ? (
                    <>
                      <Calendar className="w-5 h-5 text-cyan-400" /> DMT Regulatory Dates: {selectedStudent.userId?.name}
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5 text-amber-400" /> Record Practical Trial Attempt: {selectedStudent.userId?.name}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudent.branch} Branch • {selectedStudent.studentType}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DMT Dates Edit Form */}
            {modalMode === 'edit_dmt' && (
              <form onSubmit={handleSaveDmtDates} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    DMT Medical Examination Date:
                  </label>
                  <input
                    type="date"
                    value={dmtForm.medicalExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, medicalExamDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="staffMedPassed"
                    checked={dmtForm.medicalExamPassed}
                    onChange={(e) =>
                      setDmtForm({ ...dmtForm, medicalExamPassed: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="staffMedPassed" className="font-medium text-slate-200 cursor-pointer">
                    Passed DMT Medical Examination
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    DMT Learner Written Exam Date:
                  </label>
                  <input
                    type="date"
                    value={dmtForm.learnerExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, learnerExamDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="staffExamPassed"
                    checked={dmtForm.learnerExamPassed}
                    onChange={(e) =>
                      setDmtForm({ ...dmtForm, learnerExamPassed: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="staffExamPassed" className="font-medium text-slate-200 cursor-pointer">
                    Passed DMT Written Exam (Starts 3-Month Trial Waiting Window)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                    Save DMT Changes
                  </button>
                </div>
              </form>
            )}

            {/* Practical Trial Result Form */}
            {modalMode === 'record_trial' && (
              <form onSubmit={handleRecordTrial} className="space-y-4 text-xs">
                <div className="p-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> DMT 3-Attempt Rule:
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Current attempts recorded: {selectedStudent.trial?.attempts?.length || 0} of 3 maximum allowed attempts.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Practical Trial Examination Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={trialForm.attemptDate}
                    onChange={(e) => setTrialForm({ ...trialForm, attemptDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trial Outcome:</label>
                  <select
                    value={trialForm.result}
                    onChange={(e) => setTrialForm({ ...trialForm, result: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white font-bold rounded-xl"
                  >
                    <option value="passed">PASSED (Issue Driver's License)</option>
                    <option value="failed">FAILED (Requires Re-trial Scheduling)</option>
                    <option value="absent">ABSENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Examiner Notes / Feedback:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Reverse parking cleared, minor observation on lane switching..."
                    value={trialForm.examinerNotes}
                    onChange={(e) => setTrialForm({ ...trialForm, examinerNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-accent text-xs py-2 px-5 font-bold">
                    Record Trial Result
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
