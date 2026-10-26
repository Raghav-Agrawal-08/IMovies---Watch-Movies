import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';
import { HeroBanner } from '../components/home/HeroBanner';
import { PopularRanking } from '../components/home/PopularRanking';
import { MovieFilters } from '../components/home/MovieFilters';
import { MovieCard } from '../components/home/MovieCard';
import { Film, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const HomePage = ({ searchQuery }) => {
  const { currentCity } = useCity();

  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [popularRankings, setPopularRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchMoviesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery.trim();

      const [moviesRes, rankingsRes] = await Promise.all([
        api.movies.getMovies(params),
        api.movies.getPopularRankings(),
      ]);

      if (moviesRes.success) {
        setMovies(moviesRes.data);
        // Featured for hero carousel
        const featured = moviesRes.data.filter((m) => m.isFeatured);
        setFeaturedMovies(featured.length > 0 ? featured : moviesRes.data.slice(0, 3));
      }

      if (rankingsRes.success) {
        setPopularRankings(rankingsRes.data);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Unable to load movies. Please verify your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, [selectedGenre, selectedLanguage, selectedStatus, searchQuery]);

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen pb-20 space-y-12">
      {/* Cinematic Hero Carousel Banner (Only on clean search) */}
      {!searchQuery && (
        <HeroBanner featuredMovies={featuredMovies} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Curated Popularity Rankings Section */}
        {!searchQuery && popularRankings.length > 0 && (
          <PopularRanking rankingMovies={popularRankings} />
        )}

        {/* Section Header: Explore Films in City */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-red-600" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : `Now Showing in ${currentCity}`}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any movie to browse auditoriums, showtimes, and reserve your seats
            </p>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-sm">
            {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} Available
          </div>
        </div>

        {/* Interactive Filters */}
        <MovieFilters
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onResetFilters={handleResetFilters}
        />

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="aspect-[2/3] rounded-3xl bg-slate-900 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Failed to Load Movies</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={fetchMoviesData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
            >
              Retry
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Movies Match Your Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any films matching the selected genre or language criteria. Try resetting your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
