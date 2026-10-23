import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Poster Image with Gradient & Badges */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-black/60 text-slate-100 backdrop-blur-md border border-white/10 uppercase tracking-wider">
            {movie.certificate || 'U/A 13+'}
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 text-amber-300 backdrop-blur-md border border-white/10 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating?.toFixed(1) || '8.5'}</span>
          </div>
        </div>

        {/* Popularity Rank Ribbon if applicable */}
        {movie.samplePopularityRank > 0 && movie.samplePopularityRank <= 3 && (
          <div className="absolute top-12 left-0 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-r-full shadow-lg">
            Top #{movie.samplePopularityRank}
          </div>
        )}

        {/* Quick Language Badge at Bottom of Poster */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/60 backdrop-blur-md">
            {movie.language}
          </span>
          {movie.status === 'upcoming' && (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/90 text-slate-950 font-bold backdrop-blur-md">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {/* Movie Details */}
      <div className="flex flex-col flex-1 p-5 space-y-2.5">
        <h3 className="text-base font-extrabold text-white group-hover:text-red-400 transition-colors line-clamp-1">
          {movie.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-1">
          {movie.genres?.join(', ')}
        </p>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{movie.duration}m</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500">Tickets from</span>{' '}
            <span className="font-bold text-slate-200">₹{movie.baseTicketPrice || 250}</span>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie._id}`);
          }}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-red-600 group-hover:bg-red-600 text-slate-200 hover:text-white group-hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <Ticket className="w-4 h-4" />
          <span>{movie.status === 'upcoming' ? 'View Details' : 'Book Tickets'}</span>
        </button>
      </div>
    </div>
  );
};
