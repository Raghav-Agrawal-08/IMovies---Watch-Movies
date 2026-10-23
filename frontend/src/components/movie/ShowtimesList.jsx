import React from 'react';
import { MapPin, Sparkles, Tv, Armchair } from 'lucide-react';

export const ShowtimesList = ({ groupedCinemas = [], onSelectShow, activeShowId }) => {
  if (!groupedCinemas || groupedCinemas.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
        <Tv className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-white mb-1">No Showtimes Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          There are no shows scheduled for this movie on the selected date in this city. Try changing the date or city above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedCinemas.map(({ cinema, shows }) => (
        <div
          key={cinema._id}
          className="p-5 sm:p-6 rounded-3xl bg-[#0f172a] border border-slate-800/80 shadow-lg space-y-4 transition hover:border-slate-700"
        >
          {/* Cinema Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-white">
                  {cinema.name}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {cinema.city}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="line-clamp-1">{cinema.address}</span>
              </div>
            </div>

            {/* Facilities Badges */}
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
              {cinema.facilities?.slice(0, 3).map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Showtimes Buttons */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
              Available Showtimes
            </div>
            <div className="flex flex-wrap gap-3">
              {shows.map((show) => {
                const isActive = activeShowId === show._id;
                return (
                  <button
                    key={show._id}
                    onClick={() => onSelectShow(show)}
                    className={`flex flex-col items-center py-2 px-4 rounded-2xl border transition-all active:scale-95 text-left group ${
                      isActive
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-red-500/50'
                    }`}
                  >
                    <span className="text-sm font-black tracking-tight">
                      {show.startTime}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-red-100' : 'text-amber-400 group-hover:text-amber-300'
                      }`}
                    >
                      {show.screenType}
                    </span>
                    <span
                      className={`text-[9px] mt-0.5 ${
                        isActive ? 'text-red-200' : 'text-slate-500'
                      }`}
                    >
                      {show.availableSeatsCount} seats left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
