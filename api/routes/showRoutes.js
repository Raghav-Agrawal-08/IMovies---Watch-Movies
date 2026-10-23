const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowById,
  createShow,
} = require('../controllers/showController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getShows);
router.get('/:id', getShowById);

// Admin routes
router.post('/', protect, adminOnly, createShow);

module.exports = router;
