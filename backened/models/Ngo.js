const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    acceptedCategories: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number] }, // [lng, lat]
      address: { type: String, trim: true },
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ngoSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ngo', ngoSchema);
