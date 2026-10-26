const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    screenName: {
      type: String,
      default: 'Audi 1',
    },
    screenType: {
      type: String,
      enum: ['IMAX 3D', 'Dolby Atmos', '4DX', 'ScreenX', 'Standard 2D'],
      default: 'Dolby Atmos',
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "07:30 PM"
      required: true,
    },
    pricing: {
      classic: { type: Number, default: 220 },
      premium: { type: Number, default: 320 },
      vip: { type: Number, default: 450 },
      recliner: { type: Number, default: 650 },
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
    bookedSeats: [
      {
        seatNumber: {
          type: String,
          required: true,
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        bookedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch shows for a movie in a date range
showSchema.index({ movie: 1, date: 1, cinema: 1 });

module.exports = mongoose.model('Show', showSchema);
