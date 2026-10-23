import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'confirmed', 'pending'

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-600/20 text-red-500 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to View Tickets</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please sign in or create an account to access your booked movie tickets, QR passes, and payment receipts.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'confirmed') return b.status === 'confirmed';
    if (filterTab === 'pending') return b.status === 'pending';
    if (filterTab === 'cancelled') return b.status === 'cancelled' || b.status === 'failed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-500">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                My Movie Tickets
              </h1>
              <p className="text-xs text-slate-400">
                View your confirmed passes, auditorium entry QR codes, and pending transactions
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Passes</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'all'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Passes ({bookings.length})
        </button>
        <button
          onClick={() => setFilterTab('confirmed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'confirmed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'pending'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending ({bookings.filter((b) => b.status === 'pending').length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any bookings under the "{filterTab}" category. Book a movie now to get your passes!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
          >
            Explore Movies &amp; Book Tickets
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
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
