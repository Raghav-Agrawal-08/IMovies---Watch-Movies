import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Info, Star, Ticket } from 'lucide-react';

export const PopularRanking = ({ rankingMovies = [] }) => {
  const navigate = useNavigate();

  if (!rankingMovies || rankingMovies.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header with Clear Sample Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Trending &amp; Popular Movies
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample Curated Ranking (Demo Dataset)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Ranking Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {rankingMovies.map((movie, index) => {
          const rank = movie.samplePopularityRank || index + 1;
          return (
            <div
              key={movie._id || index}
              onClick={() => navigate(`/movie/${movie._id}`)}
              className="relative flex-none w-56 sm:w-64 bg-[#0f172a] rounded-3xl p-3 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group snap-start shadow-lg hover:shadow-red-950/20"
            >
              {/* Big Cinematic Rank Number Overlay */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 mb-3">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                
                {/* Stylized Giant Rank Number */}
                <div className="absolute bottom-1 left-2 text-5xl sm:text-6xl font-black text-white/95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] font-sans italic tracking-tighter">
                  #{rank}
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 border border-white/10 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{movie.rating?.toFixed(1) || '8.5'}</span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="px-1 space-y-1">
                <h4 className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors truncate">
                  {movie.title}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {movie.genres?.slice(0, 2).join(' • ')}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">{movie.language}</span>
                  <span className="text-xs font-bold text-slate-300">₹{movie.baseTicketPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
