const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');
const User = require('../models/User');
const { seedDatabase } = require('../seed/seeder');

// Check database status
router.get('/status', async (req, res) => {
  try {
    const movieCount = await Movie.countDocuments();
    const cinemaCount = await Cinema.countDocuments();
    const showCount = await Show.countDocuments();
    const userCount = await User.countDocuments();

    res.status(200).json({
      success: true,
      isSeeded: movieCount > 0,
      counts: {
        movies: movieCount,
        cinemas: cinemaCount,
        shows: showCount,
        users: userCount,
      },
      message: movieCount > 0
        ? 'Database is active and populated with IMovies data.'
        : 'Database is empty. Call POST /api/seed or visit GET /api/seed?secret=seed_imovies_2026 to populate sample movies and showtimes.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Seed endpoint (supports both GET for easy browser URL click and POST)
const handleSeed = async (req, res) => {
  try {
    const secretProvided = req.query.secret || req.body?.secret || req.headers['x-seed-secret'];
    const expectedSecret = process.env.SEED_SECRET || 'seed_imovies_2026';

    const movieCount = await Movie.countDocuments();
    // Allow seeding if database is completely empty OR if the secret matches
    if (movieCount > 0 && secretProvided !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Database is already seeded. To re-seed, provide ?secret=seed_imovies_2026 (or your configured SEED_SECRET).',
      });
    }

    console.log('[Seed Route] Triggering database seeding...');
    const result = await seedDatabase();

    res.status(200).json({
      success: true,
      message: 'IMovies database successfully seeded on MongoDB Atlas!',
      demoAccounts: {
        customer: 'demo@imovies.com / Password123!',
        admin: 'admin@imovies.com / AdminPassword123!',
      },
      result,
    });
  } catch (err) {
    console.error('[Seed Route Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database: ' + err.message,
    });
  }
};

router.get('/', handleSeed);
router.post('/', handleSeed);

module.exports = router;
