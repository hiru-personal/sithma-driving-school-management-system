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
      const res = await api.patch(`/students/${selectedStudent._id}/trial`, trialForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record trial attempt');
    }
  };

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Student Records & DMT Milestone Management
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Manage registrations, track DMT milestone progress, and record practical trial examination attempts.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-borderColor rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border border-borderColor rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
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
            className="px-3 py-2 border border-borderColor rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
          >
            <option value="">All Categories (Type 1 & 2)</option>
            <option value="Type1_NewLearner">Type 1 — New Learner</option>
            <option value="Type2_TrialReady">Type 2 — Trial-Ready</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-borderColor rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
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
      <div className="card p-0 overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading student database...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No students found matching your filters</p>
            <p className="text-xs text-textMuted">Try adjusting your search query or branch filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-borderColor text-textMuted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Branch & Category</th>
                  <th className="px-4 py-3">Package / Lessons</th>
                  <th className="px-4 py-3">DMT Learner Status</th>
                  <th className="px-4 py-3">Trial Attempts</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {students.map((st) => {
                  const isLicensed = st.trial?.licenseObtained;
                  const attemptsCount = st.trial?.attempts?.length || 0;
                  const isType2 = st.studentType === 'Type2_TrialReady';

                  return (
                    <tr key={st._id} className="hover:bg-primary-light/20 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-4 py-3 font-semibold text-textMain">
                        <div>{st.userId?.name || 'Unknown Student'}</div>
                        <div className="text-[11px] text-textMuted font-normal">
                          {st.userId?.phone} • {st.userId?.email}
                        </div>
                      </td>

                      {/* Branch & Type */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary">{st.branch}</div>
                        <span className={`badge text-[10px] py-0 px-2 mt-0.5 ${isType2 ? 'badge-accent' : 'badge-info'}`}>
                          {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                        </span>
                      </td>

                      {/* Package */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-textMain">{st.package?.type?.replace('_', ' ')}</div>
                        <div className="text-[11px] text-textMuted">
                          {st.package?.lessonsUsed || 0} / {st.package?.lessonsTotal || 15} Lessons Used
                        </div>
                      </td>

                      {/* DMT Learner Exam */}
                      <td className="px-4 py-3">
                        {isType2 ? (
                          <span className="badge badge-success text-[10px]">Pre-Cleared</span>
                        ) : st.dmtDates?.learnerExamPassed ? (
                          <span className="badge badge-success text-[10px]">Passed Written Exam</span>
                        ) : st.dmtDates?.learnerExamDate ? (
                          <span className="badge badge-warning text-[10px]">
                            Exam: {format(new Date(st.dmtDates.learnerExamDate), 'MMM dd')}
                          </span>
                        ) : (
                          <span className="badge bg-slate-100 text-slate-500 text-[10px]">Date Awaiting</span>
                        )}
                      </td>

                      {/* Trial Attempts */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((num) => {
                            const att = st.trial?.attempts?.[num - 1];
                            const isPass = att?.result === 'passed';
                            const isFail = att?.result === 'failed';

                            return (
                              <span
                                key={num}
                                className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                                  isPass
                                    ? 'bg-success text-white'
                                    : isFail
                                    ? 'bg-danger text-white'
                                    : att
                                    ? 'bg-warning text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {num}
                              </span>
                            );
                          })}
                        </div>
                        {isLicensed && (
                          <span className="text-[10px] font-bold text-success flex items-center gap-0.5 mt-0.5">
                            <Award className="w-3 h-3" /> Licensed
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            isLicensed
                              ? 'badge-success'
                              : st.registrationStatus === 'registered'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          {isLicensed ? 'Licensed' : st.registrationStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openStudentModal(st, 'edit_dmt')}
                            className="p-1.5 rounded bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors"
                            title="Update DMT Dates"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openStudentModal(st, 'record_trial')}
                            className="p-1.5 rounded bg-accent-light text-accent-dark hover:bg-accent hover:text-white transition-colors"
                            title="Record Trial Attempt"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Modal for DMT Dates & Trial Record */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <div>
                <h3 className="text-base font-bold text-textMain">
                  {modalMode === 'record_trial' ? 'Record Practical Trial Exam Result' : 'Manage DMT Milestones'}
                </h3>
                <p className="text-xs text-textMuted">
                  Student: <strong>{selectedStudent.userId?.name}</strong> ({selectedStudent.branch} Branch)
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode 1: Edit DMT Dates */}
            {modalMode === 'edit_dmt' && (
              <form onSubmit={handleSaveDmtDates} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    DMT Medical Examination Date:
                  </label>
                  <input
                    type="date"
                    value={dmtForm.medicalExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, medicalExamDate: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="staffMedPassed"
                    checked={dmtForm.medicalExamPassed}
                    onChange={(e) => setDmtForm({ ...dmtForm, medicalExamPassed: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="staffMedPassed" className="font-semibold text-textMain">
                    Medical Exam Passed
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    DMT Learner Written Exam Date:
                  </label>
                  <input
                    type="date"
                    value={dmtForm.learnerExamDate}
                    onChange={(e) => setDmtForm({ ...dmtForm, learnerExamDate: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="staffExamPassed"
                    checked={dmtForm.learnerExamPassed}
                    onChange={(e) => setDmtForm({ ...dmtForm, learnerExamPassed: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="staffExamPassed" className="font-semibold text-textMain">
                    Learner Written Exam Passed (Enables Trial Lessons)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary py-2 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                    Save DMT Milestone
                  </button>
                </div>
              </form>
            )}

            {/* Mode 2: Record Practical Trial Attempt */}
            {modalMode === 'record_trial' && (
              <form onSubmit={handleRecordTrial} className="space-y-4 text-xs">
                <div className="p-3 bg-neutralBg rounded-lg border border-borderColor space-y-1">
                  <div className="flex justify-between">
                    <span>Attempts Used:</span>
                    <span className="font-bold text-primary">
                      {selectedStudent.trial?.attempts?.length || 0} of 3 Max Attempts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Attempt Number:</span>
                    <span className="font-bold text-accent-dark">
                      Attempt #{(selectedStudent.trial?.attempts?.length || 0) + 1}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    Trial Examination Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={trialForm.attemptDate}
                    onChange={(e) => setTrialForm({ ...trialForm, attemptDate: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    Examination Outcome:
                  </label>
                  <select
                    value={trialForm.result}
                    onChange={(e) => setTrialForm({ ...trialForm, result: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="passed">✅ PASSED (Issue License & Complete)</option>
                    <option value="failed">❌ FAILED (Schedule Retake Attempt)</option>
                    <option value="pending">⏳ PENDING (Awaiting Official Result)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">
                    Examiner / Driving Instructor Notes:
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Reverse parking cleared cleanly, road observation satisfactory."
                    value={trialForm.examinerNotes}
                    onChange={(e) => setTrialForm({ ...trialForm, examinerNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary py-2 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-accent py-2 px-4 text-xs font-bold text-textMain">
                    Submit Trial Result
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
