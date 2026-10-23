const QRCode = require('qrcode');

const generateTicketQrData = async (booking) => {
  try {
    const payload = JSON.stringify({
      ref: booking.bookingReference,
      movie: booking.movieTitle,
      cinema: booking.cinemaName,
      date: booking.showDate,
      time: booking.showTime,
      seats: booking.seats.map((s) => s.seatNumber),
      amount: booking.totalAmount,
      status: 'CONFIRMED',
      issuedAt: new Date().toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#080c15',
        light: '#ffffff',
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating ticket QR:', error);
    return '';
  }
};

const generateUpiQrDataUrl = async (amount, bookingRef) => {
  try {
    const upiString = `upi://pay?pa=imovies.ticket@phonepe&pn=IMOVIES%20ENTERTAINMENT&am=${amount.toFixed(
      2
    )}&cu=INR&tr=${bookingRef}&tn=IMovies%20Ticket%20Booking%20${bookingRef}`;

    const qrDataUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#5f259f', // PhonePe brand purple
        light: '#ffffff',
      },
    });

    return { upiString, qrDataUrl };
  } catch (error) {
    console.error('Error generating UPI QR:', error);
    return { upiString: '', qrDataUrl: '' };
  }
};

module.exports = {
  generateTicketQrData,
  generateUpiQrDataUrl,
};
