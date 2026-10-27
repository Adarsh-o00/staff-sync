import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Mail,
  Building,
  Briefcase,
  Trash2,
  Edit2,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  UserCheck,
  UserCheck2,
  Filter
} from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Edit employee form state
  const [editData, setEditData] = useState({
    name: '',
    department: 'Engineering',
    position: '',
    role: 'employee',
    phone: '',
  });
  const [editError, setEditError] = useState('');

  // New employee form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const departmentsList = ['All', 'Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Management'];
  const rolesList = ['All', 'admin', 'manager', 'employee'];

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await API.post('/employees', formData);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Engineer',
        phone: '',
      });
      setActionNotice({ type: 'success', text: 'New employee created successfully!' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleEditClick = (emp) => {
    setEditingId(emp._id);
    setEditData({
      name: emp.name || '',
      department: emp.department || 'Engineering',
      position: emp.position || emp.designation || '',
      role: emp.role || 'employee',
      phone: emp.phone || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSubmitting(true);
    try {
      await API.put(`/employees/${editingId}`, editData);
      setShowEditModal(false);
      setActionNotice({ type: 'success', text: 'Employee details updated successfully!' });
      fetchEmployees();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name || 'this employee'} from StaffSync?`)) return;
    try {
      await API.delete(`/employees/${id}`);
      setActionNotice({ type: 'success', text: `${name} has been deleted.` });
      fetchEmployees();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete employee',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name && emp.name.toLowerCase().includes(search.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
      (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())) ||
      (emp.position && emp.position.toLowerCase().includes(search.toLowerCase()));

    const matchesDept =
      selectedDept === 'All' ||
      (emp.department && emp.department.toLowerCase() === selectedDept.toLowerCase());

    const matchesRole =
      selectedRole === 'All' ||
      (emp.role && emp.role.toLowerCase() === selectedRole.toLowerCase());

    return matchesSearch && matchesDept && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getAvatarGradient = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'from-purple-500 to-indigo-600 text-white';
      case 'manager':
        return 'from-blue-500 to-sky-600 text-white';
      default:
        return 'from-emerald-500 to-teal-600 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all duration-300 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Title and Add Employee button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage company personnel, assign departments, and update roles
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-md shadow-brand-500/25 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, position..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 self-end md:self-auto">
            <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition ${
                viewMode === 'grid'
                  ? 'bg-brand-50 text-brand-600 font-bold border border-brand-200'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition ${
                viewMode === 'table'
                  ? 'bg-brand-50 text-brand-600 font-bold border border-brand-200'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Dept:
          </span>
          {departmentsList.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Role:
          </span>
          {rolesList.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                selectedRole === r
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Count summary */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>
          Showing <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> of {employees.length} personnel
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 mt-3">Loading staff directory...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-soft space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No personnel found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No employees match the specified filters or search criteria. Try resetting the filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('All');
              setSelectedRole('All');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/40 p-6 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header row with Avatar, Name, and Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                        emp.role
                      )} font-bold flex items-center justify-center text-lg shadow-sm`}
                    >
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate max-w-[170px]">
                        {emp.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getRoleBadgeStyle(
                            emp.role
                          )}`}
                        >
                          {emp.role || 'employee'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot-active" title="Active"></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Admin / Manager */}
                  <div className="flex items-center space-x-1">
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {user?.role === 'admin' && emp._id !== user._id && emp._id !== user.id && (
                      <button
                        onClick={() => handleDelete(emp._id, emp.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-5 space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <Building className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{emp.department || 'General'}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.position || emp.designation || 'Staff Member'}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={`mailto:${emp.email}`}
                      className="text-slate-500 hover:text-brand-600 truncate transition"
                    >
                      {emp.email}
                    </a>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center space-x-2.5">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500">{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: <span className="text-emerald-600 font-semibold">Active Full-Time</span></span>
                <span className="text-[10px] font-mono">ID: {emp._id ? emp._id.slice(-6) : 'Staff'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Modern Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Personnel</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Status</th>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <th className="py-4 px-6 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                            emp.role
                          )} font-bold flex items-center justify-center text-sm shadow-2xs`}
                        >
                          {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.phone || 'No phone set'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border ${getRoleBadgeStyle(
                          emp.role
                        )}`}
                      >
                        {emp.role || 'employee'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {emp.department || 'General'}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {emp.position || emp.designation || 'Staff'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                      {emp.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 status-dot-active"></span>
                        Active
                      </span>
                    </td>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition inline-flex"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user?.role === 'admin' && emp._id !== user._id && emp._id !== user.id && (
                          <button
                            onClick={() => handleDelete(emp._id, emp.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition inline-flex"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Personnel</h2>
                <p className="text-xs text-slate-500 mt-0.5">Register an employee profile into StaffSync HRM</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    placeholder="alex@staffsync.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition capitalize"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    placeholder="Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
                >
                  {submitting ? 'Creating...' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Personnel Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update team assignment, title, or system role</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role *
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition capitalize"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department *
                  </label>
                  <select
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Position / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.position}
                    onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-500/20 transition"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
