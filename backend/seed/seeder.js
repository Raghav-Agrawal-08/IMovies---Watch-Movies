const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { movies, cinemas } = require('./seedData');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

dotenv.config();

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Cinema.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    console.log('[Seeder] Creating admin and demo users...');
    const adminUser = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Alex Parker',
      email: 'demo@imovies.com',
      password: 'Password123!',
      role: 'user',
    });

    console.log('[Seeder] Inserting movies...');
    const createdMovies = await Movie.insertMany(movies);

    console.log('[Seeder] Inserting cinemas...');
    const createdCinemas = await Cinema.insertMany(cinemas);

    console.log('[Seeder] Generating shows for next 5 days...');
    const showtimes = ['10:15 AM', '01:45 PM', '05:00 PM', '08:15 PM', '10:45 PM'];
    const screenTypesList = ['IMAX 3D', 'Dolby Atmos', '4DX', 'Standard 2D'];

    const today = new Date();
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(formatDate(d));
    }

    const showsToInsert = [];

    // All rows A to J, columns 1 to 14 (total 10 * 14 = 140 seats layout)
    const possibleSeatNumbers = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach((r) => {
      for (let c = 1; c <= 12; c++) {
        possibleSeatNumbers.push(`${r}${c}`);
      }
    });

    for (const cinema of createdCinemas) {
      // Pick 3-4 movies per cinema
      const activeMovies = createdMovies.filter((m) => m.status === 'now_showing');

      for (const movie of activeMovies) {
        for (const dateStr of dates) {
          // Add 2 to 3 showtimes per movie per day
          const times = [showtimes[0], showtimes[2], showtimes[3]];

          times.forEach((time, index) => {
            const screenType = cinema.screenTypes[index % cinema.screenTypes.length] || 'Dolby Atmos';
            
            // Randomly pre-book 6 to 14 seats so seat map has realistic booked seats
            const bookedSeats = [];
            const numBooked = Math.floor(Math.random() * 8) + 6;
            const shuffledSeats = [...possibleSeatNumbers].sort(() => 0.5 - Math.random());
            const sampleBooked = shuffledSeats.slice(0, numBooked);

            sampleBooked.forEach((seatNum) => {
              bookedSeats.push({
                seatNumber: seatNum,
                bookedBy: demoUser._id,
                bookedAt: new Date(),
              });
            });

            showsToInsert.push({
              movie: movie._id,
              cinema: cinema._id,
              screenName: `Audi ${index + 1} - ${screenType}`,
              screenType,
              date: dateStr,
              startTime: time,
              pricing: {
                classic: movie.baseTicketPrice,
                premium: movie.baseTicketPrice + 80,
                vip: movie.baseTicketPrice + 160,
                recliner: movie.baseTicketPrice + 280,
              },
              totalSeats: 120,
              bookedSeats,
            });
          });
        }
      }
    }

    await Show.insertMany(showsToInsert);
    console.log(`[Seeder] Seeded ${showsToInsert.length} shows across ${createdCinemas.length} cinemas and ${createdMovies.length} movies!`);

    // Create a sample confirmed booking for Demo User so "My Tickets" has a verified sample ticket
    const sampleShow = await Show.findOne({ bookedSeats: { $ne: [] } }).populate('movie cinema');
    if (sampleShow) {
      const sampleBooking = await Booking.create({
        bookingReference: 'IM-DEMO77',
        user: demoUser._id,
        show: sampleShow._id,
        movie: sampleShow.movie._id,
        cinema: sampleShow.cinema._id,
        movieTitle: sampleShow.movie.title,
        moviePoster: sampleShow.movie.posterUrl,
        cinemaName: sampleShow.cinema.name,
        cinemaCity: sampleShow.cinema.city,
        screenName: sampleShow.screenName,
        screenType: sampleShow.screenType,
        showDate: sampleShow.date,
        showTime: sampleShow.startTime,
        seats: [
          { seatNumber: 'E5', tier: 'Premium', price: sampleShow.pricing.premium },
          { seatNumber: 'E6', tier: 'Premium', price: sampleShow.pricing.premium },
        ],
        baseAmount: sampleShow.pricing.premium * 2,
        convenienceFee: 60,
        totalAmount: sampleShow.pricing.premium * 2 + 60,
        status: 'confirmed',
        paymentMethod: 'phonepe_qr',
        ticketQr: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23080c15"/><text x="10" y="50" fill="white" font-size="12">IM-DEMO77</text></svg>',
      });

      await Payment.create({
        booking: sampleBooking._id,
        user: demoUser._id,
        amount: sampleBooking.totalAmount,
        currency: 'INR',
        method: 'phonepe_qr',
        status: 'verified',
        transactionId: 'TXN-PHONEPE-9921',
        upiUtr: '123456789012',
        verificationNotes: 'Verified via UPI Settlement',
        verifiedAt: new Date(),
      });
      console.log('[Seeder] Created verified sample ticket for demo user.');
    }

    console.log('--------------------------------------------------');
    console.log('Database Seeding Complete!');
    console.log('Demo Accounts:');
    console.log('  Admin User: admin@imovies.com / AdminPassword123!');
    console.log('  Demo User:  demo@imovies.com  / Password123!');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seeder Error]:', error);
  }
};

module.exports = { seedDatabase };

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}
