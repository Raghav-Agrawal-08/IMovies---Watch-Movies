import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  Ticket,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';

export const Navbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { currentCity, openCityModal } = useCity();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (setSearchQuery) {
      setSearchQuery(val);
    }
    if (!isHome && val.trim() !== '') {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080c15]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-2xl font-black tracking-tight text-white">
                    I<span className="text-red-500">MOVIES</span>
                  </span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                    CINEMA
                  </span>
                </div>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase -mt-1">
                  Ticket Booking
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <button
              onClick={openCityModal}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 text-sm font-medium text-slate-200 transition"
              title="Change your current city"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{currentCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, genres, languages..."
                value={searchQuery || ''}
                onChange={handleSearchChange}
                className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder:text-slate-500 rounded-full pl-10 pr-4 py-2 border border-slate-700/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-full px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links & User Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`hidden md:inline-flex px-3 py-2 text-sm font-medium rounded-lg transition ${
                location.pathname === '/'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Explore
            </Link>

            <Link
              to="/my-tickets"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                location.pathname === '/my-tickets'
                  ? 'text-red-400 bg-red-950/30 border border-red-800/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  location.pathname === '/admin'
                    ? 'text-amber-400 bg-amber-950/30 border border-amber-800/40'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Auth Button or User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-full sm:rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800/80">
                      <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-tickets"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span>Bookings &amp; Tickets</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800/80 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition active:scale-95"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search and Links Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3 animate-in slide-in-from-top-4">
            <div className="px-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCityModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>City: {currentCity}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="px-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery || ''}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <nav className="flex flex-col gap-1 pt-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium"
              >
                Movies &amp; Cinemas
              </Link>
              <Link
                to="/my-tickets"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-red-500" />
                My Tickets
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-950/20 text-sm font-medium flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
