const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    bannerUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    availableLanguages: [
      {
        type: String,
        default: ['English', 'Hindi'],
      },
    ],
    duration: {
      type: Number, // in minutes
      required: true,
    },
    certificate: {
      type: String,
      enum: ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A', 'PG-13', 'R'],
      default: 'U/A 13+',
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },
    ratingVotes: {
      type: Number,
      default: 12000,
    },
    baseTicketPrice: {
      type: Number,
      default: 250,
    },
    cast: [
      {
        name: String,
        role: String,
        avatar: String,
      },
    ],
    director: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming'],
      default: 'now_showing',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    samplePopularityRank: {
      type: Number,
      default: 0, // 1 for #1, 2 for #2, etc. (clearly documented as curated sample ranking)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
