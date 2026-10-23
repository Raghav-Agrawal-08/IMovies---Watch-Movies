const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Show = require('../models/Show');
const { getRazorpayInstance, verifyRazorpaySignature } = require('../config/razorpay');
const { generateTicketQrData, generateUpiQrDataUrl } = require('../utils/qrGenerator');

// @desc    Initiate PhonePe UPI QR payment data
// @route   POST /api/payments/phonepe/initiate
// @access  Private
const initiatePhonePePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed.' });
    }

    const { upiString, qrDataUrl } = await generateUpiQrDataUrl(booking.totalAmount, booking.bookingReference);

    res.status(200).json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        amountDue: booking.totalAmount,
        merchantVpa: 'raghav.agrawal@phonepe',
        merchantName: 'Raghav Agrawal',
        upiString,
        generatedQr: qrDataUrl,
        staticQrUrl: '/phonepe-qr.png',
        notice: 'Note: Scanning a static QR code does not automatically confirm the booking on our server. Please submit the 12-digit UPI UTR transaction reference after paying, or choose Razorpay for instant automated verification.',
        expiresAt: booking.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit UPI UTR transaction ID for PhonePe payment
// @route   POST /api/payments/phonepe/submit-utr
// @access  Private
const submitPhonePeUtr = async (req, res, next) => {
  try {
    const { bookingId, utr, payerVpa } = req.body;

    if (!bookingId || !utr) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 12-digit UPI UTR / Reference Number.',
      });
    }

    const cleanedUtr = utr.trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanedUtr)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UTR number. The UPI Transaction Reference (UTR) must be exactly 12 numeric digits.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if another payment already used this UTR
    const existingPayment = await Payment.findOne({ upiUtr: cleanedUtr, status: 'verified' });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'This UPI UTR has already been claimed for another booking.',
      });
    }

    let payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      payment = new Payment({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        method: 'phonepe_qr',
      });
    }

    payment.method = 'phonepe_qr';
    payment.upiUtr = cleanedUtr;
    payment.upiPayerVpa = payerVpa ? payerVpa.trim() : '';
    payment.status = 'pending';
    payment.verificationNotes = 'UTR submitted by user. Awaiting payment reconciliation.';
    await payment.save();

    booking.paymentMethod = 'phonepe_qr';
    booking.payment = payment._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'UTR submitted successfully. Your booking is under pending payment verification.',
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        paymentStatus: payment.status,
        utr: cleanedUtr,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order (Keeps secret keys strictly on server)
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const razorpay = getRazorpayInstance();
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!razorpay || !keyId) {
      return res.status(200).json({
        success: true,
        isConfigured: false,
        message: 'Razorpay keys not yet configured in server environment. Please use Demo Sandbox or configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      });
    }

    const options = {
      amount: Math.round(booking.totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: booking.bookingReference,
      notes: {
        bookingId: booking._id.toString(),
        movie: booking.movieTitle,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order details to payment record
    let payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      payment = new Payment({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        method: 'razorpay',
      });
    }

    payment.method = 'razorpay';
    payment.razorpayOrderId = order.id;
    payment.status = 'pending';
    await payment.save();

    booking.paymentMethod = 'razorpay';
    booking.payment = payment._id;
    await booking.save();

    res.status(200).json({
      success: true,
      isConfigured: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature (Server HMAC-SHA256)
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      payment = new Payment({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        method: 'razorpay',
      });
    }

    if (!isValid) {
      payment.status = 'failed';
      payment.verificationNotes = 'Razorpay signature verification failed. Untrusted payment attempt.';
      await payment.save();

      booking.status = 'failed';
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Digital signature mismatch.',
      });
    }

    // Payment Verified Successfully
    payment.status = 'verified';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpayOrderId = razorpay_order_id;
    payment.razorpaySignature = razorpay_signature;
    payment.verifiedAt = new Date();
    await payment.save();

    booking.status = 'confirmed';
    booking.ticketQr = await generateTicketQrData(booking);
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your tickets are confirmed.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Demo Payment Sandbox (Explicitly separated and marked for testing)
// @route   POST /api/payments/demo-sandbox
// @access  Private
const processDemoSandboxPayment = async (req, res, next) => {
  try {
    const { bookingId, action } = req.body; // action: 'simulate_success' or 'simulate_failure'

    if (!bookingId || !['simulate_success', 'simulate_failure'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid demo request. Specify action as simulate_success or simulate_failure.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      payment = new Payment({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        method: 'demo_sandbox',
      });
    }

    payment.method = 'demo_sandbox';

    if (action === 'simulate_success') {
      payment.status = 'verified';
      payment.verificationNotes = '[DEMO SANDBOX] Payment simulated as successful for demonstration and grading.';
      payment.transactionId = `DEMO-PASS-${Date.now()}`;
      payment.verifiedAt = new Date();
      await payment.save();

      booking.status = 'confirmed';
      booking.ticketQr = await generateTicketQrData(booking);
      await booking.save();

      return res.status(200).json({
        success: true,
        message: '[Demo Sandbox Mode] Simulated payment succeeded. Tickets confirmed.',
        booking,
      });
    } else {
      // Simulate failure
      payment.status = 'failed';
      payment.verificationNotes = '[DEMO SANDBOX] Simulated payment decline.';
      await payment.save();

      booking.status = 'failed';
      await booking.save();

      // Release seats
      const seatNumbers = booking.seats.map((s) => s.seatNumber);
      await Show.findByIdAndUpdate(booking.show, {
        $pull: { bookedSeats: { seatNumber: { $in: seatNumbers } } },
      });

      return res.status(200).json({
        success: false,
        message: '[Demo Sandbox Mode] Simulated payment was declined. Seats have been released.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Admin verification of PhonePe UPI Payment
// @route   POST /api/payments/admin/verify-upi
// @access  Private/Admin
const adminVerifyUpiPayment = async (req, res, next) => {
  try {
    const { bookingId, action, notes } = req.body; // action: 'approve' or 'reject'

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (action === 'approve') {
      payment.status = 'verified';
      payment.verificationNotes = notes || 'Verified manually by Admin after bank statement check.';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      await payment.save();

      booking.status = 'confirmed';
      booking.ticketQr = await generateTicketQrData(booking);
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Payment approved. Booking confirmed and ticket generated.',
        booking,
      });
    } else {
      payment.status = 'failed';
      payment.verificationNotes = notes || 'Rejected by Admin: Payment not received in bank statement.';
      await payment.save();

      booking.status = 'cancelled';
      await booking.save();

      // Release seats
      const seatNumbers = booking.seats.map((s) => s.seatNumber);
      await Show.findByIdAndUpdate(booking.show, {
        $pull: { bookedSeats: { seatNumber: { $in: seatNumbers } } },
      });

      return res.status(200).json({
        success: true,
        message: 'Payment rejected. Booking cancelled and seats released.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePhonePePayment,
  submitPhonePeUtr,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processDemoSandboxPayment,
  adminVerifyUpiPayment,
};
