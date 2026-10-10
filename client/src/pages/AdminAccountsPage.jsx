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
  Trash2,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dbInfo, setDbInfo] = useState({
    connected: true,
    target: 'Local MongoDB (127.0.0.1)',
    name: 'sithma-driving-school',
  });

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [userForm, setUserForm] = useState({
    name: '',
    nic: '',
    phone: '',
    branch: 'Maharagama',
    role: 'staff',
    username: '',
    email: '',
    vehicleCategories: 'Light',
    initialPassword: 'TempPassword@123',
    studentType: 'Type 1',
  });

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

  const checkDbHealth = async () => {
    try {
      const res = await api.get('/health');
      if (res.data?.database) {
        setDbInfo(res.data.database);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAccounts();
    checkDbHealth();
  }, [roleFilter, statusFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/accounts', userForm);
      if (res.data.success) {
        toast.success(res.data.message || 'User account created and saved to database successfully.');
        const savedUser = res.data.user;
        if (savedUser) {
          const normalized = {
            ...savedUser,
            _id: savedUser._id || savedUser.id,
            id: savedUser._id || savedUser.id,
            createdAt: savedUser.createdAt || new Date().toISOString(),
          };
          setAccounts((prev) => [normalized, ...prev.filter((u) => (u._id || u.id) !== normalized._id)]);
        }
        setShowUserModal(false);
        setUserForm({
          name: '',
          nic: '',
          phone: '',
          branch: 'Maharagama',
          role: 'staff',
          username: '',
          email: '',
          vehicleCategories: 'Light',
          initialPassword: 'TempPassword@123',
          studentType: 'Type 1',
        });
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/accounts/staff', staffForm);
      if (res.data.success) {
        toast.success(res.data.message);
        const savedUser = res.data.user;
        if (savedUser) {
          const normalized = {
            ...savedUser,
            _id: savedUser._id || savedUser.id,
            id: savedUser._id || savedUser.id,
            createdAt: savedUser.createdAt || new Date().toISOString(),
          };
          setAccounts((prev) => [normalized, ...prev.filter((u) => (u._id || u.id) !== normalized._id)]);
        }
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
        const savedUser = res.data.user;
        if (savedUser) {
          const normalized = {
            ...savedUser,
            _id: savedUser._id || savedUser.id,
            id: savedUser._id || savedUser.id,
            createdAt: savedUser.createdAt || new Date().toISOString(),
          };
          setAccounts((prev) => [normalized, ...prev.filter((u) => (u._id || u.id) !== normalized._id)]);
        }
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
        toast.success(res.data.message || `Account marked as ${nextStatus}`);
        setAccounts((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, ...res.data.user, status: nextStatus } : u
          )
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

  const handleDeleteAccount = async (user) => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/accounts/${user._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Account deleted successfully');
        setAccounts((prev) => prev.filter((u) => u._id !== user._id));
        setDeleteConfirmUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/40 text-[#1B3D59] font-bold text-xs mb-2">
            <Shield className="w-3.5 h-3.5 text-[#1B3D59]" /> Administrative Authority
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026] font-heading flex items-center gap-2.5">
            Staff & Instructor Account Management
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 font-semibold">
            Admin provisioning: Create Data Entry Officer and Instructor accounts, enforce password policies, and manage lifecycle.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Connected: <strong>{dbInfo.target || 'Local MongoDB (127.0.0.1:27017)'}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4EEF8]/70 border border-[#6A97C0]/30 text-[#1B3D59] text-[11px] font-mono font-medium">
              Database: <strong>{dbInfo.name || 'sithma-driving-school'}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
              Live Accounts in DB: <strong>{accounts.length}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowUserModal(true)}
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + Create User
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + Staff Account
          </button>
          <button
            onClick={() => setShowInstructorModal(true)}
            className="bg-[#6A97C0] hover:bg-[#1B3D59] text-white text-xs py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + Instructor Account
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#D4EEF8] shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAccounts();
          }}
          className="relative w-full md:w-96"
        >
          <Search className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, username, NIC, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#D4EEF8] text-[#152026] placeholder-[#6A97C0]/70 rounded-xl text-xs outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1] transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs font-semibold outline-none focus:border-[#1B3D59]"
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
            className="px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl text-xs font-semibold outline-none focus:border-[#1B3D59]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_verification">Pending Verification</option>
          </select>

          <button
            onClick={fetchAccounts}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 font-bold"
            title="Refresh List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-[#D4EEF8] rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-[#1B3D59] text-white uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-[#D4EEF8] text-[#152026]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#1B3D59] font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" />
                      Loading system accounts...
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#6A97C0] font-medium">
                    No accounts found matching the criteria.
                  </td>
                </tr>
              ) : (
                accounts.map((user) => (
                  <tr key={user._id} className="hover:bg-[#D4EEF8]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#152026] text-sm">{user.name}</div>
                      <div className="text-[11px] text-[#1B3D59] font-mono font-semibold">
                        @{user.username || user.email.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">{user.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                          user.role === 'admin'
                            ? 'bg-[#152026] text-white'
                            : user.role === 'staff'
                            ? 'bg-[#B3D5F1] text-[#1B3D59] border border-[#6A97C0]/40'
                            : user.role === 'instructor'
                            ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30'
                            : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30'
                        }`}
                      >
                        {user.role === 'staff' ? 'Data Entry Officer' : user.role}
                      </span>
                      {user.role === 'instructor' && (
                        <div className="text-[10px] text-slate-600 mt-1 font-medium">
                          Teaches: <strong className="text-[#152026]">{user.teachingCategories || 'Light'}</strong>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#152026]">
                      {user.branch || 'Maharagama'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-[#152026]">{user.nic || '—'}</div>
                      <div className="text-[11px] text-slate-700 font-medium">{user.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : user.status === 'pending_verification'
                            ? 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {user.mustChangePassword ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40 text-[9px] font-bold">
                          Password Change Pending
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Verified Password
                        </span>
                      )}
                      {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                        <div className="text-[9px] text-rose-600 font-bold">
                          🔒 Locked until {new Date(user.lockedUntil).toLocaleTimeString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              user.status === 'active'
                                ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                                : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
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
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#6A97C0]/40 text-[#1B3D59] hover:bg-[#D4EEF8] transition-colors cursor-pointer"
                          title="Force Reset Password"
                        >
                          Reset Password
                        </button>

                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteConfirmUser(user)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title={user.role === 'student' ? 'Permanently Delete Student Account' : 'Permanently Delete Account'}
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Any User Account */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-white border border-[#D4EEF8] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1B3D59]" /> Create New User Account
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6A97C0] font-medium">
              Create and provision user accounts with role-based permissions directly into the database.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Account Role */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#152026] mb-1">
                    Account Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none font-bold focus:border-[#1B3D59]"
                  >
                    <option value="staff">Staff (Data Entry Officer)</option>
                    <option value="instructor">Driving Instructor</option>
                    <option value="student">Student / Learner</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Jayawardena"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    NIC / Passport <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 199512345678"
                    value={userForm.nic}
                    onChange={(e) => setUserForm({ ...userForm, nic: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0771234567"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Assigned Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userForm.branch}
                    onChange={(e) => setUserForm({ ...userForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                {userForm.role === 'instructor' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#152026] mb-1">
                      Teaching Vehicle Categories <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={userForm.vehicleCategories}
                      onChange={(e) => setUserForm({ ...userForm, vehicleCategories: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                    >
                      <option value="Light">Light Vehicles Only (Car / Bike / Three-Wheel)</option>
                      <option value="Heavy">Heavy Vehicles Only (Bus / Lorry)</option>
                      <option value="Both">Both Light & Heavy Vehicles</option>
                    </select>
                  </div>
                )}

                {userForm.role === 'student' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#152026] mb-1">
                      Student Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={userForm.studentType}
                      onChange={(e) => setUserForm({ ...userForm, studentType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                    >
                      <option value="Type 1">Type 1 — New Learner (Needs DMT Milestones & Theory)</option>
                      <option value="Type 2">Type 2 — Trial-Ready (Existing DMT Clearance)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kasun.j"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder={userForm.role === 'student' ? 'e.g. kasun@gmail.com' : 'e.g. kasun@sithma.lk'}
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#152026] mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.initialPassword}
                    onChange={(e) => setUserForm({ ...userForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl outline-none font-mono focus:border-[#1B3D59]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Save User to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Staff Account */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-white border border-[#D4EEF8] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1B3D59]" /> Create Staff Account (Data Entry Officer)
              </h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6A97C0] font-medium">
              Only Administrators can create Data Entry Officer accounts. Upon creation, status is Active immediately, and the officer will be forced to change their password on first login.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimali Fernando"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    NIC Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 198854321098"
                    value={staffForm.nic}
                    onChange={(e) => setStaffForm({ ...staffForm, nic: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0772000002"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Assigned Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={staffForm.branch}
                    onChange={(e) => setStaffForm({ ...staffForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Desired Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. nimali.staff"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Initial Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.initialPassword}
                    onChange={(e) => setStaffForm({ ...staffForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl outline-none font-mono focus:border-[#1B3D59]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-white border border-[#D4EEF8] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1B3D59]" /> Create Instructor Account
              </h3>
              <button
                onClick={() => setShowInstructorModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6A97C0] font-medium">
              Instructors are provisioned directly by Admin with teaching qualifications. They can only view their own driving lesson schedules.
            </p>

            <form onSubmit={handleCreateInstructor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samantha Perera"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    NIC Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 198422334455"
                    value={instructorForm.nic}
                    onChange={(e) => setInstructorForm({ ...instructorForm, nic: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0713000003"
                    value={instructorForm.phone}
                    onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Assigned Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={instructorForm.branch}
                    onChange={(e) => setInstructorForm({ ...instructorForm, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59]"
                  >
                    <option value="Maharagama">Maharagama</option>
                    <option value="Werahara">Werahara</option>
                    <option value="Delgoda">Delgoda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Teaching Categories <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={instructorForm.vehicleCategories}
                    onChange={(e) => setInstructorForm({ ...instructorForm, vehicleCategories: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#1B3D59] rounded-xl outline-none font-bold focus:border-[#1B3D59]"
                  >
                    <option value="Light">Light Vehicle (Car, Bike, Three-Wheeler)</option>
                    <option value="Heavy">Heavy Vehicle (Bus, Lorry)</option>
                    <option value="Both">Both Light & Heavy Vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#152026] mb-1">
                    Desired Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. instructor.samantha"
                    value={instructorForm.username}
                    onChange={(e) => setInstructorForm({ ...instructorForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#152026] mb-1">
                    Initial Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.initialPassword}
                    onChange={(e) => setInstructorForm({ ...instructorForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl outline-none font-mono focus:border-[#1B3D59]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
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
                  className="btn-primary text-xs py-2 px-5 font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-[#D4EEF8] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#1B3D59]" /> Force Password Reset
              </h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6A97C0] font-medium">
              Reset the password for <strong className="text-[#152026]">{selectedUser.name}</strong> ({selectedUser.email}). The user will be forced to change this temporary password upon their next login.
            </p>

            <form onSubmit={handleForceResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Temporary Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-sm font-mono outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#B3D5F1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4EEF8]">
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
                  className="btn-primary text-xs py-2 px-4 font-bold"
                >
                  {submitting ? 'Resetting...' : 'Set Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Permanent Account Deletion */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-rose-200 shadow-2xl space-y-5 text-[#152026]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-950">
                  Delete {deleteConfirmUser.role === 'student' ? 'Student' : 'User'} Account?
                </h3>
                <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
                  Permanent Removal • Non-Reversible
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-rose-900 space-y-2">
              <p>
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-rose-950 underline">{deleteConfirmUser.name}</strong>{' '}
                ({deleteConfirmUser.email || deleteConfirmUser.username})?
              </p>
              {deleteConfirmUser.role === 'student' && (
                <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                  ⚠️ This will permanently remove the student's registration, course progress, payment logs, and milestones from the school database.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteAccount(deleteConfirmUser)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
