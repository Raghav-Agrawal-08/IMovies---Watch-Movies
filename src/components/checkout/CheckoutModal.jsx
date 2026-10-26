import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  CreditCard,
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const CheckoutModal = ({
  isOpen,
  onClose,
  booking,
  show,
  onBookingConfirmed,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('phonepe'); // 'phonepe', 'razorpay', 'sandbox'
  const [utrNumber, setUtrNumber] = useState('');
  const [payerVpa, setPayerVpa] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phonepeData, setPhonepeData] = useState(null);

  // Countdown timer for 10 minutes hold
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!isOpen || !booking) return;

    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Fetch PhonePe QR data
    const loadPhonePe = async () => {
      try {
        const res = await api.payments.initiatePhonePe(booking._id);
        if (res.success) {
          setPhonepeData(res.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic PhonePe data:', err.message);
      }
    };

    loadPhonePe();

    return () => clearInterval(timer);
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard!', 'info');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // 1. Submit PhonePe UTR
  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');

    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMessage('Please enter a valid 12-digit numeric UPI UTR / Reference number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.payments.submitPhonePeUtr(booking._id, cleanUtr, payerVpa);
      showToast('UPI Reference submitted. Ticket is pending verification.', 'success');
      onBookingConfirmed(res.data);
      onClose();
      navigate(`/booking-confirmation/${booking._id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit UPI reference.');
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Razorpay Flow
  const handleRazorpayPayment = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderRes = await api.payments.createRazorpayOrder(booking._id);

      if (!orderRes.isConfigured) {
        // Razorpay keys not yet set in .env
        setErrorMessage(
          'Razorpay Gateway credentials are not configured in backend/.env. Please use the Demo Payment Sandbox tab or submit PhonePe UTR.'
        );
        showToast('Razorpay keys not configured in server .env', 'warning');
        setSubmitting(false);
        return;
      }

      // If Razorpay SDK is loaded and keys exist
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const options = {
        key: orderRes.order.key,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: 'IMovies Cinema',
        description: `Movie Tickets: ${booking.movieTitle}`,
        order_id: orderRes.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.payments.verifyRazorpay({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              showToast('Payment verified successfully! Tickets confirmed.', 'success');
              onBookingConfirmed(verifyRes.booking);
              onClose();
              navigate(`/booking-confirmation/${booking._id}`);
            }
          } catch (err) {
            setErrorMessage('Payment verification failed on the server.');
            showToast('Payment verification error', 'error');
          }
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
        },
        theme: {
          color: '#e50914',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setErrorMessage(`Payment failed: ${resp.error.description}`);
        showToast('Payment was not completed', 'error');
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initiate Razorpay checkout.');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Demo Sandbox Flow
  const handleSandboxSimulation = async (action) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.payments.demoSandbox(booking._id, action);
      if (action === 'simulate_success') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        showToast('[Demo Mode] Payment simulated! Tickets confirmed.', 'success');
        onBookingConfirmed(res.booking);
        onClose();
        navigate(`/booking-confirmation/${booking._id}`);
      } else {
        showToast('[Demo Mode] Payment declined. Seats released.', 'error');
        onClose();
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Simulation error.');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 modal-backdrop-blur animate-in fade-in-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Payment &amp; Booking Confirmation
              </h3>
              <p className="text-xs text-slate-400">
                Reference: <strong className="text-slate-200">{booking.bookingReference}</strong> • Total Due:{' '}
                <strong className="text-red-400">₹{booking.totalAmount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seat Hold Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                timeLeft < 120
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment Tabs Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('phonepe')}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'phonepe'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/50 shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>PhonePe UPI QR</span>
          </button>

          <button
            onClick={() => setActiveTab('razorpay')}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'razorpay'
                ? 'bg-sky-900/40 text-sky-200 border border-sky-500/50 shadow-md shadow-sky-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>Razorpay Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'sandbox'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-500/50 shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Demo Sandbox</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: PHONEPE UPI QR */}
          {activeTab === 'phonepe' && (
            <div className="space-y-6">
              {/* Mandatory Prompt Transparency Notice */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Important Verification Rule:</span>
                </div>
                <p>
                  Scanning a static QR code does <strong>not</strong> automatically notify the website whether the payment succeeded. To confirm your booking, scan and pay via PhonePe / any UPI app, then submit the <strong>12-digit UPI Transaction Reference (UTR)</strong> below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Display Card with User's Uploaded PhonePe QR Image */}
                <div className="flex flex-col items-center justify-center p-3 bg-black/90 rounded-2xl border border-slate-800 shadow-2xl">
                  <img
                    src="/phonepe-qr.png"
                    alt="PhonePe UPI QR Code - Raghav Agrawal"
                    className="w-64 max-h-[380px] object-contain rounded-xl border border-slate-800 shadow-lg"
                  />
                  <div className="mt-2.5 text-center">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 block">
                      Raghav Agrawal • PhonePe Merchant
                    </span>
                    <span className="text-base font-black text-white">
                      Amount Due: ₹{booking.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Payment Steps & UTR Form */}
                <div className="space-y-4">
                  {/* Merchant UPI ID Copy Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Payee: Raghav Agrawal (UPI ID)
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-purple-300">
                        raghav.agrawal@phonepe
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('raghav.agrawal@phonepe')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 border border-slate-700 transition"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* UTR Input Form */}
                  <form onSubmit={handleSubmitUtr} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        12-Digit UPI Transaction Reference (UTR) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        placeholder="e.g. 428901847291"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-900 text-sm font-mono text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Found in your PhonePe / UPI app transaction details (UTR / Ref No.)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your UPI ID / Phone (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. alex@okaxis or 9876543210"
                        value={payerVpa}
                        onChange={(e) => setPayerVpa(e.target.value)}
                        className="w-full bg-slate-900 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || utrNumber.length !== 12}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition disabled:opacity-40"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Reference...' : 'Submit UTR for Verification'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAZORPAY GATEWAY */}
          {activeTab === 'razorpay' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-600/40 text-sky-200 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Secure Razorpay Gateway Integration:</span>
                </div>
                <p>
                  Secret keys stay strictly on the backend. The server creates the order with HMAC-SHA256 signature verification upon return.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-600/20 text-sky-400 mx-auto flex items-center justify-center">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Pay Online via Razorpay
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Supports Credit/Debit Cards, NetBanking, UPI, and Digital Wallets. Verification is cryptographically completed in real time.
                  </p>
                </div>

                <div className="text-2xl font-black text-white">
                  Total: ₹{booking.totalAmount}
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRazorpayPayment}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-sky-600/30 transition active:scale-95 disabled:opacity-40"
                >
                  {submitting ? 'Connecting Gateway...' : 'Launch Razorpay Checkout'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DEMO SANDBOX (EXPLICITLY LABELED) */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Demo Mode Sandbox (Evaluation Only)</span>
                </div>
                <p>
                  This sandbox mode explicitly verifies all backend booking lifecycle steps (seat locks, payment verification record, ticket QR issuance, and cancellation release) without needing live banking credentials.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-slate-300">
                  Select a test simulation scenario:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Simulate Success */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Simulate Success</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Simulates an approved payment callback. Tickets are confirmed and generated with gate QR code.
                    </p>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSandboxSimulation('simulate_success')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      {submitting ? 'Simulating...' : 'Simulate Successful Payment'}
                    </button>
                  </div>

                  {/* Simulate Decline */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <X className="w-5 h-5" />
                      <span>Simulate Decline</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Simulates a failed/cancelled payment. Held seats are released back to the seating map.
                    </p>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSandboxSimulation('simulate_failure')}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition"
                    >
                      {submitting ? 'Simulating...' : 'Simulate Payment Failure'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 text-center text-xs text-slate-500">
          IMovies Secure Checkout Engine • 256-bit Encrypted Transaction
        </div>
      </div>
    </div>
  );
};
