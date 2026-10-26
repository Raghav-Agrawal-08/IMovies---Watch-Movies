import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Printer,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Film,
  Download,
} from 'lucide-react';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const res = await api.bookings.getBookingById(id);
        if (res.success && res.data) {
          setBooking(res.data);
          if (res.data.status === 'confirmed') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        } else {
          setError('Booking not found or access denied.');
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve booking confirmation.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white animate-pulse mb-3">
          <Film className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading Booking Confirmation...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Booking</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'Booking record could not be found.'}</p>
        <button
          onClick={() => navigate('/my-tickets')}
          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
        >
          Go to My Tickets
        </button>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 min-h-screen">
      {/* Top Banner Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 mb-1">
          {isConfirmed ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          )}
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isConfirmed ? 'Booking Confirmed!' : 'Booking Received — Payment Pending'}
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          {isConfirmed
            ? 'Your tickets are locked and ready. Show the digital QR barcode at the cinema ticket counter or usher station.'
            : 'Your seat reservation is currently on hold. Please finalize your UPI payment verification to activate your entry pass.'}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
          <span>Booking Reference:</span>
          <span className="text-red-600">{booking.bookingReference}</span>
        </div>
      </div>

      {/* Printable Digital Ticket Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Ticket Header */}
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            {booking.movie?.posterUrl && (
              <img
                src={booking.movie.posterUrl}
                alt={booking.movie.title}
                className="w-16 h-24 object-cover rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0 shadow-md"
              />
            )}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                {booking.movie?.language} • {booking.movie?.certificate || 'U/A 13+'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {booking.movie?.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {booking.movie?.genres?.join(', ')} • {booking.movie?.duration} mins
              </p>
            </div>
          </div>

          <div className="text-right self-start sm:self-center">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Paid</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{booking.totalAmount}
            </span>
          </div>
        </div>

        {/* Show & Seating Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Cinema &amp; Location</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {booking.cinema?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {booking.cinema?.city}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Date &amp; Showtime</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>{booking.showDate}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{booking.showTime} • {booking.show?.screenType || 'Dolby Atmos'}</span>
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Reserved Seats</span>
            <div className="flex flex-wrap gap-1.5">
              {booking.seats?.map((s) => (
                <span
                  key={s.seatNumber}
                  className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold"
                >
                  {s.seatNumber}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 capitalize">
              Tier: {booking.seats?.[0]?.tier || 'Standard'} ({booking.seats?.length} {booking.seats?.length === 1 ? 'ticket' : 'tickets'})
            </p>
          </div>
        </div>

        {/* QR Pass & Verification Footer */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-[#0b0f19]/50">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Official Cinema Pass</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Please present this pass at the gate. Valid for single entry only on the scheduled date and time.
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Ref: {booking.bookingReference} • ID: {booking._id}
            </p>
          </div>

          <div className="flex flex-col items-center">
            {booking.ticketQr ? (
              <img
                src={booking.ticketQr}
                alt={`Ticket QR for ${booking.bookingReference}`}
                className="w-28 h-28 p-2 rounded-xl bg-white border border-slate-300 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <Ticket className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-500">QR Activated on Pay</span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Scan at Usher Station</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Ticket</span>
        </button>

        <button
          onClick={() => navigate('/my-tickets')}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-red-600/30"
        >
          <span>View in My Tickets</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition"
        >
          Explore More Movies
        </button>
      </div>
    </div>
  );
};
