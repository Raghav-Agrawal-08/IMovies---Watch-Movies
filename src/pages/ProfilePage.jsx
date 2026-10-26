import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCity } from '../context/CityContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  LogOut,
  ShieldCheck,
  Ticket,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Film,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const { currentCity } = useCity();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else if (!isAuthenticated) {
      navigate('/');
    }
  }, [user, isAuthenticated, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Please enter your current password to set a new password.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      showToast('Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    showToast('You have been signed out.', 'info');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* User Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-red-600/30 shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {user?.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-bold transition self-start sm:self-auto shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Quick Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">My Movie Passes</span>
            <Link to="/my-tickets" className="text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 transition flex items-center gap-1">
              <span>View Bookings</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Primary Cinema Hub</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{currentCity}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Security Status</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Verified &amp; Active</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form & Dashboard Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Overview
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Member</span>
              </span>
              {user?.role === 'admin' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              Your profile is verified and secured with encrypted credentials and session tokens.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">View Booked Tickets</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Passes, showtimes &amp; receipts</span>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-red-600 transition">→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full p-4 rounded-2xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Browse Now Showing</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Explore movie discovery</span>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-red-600 transition">→</span>
          </button>
        </div>

        {/* Profile Details & Password Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleUpdate}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm dark:shadow-xl"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="profile-name">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 focus:border-red-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="profile-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 focus:border-red-600 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Optional Change Password Sub-section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Security &amp; Password Update (Optional)</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="current-pw">
                    Current Password
                  </label>
                  <input
                    id="current-pw"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password if changing"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="new-pw">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-pw"
                      type={showPassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 rounded-xl px-3.5 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 focus:border-red-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Updates'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
