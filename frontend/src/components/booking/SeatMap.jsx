import React from 'react';
import { Armchair, ShieldAlert, Check, X, Info } from 'lucide-react';

export const SeatMap = ({
  show,
  selectedSeats = [],
  onToggleSeat,
  bookedSeatNumbers = [],
}) => {
  if (!show) return null;

  // Seating layout configuration
  // Rows from front to back: A, B, C (Classic), D, E, F (Premium), G, H (VIP), I, J (Recliner)
  const tiersConfig = [
    {
      name: 'Recliner',
      price: show.pricing?.recliner || 650,
      rows: ['J', 'I'],
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/20',
    },
    {
      name: 'VIP',
      price: show.pricing?.vip || 450,
      rows: ['H', 'G'],
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/20',
    },
    {
      name: 'Premium',
      price: show.pricing?.premium || 320,
      rows: ['F', 'E', 'D'],
      badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-950/20',
    },
    {
      name: 'Classic',
      price: show.pricing?.classic || 220,
      rows: ['C', 'B', 'A'],
      badgeColor: 'border-slate-600 text-slate-300 bg-slate-900',
    },
  ];

  // 12 columns with aisles after col 3 and col 9
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const isSeatBooked = (seatNumber) => {
    return bookedSeatNumbers.includes(seatNumber);
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeats.some((s) => s.seatNumber === seatNumber);
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl space-y-8">
      {/* Curved Screen Banner */}
      <div className="max-w-2xl mx-auto text-center space-y-2">
        <div className="cinema-screen-curve w-full" />
        <div className="text-[11px] font-extrabold tracking-[0.25em] text-sky-400/80 uppercase">
          SCREEN THIS WAY • {show.screenName || 'AUDI 1'}
        </div>
      </div>

      {/* Seating Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700" />
          <span className="text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-red-600 border border-red-500 shadow-md shadow-red-600/40" />
          <span className="text-slate-200 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800/80 opacity-50 relative flex items-center justify-center">
            <X className="w-3 h-3 text-slate-600" />
          </div>
          <span className="text-slate-500">Booked / Sold</span>
        </div>
      </div>

      {/* Seating Matrix Grouped by Tiers */}
      <div className="space-y-6 overflow-x-auto pb-4 scrollbar-thin">
        {tiersConfig.map((tier) => (
          <div key={tier.name} className="space-y-3 min-w-[580px]">
            {/* Tier Header with Price */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 text-xs">
              <span className={`px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${tier.badgeColor}`}>
                {tier.name} — ₹{tier.price}
              </span>
              <span className="text-[11px] text-slate-500">
                Rows: {tier.rows.join(', ')}
              </span>
            </div>

            {/* Rows in this tier */}
            <div className="space-y-2">
              {tier.rows.map((rowLetter) => (
                <div key={rowLetter} className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* Left Row Indicator */}
                  <span className="w-5 text-center text-xs font-bold text-slate-500">
                    {rowLetter}
                  </span>

                  {/* Seats in row */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {columns.map((colNum) => {
                      const seatNumber = `${rowLetter}${colNum}`;
                      const booked = isSeatBooked(seatNumber);
                      const selected = isSeatSelected(seatNumber);
                      const isAisleGap = colNum === 3 || colNum === 9;

                      return (
                        <React.Fragment key={seatNumber}>
                          <button
                            type="button"
                            disabled={booked}
                            onClick={() =>
                              onToggleSeat({
                                seatNumber,
                                tier: tier.name,
                                price: tier.price,
                              })
                            }
                            title={
                              booked
                                ? `Seat ${seatNumber} (Booked)`
                                : `Seat ${seatNumber} - ${tier.name} (₹${tier.price})`
                            }
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all duration-150 ${
                              booked
                                ? 'bg-slate-950/70 text-slate-700 border border-slate-900 cursor-not-allowed opacity-40'
                                : selected
                                ? 'bg-red-600 text-white border border-red-400 shadow-md shadow-red-600/50 seat-pop'
                                : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-red-500 hover:text-white hover:bg-slate-700 active:scale-95'
                            }`}
                          >
                            {colNum}
                          </button>
                          {/* Aisle Spacer */}
                          {isAisleGap && <div className="w-3 sm:w-5" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right Row Indicator */}
                  <span className="w-5 text-center text-xs font-bold text-slate-500">
                    {rowLetter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>Maximum 10 seats allowed per booking. Real-time availability verified on server.</span>
      </div>
    </div>
  );
};
