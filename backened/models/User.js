const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'volunteer', 'admin'],
      default: 'donor',
    },
    avatarInitials: { type: String, trim: true, maxlength: 3 },
    location: {
      address: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    // Rolled-up stats shown on profile / leaderboard / hero ring
    stats: {
      mealsDonated: { type: Number, default: 0 },
      mealsClaimed: { type: Number, default: 0 },
      donationsCount: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
