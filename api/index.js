const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-seed-secret'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pre-flight & DB Connection Middleware
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[API Database Connection Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured in your environment or Vercel settings.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'IMovies Movie Ticket Booking API (Vercel Serverless)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/cinemas', require('./routes/cinemaRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));

// Central Error Handler
app.use(errorHandler);

module.exports = app;
