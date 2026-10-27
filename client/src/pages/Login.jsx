import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-xl overflow-hidden relative z-10">
        
        {/* Left Col (5 cols): Branding & Value Props */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-700 via-indigo-800 to-slate-950 p-8 flex-col justify-between text-white relative">
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-200" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Staff<span className="text-brand-300">Sync</span>
              </span>
            </div>

            <div className="space-y-3 pt-6">
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                Modern Workforce Management Platform
              </h2>
              <p className="text-xs text-brand-100/80 leading-relaxed">
                Empower your employees with intelligent shift tracking, seamless leave management, and company-wide transparency.
              </p>
            </div>

            <div className="space-y-3 pt-4 text-xs text-brand-100/90">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-time Clock-In & Timesheets</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Multi-level Leave Approval Workflows</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Company Bulletins & Feeds</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-brand-200/70 flex items-center justify-between">
            <span>StaffSync HRM Enterprise</span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* Right Col (7 cols): Login Form & Demo Accounts */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <div className="lg:hidden flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-lg font-extrabold text-white">
                  Staff<span className="text-brand-400">Sync</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access your staff portal
              </p>
            </div>

            {/* Demo Quick-Fill Buttons */}
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Quick-Fill Demo Credentials</span>
                <span className="text-[10px] text-brand-400 lowercase font-normal">Click to auto-populate</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@staffsync.com', 'Password123!')}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition text-center cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="font-bold">Admin</span>
                  <span className="text-[10px] text-purple-400/80 truncate w-full">Full Control</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('manager@staffsync.com', 'Password123!')}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition text-center cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="font-bold">Manager</span>
                  <span className="text-[10px] text-blue-400/80 truncate w-full">Approvals</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('employee@staffsync.com', 'Password123!')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition text-center cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="font-bold">Employee</span>
                  <span className="text-[10px] text-emerald-400/80 truncate w-full">Self-Service</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-center space-x-3 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm transition"
                    placeholder="name@staffsync.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-brand-600/30 disabled:opacity-50 text-sm cursor-pointer mt-2 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to StaffSync</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an employee account yet?{' '}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
            >
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
