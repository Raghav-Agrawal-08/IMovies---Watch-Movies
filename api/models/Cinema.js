const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Cinema address is required'],
    },
    screenTypes: [
      {
        type: String,
        enum: ['IMAX 3D', 'Dolby Atmos', '4DX', 'ScreenX', 'Standard 2D'],
        default: ['Standard 2D', 'Dolby Atmos'],
      },
    ],
    facilities: [
      {
        type: String,
        default: ['Recliner Seats', 'F&B Service', 'Wheelchair Access', 'Parking'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cinema', cinemaSchema);
