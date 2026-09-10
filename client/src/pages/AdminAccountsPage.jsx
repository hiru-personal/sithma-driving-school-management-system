import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Lock,
  CheckCircle2,
  XCircle,
  KeyRound,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [staffForm, setStaffForm] = useState({
    name: '',
    nic: '',
    phone: '',
    branch: 'Maharagama',
    username: '',
    email: '',
    initialPassword: 'TempPassword@123',
  });

  const [instructorForm, setInstructorForm] = useState({
    name: '',
    nic: '',
    phone: '',
    branch: 'Maharagama',
    vehicleCategories: 'Light',
    username: '',
    email: '',
    initialPassword: 'TempPassword@123',
  });

  const [tempPassword, setTempPassword] = useState('TempResetPass#2026');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/accounts', {
        params: { role: roleFilter, status: statusFilter, search },
      });
      if (res.data.success) {
        setAccounts(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to load accounts list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [roleFilter, statusFilter]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/accounts/staff', staffForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowStaffModal(false);
        setStaffForm({
          name: '',
          nic: '',
          phone: '',
          branch: 'Maharagama',
          username: '',
          email: '',
          initialPassword: 'TempPassword@123',
        });
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/accounts/instructor', instructorForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowInstructorModal(false);
        setInstructorForm({
          name: '',
          nic: '',
          phone: '',
          branch: 'Maharagama',
          vehicleCategories: 'Light',
          username: '',
          email: '',
          initialPassword: 'TempPassword@123',
        });
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create instructor account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/admin/accounts/${user._id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Account marked as ${nextStatus}`);
        setAccounts((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleForceResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/admin/accounts/${selectedUser._id}/reset-password`, {
        tempPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowResetModal(false);
        setSelectedUser(null);
        setTempPassword('TempResetPass#2026');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to force reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Shield className="w-3.5 h-3.5" /> Administrative Authority
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2.5 drop-shadow">
            Staff & Instructor Account Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin provisioning: Create Data Entry Officer and Instructor accounts, enforce password policies, and manage lifecycle.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowStaffModal(true)}
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-4 h-4" /> + Create Staff Account
          </button>
          <button
            onClick={() => setShowInstructorModal(true)}
            className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-4 h-4" /> + Create Instructor Account
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAccounts();
          }}
          className="relative w-full md:w-96"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, username, NIC, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-white/15 text-white rounded-xl text-xs outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/90 border border-white/15 text-white rounded-xl text-xs font-semibold outline-none"
          >
            <option value="all">All Roles</option>
            <option value="staff">Data Entry Officers (Staff)</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Administrators</option>
            <option value="student">Students</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/90 border border-white/15 text-white rounded-xl text-xs font-semibold outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_verification">Pending Verification</option>
          </select>

          <button
            onClick={fetchAccounts}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card overflow-hidden shadow-card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">User / Account</th>
                <th className="py-3.5 px-4 font-bold">Role</th>
                <th className="py-3.5 px-4 font-bold">Branch</th>
                <th className="py-3.5 px-4 font-bold">NIC & Contact</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Security Flags</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-cyan-300 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      Loading system accounts...
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No accounts found matching the criteria.
                  </td>
                </tr>
              ) : (
                accounts.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-cyan-300 font-mono">
                        @{user.username || user.email.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[10px] uppercase font-bold ${
                          user.role === 'admin'
                            ? 'badge-danger'
                            : user.role === 'staff'
                            ? 'badge-info'
                            : user.role === 'instructor'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {user.role === 'staff' ? 'Data Entry Officer' : user.role}
                      </span>
                      {user.role === 'instructor' && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Teaches: <strong className="text-slate-200">{user.teachingCategories || 'Light'}</strong>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {user.branch || 'Maharagama'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-200">{user.nic || '—'}</div>
                      <div className="text-[11px] text-slate-400">{user.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`badge text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'badge-success'
                            : user.status === 'pending_verification'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {user.mustChangePassword ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                          Password Change Pending
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Verified Password
                        </span>
                      )}
                      {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                        <div className="text-[9px] text-rose-400 font-bold">
                          🔒 Locked until {new Date(user.lockedUntil).toLocaleTimeString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            user.status === 'active'
                              ? 'border-rose-400/40 text-rose-300 hover:bg-rose-500/20'
                              : 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
                        title="Force Reset Password"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Staff Account */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-cyan-400/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" /> Create Staff Account (Data Entry Officer)
              </h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only Administrators can create Data Entry Officer accounts. Upon creation, status is Active immediately, and the officer will be forced to change their password on first login.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimali Fernando"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    NIC Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 198854321098"
                    value={staffForm.nic}
                    onChange={(e) => setStaffForm({ ...staffForm, nic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0772000002"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assigned Branch <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={staffForm.branch}
                    onChange={(e) => setStaffForm({ ...staffForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Desired Username <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. nimali.staff"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Temporary Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.initialPassword}
                    onChange={(e) => setStaffForm({ ...staffForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 font-bold"
                >
                  {submitting ? 'Creating...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Instructor Account */}
      {showInstructorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-accent/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" /> Create Instructor Account
              </h3>
              <button
                onClick={() => setShowInstructorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Instructors are provisioned directly by Admin with teaching qualifications. They can only view their own driving lesson schedules.
            </p>

            <form onSubmit={handleCreateInstructor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samantha Perera"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    NIC Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 198422334455"
                    value={instructorForm.nic}
                    onChange={(e) => setInstructorForm({ ...instructorForm, nic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0713000003"
                    value={instructorForm.phone}
                    onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assigned Branch <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={instructorForm.branch}
                    onChange={(e) => setInstructorForm({ ...instructorForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Teaching Categories <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={instructorForm.vehicleCategories}
                    onChange={(e) => setInstructorForm({ ...instructorForm, vehicleCategories: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none font-bold text-accent"
                  >
                    <option value="Light">Light Vehicle (Car, Bike, Three-Wheeler)</option>
                    <option value="Heavy">Heavy Vehicle (Bus, Lorry)</option>
                    <option value="Both">Both Light & Heavy Vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Desired Username <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. instructor.samantha"
                    value={instructorForm.username}
                    onChange={(e) => setInstructorForm({ ...instructorForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Temporary Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.initialPassword}
                    onChange={(e) => setInstructorForm({ ...instructorForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowInstructorModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent text-xs py-2 px-5 font-bold"
                >
                  {submitting ? 'Creating...' : 'Provision Instructor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Force Reset Password */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-accent" /> Force Password Reset
              </h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reset the password for <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email}). The user will be forced to change this temporary password upon their next login.
            </p>

            <form onSubmit={handleForceResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Temporary Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent text-xs py-2 px-4 font-bold"
                >
                  {submitting ? 'Resetting...' : 'Set Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
