import React from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Printer,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const TicketCard = ({ booking, onAction }) => {
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';
  const isCancelled = booking.status === 'cancelled' || booking.status === 'failed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative flex flex-col md:flex-row bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition hover:border-slate-700">
      {/* Jagged / Notch Cutouts on sides for Ticket feel */}
      <div className="hidden md:block ticket-notch-left" />
      <div className="hidden md:block ticket-notch-right" />

      {/* Left: Movie Poster & Quick Info */}
      <div className="md:w-56 bg-slate-900 shrink-0 relative overflow-hidden aspect-[4/3] md:aspect-auto">
        <img
          src={booking.moviePoster || booking.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'}
          alt={booking.movieTitle}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] md:from-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f172a]" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isConfirmed && (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONFIRMED</span>
            </span>
          )}
          {isPending && (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md shadow-lg animate-pulse">
              <Clock3 className="w-3.5 h-3.5" />
              <span>PAYMENT PENDING</span>
            </span>
          )}
          {isCancelled && (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
              <XCircle className="w-3.5 h-3.5" />
              <span>CANCELLED</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Ticket Details */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
              BOOKING REF: <span className="text-red-400 font-bold">{booking.bookingReference}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {booking.screenType || 'Dolby Atmos'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {booking.movieTitle}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold text-white">{booking.cinemaName}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{booking.cinemaCity}</span>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                DATE
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {booking.showDate}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                TIME
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                {booking.showTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                SEATS ({booking.seats?.length})
              </span>
              <span className="text-xs sm:text-sm font-bold text-red-400">
                {booking.seats?.map((s) => s.seatNumber).join(', ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                TOTAL PAID
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Notice for Pending payments */}
        {isPending && (
          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Payment is being verified by the server. Your ticket QR will activate once verified.</span>
            </div>
            {onAction && (
              <button
                onClick={() => onAction(booking)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
              >
                Complete Payment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right: Gate Pass & Barcode QR */}
      <div className="p-6 md:p-8 bg-[#0b0f19] border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col items-center justify-center text-center space-y-3 shrink-0 md:w-56">
        {isConfirmed ? (
          <>
            <div className="p-2 bg-white rounded-2xl shadow-xl">
              {booking.ticketQr ? (
                <img
                  src={booking.ticketQr}
                  alt="Ticket Entry QR Code"
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <QrCode className="w-28 h-28 text-slate-900" />
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              SCAN AT AUDITORIUM
            </span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Ticket</span>
            </button>
          </>
        ) : isPending ? (
          <div className="space-y-2 py-4">
            <Clock3 className="w-12 h-12 text-amber-400 mx-auto animate-spin" />
            <span className="text-xs font-bold text-amber-300 block">
              Verification Pending
            </span>
            <span className="text-[10px] text-slate-500 block max-w-[140px]">
              Gate QR generated upon payment confirmation.
            </span>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto opacity-60" />
            <span className="text-xs font-bold text-rose-400 block">
              Cancelled Pass
            </span>
            <span className="text-[10px] text-slate-500 block">
              Seats released
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
