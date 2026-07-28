const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Veg Biryani (12 boxes)"
    category: {
      type: String,
      enum: ['bakery', 'produce', 'cooked-meals', 'dairy', 'grains', 'other'],
      default: 'other',
    },
    servings: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },

    // GeoJSON point so we can do proper "nearby" queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [lng, lat]
        type: [Number],
        required: true,
      },
      address: { type: String, trim: true },
    },

    expiresAt: { type: Date, required: true }, // powers the countdown timer on the card
    status: {
      type: String,
      enum: ['available', 'claimed', 'completed', 'expired', 'cancelled'],
      default: 'available',
    },

    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
