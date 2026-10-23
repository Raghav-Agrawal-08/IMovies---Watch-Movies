const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getPopularRankings,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getMovies);
router.get('/popular-rankings', getPopularRankings);
router.get('/:id', getMovieById);

// Admin routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
