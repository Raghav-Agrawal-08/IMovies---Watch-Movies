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
    console.error('[Database Connection Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured in your environment or Vercel settings.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// Health check endpoint
const handleHealth = (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'IMovies Full-Stack API (Single Vercel Serverless Function)',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Mount API routes
// Support both /api/path and /path so Vercel rewrites work seamlessly regardless of URL structure
const mountRoutes = (prefix = '') => {
  app.use(`${prefix}/auth`, require('./routes/authRoutes'));
  app.use(`${prefix}/movies`, require('./routes/movieRoutes'));
  app.use(`${prefix}/cinemas`, require('./routes/cinemaRoutes'));
  app.use(`${prefix}/shows`, require('./routes/showRoutes'));
  app.use(`${prefix}/bookings`, require('./routes/bookingRoutes'));
  app.use(`${prefix}/payments`, require('./routes/paymentRoutes'));
  app.use(`${prefix}/seed`, require('./routes/seedRoutes'));
};

mountRoutes('/api');
mountRoutes('');

// Central Error Handler
app.use(errorHandler);

module.exports = app;
