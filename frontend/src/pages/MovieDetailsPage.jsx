import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DateSelector } from '../components/movie/DateSelector';
import { ShowtimesList } from '../components/movie/ShowtimesList';
import { SeatMap } from '../components/booking/SeatMap';
import { BookingSummaryBar } from '../components/booking/BookingSummaryBar';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import {
  Star,
  Clock,
  MapPin,
  Calendar,
  Ticket,
  ChevronLeft,
  Tv,
  Users,
  Play,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCity, openCityModal } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);

  // Date selection (default: today's date formatted YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [groupedCinemas, setGroupedCinemas] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  // Active Show & Seating Map
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeatsList, setBookedSeatsList] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Checkout Modal
  const [activeBooking, setActiveBooking] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);

  const seatMapRef = useRef(null);

  // 1. Fetch Movie
  useEffect(() => {
    const loadMovie = async () => {
      setLoadingMovie(true);
      try {
        const res = await api.movies.getMovieById(id);
        if (res.success) {
          setMovie(res.data);
        }
      } catch (err) {
        showToast('Movie not found or failed to load', 'error');
        navigate('/');
      } finally {
        setLoadingMovie(false);
      }
    };
    loadMovie();
  }, [id, navigate]);

  // 2. Fetch Shows for Movie in current City on selected Date
  useEffect(() => {
    const loadShows = async () => {
      if (!id) return;
      setLoadingShows(true);
      setSelectedShow(null);
      setSelectedSeats([]);

      try {
        const res = await api.shows.getShows({
          movieId: id,
          date: selectedDate,
          city: currentCity,
        });
        if (res.success) {
          setGroupedCinemas(res.grouped || []);
        }
      } catch (err) {
        console.error('Failed to load shows:', err);
      } finally {
        setLoadingShows(false);
      }
    };

    loadShows();
  }, [id, selectedDate, currentCity]);

  // 3. User Selects a Show
  const handleSelectShow = async (showSummary) => {
    setLoadingSeats(true);
    setSelectedSeats([]);
    setSelectedShow(showSummary);

    try {
      const res = await api.shows.getShowById(showSummary._id);
      if (res.success) {
        setSelectedShow(res.data);
        setBookedSeatsList(res.data.bookedSeatNumbers || []);

        // Smooth scroll to seating section
        setTimeout(() => {
          if (seatMapRef.current) {
            seatMapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (err) {
      showToast('Could not load seating map for this show.', 'error');
    } finally {
      setLoadingSeats(false);
    }
  };

  // 4. Toggle Seat Selection
  const handleToggleSeat = (seatObj) => {
    const exists = selectedSeats.some((s) => s.seatNumber === seatObj.seatNumber);

    if (exists) {
      // Remove seat
      setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seatObj.seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        showToast('Maximum 10 seats allowed per booking.', 'warning');
        return;
      }
      setSelectedSeats((prev) => [...prev, seatObj]);
    }
  };

  // 5. Create Booking & Launch Checkout
  const handleProceedToCheckout = async () => {
    if (!selectedShow || selectedSeats.length === 0) {
      showToast('Please select at least 1 seat before checkout.', 'warning');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login', () => handleProceedToCheckout());
      return;
    }

    setCreatingBooking(true);
    try {
      const res = await api.bookings.createBooking(
        selectedShow._id,
        selectedSeats,
        'phonepe_qr'
      );

      if (res.success) {
        setActiveBooking(res.booking);
        setIsCheckoutOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Seat reservation failed.', 'error');
      // Refresh seating map to get updated occupied seats
      if (err.conflictSeats) {
        setBookedSeatsList((prev) => [...prev, ...err.conflictSeats]);
        setSelectedSeats((prev) =>
          prev.filter((s) => !err.conflictSeats.includes(s.seatNumber))
        );
      }
    } finally {
      setCreatingBooking(false);
    }
  };

  if (loadingMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading film details...</span>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen pb-24 space-y-10">
      {/* Back Button Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Movies</span>
        </button>
      </div>

      {/* Cinematic Movie Backdrop Hero Section */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800/80 overflow-hidden">
        {/* Background Image with Gradients */}
        <div className="absolute inset-0">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c15] via-[#080c15]/80 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col md:flex-row gap-8 sm:gap-12 items-start">
          {/* Movie Poster */}
          <div className="w-56 sm:w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-red-950/40 border border-slate-700 shrink-0 bg-slate-900">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
                {movie.status === 'upcoming' ? 'Coming Soon' : 'Now Showing'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                {movie.certificate}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{movie.rating?.toFixed(1) || '8.5'}/10</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({(movie.ratingVotes || 12000).toLocaleString()} votes)
                </span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{movie.duration} mins</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-200">{movie.genres?.join(', ')}</span>
              <span>•</span>
              <span className="text-slate-300">{movie.language} (with subtitles)</span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>

            {/* Cast & Director */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              {movie.director && (
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Director:</span> {movie.director}
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">Featured Cast:</span>
                  <div className="flex flex-wrap gap-3">
                    {movie.cast.map((actor) => (
                      <div
                        key={actor.name}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900/80 border border-slate-800"
                      >
                        <img
                          src={actor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                          alt={actor.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block leading-tight">{actor.name}</span>
                          <span className="text-[10px] text-slate-400 block leading-tight">{actor.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* City Reminder & Date Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0f172a] border border-slate-800">
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />

          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
            <span className="text-xs text-slate-400">Cinemas in:</span>
            <button
              onClick={openCityModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-white hover:border-red-500 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{currentCity}</span>
            </button>
          </div>
        </div>

        {/* Showtimes Grouped List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">
              Available Theatres &amp; Showtimes
            </h3>
            <span className="text-xs text-slate-400">
              Select a showtime to load seat map
            </span>
          </div>

          {loadingShows ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : (
            <ShowtimesList
              groupedCinemas={groupedCinemas}
              onSelectShow={handleSelectShow}
              activeShowId={selectedShow?._id}
            />
          )}
        </div>

        {/* Interactive Seating Map Anchor */}
        {selectedShow && (
          <div ref={seatMapRef} className="pt-8 space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-red-500" />
                  <span>Select Your Seats</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedShow.cinema?.name} • {selectedShow.screenName} ({selectedShow.screenType}) • {selectedShow.startTime}
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Tickets selected:{' '}
                <strong className="text-red-400">{selectedSeats.length}</strong> / 10
              </div>
            </div>

            {loadingSeats ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
              </div>
            ) : (
              <SeatMap
                show={selectedShow}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                bookedSeatNumbers={bookedSeatsList}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Booking Summary Bar */}
      {selectedShow && (
        <BookingSummaryBar
          show={selectedShow}
          selectedSeats={selectedSeats}
          onProceed={handleProceedToCheckout}
          loading={creatingBooking}
        />
      )}

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        booking={activeBooking}
        show={selectedShow}
        onBookingConfirmed={(confirmedBooking) => {
          setSelectedSeats([]);
          setActiveBooking(null);
        }}
      />
    </div>
  );
};
