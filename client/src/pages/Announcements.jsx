import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  Plus,
  X,
  Calendar,
  User,
  AlertTriangle,
  Bell,
  Sparkles,
  Building,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetDepartment: 'All',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await API.post('/announcements', formData);
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        targetDepartment: 'All',
      });
      setActionNotice({
        type: 'success',
        text: 'Announcement broadcasted to the company successfully!',
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.author?.name && item.author.name.toLowerCase().includes(search.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'all' || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          icon: AlertTriangle,
          label: 'Urgent',
          classes: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
          accent: 'border-l-4 border-l-rose-500',
        };
      case 'low':
        return {
          icon: Sparkles,
          label: 'Event / Social',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
          accent: 'border-l-4 border-l-emerald-500',
        };
      default:
        return {
          icon: Bell,
          label: 'Company Notice',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
          accent: 'border-l-4 border-l-blue-500',
        };
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Announcements & News
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with organization milestones, corporate notices, and events
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-md shadow-brand-500/25 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by keywords or author..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition"
          />
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Category:
          </span>
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              priorityFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({announcements.length})
          </button>
          <button
            onClick={() => setPriorityFilter('high')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              priorityFilter === 'high'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Urgent
          </button>
          <button
            onClick={() => setPriorityFilter('medium')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              priorityFilter === 'medium'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Notices
          </button>
          <button
            onClick={() => setPriorityFilter('low')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              priorityFilter === 'low'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 mt-3">Loading bulletin feed...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-soft space-y-3">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No announcements found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no news posts matching your current filters or search term.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAnnouncements.map((item) => {
            const badge = getPriorityBadge(item.priority);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-soft-lg transition-all duration-200 space-y-4 ${badge.accent}`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5 mr-1" />
                      {badge.label}
                    </span>
                    {item.targetDepartment && item.targetDepartment !== 'All' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        {item.targetDepartment} Only
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-700">
                        {item.author?.name || 'HR Admin'}
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Announcement Title */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {item.title}
                </h2>

                {/* Body Content */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                  {item.content}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Post Announcement</h2>
                <p className="text-xs text-slate-500 mt-0.5">Broadcast an organizational update to staff</p>
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
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  placeholder="e.g. Annual Company Retreat 2026 Details"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition capitalize"
                  >
                    <option value="medium">Notice (Normal)</option>
                    <option value="high">Urgent (High Attention)</option>
                    <option value="low">Event / Social (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Department *
                  </label>
                  <select
                    value={formData.targetDepartment}
                    onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Announcement Details & Message *
                </label>
                <textarea
                  required
                  rows="5"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  placeholder="Write message content, deadlines, guidelines, and instructions..."
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
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
