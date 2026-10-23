import React, { useState, useEffect } from 'react';
import { Film, Mail, Lock, User as UserIcon, Eye, EyeOff, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    login,
    signup,
  } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset errors on tab switch
  useEffect(() => {
    setErrorMessage('');
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      if (authModalTab === 'login') {
        const res = await login(email, password);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const res = await signup(name.trim(), email.trim(), password);
        showToast(`Account created! Welcome to IMovies, ${res.user.name}!`, 'success');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('demo@imovies.com');
    setPassword('Password123!');
    setAuthModalTab('login');
    setErrorMessage('');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('AdminPassword123!');
    setAuthModalTab('login');
    setErrorMessage('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop-blur animate-in fade-in-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30 mb-3">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">
            {authModalTab === 'login' ? 'Sign In to IMovies' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalTab === 'login'
              ? 'Access your tickets, manage your profile and book showtimes'
              : 'Join IMovies to book seats, earn rewards and track your shows'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl mt-5 border border-slate-800">
            <button
              type="button"
              onClick={() => setAuthModalTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalTab === 'login'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalTab === 'signup'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="auth-name">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Parker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="auth-password">
                Password
              </label>
              {authModalTab === 'signup' && (
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-10 py-2.5 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : authModalTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="px-6 pb-6 pt-1 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Demo Credentials (One-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillDemoUser}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-left transition"
            >
              <div className="font-bold text-white flex items-center gap-1">
                <span>Demo User</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">demo@imovies.com</div>
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-left transition"
            >
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Admin User</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">admin@imovies.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
