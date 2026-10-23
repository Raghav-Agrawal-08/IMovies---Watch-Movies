const Show = require('../models/Show');
const Cinema = require('../models/Cinema');
const Movie = require('../models/Movie');

// @desc    Get shows for a movie, optionally filtered by date and city
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movieId, date, city } = req.query;

    const query = {};

    if (movieId) {
      query.movie = movieId;
    }

    if (date) {
      query.date = date; // Format: YYYY-MM-DD
    }

    let cinemaIds = null;
    if (city && city !== 'All') {
      const cinemasInCity = await Cinema.find({
        city: new RegExp(`^${city.trim()}$`, 'i'),
      }).select('_id');
      cinemaIds = cinemasInCity.map((c) => c._id);
      query.cinema = { $in: cinemaIds };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration certificate language')
      .populate('cinema', 'name city address screenTypes facilities')
      .sort({ startTime: 1 });

    // Group shows by Cinema for easier rendering on the movie detail page
    const groupedByCinema = {};
    shows.forEach((show) => {
      if (!show.cinema) return;
      const cinemaId = show.cinema._id.toString();
      if (!groupedByCinema[cinemaId]) {
        groupedByCinema[cinemaId] = {
          cinema: show.cinema,
          shows: [],
        };
      }
      groupedByCinema[cinemaId].shows.push({
        _id: show._id,
        screenName: show.screenName,
        screenType: show.screenType,
        date: show.date,
        startTime: show.startTime,
        pricing: show.pricing,
        totalSeats: show.totalSeats,
        availableSeatsCount: show.totalSeats - (show.bookedSeats ? show.bookedSeats.length : 0),
      });
    });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
      grouped: Object.values(groupedByCinema),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show with full seating map & occupied seat info
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title posterUrl bannerUrl duration certificate language ticketPrice')
      .populate('cinema', 'name city address screenTypes');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Extract list of booked seat numbers
    const bookedSeatNumbers = show.bookedSeats.map((s) => s.seatNumber);

    res.status(200).json({
      success: true,
      data: {
        _id: show._id,
        movie: show.movie,
        cinema: show.cinema,
        screenName: show.screenName,
        screenType: show.screenType,
        date: show.date,
        startTime: show.startTime,
        pricing: show.pricing,
        totalSeats: show.totalSeats,
        bookedSeatNumbers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show (Admin)
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const { movie, cinema, screenName, screenType, date, startTime, pricing } = req.body;

    if (!movie || !cinema || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, cinema, date, and startTime',
      });
    }

    const show = await Show.create({
      movie,
      cinema,
      screenName: screenName || 'Audi 1',
      screenType: screenType || 'Dolby Atmos',
      date,
      startTime,
      pricing: pricing || { classic: 220, premium: 320, vip: 450, recliner: 650 },
      bookedSeats: [],
    });

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
};
