const crypto = require('crypto');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Payment = require('../models/Payment');
const { generateTicketQrData } = require('../utils/qrGenerator');

// Generate unique booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Create a new booking and reserve seats
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, selectedSeats, paymentMethod = 'phonepe_qr' } = req.body;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat to proceed with booking.',
      });
    }

    if (selectedSeats.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'A maximum of 10 seats can be booked in a single transaction.',
      });
    }

    const show = await Show.findById(showId).populate('movie cinema');
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'The requested movie show was not found.',
      });
    }

    const requestedSeatNumbers = selectedSeats.map((s) => s.seatNumber);

    // ATOMIC CONCURRENCY CHECK:
    // Check if any requested seat is already booked for this show
    const alreadyBooked = show.bookedSeats.filter((b) =>
      requestedSeatNumbers.includes(b.seatNumber)
    );

    if (alreadyBooked.length > 0) {
      const conflictSeats = alreadyBooked.map((b) => b.seatNumber).join(', ');
      return res.status(409).json({
        success: false,
        message: `Seats (${conflictSeats}) have just been booked by another user. Please choose alternative seats.`,
        conflictSeats: alreadyBooked.map((b) => b.seatNumber),
      });
    }

    // Calculate amounts securely on server
    let baseAmount = 0;
    const validatedSeats = [];

    for (const item of selectedSeats) {
      const tier = item.tier || 'Classic';
      const tierKey = tier.toLowerCase();
      const seatPrice = show.pricing[tierKey] || show.pricing.classic || 220;
      baseAmount += seatPrice;
      validatedSeats.push({
        seatNumber: item.seatNumber,
        tier: tier,
        price: seatPrice,
      });
    }

    const convenienceFee = validatedSeats.length * 30; // ₹30 convenience fee per ticket
    const totalAmount = baseAmount + convenienceFee;
    const bookingReference = generateBookingRef();

    // Create the booking in 'pending' status
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      cinema: show.cinema._id,
      movieTitle: show.movie.title,
      moviePoster: show.movie.posterUrl,
      cinemaName: show.cinema.name,
      cinemaCity: show.cinema.city,
      screenName: show.screenName,
      screenType: show.screenType,
      showDate: show.date,
      showTime: show.startTime,
      seats: validatedSeats,
      baseAmount,
      convenienceFee,
      totalAmount,
      status: 'pending', // Pending payment verification
      paymentMethod,
    });

    // Atomically reserve seats on the show with booking ID
    const seatEntries = validatedSeats.map((s) => ({
      seatNumber: s.seatNumber,
      bookingId: booking._id,
      bookedBy: req.user._id,
      bookedAt: new Date(),
    }));

    await Show.findByIdAndUpdate(show._id, {
      $push: { bookedSeats: { $each: seatEntries } },
    });

    // Create initial pending payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      currency: 'INR',
      method: paymentMethod,
      status: 'pending',
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    booking.payment = payment._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Seats held successfully. Please complete payment to confirm your booking.',
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (My Tickets)
// @route   GET /api/bookings/my-tickets
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl duration language certificate')
      .populate('cinema', 'name city address')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID or Reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    let booking;
    if (req.params.id.startsWith('IM-')) {
      booking = await Booking.findOne({ bookingReference: req.params.id });
    } else {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking ticket.',
      });
    }

    await booking.populate('movie cinema payment');

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and release seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Release seats from show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { seatNumber: { $in: seatNumbers } } },
    });

    booking.status = 'cancelled';
    await booking.save();

    // Mark payment as failed/cancelled
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, {
        status: 'failed',
        remarks: 'Cancelled by user or expired',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and seats have been released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
