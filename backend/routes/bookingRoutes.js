const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, bookingLimiter, createBooking);
router.get('/my-tickets', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin route
router.get('/', protect, adminOnly, getAllBookings);

module.exports = router;
