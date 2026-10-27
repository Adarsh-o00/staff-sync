import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Megaphone,
  Bell,
  Search,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Shield,
  Briefcase
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Employees', icon: Users, path: '/employees' },
    { label: 'Leave Requests', icon: CalendarDays, path: '/leaves' },
    { label: 'Attendance', icon: Clock, path: '/attendance' },
    { label: 'Announcements', icon: Megaphone, path: '/announcements' },
  ];

  // Derive current page name
  const getPageTitle = () => {
    const current = navItems.find((item) => location.pathname.startsWith(item.path));
    return current ? current.label : 'Overview';
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200 ring-1 ring-purple-500/20';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Leave Approved',
      desc: 'Your casual leave for next Friday has been approved.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Company Announcement',
      desc: 'Quarterly Town Hall is scheduled for this Thursday 3:00 PM.',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Punch In Recorded',
      desc: 'You clocked in successfully this morning at 9:02 AM.',
      time: '6h ago',
      unread: false,
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Toggle & Brand / Breadcrumb */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo mark */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">Staff<span className="text-brand-600">Sync</span></span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">HRM</span>
            </div>
          </div>

          <span className="hidden lg:inline text-slate-300">/</span>

          {/* Current Page Indicator */}
          <div className="hidden lg:flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            <span>{getPageTitle()}</span>
          </div>
        </div>

        {/* Center: Search Shortcut Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <div className="w-full relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              readOnly
              placeholder="Quick search staff, leaves, policy..."
              className="w-full pl-9 pr-12 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-600 placeholder-slate-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              onClick={() => alert("Search shortcut: Use search filters on Directory or Leaves page.")}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 animate-slide-up z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded-full">2 New</span>
                  </div>
                  <button
                    onClick={() => alert("All notifications marked as read")}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-xl transition">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100/80 transition focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center space-x-1.5">
                  <p className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </p>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium capitalize">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 animate-slide-up z-50">
                <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getRoleBadgeStyle(user?.role)}`}>
                      {user?.role || 'Employee'}
                    </span>
                    <span className="text-[11px] text-slate-500">• {user?.department || 'General'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-slide-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Signed in as <span className="font-semibold text-slate-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
