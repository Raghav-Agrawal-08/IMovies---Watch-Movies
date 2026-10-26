import React, { useState } from 'react';
import { Film, LogIn, UserPlus, Sparkles, AlertCircle, Eye, EyeOff, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export const AuthLandingPage = () => {
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const { theme, isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (activeTab === 'signup' && !name.trim()) {
      setErrorMsg('Please provide your full name.');
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
        showToast('Welcome back to IMovies!', 'success');
      } else {
        await signup(name, email, password);
        showToast('Account created successfully! Welcome to IMovies.', 'success');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setErrorMsg('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
      showToast(`Logged in successfully as ${demoEmail}!`, 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-slate-100 dark:bg-[#080c15] dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors duration-300">
      {/* Subtle Cinematic Background Grid & Posters Strip */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-15">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
      </div>

      {/* Top Corner Controls (Light/Dark Mode toggle) */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-700 dark:border-slate-800 bg-slate-800/80 dark:bg-slate-900/80 text-slate-200 dark:text-slate-200 hover:text-white dark:hover:text-white hover:border-slate-600 transition shadow-sm"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Auth Card Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 shadow-md shadow-red-600/30 mb-3.5">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white dark:text-white light:text-slate-900">
            I<span className="text-red-500">MOVIES</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-widest mt-1">
            Premium Movie Ticket Booking
          </p>
          <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 mt-2 font-medium">
            Please sign in or create an account to access movies and showtimes
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-800/90 dark:bg-[#0f172a] border border-slate-700/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-900/80 dark:bg-[#090d16] p-1 border border-slate-700/60 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'login'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === 'signup'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Parker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#090d16] border border-slate-700 dark:border-slate-800 text-white placeholder:text-slate-500 text-sm focus:border-red-500 focus:outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#090d16] border border-slate-700 dark:border-slate-800 text-white placeholder:text-slate-500 text-sm focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#090d16] border border-slate-700 dark:border-slate-800 text-white placeholder:text-slate-500 text-sm focus:border-red-500 focus:outline-none pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{activeTab === 'login' ? 'Sign In & View Movies' : 'Create Account & Enter'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-400 text-center mb-3 font-semibold uppercase tracking-wider">
              Instant 1-Click Test Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('demo@imovies.com', 'Password123!')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-[#090d16] hover:bg-slate-700/60 border border-slate-700/80 dark:border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo User</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@imovies.com', 'AdminPassword123!')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-[#090d16] hover:bg-slate-700/60 border border-slate-700/80 dark:border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                <span>Admin User</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              No registration required to test booking and seating features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
