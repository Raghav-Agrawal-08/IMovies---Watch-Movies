import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Play, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroBanner = ({ featuredMovies = [] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev'

  const timerRef = useRef(null);

  // Auto-play slider every 5.5 seconds unless hovered
  useEffect(() => {
    if (featuredMovies.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setSlideDirection('next');
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featuredMovies.length, isHovered]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const handleNext = () => {
    setSlideDirection('next');
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setSlideDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <div
      className="relative w-full h-[540px] sm:h-[620px] overflow-hidden bg-[#080c15]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {featuredMovies.map((movie, idx) => {
          const isActive = idx === currentIndex;
          const isPrev =
            idx === (currentIndex - 1 + featuredMovies.length) % featuredMovies.length;

          // Smooth sliding and cross-fading positions
          let transformClass = 'translate-x-full opacity-0 pointer-events-none scale-105';
          if (isActive) {
            transformClass = 'translate-x-0 opacity-100 pointer-events-auto scale-100 z-10';
          } else if (isPrev) {
            transformClass = '-translate-x-full opacity-0 pointer-events-none scale-95 z-0';
          }

          return (
            <div
              key={movie._id || idx}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${transformClass}`}
            >
              {/* Cinematic Wide Banner Backdrop */}
              <div className="absolute inset-0">
                <img
                  src={movie.bannerUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out transform"
                />
                {/* Vignettes & Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c15] via-[#080c15]/65 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080c15] via-[#080c15]/80 to-transparent" />
                <div className="absolute inset-0 bg-black/25" />
              </div>

              {/* Slide Content */}
              <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20">
                <div className={`max-w-2xl space-y-4 transition-all duration-700 delay-150 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                  {/* Badges Strip */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                    <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white tracking-wider uppercase text-[11px] font-black shadow-lg shadow-red-600/50">
                      NOW SHOWING IN CINEMAS
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md">
                      {movie.certificate || 'U/A 13+'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-amber-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{movie.rating?.toFixed(1) || '8.5'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{movie.duration} mins</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                    {movie.title}
                  </h1>

                  {/* Genres & Language */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    <span className="font-semibold text-red-400">{movie.genres?.join(' • ')}</span>
                    <span>|</span>
                    <span className="text-slate-200 font-medium">{movie.language}</span>
                    <span>|</span>
                    <span className="text-slate-400">IMAX 3D &amp; Dolby Atmos</span>
                  </div>

                  {/* Synopsis */}
                  <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow-md">
                    {movie.synopsis}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-3">
                    <button
                      onClick={() => navigate(`/movie/${movie._id}`)}
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/40 flex items-center gap-2.5 transition-all transform active:scale-95 group"
                    >
                      <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Book Tickets Now</span>
                    </button>

                    {movie.trailerUrl && (
                      <a
                        href={movie.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 backdrop-blur-md flex items-center gap-2 transition active:scale-95 shadow-md"
                      >
                        <Play className="w-4 h-4 fill-white text-white" />
                        <span>Watch Trailer</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Smooth Arrow Controls */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border border-slate-700/80 backdrop-blur-md transition-all duration-200 active:scale-90 shadow-xl z-20 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border border-slate-700/80 backdrop-blur-md transition-all duration-200 active:scale-90 shadow-xl z-20 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Animated Indicators with Mini Thumbnails */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20 bg-slate-900/70 p-1.5 px-3 rounded-full border border-slate-800 backdrop-blur-md">
          {featuredMovies.map((m, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={m._id || idx}
                onClick={() => {
                  setSlideDirection(idx > currentIndex ? 'next' : 'prev');
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${
                  isActive ? 'w-8 bg-red-600 shadow-md shadow-red-600/50' : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                title={m.title}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
