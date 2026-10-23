const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const Movie = require('./models/Movie');
const { seedDatabase } = require('./seed/seeder');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'IMovies Movie Ticket Booking API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/cinemas', require('./routes/cinemaRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Serve frontend in production build if present, and public folder for static assets
const frontendDist = path.join(__dirname, '../frontend/dist');
const frontendPublic = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPublic));
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        message: 'IMovies Backend API running. Run the frontend dev server at http://localhost:5173 or build the frontend.',
      });
    }
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is empty
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Startup] No movies detected in database. Executing automatic database seed...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('[Startup Seeding Error]:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🎬 IMovies Backend API Server running on port ${PORT}`);
    console.log(`  🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();

module.exports = app;
