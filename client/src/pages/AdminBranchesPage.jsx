import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import {
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
  UserCheck,
  UserPlus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Active / Selected Branch
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    code: '',
    address: '',
    contactPhone: '',
    email: '',
    manager: '',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Member Assignment State
  const [branchMembersData, setBranchMembersData] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberRoleFilter, setMemberRoleFilter] = useState('all'); // 'all' | 'student' | 'instructor' | 'staff'
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [assigningMembers, setAssigningMembers] = useState(false);

  // Fetch all branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches', {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        },
      });
      if (res.data?.success) {
        setBranches(res.data.branches || []);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch branch list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [statusFilter]);

  // Handle Search Input (with manual refresh or debounce)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBranches();
  };

  // Filtered branches by search query client-side as well
  const filteredBranches = useMemo(() => {
    if (!search.trim()) return branches;
    const q = search.toLowerCase().trim();
    return branches.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.contactPhone?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.manager?.toLowerCase().includes(q)
    );
  }, [branches, search]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      contactPhone: branch.contactPhone || '',
      email: branch.email || '',
      manager: branch.manager || '',
      status: branch.status || 'Active',
    });
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (branch) => {
    setSelectedBranch(branch);
    setShowViewModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  // Open Assign Members Modal
  const openAssignModal = async (branch) => {
    setSelectedBranch(branch);
    setSelectedMemberIds([]);
    setBranchMembersData(null);
    setShowAssignModal(true);
    setLoadingMembers(true);
    try {
      const res = await api.get(`/branches/${branch._id}/members`);
      if (res.data?.success) {
        setBranchMembersData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load branch members');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Handle Create Submit
  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim() || !formData.contactPhone.trim()) {
      toast.error('Please fill in all required fields (Name, Code, Address, Contact Number)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/branches', formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Branch created successfully!');
        setShowAddModal(false);
        setFormData(initialFormState);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim() || !formData.contactPhone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/branches/${selectedBranch._id}`, formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Branch updated successfully!');
        setShowEditModal(false);
        setSelectedBranch(null);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/branches/${selectedBranch._id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Branch deleted successfully');
        setShowDeleteModal(false);
        setSelectedBranch(null);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Deactivate instead of Delete
  const handleDeactivateBranch = async () => {
    if (!selectedBranch) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/branches/${selectedBranch._id}`, {
        ...selectedBranch,
        status: 'Inactive',
      });
      if (res.data?.success) {
        toast.success(`Branch "${selectedBranch.name}" has been deactivated successfully.`);
        setShowDeleteModal(false);
        setSelectedBranch(null);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reassign Members to this Branch
  const handleAssignSelectedMembers = async () => {
    if (!selectedBranch || selectedMemberIds.length === 0) {
      toast.error('Please select at least one member to assign');
      return;
    }

    setAssigningMembers(true);
    try {
      const res = await api.post(`/branches/${selectedBranch._id}/assign`, {
        userIds: selectedMemberIds,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Members successfully reassigned!');
        setSelectedMemberIds([]);
        // Refresh members in modal
        const refreshed = await api.get(`/branches/${selectedBranch._id}/members`);
        if (refreshed.data?.success) {
          setBranchMembersData(refreshed.data);
        }
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign members');
    } finally {
      setAssigningMembers(false);
    }
  };

  // Summary counts
  const totalBranches = branches.length;
  const activeCount = branches.filter((b) => b.status === 'Active').length;
  const inactiveCount = branches.filter((b) => b.status === 'Inactive').length;
  const totalAssignedCount = branches.reduce((acc, b) => acc + (b.totalAssigned || 0), 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Enterprise Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#152026] flex items-center gap-2.5">
            Branch Management
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 font-semibold">
            Add, edit, view, and organize Sithma Driving School training branches, facilities, and staff allocations.
          </p>
        </div>

        {/* Action Button: Add New Branch */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBranches}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
            title="Refresh branches list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary text-xs py-2.5 px-4 sm:px-5 flex items-center gap-2 font-bold shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Branch
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Branches */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#1B3D59] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Total Branches</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#152026]">{totalBranches}</div>
          <p className="text-[11px] text-slate-600 font-medium">Registered academy locations</p>
        </div>

        {/* Card 2: Active Centers */}
        <div className="card p-5 space-y-2 border-l-4 border-l-emerald-600 border-emerald-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Active Centers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700">{activeCount}</div>
          <p className="text-[11px] text-slate-600 font-medium">Accepting student registrations</p>
        </div>

        {/* Card 3: Inactive Centers */}
        <div className="card p-5 space-y-2 border-l-4 border-l-slate-400 border-slate-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Inactive Centers</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-600">{inactiveCount}</div>
          <p className="text-[11px] text-slate-600 font-medium">Temporarily paused or archived</p>
        </div>

        {/* Card 4: Assigned Students & Personnel */}
        <div className="card p-5 space-y-2 border-l-4 border-l-amber-500 border-amber-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Total Assigned Personnel</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-amber-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800">{totalAssignedCount}</div>
          <p className="text-[11px] text-slate-600 font-medium">Learners, staff & instructors</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#D4EEF8] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches by name, code, manager, or address..."
            className="w-full pl-10 pr-4 py-2 border border-[#D4EEF8] rounded-xl text-xs bg-[#FAFCFE] font-medium text-[#152026] outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59] transition-all"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#1B3D59]" /> Status:
          </span>
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#1B3D59] text-white shadow-xs'
                  : 'bg-slate-100 text-[#152026] hover:bg-[#D4EEF8]/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Branches Data Table */}
      <div className="bg-white rounded-2xl border border-[#D4EEF8] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#D4EEF8] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B3D59] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B3D59]" />
            Operating Branches Directory ({filteredBranches.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Click edit or assign to manage branch operations
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1B3D59]" />
            <p className="text-xs font-bold text-slate-600">Loading branch information...</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#152026]">No branches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No branches match your query "${search}". Try searching with a different keyword.`
                : 'No branches added yet. Click "+ Add New Branch" above to create one.'}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(''); fetchBranches(); }}
                className="btn-secondary text-xs py-1.5 px-3 font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#D4EEF8]/40 border-b border-[#D4EEF8] text-[#152026] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Branch & Code</th>
                  <th className="py-3 px-4">Address / Location</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Branch Manager</th>
                  <th className="py-3 px-4">Assigned Members</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4EEF8]/60">
                {filteredBranches.map((branch) => {
                  const isActive = branch.status === 'Active';
                  return (
                    <tr key={branch._id} className="hover:bg-[#D4EEF8]/15 transition-colors">
                      {/* Branch Name & Code */}
                      <td className="py-3.5 px-4 font-bold text-[#152026]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center shrink-0 font-black">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-[#152026] text-sm flex items-center gap-2">
                              {branch.name}
                              <span className="px-2 py-0.5 rounded-md bg-[#1B3D59] text-white text-[10px] font-mono font-bold tracking-wider">
                                {branch.code}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-normal">
                              ID: {branch._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#1B3D59] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{branch.address}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{branch.contactPhone}</span>
                        </div>
                        {branch.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{branch.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Branch Manager */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#152026]">
                          <User className="w-3.5 h-3.5 text-[#1B3D59] shrink-0" />
                          <span>{branch.manager || 'Not Assigned'}</span>
                        </div>
                      </td>

                      {/* Assigned Members Breakdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">
                              {branch.studentCount || 0} Learners
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              {branch.instructorCount || 0} Instructors
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {branch.staffCount || 0} Staff
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openAssignModal(branch)}
                            className="text-[11px] text-[#1B3D59] hover:underline font-bold inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3 text-[#1B3D59]" /> Assign / Transfer Members →
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions: View, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => openViewModal(branch)}
                            className="p-1.5 text-slate-600 hover:text-[#1B3D59] hover:bg-[#D4EEF8]/40 rounded-lg transition-colors cursor-pointer"
                            title="View Branch Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(branch)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Branch"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(branch)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ======================================================== */}
      {/* 1. ADD NEW BRANCH MODAL                                 */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#152026]">Add New Driving School Branch</h3>
                  <p className="text-[11px] text-slate-500">Configure center details and unique branch identifier.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Branch Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kottawa Branch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-semibold outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-KOT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-mono uppercase font-bold outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Unique uppercase identifier</span>
                </div>

                {/* Branch Status */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">Branch Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-bold outline-none focus:border-[#1B3D59]"
                  >
                    <option value="Active">Active (Operational)</option>
                    <option value="Inactive">Inactive (Paused)</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 011-2849201"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. kottawa@sithma.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>

                {/* Branch Manager */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">Branch Manager</label>
                  <input
                    type="text"
                    placeholder="e.g. Priyantha Jayasuriya"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>

                {/* Branch Address */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. No. 145, High Level Road, Kottawa"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2.5 px-5 font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Save & Register Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EDIT BRANCH MODAL                                    */}
      {/* ======================================================== */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#152026]">Edit Branch: {selectedBranch.name}</h3>
                  <p className="text-[11px] text-slate-500">Update facility address, contact details, or status.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedBranch(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Branch Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-semibold outline-none focus:border-[#1B3D59]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Renaming will automatically update all assigned learners and staff.
                  </span>
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-mono uppercase font-bold outline-none focus:border-[#1B3D59]"
                  />
                </div>

                {/* Branch Status */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">Branch Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-bold outline-none focus:border-[#1B3D59]"
                  >
                    <option value="Active">Active (Operational)</option>
                    <option value="Inactive">Inactive (Deactivated)</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-bold text-[#152026] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59]"
                  />
                </div>

                {/* Branch Manager */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">Branch Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59]"
                  />
                </div>

                {/* Branch Address */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#152026] mb-1">
                    Branch Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl font-medium outline-none focus:border-[#1B3D59]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedBranch(null); }}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2.5 px-5 font-bold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Update Branch Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VIEW BRANCH MODAL                                    */}
      {/* ======================================================== */}
      {showViewModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#152026] flex items-center gap-2">
                    {selectedBranch.name}
                    <span className="px-2 py-0.5 rounded-md bg-[#1B3D59] text-white text-[10px] font-mono">
                      {selectedBranch.code}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Comprehensive Branch Overview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowViewModal(false); setSelectedBranch(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#FAFCFE] p-4 rounded-2xl border border-[#D4EEF8]">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Branch Status</p>
                  <p className="font-bold text-[#152026] mt-0.5 flex items-center gap-1">
                    {selectedBranch.status === 'Active' ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational (Active)
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Branch Manager</p>
                  <p className="font-bold text-[#152026] mt-0.5">{selectedBranch.manager || 'Not Assigned'}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Phone</p>
                  <p className="font-bold text-[#152026] mt-0.5">{selectedBranch.contactPhone}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Email</p>
                  <p className="font-bold text-[#152026] mt-0.5">{selectedBranch.email || 'None'}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[11px] text-slate-500 font-medium">Physical Location & Address</p>
                  <p className="font-semibold text-[#152026] mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1B3D59] shrink-0 mt-0.5" />
                    <span>{selectedBranch.address}</span>
                  </p>
                </div>
              </div>

              {/* Personnel Summary */}
              <div className="border border-[#D4EEF8] rounded-2xl p-4 bg-white space-y-2.5">
                <h4 className="font-extrabold text-[#1B3D59] text-xs">Assigned Academy Personnel</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#D4EEF8]/40 border border-[#D4EEF8]">
                    <div className="text-xl font-black text-[#1B3D59]">{selectedBranch.studentCount || 0}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Students</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-xl font-black text-amber-800">{selectedBranch.instructorCount || 0}</div>
                    <div className="text-[10px] text-amber-900 font-bold uppercase mt-0.5">Instructors</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xl font-black text-slate-700">{selectedBranch.staffCount || 0}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Desk Staff</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    openAssignModal(selectedBranch);
                  }}
                  className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> Manage Members
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedBranch);
                  }}
                  className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DELETE / DEACTIVATE BRANCH CONFIRMATION MODAL         */}
      {/* ======================================================== */}
      {showDeleteModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#152026]">Delete Branch: {selectedBranch.name}</h3>
                <p className="text-[11px] text-slate-500">Code: {selectedBranch.code}</p>
              </div>
            </div>

            {/* Check if branch has assigned members */}
            {(selectedBranch.totalAssigned || 0) > 0 ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Deletion Blocked (Safety Rule)</span>
                  </div>
                  <p className="leading-relaxed">
                    This branch currently has{' '}
                    <strong className="underline">
                      {selectedBranch.studentCount || 0} student(s)
                    </strong>{' '}
                    and{' '}
                    <strong className="underline">
                      {(selectedBranch.instructorCount || 0) + (selectedBranch.staffCount || 0)} staff/instructor member(s)
                    </strong>{' '}
                    assigned.
                  </p>
                  <p className="text-[11px] text-amber-800">
                    To maintain student exam history and financial audit records, deletion is prevented. You may safely <strong>deactivate</strong> this branch instead so it no longer accepts new registrations.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteModal(false); setSelectedBranch(null); }}
                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeactivateBranch}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer transition-colors"
                  >
                    {submitting ? 'Deactivating...' : 'Deactivate Branch Instead'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete branch <strong>"{selectedBranch.name}"</strong> ({selectedBranch.code})?
                  This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteModal(false); setSelectedBranch(null); }}
                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBranch}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer transition-colors"
                  >
                    {submitting ? 'Deleting...' : 'Yes, Delete Branch'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ASSIGN MEMBERS MODAL (Requirement 6)                 */}
      {/* ======================================================== */}
      {showAssignModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D4EEF8] shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#152026]">
                    Assign Members to {selectedBranch.name} ({selectedBranch.code})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Reassign learners, instructors, and staff to this training branch.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAssignModal(false); setSelectedBranch(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingMembers ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1B3D59]" />
                <p className="text-xs font-bold text-slate-600">Loading branch member directory...</p>
              </div>
            ) : !branchMembersData ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Failed to load members. Please try again.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                {/* Search & Filter Bar for Available Members */}
                <div className="bg-[#FAFCFE] p-3 rounded-2xl border border-[#D4EEF8] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter members by name, role..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D4EEF8] rounded-xl outline-none text-[#152026]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {['all', 'student', 'instructor', 'staff'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setMemberRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                          memberRoleFilter === r
                            ? 'bg-[#1B3D59] text-white'
                            : 'bg-white text-slate-700 border border-[#D4EEF8]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of Available Users to Reassign */}
                <div className="border border-[#D4EEF8] rounded-2xl overflow-hidden bg-white">
                  <div className="p-3 bg-[#D4EEF8]/30 border-b border-[#D4EEF8] flex items-center justify-between font-bold text-[11px] text-[#152026]">
                    <span>Personnel Roster (Select to Reassign)</span>
                    <span>{selectedMemberIds.length} Selected</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {branchMembersData.available?.users
                      ?.filter((u) => {
                        if (memberRoleFilter !== 'all' && u.role !== memberRoleFilter) return false;
                        if (memberSearchQuery.trim()) {
                          const q = memberSearchQuery.toLowerCase();
                          return (
                            u.name?.toLowerCase().includes(q) ||
                            u.email?.toLowerCase().includes(q) ||
                            u.role?.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((u) => {
                        const isCurrentlyAssigned = u.branch === selectedBranch.name;
                        const isChecked = selectedMemberIds.includes(u._id);

                        return (
                          <label
                            key={u._id}
                            className={`p-3 flex items-center justify-between gap-3 hover:bg-[#D4EEF8]/20 transition-colors cursor-pointer ${
                              isCurrentlyAssigned ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                disabled={isCurrentlyAssigned}
                                checked={isChecked || isCurrentlyAssigned}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMemberIds((prev) => [...prev, u._id]);
                                  } else {
                                    setSelectedMemberIds((prev) => prev.filter((id) => id !== u._id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#1B3D59] focus:ring-[#1B3D59]"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-[#152026] flex items-center gap-2">
                                  <span>{u.name}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                                    {u.role}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {u.email} • Phone: {u.phone || 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isCurrentlyAssigned
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {isCurrentlyAssigned ? 'Current Branch' : `Branch: ${u.branch || 'None'}`}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D4EEF8]">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedMemberIds.length} personnel selected for assignment to {selectedBranch.name}.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowAssignModal(false); setSelectedBranch(null); }}
                      className="btn-secondary text-xs py-2 px-3.5"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={assigningMembers || selectedMemberIds.length === 0}
                      onClick={handleAssignSelectedMembers}
                      className="btn-primary text-xs py-2 px-4 font-bold disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {assigningMembers ? 'Assigning...' : `Assign to ${selectedBranch.name}`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
