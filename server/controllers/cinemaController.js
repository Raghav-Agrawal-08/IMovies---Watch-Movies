const Cinema = require('../models/Cinema');

// @desc    Get cinemas (optionally filtered by city)
// @route   GET /api/cinemas
// @access  Public
const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};

    if (city && city !== 'All') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    const cinemas = await Cinema.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: cinemas.length,
      data: cinemas,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique cities list
// @route   GET /api/cinemas/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const cities = await Cinema.distinct('city');
    res.status(200).json({
      success: true,
      data: cities.length > 0 ? cities : ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cinema by ID
// @route   GET /api/cinemas/:id
// @access  Public
const getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found',
      });
    }
    res.status(200).json({
      success: true,
      data: cinema,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create cinema (Admin)
// @route   POST /api/cinemas
// @access  Private/Admin
const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cinema added successfully.',
      data: cinema,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cinema (Admin)
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    res.status(200).json({ success: true, message: 'Cinema deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCinemas,
  getCities,
  getCinemaById,
  createCinema,
  deleteCinema,
};
