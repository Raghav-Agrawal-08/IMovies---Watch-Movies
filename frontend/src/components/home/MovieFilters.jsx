import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const MovieFilters = ({
  selectedGenre,
  setSelectedGenre,
  selectedLanguage,
  setSelectedLanguage,
  selectedStatus,
  setSelectedStatus,
  onResetFilters,
}) => {
  const genres = [
    'All',
    'Action',
    'Sci-Fi',
    'Thriller',
    'Adventure',
    'Drama',
    'Comedy',
    'Romance',
    'Horror',
  ];

  const languages = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];

  const hasActiveFilters =
    selectedGenre !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedStatus !== 'all';

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Top Filter Bar: Status & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Status Switch Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Films
          </button>
          <button
            onClick={() => setSelectedStatus('now_showing')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'now_showing'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'upcoming'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition py-1 px-2.5 rounded-lg hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Genre Filter Pills */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-red-500" />
          <span>Filter by Genre</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  isSelected
                    ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Filter Pills */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Filter by Language</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  isSelected
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
