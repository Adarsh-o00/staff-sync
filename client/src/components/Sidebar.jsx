import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Megaphone,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', hint: 'Overview' },
    { label: 'Employees', icon: Users, path: '/employees', hint: 'Staff' },
    { label: 'Leave Requests', icon: CalendarDays, path: '/leaves', hint: 'Time off' },
    { label: 'Attendance', icon: Clock, path: '/attendance', hint: 'Punch logs' },
    { label: 'Announcements', icon: Megaphone, path: '/announcements', hint: 'News' },
  ];

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700' };
      case 'manager':
        return { label: 'Manager', color: 'bg-blue-100 text-blue-700' };
      default:
        return { label: 'Staff', color: 'bg-emerald-100 text-emerald-700' };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <aside className="w-68 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex sticky top-16 select-none">
      
      {/* Top Menu Section */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? 'text-white opacity-80'
                            : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Insights / Role Notice */}
        <div className="px-3 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/40 border border-slate-200/60 text-xs">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Role Permissions</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Logged in as <span className="font-semibold text-slate-700 capitalize">{user?.role || 'Employee'}</span>. 
            {user?.role === 'admin' 
              ? ' You have full directory & approvals access.' 
              : user?.role === 'manager'
              ? ' You can manage leaves and view team records.'
              : ' You can submit leaves & record daily punches.'}
          </p>
        </div>
      </div>

      {/* Bottom User / System Info Card */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white status-dot-active"></span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.department || 'General'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cloud Sync Active</span>
          </span>
          <span className="font-mono text-[10px]">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
}
