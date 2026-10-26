import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Film,
  Calendar,
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Tv,
  Loader2,
  RefreshCw,
  Search,
  Building2,
  MapPin,
} from 'lucide-react';

export const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'movies', 'shows', 'cinemas'
  const [loading, setLoading] = useState(true);

  // Stats
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  // Add Movie Modal State
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    bannerUrl: '',
    duration: 140,
    certificate: 'U/A 13+',
    language: 'English',
    genres: 'Action, Thriller',
    baseTicketPrice: 280,
    isFeatured: false,
    releaseDate: '2026-10-22',
  });

  // Add Cinema Modal State
  const [isAddCinemaModalOpen, setIsAddCinemaModalOpen] = useState(false);
  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    screenTypes: ['Standard 2D', 'Dolby Atmos', 'IMAX 3D'],
    facilities: ['Recliner Seats', 'F&B Service', 'Parking'],
  });

  // Schedule Show State
  const [showForm, setShowForm] = useState({
    movieId: '',
    cinemaId: '',
    screenName: 'Audi 1 - IMAX Laser',
    screenType: 'IMAX 3D',
    date: '2026-10-22',
    startTime: '07:30 PM',
    classicPrice: 240,
    premiumPrice: 340,
    vipPrice: 480,
    reclinerPrice: 650,
  });

  const loadAdminData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [bookingsRes, moviesRes, cinemasRes] = await Promise.all([
        api.bookings.getAllBookings(),
        api.movies.getMovies({ status: 'all' }),
        api.cinemas.getCinemas(),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (moviesRes.success) setMovies(moviesRes.data || []);
      if (cinemasRes.success) setCinemas(cinemasRes.data || []);

      if (moviesRes.data?.length > 0 && !showForm.movieId) {
        setShowForm((prev) => ({
          ...prev,
          movieId: moviesRes.data[0]._id,
          cinemaId: cinemasRes.data?.[0]?._id || '',
        }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  // Admin verifies PhonePe UPI payment
  const handleVerifyUpi = async (bookingId, action) => {
    try {
      const res = await api.payments.adminVerifyUpi(
        bookingId,
        action,
        action === 'approve' ? 'Approved by Admin in Console' : 'Rejected by Admin'
      );
      showToast(
        action === 'approve'
          ? 'Payment confirmed and ticket issued!'
          : 'Payment rejected and seats released.',
        action === 'approve' ? 'success' : 'info'
      );
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  // Add Movie submit
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        duration: Number(movieForm.duration),
        baseTicketPrice: Number(movieForm.baseTicketPrice),
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        releaseDate: new Date(movieForm.releaseDate),
      };

      const res = await api.movies.createMovie(payload);
      if (res.success) {
        showToast('Movie added successfully!', 'success');
        setIsAddMovieModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add movie', 'error');
    }
  };

  // Delete movie
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await api.movies.deleteMovie(movieId);
      if (res.success) {
        showToast('Movie deleted.', 'info');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Add Cinema submit
  const handleAddCinema = async (e) => {
    e.preventDefault();
    try {
      const res = await api.cinemas.createCinema(cinemaForm);
      if (res.success) {
        showToast('Theatre added successfully!', 'success');
        setIsAddCinemaModalOpen(false);
        setCinemaForm({
          name: '',
          city: 'Mumbai',
          address: '',
          screenTypes: ['Standard 2D', 'Dolby Atmos', 'IMAX 3D'],
          facilities: ['Recliner Seats', 'F&B Service', 'Parking'],
        });
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add theatre', 'error');
    }
  };

  // Delete cinema
  const handleDeleteCinema = async (cinemaId) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      const res = await api.cinemas.deleteCinema(cinemaId);
      if (res.success) {
        showToast('Theatre removed.', 'info');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Schedule show submit
  const handleScheduleShow = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movie: showForm.movieId,
        cinema: showForm.cinemaId,
        screenName: showForm.screenName,
        screenType: showForm.screenType,
        date: showForm.date,
        startTime: showForm.startTime,
        pricing: {
          classic: Number(showForm.classicPrice),
          premium: Number(showForm.premiumPrice),
          vip: Number(showForm.vipPrice),
          recliner: Number(showForm.reclinerPrice),
        },
      };

      const res = await api.shows.createShow(payload);
      if (res.success) {
        showToast('New show scheduled successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to schedule show', 'error');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please log in with the administrator account to manage movies, schedule showtimes, and reconcile payments.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <div><strong>Demo Admin Login:</strong></div>
            <div className="text-amber-400">admin@imovies.com / AdminPassword123!</div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  // Calculate high-level stats
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Admin Management Console
              </h1>
              <p className="text-xs text-slate-400">
                Manage films, auditoriums, schedules, and verify customer payments
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block">From verified tickets</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Confirmed Passes
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {confirmedBookings.length}
          </div>
          <span className="text-[11px] text-emerald-400 block">Payment settled</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Payments
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {pendingBookings.length}
          </div>
          <span className="text-[11px] text-slate-500 block">Awaiting UTR or review</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Movies
          </span>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {movies.length}
          </div>
          <span className="text-[11px] text-slate-500 block">Across {cinemas.length} cinemas</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'bookings'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bookings &amp; UPI Verification ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'movies'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Movies Catalog ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('shows')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'shows'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Schedule Shows
        </button>
        <button
          onClick={() => setActiveTab('cinemas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cinemas'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Theatres &amp; Screens ({cinemas.length})
        </button>
      </div>

      {/* TAB 1: BOOKINGS & PAYMENT RECONCILIATION */}
      {activeTab === 'bookings' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Customer Bookings &amp; Payment Status
            </h3>
            <span className="text-xs text-slate-400">
              Review submitted UPI UTRs to confirm passes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0f19] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Movie &amp; Show</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method / UTR</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => {
                  const payment = b.payment || {};
                  return (
                    <tr key={b._id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono font-bold text-red-400">
                        {b.bookingReference}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{b.user?.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400">{b.user?.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{b.movieTitle}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.cinemaName} • {b.showDate} @ {b.showTime}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">
                        {b.seats?.map((s) => s.seatNumber).join(', ')}
                      </td>
                      <td className="p-4 font-black text-white">
                        ₹{b.totalAmount}
                      </td>
                      <td className="p-4">
                        <span className="capitalize block font-semibold text-slate-300">
                          {b.paymentMethod?.replace('_', ' ')}
                        </span>
                        {payment.upiUtr ? (
                          <span className="font-mono text-[11px] text-purple-300 block">
                            UTR: {payment.upiUtr}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 block">No UTR</span>
                        )}
                      </td>
                      <td className="p-4">
                        {b.status === 'confirmed' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            CONFIRMED
                          </span>
                        )}
                        {b.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            PENDING
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {b.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerifyUpi(b._id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition shadow"
                              title="Confirm payment & generate ticket QR"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyUpi(b._id, 'reject')}
                              className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg font-bold text-[11px] transition"
                              title="Reject & release seats"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <span className="text-emerald-400 font-bold text-[11px]">Pass Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIE CATALOG MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">
              Movies Catalog ({movies.length})
            </h3>
            <button
              onClick={() => setIsAddMovieModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-3xl bg-[#0f172a] border border-slate-800 flex gap-4 items-start"
              >
                <img
                  src={m.posterUrl}
                  alt={m.title}
                  className="w-20 aspect-[2/3] object-cover rounded-xl bg-slate-900 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-extrabold text-white text-sm truncate">{m.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{m.genres?.join(', ')}</p>
                  <div className="text-[11px] text-slate-500">
                    {m.duration}m • {m.language} • {m.certificate}
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    Base: ₹{m.baseTicketPrice}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleDeleteMovie(m._id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE SHOWS */}
      {activeTab === 'shows' && (
        <div className="max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-white">
              Schedule a Movie Showtime
            </h3>
            <p className="text-xs text-slate-400">
              Create a new auditorium showtime with custom tier pricing
            </p>
          </div>

          <form onSubmit={handleScheduleShow} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Movie
              </label>
              <select
                value={showForm.movieId}
                onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.language})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Cinema / Theatre
              </label>
              <select
                value={showForm.cinemaId}
                onChange={(e) => setShowForm({ ...showForm, cinemaId: e.target.value })}
                className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
              >
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Screen Format
                </label>
                <select
                  value={showForm.screenType}
                  onChange={(e) => setShowForm({ ...showForm, screenType: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
                >
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="Dolby Atmos">Dolby Atmos</option>
                  <option value="4DX">4DX</option>
                  <option value="Standard 2D">Standard 2D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Screen Name
                </label>
                <input
                  type="text"
                  value={showForm.screenName}
                  onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Show Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={showForm.date}
                  onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Start Time (e.g. 07:30 PM)
                </label>
                <input
                  type="text"
                  value={showForm.startTime}
                  onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Tier Pricing (in ₹ INR)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400">Classic</label>
                  <input
                    type="number"
                    value={showForm.classicPrice}
                    onChange={(e) => setShowForm({ ...showForm, classicPrice: e.target.value })}
                    className="w-full bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Premium</label>
                  <input
                    type="number"
                    value={showForm.premiumPrice}
                    onChange={(e) => setShowForm({ ...showForm, premiumPrice: e.target.value })}
                    className="w-full bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">VIP</label>
                  <input
                    type="number"
                    value={showForm.vipPrice}
                    onChange={(e) => setShowForm({ ...showForm, vipPrice: e.target.value })}
                    className="w-full bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Recliner</label>
                  <input
                    type="number"
                    value={showForm.reclinerPrice}
                    onChange={(e) => setShowForm({ ...showForm, reclinerPrice: e.target.value })}
                    className="w-full bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
            >
              Save and Publish Show
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: THEATRES / CINEMAS MANAGEMENT */}
      {activeTab === 'cinemas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                Theatres &amp; Cinema Halls ({cinemas.length})
              </h3>
              <p className="text-xs text-slate-400">
                Manage cinema hubs, screens, formats, and amenities
              </p>
            </div>
            <button
              onClick={() => setIsAddCinemaModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Theatre</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cinemas.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{c.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {c.city}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </p>

                  <div className="pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Screen Formats
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.screenTypes?.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {c.facilities?.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Amenities
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {c.facilities.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteCinema(c._id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Theatre</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MOVIE MODAL */}
      {isAddMovieModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddMovieModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white">Add New Movie</h3>
            <form onSubmit={handleAddMovie} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Synopsis *</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Poster URL *</label>
                  <input
                    type="url"
                    required
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Banner URL *</label>
                  <input
                    type="url"
                    required
                    value={movieForm.bannerUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration (m)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={movieForm.baseTicketPrice}
                    onChange={(e) => setMovieForm({ ...movieForm, baseTicketPrice: e.target.value })}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Certificate</label>
                  <select
                    value={movieForm.certificate}
                    onChange={(e) => setMovieForm({ ...movieForm, certificate: e.target.value })}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="U">U</option>
                    <option value="U/A 13+">U/A 13+</option>
                    <option value="U/A 16+">U/A 16+</option>
                    <option value="A">A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={movieForm.genres}
                  onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={movieForm.isFeatured}
                  onChange={(e) => setMovieForm({ ...movieForm, isFeatured: e.target.checked })}
                  className="rounded text-red-600 focus:ring-0"
                />
                <label htmlFor="featured-check" className="text-slate-300 font-semibold">
                  Feature in Home Hero Carousel
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMovieModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CINEMA MODAL */}
      {isAddCinemaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddCinemaModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white">Add New Cinema / Theatre</h3>
            <form onSubmit={handleAddCinema} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Theatre Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PVR INOX: Phoenix Palladium"
                  value={cinemaForm.name}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">City *</label>
                <select
                  value={cinemaForm.city}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi-NCR</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 462 Senapati Bapat Marg, Lower Parel, Mumbai"
                  value={cinemaForm.address}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supported Screen Formats</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {['IMAX 3D', 'Dolby Atmos', '4DX', 'ScreenX', 'Standard 2D'].map((fmt) => (
                    <label key={fmt} className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={cinemaForm.screenTypes.includes(fmt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCinemaForm({
                              ...cinemaForm,
                              screenTypes: [...cinemaForm.screenTypes, fmt],
                            });
                          } else {
                            setCinemaForm({
                              ...cinemaForm,
                              screenTypes: cinemaForm.screenTypes.filter((t) => t !== fmt),
                            });
                          }
                        }}
                        className="rounded text-red-600 focus:ring-0"
                      />
                      <span>{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCinemaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
