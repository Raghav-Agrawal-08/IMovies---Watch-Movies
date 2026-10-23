const API_BASE = '/api';

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(res);
    },
    register: async (name, email, password) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
    updateProfile: async (payload) => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
  },

  // Movies
  movies: {
    getMovies: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/movies?${query}`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    getMovieById: async (id) => {
      const res = await fetch(`${API_BASE}/movies/${id}`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    getPopularRankings: async () => {
      const res = await fetch(`${API_BASE}/movies/popular-rankings`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    createMovie: async (data) => {
      const res = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateMovie: async (id, data) => {
      const res = await fetch(`${API_BASE}/movies/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    deleteMovie: async (id) => {
      const res = await fetch(`${API_BASE}/movies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
  },

  // Cinemas
  cinemas: {
    getCinemas: async (city) => {
      const q = city ? `?city=${encodeURIComponent(city)}` : '';
      const res = await fetch(`${API_BASE}/cinemas${q}`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    getCities: async () => {
      const res = await fetch(`${API_BASE}/cinemas/cities`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
  },

  // Shows
  shows: {
    getShows: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/shows?${query}`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    getShowById: async (id) => {
      const res = await fetch(`${API_BASE}/shows/${id}`, {
        headers: getHeaders(false),
      });
      return handleResponse(res);
    },
    createShow: async (data) => {
      const res = await fetch(`${API_BASE}/shows`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Bookings
  bookings: {
    createBooking: async (showId, selectedSeats, paymentMethod) => {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ showId, selectedSeats, paymentMethod }),
      });
      return handleResponse(res);
    },
    getMyTickets: async () => {
      const res = await fetch(`${API_BASE}/bookings/my-tickets`, {
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
    getBookingById: async (id) => {
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
    cancelBooking: async (id) => {
      const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
    getAllBookings: async () => {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: getHeaders(true),
      });
      return handleResponse(res);
    },
  },

  // Payments
  payments: {
    initiatePhonePe: async (bookingId) => {
      const res = await fetch(`${API_BASE}/payments/phonepe/initiate`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ bookingId }),
      });
      return handleResponse(res);
    },
    submitPhonePeUtr: async (bookingId, utr, payerVpa) => {
      const res = await fetch(`${API_BASE}/payments/phonepe/submit-utr`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ bookingId, utr, payerVpa }),
      });
      return handleResponse(res);
    },
    createRazorpayOrder: async (bookingId) => {
      const res = await fetch(`${API_BASE}/payments/razorpay/create-order`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ bookingId }),
      });
      return handleResponse(res);
    },
    verifyRazorpay: async (payload) => {
      const res = await fetch(`${API_BASE}/payments/razorpay/verify`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
    demoSandbox: async (bookingId, action) => {
      const res = await fetch(`${API_BASE}/payments/demo-sandbox`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ bookingId, action }),
      });
      return handleResponse(res);
    },
    adminVerifyUpi: async (bookingId, action, notes) => {
      const res = await fetch(`${API_BASE}/payments/admin/verify-upi`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ bookingId, action, notes }),
      });
      return handleResponse(res);
    },
  },
};
