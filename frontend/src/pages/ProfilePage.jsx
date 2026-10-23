import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
} from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

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

      const res = await updateProfile(payload);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-600/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {user?.name}
            </h1>
            <p className="text-xs text-slate-400">
              {user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-bold transition self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Status
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Account</span>
              </span>
              {user?.role === 'admin' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Your personal information is encrypted and securely stored. We never share your credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="w-full p-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-red-500" />
              <div>
                <span className="text-xs font-bold text-white block">View Booked Tickets</span>
                <span className="text-[10px] text-slate-400 block">Passes &amp; receipts</span>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-white transition">→</span>
          </button>
        </div>

        {/* Profile Details & Password Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleUpdate}
            className="p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6 shadow-xl"
          >
            <h3 className="text-lg font-black text-white">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="profile-name">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="profile-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Optional Change Password Sub-section */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Security &amp; Password Update (Optional)</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="current-pw">
                    Current Password
                  </label>
                  <input
                    id="current-pw"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password if changing"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-pw">
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
                      className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 pr-10 py-2.5 border border-slate-700 focus:border-red-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
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
