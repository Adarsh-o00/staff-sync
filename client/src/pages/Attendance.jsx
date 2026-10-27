import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Timer,
  Coffee,
  TrendingUp,
  Activity,
  UserCheck,
  Check,
  X
} from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionNotice, setActionNotice] = useState(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await API.get('/attendance');
      const data = res.data.data || res.data || [];
      setAttendanceList(data);

      const today = new Date().toISOString().split('T')[0];
      const current = data.find((a) => {
        const matchesDate = a.date && a.date.split('T')[0] === today;
        const matchesUser = (a.user?._id || a.user) === (user?._id || user?.id);
        return matchesDate && matchesUser;
      });
      setTodayRecord(current || null);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setActionNotice(null);
    try {
      await API.post('/attendance/clock-in');
      setActionNotice({ type: 'success', text: 'Clocked in successfully! Have a great shift.' });
      fetchAttendance();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to clock in',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setActionNotice(null);
    try {
      await API.post('/attendance/clock-out');
      setActionNotice({ type: 'success', text: 'Clocked out successfully! Great job today.' });
      fetchAttendance();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Failed to clock out',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Metrics calculations
  const totalDaysPresent = attendanceList.length;
  const totalHoursLogged = attendanceList
    .reduce((sum, item) => sum + (Number(item.totalHours) || 0), 0)
    .toFixed(1);
  const avgHours = totalDaysPresent > 0 ? (totalHoursLogged / totalDaysPresent).toFixed(1) : '8.0';

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 status-dot-active"></span>
            Present
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Late Arrival
          </span>
        );
      case 'half-day':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Half-Day
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Present
          </span>
        );
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

      {/* Header and Interactive Punch Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-brand-300 border border-white/10 uppercase tracking-wider">
            Daily Timesheet & Logs
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Attendance Tracking
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            Record shifts, monitor daily check-ins, and inspect working hours history
          </p>
        </div>

        {/* Live Punch Controls */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl flex items-center space-x-5 w-full md:w-auto justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-brand-200 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Time</span>
            </div>
            <p className="text-2xl font-mono font-extrabold text-white mt-0.5">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </p>
          </div>

          <div className="flex-shrink-0">
            {!todayRecord || !todayRecord.clockIn ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <Timer className="w-4 h-4" />
                <span>{actionLoading ? 'Clocking In...' : 'Clock In Now'}</span>
              </button>
            ) : !todayRecord.clockOut ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-500/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                <span>{actionLoading ? 'Clocking Out...' : 'Clock Out Now'}</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Shift Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Days Present
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalDaysPresent}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Logged records on system</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Hours
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalHoursLogged} hrs</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Cumulative work hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Hours / Day
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{avgHours} hrs</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Standard 8.0 hrs expected</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              On-Time Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">97.5%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Consistent punctuality</p>
        </div>

      </div>

      {/* Attendance History Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 mt-3">Loading attendance history...</p>
        </div>
      ) : attendanceList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-soft space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No attendance logs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Clock in today to begin recording your work hours.
          </p>
          <button
            onClick={handleClockIn}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Clock In Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Punch History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological record of daily shifts and durations</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {attendanceList.length} total sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <th className="py-4 px-6">Personnel</th>
                  )}
                  <th className="py-4 px-6">Clock In</th>
                  <th className="py-4 px-6">Clock Out</th>
                  <th className="py-4 px-6">Logged Duration</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {attendanceList.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatDate(att.date)}
                    </td>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {att.user?.name ? att.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {att.user?.name || 'Staff Member'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {att.user?.department || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      <span className="inline-flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{formatTime(att.clockIn)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {att.clockOut ? (
                        <span className="inline-flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>{formatTime(att.clockOut)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active Shift
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-900 font-bold text-xs">
                      {att.totalHours ? `${att.totalHours} hrs` : att.clockIn && !att.clockOut ? 'In progress' : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(att.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
