import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TicketCard } from '../components/tickets/TicketCard';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import {
  Ticket,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  History,
  CheckCircle2,
} from 'lucide-react';

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming', 'past', 'pending', 'all'

  // Modal for completing pending payment
  const [activePendingBooking, setActivePendingBooking] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.bookings.getMyTickets();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showToast('Could not load your tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const handleActionOnPending = (booking) => {
    setActivePendingBooking(booking);
    setIsCheckoutOpen(true);
  };

  // Classify bookings into Upcoming vs Past
  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const { upcomingBookings, pastBookings, pendingBookings } = useMemo(() => {
    const upcoming = [];
    const past = [];
    const pending = [];

    bookings.forEach((b) => {
      if (b.status === 'pending') {
        pending.push(b);
      }
      // Compare showDate string (e.g. 2026-10-26) with todayStr
      const bookingDate = b.showDate || (b.show?.showDate ? b.show.showDate : '');
      if (bookingDate >= todayStr) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    });

    return {
      upcomingBookings: upcoming,
      pastBookings: past,
      pendingBookings: pending,
    };
  }, [bookings, todayStr]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-red-600/10 text-red-600 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to View Tickets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please sign in or create an account to access your booked movie tickets, QR passes, and payment receipts.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Filter based on active tab
  const displayedBookings = useMemo(() => {
    if (filterTab === 'upcoming') return upcomingBookings;
    if (filterTab === 'past') return pastBookings;
    if (filterTab === 'pending') return pendingBookings;
    return bookings;
  }, [filterTab, upcomingBookings, pastBookings, pendingBookings, bookings]);

  // Total spent calculation
  const totalSpent = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-red-600/10 text-red-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                My Movie Bookings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View your upcoming shows, past movie experiences, and verified entry passes
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-semibold transition self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Passes</span>
        </button>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Upcoming Shows</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {upcomingBookings.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Past Experiences</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-200">
            {pastBookings.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Pending Approval</span>
          <span className="text-2xl font-black text-amber-500">
            {pendingBookings.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Cinema Spend</span>
          <span className="text-2xl font-black text-red-600">
            ₹{totalSpent.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs: UPCOMING & PAST BOOKINGS */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-[#0f172a] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterTab === 'upcoming'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Shows ({upcomingBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterTab === 'past'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Past Bookings ({pastBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterTab === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Pending ({pendingBookings.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'all'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Passes ({bookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <Ticket className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {filterTab === 'upcoming'
              ? 'No Upcoming Shows Booked'
              : filterTab === 'past'
              ? 'No Past Movie History Yet'
              : `No Tickets in ${filterTab}`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {filterTab === 'upcoming'
              ? 'You do not have any upcoming movie shows reserved. Explore the latest blockbusters and reserve your favorite seats now!'
              : 'Once you attend movies, your booking receipts and memories will be archived right here.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition"
          >
            Explore Movies &amp; Book Tickets
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedBookings.map((booking) => (
            <TicketCard
              key={booking._id}
              booking={booking}
              onAction={handleActionOnPending}
            />
          ))}
        </div>
      )}

      {/* Complete Pending Payment Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        booking={activePendingBooking}
        onBookingConfirmed={() => {
          fetchBookings();
        }}
      />
    </div>
  );
};
