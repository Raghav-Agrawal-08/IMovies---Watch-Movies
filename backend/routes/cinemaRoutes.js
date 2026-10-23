const express = require('express');
const router = express.Router();
const {
  getCinemas,
  getCities,
  getCinemaById,
  createCinema,
} = require('../controllers/cinemaController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getCinemas);
router.get('/cities', getCities);
router.get('/:id', getCinemaById);

// Admin routes
router.post('/', protect, adminOnly, createCinema);

module.exports = router;
