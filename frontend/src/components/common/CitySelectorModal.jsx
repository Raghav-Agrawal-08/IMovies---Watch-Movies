import React, { useState, useEffect } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export const CitySelectorModal = () => {
  const { currentCity, cities, selectCity, isCityModalOpen, closeCityModal } = useCity();
  const [searchTerm, setSearchTerm] = useState('');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCityModalOpen) {
        closeCityModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCityModalOpen, closeCityModal]);

  if (!isCityModalOpen) return null;

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 modal-backdrop-blur animate-in fade-in-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCityModal();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Select Your City</h3>
              <p className="text-xs text-slate-400">Cinemas and showtimes will update for this location</p>
            </div>
          </div>
          <button
            onClick={closeCityModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search city (e.g. Mumbai, Delhi, Bengaluru)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* City Grid */}
        <div className="p-6 pt-3 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredCities.map((city) => {
              const isSelected = city.toLowerCase() === currentCity.toLowerCase();
              return (
                <button
                  key={city}
                  onClick={() => selectCity(city)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl text-left border text-sm font-semibold transition group ${
                    isSelected
                      ? 'bg-red-950/40 border-red-600 text-red-200 shadow-md shadow-red-950/40'
                      : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="truncate">{city}</span>
                  {isSelected && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No matching cinema hubs found for "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Current Location: <strong className="text-slate-200">{currentCity}</strong></span>
          <span className="text-[11px] text-slate-500">More cities added monthly</span>
        </div>
      </div>
    </div>
  );
};
