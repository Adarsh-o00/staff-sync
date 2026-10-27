import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  AlertCircle,
  Check,
  Calendar,
  Sparkles,
  HeartPulse,
  Coffee,
  Baby,
  User,
  Filter
} from 'lucide-react';

export default function LeaveRequests() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [actionNotice, setActionNotice] = useState(null);

  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto calculate duration in days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return diffDays;
  };

  const currentDuration = calculateDays(formData.startDate, formData.endDate);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves');
      setLeaves(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot precede start date.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/leaves', formData);
      setShowModal(false);
      setFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setActionNotice({
        type: 'success',
        text: 'Leave application submitted successfully for review.',
      });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      setActionNotice({
        type: 'success',
        text: `Leave request has been marked as ${status}.`,
      });
      fetchLeaves();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update leave status',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Filter leaves based on active tab
  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === 'all') return true;
    return leave.status === statusFilter;
  });

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  // Calculate used leaves for current user
  const userLeaves = leaves.filter(
    (l) => (l.user?._id || l.user) === (user?._id || user?.id) && l.status === 'approved'
  );
  const annualUsed = userLeaves
    .filter((l) => l.leaveType === 'annual')
    .reduce((acc, curr) => acc + calculateDays(curr.startDate, curr.endDate), 0);
  const sickUsed = userLeaves
    .filter((l) => l.leaveType === 'sick')
    .reduce((acc, curr) => acc + calculateDays(curr.startDate, curr.endDate), 0);
  const casualUsed = userLeaves
    .filter((l) => l.leaveType === 'casual')
    .reduce((acc, curr) => acc + calculateDays(curr.startDate, curr.endDate), 0);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const getLeaveTypeBadge = (type) => {
    switch (type) {
      case 'sick':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'casual':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maternity':
      case 'paternity':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Request time-off, monitor balance allowances, and review team requests
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-md shadow-brand-500/25 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Allowance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Annual Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Annual Leave
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {Math.max(0, 14 - annualUsed)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 14 Days Remaining</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (annualUsed / 14) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {annualUsed} days taken this calendar year
          </p>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sick Leave
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {Math.max(0, 8 - sickUsed)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 8 Days Remaining</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (sickUsed / 8) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {sickUsed} days used for medical recovery
          </p>
        </div>

        {/* Casual Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Casual / Personal
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {Math.max(0, 6 - casualUsed)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 6 Days Remaining</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (casualUsed / 6) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {casualUsed} personal days used
          </p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Requests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-200">
              {leaves.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600/60 text-white">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700/60 text-white">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-700/60 text-white">
              {rejectedCount}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium px-2">
          Filtered view: <span className="font-semibold text-slate-700">{filteredLeaves.length} records</span>
        </div>
      </div>

      {/* Leaves Records Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 mt-3">Loading leave requests...</p>
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-soft space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No leave requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no leave requests filed under the "{statusFilter}" filter.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-semibold rounded-xl transition"
          >
            Submit an Application
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Personnel</th>
                  <th className="py-4 px-6">Leave Category</th>
                  <th className="py-4 px-6">Duration & Schedule</th>
                  <th className="py-4 px-6">Reason / Notes</th>
                  <th className="py-4 px-6">Status</th>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <th className="py-4 px-6 text-right">Decision</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLeaves.map((leave) => {
                  const days = calculateDays(leave.startDate, leave.endDate);
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Employee */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                            {leave.user?.name ? leave.user.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {leave.user?.name || leave.employeeName || 'Staff Member'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {leave.user?.department || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getLeaveTypeBadge(
                            leave.leaveType
                          )}`}
                        >
                          {leave.leaveType || 'annual'} Leave
                        </span>
                      </td>

                      {/* Schedule & Duration */}
                      <td className="py-4 px-6 text-slate-600">
                        <div className="font-semibold text-slate-800 text-xs">
                          {new Date(leave.startDate).toLocaleDateString()} &rarr;{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        <span className="text-[11px] text-brand-600 font-bold">
                          {days} {days === 1 ? 'Day' : 'Days'} total
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-6 text-slate-600 max-w-xs">
                        <p className="text-xs line-clamp-2 leading-relaxed italic">
                          "{leave.reason}"
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">{getStatusBadge(leave.status)}</td>

                      {/* Manager / Admin Decision Actions */}
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <td className="py-4 px-6 text-right">
                          {leave.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(leave._id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Decided</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Apply for Time Off</h2>
                <p className="text-xs text-slate-500 mt-0.5">Submit a formal leave request to management</p>
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

            <form onSubmit={handleApply} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Leave Category *
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition capitalize"
                >
                  <option value="annual">Annual Leave (Vacation)</option>
                  <option value="sick">Sick Leave (Medical)</option>
                  <option value="casual">Casual Leave (Personal Affairs)</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              {/* Live duration banner */}
              {currentDuration > 0 && (
                <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200/60 flex items-center justify-between text-xs text-brand-700">
                  <span className="font-medium">Calculated Leave Duration:</span>
                  <span className="font-extrabold text-sm">{currentDuration} Days</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Time Off *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  placeholder="Explain reason for leave and handoff plans..."
                ></textarea>
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
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
