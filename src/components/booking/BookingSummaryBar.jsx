import React from 'react';
import { Ticket, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BookingSummaryBar = ({
  show,
  selectedSeats = [],
  onProceed,
  loading = false,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const seatCount = selectedSeats.length;
  const baseTotal = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);
  const convenienceFee = seatCount * 30;
  const grandTotal = baseTotal + convenienceFee;

  const handleCheckoutClick = () => {
    if (seatCount === 0) return;

    if (!isAuthenticated) {
      openAuthModal('login', () => {
        onProceed();
      });
      return;
    }

    onProceed();
  };

  return (
    <div className="sticky bottom-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 p-4 sm:p-5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Seats and Cost Breakdown */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <div>
            <div className="text-xs text-slate-400 font-semibold">
              Selected Seats ({seatCount})
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {seatCount > 0 ? (
                <span className="text-red-400">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              ) : (
                <span className="text-slate-500 text-sm font-normal">
                  No seats selected yet
                </span>
              )}
            </div>
          </div>

          <div className="border-l border-slate-800 pl-4 sm:pl-8">
            <div className="text-xs text-slate-400 font-semibold">
              Total Amount (incl. fees)
            </div>
            <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-2">
              <span>₹{grandTotal}</span>
              {seatCount > 0 && (
                <span className="text-xs font-normal text-slate-400">
                  (₹{baseTotal} + ₹{convenienceFee} fee)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            type="button"
            disabled={seatCount === 0 || loading}
            onClick={handleCheckoutClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>
              {loading
                ? 'Reserving Seats...'
                : seatCount === 0
                ? 'Select At Least 1 Seat'
                : !isAuthenticated
                ? 'Sign In & Checkout'
                : 'Proceed to Pay'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
