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
    'Crime',
    'Mystery',
    'Animation',
    'Fantasy',
  ];

  const languages = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];

  const hasActiveFilters =
    selectedGenre !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedStatus !== 'all';

  return (
    <div className="bg-white dark:bg-[#0f172a]/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-sm dark:shadow-xl space-y-5 transition-colors">
      {/* Top Filter Bar: Status & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        {/* Status Switch Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Films
          </button>
          <button
            onClick={() => setSelectedStatus('now_showing')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'now_showing'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedStatus === 'upcoming'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-rose-400 transition py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Genre Filter Pills */}
      <div>
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-red-600" />
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
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
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
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
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
