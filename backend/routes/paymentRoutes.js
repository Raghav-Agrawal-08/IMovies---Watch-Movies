const express = require('express');
const router = express.Router();
const {
  initiatePhonePePayment,
  submitPhonePeUtr,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processDemoSandboxPayment,
  adminVerifyUpiPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// PhonePe UPI QR flows
router.post('/phonepe/initiate', protect, initiatePhonePePayment);
router.post('/phonepe/submit-utr', protect, submitPhonePeUtr);

// Razorpay flows (Server verifies cryptographic HMAC signature)
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Dedicated Demo Sandbox simulation route
router.post('/demo-sandbox', protect, processDemoSandboxPayment);

// Admin manual review and approval of UPI payments
router.post('/admin/verify-upi', protect, adminOnly, adminVerifyUpiPayment);

module.exports = router;
