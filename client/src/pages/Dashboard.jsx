import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Users,
  Calendar,
  Clock,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Sparkles,
  TrendingUp,
  UserCheck,
  Building,
  Shield,
  Coffee,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employeesCount: 0,
    leavesCount: 0,
    announcementsCount: 0,
    clockedInCount: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [loadingClock, setLoadingClock] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [actionMessage, setActionMessage] = useState(null);

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live elapsed time counter when clocked in
  useEffect(() => {
    if (clockedIn && todayAttendance?.clockIn) {
      const interval = setInterval(() => {
        const start = new Date(todayAttendance.clockIn).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime('00:00:00');
    }
  }, [clockedIn, todayAttendance]);

  const fetchDashboardData = async () => {
    try {
      const [empRes, leaveRes, annRes, attRes] = await Promise.all([
        API.get('/employees').catch(() => ({ data: [] })),
        API.get('/leaves').catch(() => ({ data: [] })),
        API.get('/announcements').catch(() => ({ data: [] })),
        API.get('/attendance').catch(() => ({ data: [] })),
      ]);

      const empData = empRes.data.data || empRes.data || [];
      const leaveData = leaveRes.data.data || leaveRes.data || [];
      const annData = annRes.data.data || annRes.data || [];
      const attData = attRes.data.data || attRes.data || [];

      setEmployees(empData);
      setRecentAnnouncements(annData.slice(0, 3));

      // Filter leaves
      const pending = leaveData.filter((l) => l.status === 'pending');
      setPendingLeaves(pending.slice(0, 4));

      // Calculate today's attendance
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAtts = attData.filter(
        (a) => a.date && a.date.split('T')[0] === todayStr
      );
      
      // Check current user's attendance today
      const myTodayAtt = todayAtts.find(
        (a) => (a.user?._id || a.user) === (user?._id || user?.id)
      );
      setTodayAttendance(myTodayAtt || null);

      if (myTodayAtt && myTodayAtt.clockIn && !myTodayAtt.clockOut) {
        setClockedIn(true);
      } else {
        setClockedIn(false);
      }

      // Count staff currently clocked in today across company
      const activeClockedStaff = todayAtts.filter((a) => a.clockIn && !a.clockOut).length;

      setStats({
        employeesCount: empData.length,
        leavesCount: pending.length,
        announcementsCount: annData.length,
        clockedInCount: activeClockedStaff,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleClockToggle = async () => {
    setLoadingClock(true);
    setActionMessage(null);
    try {
      if (clockedIn) {
        await API.post('/attendance/clock-out');
        setClockedIn(false);
        setActionMessage({ type: 'success', text: 'Clocked out successfully! Great work today.' });
      } else {
        await API.post('/attendance/clock-in');
        setClockedIn(true);
        setActionMessage({ type: 'success', text: 'Clocked in successfully! Have a productive day.' });
      }
      await fetchDashboardData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update attendance',
      });
    } finally {
      setLoadingClock(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleLeaveDecision = async (leaveId, status) => {
    try {
      await API.put(`/leaves/${leaveId}/status`, { status });
      setActionMessage({
        type: 'success',
        text: `Leave request has been ${status}.`,
      });
      fetchDashboardData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update leave request',
      });
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const formatDateLong = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeLive = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Alert toast notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all duration-300 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Welcome Banner with Live Time & Punch Widget */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        {/* Subtle mesh background decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-brand-100 backdrop-blur-md border border-white/10 uppercase tracking-wider">
                {user?.role || 'Employee'} Portal
              </span>
              <span className="text-xs text-brand-200/90 font-medium">
                {formatDateLong(currentTime)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Staff Member'}! 👋
            </h1>

            <p className="text-brand-100/80 text-sm leading-relaxed">
              Track your daily shifts, view organizational announcements, and stay in sync with your team at <span className="font-semibold text-white">StaffSync HRM</span>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/10 text-xs text-white/90 font-medium">
                <Building className="w-3.5 h-3.5 mr-1.5 text-brand-300" />
                {user?.department || 'Engineering'}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/10 text-xs text-white/90 font-medium">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-brand-300" />
                {user?.position || user?.designation || 'Specialist'}
              </span>
            </div>
          </div>

          {/* Quick Punch Interactive Card */}
          <div className="w-full lg:w-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center gap-5 sm:gap-6 min-w-[320px]">
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Clock className="w-4 h-4 text-brand-300 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
                  Real-Time Clock
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-white">
                {formatTimeLive(currentTime)}
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    clockedIn ? 'bg-emerald-400 status-dot-active' : 'bg-slate-400'
                  }`}
                ></span>
                <span className="text-brand-100 font-medium">
                  {clockedIn ? `Clocked in • ${elapsedTime}` : 'Shift not started'}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
              <button
                onClick={handleClockToggle}
                disabled={loadingClock}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  clockedIn
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                }`}
              >
                {loadingClock ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : clockedIn ? (
                  <>
                    <Coffee className="w-4 h-4" />
                    <span>Clock Out</span>
                  </>
                ) : (
                  <>
                    <Timer className="w-4 h-4" />
                    <span>Clock In Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Employees */}
        <Link
          to="/employees"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-brand-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Staff
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.employeesCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Active directory
            </span>
            <span className="text-slate-400 group-hover:text-brand-600 font-medium flex items-center">
              View all <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </Link>

        {/* Metric 2: Today's Clocked-in Staff */}
        <Link
          to="/attendance"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-emerald-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clocked-In Today
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.clockedInCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 status-dot-active"></span>
              On-shift now
            </span>
            <span className="text-slate-400 group-hover:text-emerald-600 font-medium flex items-center">
              Timesheet <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </Link>

        {/* Metric 3: Pending Leaves */}
        <Link
          to="/leaves"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-amber-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Leaves
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.leavesCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center font-semibold text-amber-600">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              {stats.leavesCount > 0 ? 'Action required' : 'Up to date'}
            </span>
            <span className="text-slate-400 group-hover:text-amber-600 font-medium flex items-center">
              Manage <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </Link>

        {/* Metric 4: Announcements */}
        <Link
          to="/announcements"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-purple-500/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Announcements
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.announcementsCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center font-semibold text-purple-600">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Company feed
            </span>
            <span className="text-slate-400 group-hover:text-purple-600 font-medium flex items-center">
              Read bulletin <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </Link>

      </div>

      {/* Main Split Section: Pending Approvals & Announcements Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Pending Approvals / Leave Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {user?.role === 'admin' || user?.role === 'manager'
                    ? 'Pending Leave Approvals'
                    : 'Recent Leave Status'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.role === 'admin' || user?.role === 'manager'
                    ? 'Review team time-off requests needing action'
                    : 'Your submitted requests and latest review updates'}
                </p>
              </div>
              <Link
                to="/leaves"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingLeaves.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-medium text-slate-600">No pending requests</p>
                  <p className="text-xs text-slate-400">All leave requests have been addressed.</p>
                </div>
              ) : (
                pendingLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {leave.user?.name ? leave.user.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-slate-900">
                            {leave.user?.name || 'Staff Member'}
                          </p>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-slate-100 text-slate-600">
                            {leave.leaveType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(leave.startDate).toLocaleDateString()} &rarr;{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">
                          "{leave.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Quick Action buttons for Admin / Manager */}
                    {(user?.role === 'admin' || user?.role === 'manager') ? (
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleLeaveDecision(leave._id, 'approved')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs flex items-center space-x-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(leave._id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Approval
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/leaves"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:border-brand-500/50 hover:shadow-soft-lg transition text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">Apply Leave</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Time off</p>
            </Link>

            <Link
              to="/attendance"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:border-brand-500/50 hover:shadow-soft-lg transition text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">Timesheet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Punch logs</p>
            </Link>

            <Link
              to="/employees"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:border-brand-500/50 hover:shadow-soft-lg transition text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">Staff Directory</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Find peers</p>
            </Link>

            <Link
              to="/announcements"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:border-brand-500/50 hover:shadow-soft-lg transition text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Megaphone className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">Notice Board</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Company news</p>
            </Link>
          </div>
        </div>

        {/* Right Column (1/3): Announcements Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Company News</h2>
              </div>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 space-y-4">
              {recentAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No announcements posted yet.</p>
                </div>
              ) : (
                recentAnnouncements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-brand-500/30 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {ann.title}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                          ann.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : ann.priority === 'low'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ann.priority || 'Notice'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/40">
                      <span>By {ann.author?.name || 'HR Admin'}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Breakdown mini card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                StaffSync Workspace
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-dot-active"></span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">HRM Production Cluster</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to encrypted MongoDB instance
              </p>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
              <span>Security Protocols</span>
              <span className="font-semibold text-emerald-400">JWT / Bcrypt Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
