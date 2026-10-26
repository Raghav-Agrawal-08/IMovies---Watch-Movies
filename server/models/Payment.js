const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['phonepe_qr', 'razorpay', 'demo_sandbox'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
      index: true,
    },
    // Razorpay specific details
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    // PhonePe UPI QR specific details
    upiUtr: {
      type: String,
      default: '', // User's submitted 12-digit transaction reference / UTR
    },
    upiPayerVpa: {
      type: String,
      default: '',
    },
    phonepeQrUrl: {
      type: String,
      default: '',
    },
    // Admin or webhook verification notes
    verificationNotes: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
