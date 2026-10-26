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
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { currentCity, openCityModal } = useCity();
  const { theme, isDark, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#080c15]/95 text-slate-900 dark:text-slate-100 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30 group-hover:bg-red-500 transition-colors duration-200">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    I<span className="text-red-600">MOVIES</span>
                  </span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded">
                    CINEMA
                  </span>
                </div>
                <span className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase -mt-1 font-semibold">
                  Ticket Booking
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <button
              onClick={openCityModal}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Change your current city"
            >
              <MapPin className="w-3.5 h-3.5 text-red-600" />
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
                className="w-full bg-slate-100 dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700/80 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs bg-slate-200 dark:bg-slate-800 rounded-full px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Corner: Navigation, Theme Toggle, User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/"
              className={`hidden md:inline-flex px-3 py-2 text-sm font-semibold rounded-lg transition ${
                location.pathname === '/'
                  ? 'text-red-600 dark:text-white bg-slate-100 dark:bg-slate-800/80'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              Explore
            </Link>

            <Link
              to="/my-tickets"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition ${
                location.pathname === '/my-tickets'
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition ${
                  location.pathname === '/admin'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Admin</span>
              </Link>
            )}

            {/* LIGHT / DARK MODE CORNER TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 shadow-sm"
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-xs font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden lg:inline text-xs font-semibold">Dark</span>
                </>
              )}
            </button>

            {/* Auth Button or User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full sm:rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[100px]">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-tickets"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span>Bookings &amp; Tickets</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition font-semibold"
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
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-md shadow-red-600/30 transition"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="sm:hidden mb-2">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full bg-slate-100 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-4 py-2.5 border border-slate-300 dark:border-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openCityModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>City: {currentCity}</span>
            </div>
            <span className="text-red-600 font-bold">Change</span>
          </button>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Explore Movies
          </Link>

          <Link
            to="/my-tickets"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            My Bookings &amp; Tickets
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg"
            >
              Admin Management
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};
