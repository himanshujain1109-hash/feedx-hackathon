const mongoose = require('mongoose');

// Every meaningful event (donation posted, claimed, delivered) writes one of
// these, which both backs the "Live activity" feed and the leaderboard math.
const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['donated', 'claimed', 'delivered', 'cancelled'],
      required: true,
    },
    foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
    meals: { type: Number, default: 0 },
    message: { type: String, trim: true }, // pre-rendered text e.g. "donated 14 meals"
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
