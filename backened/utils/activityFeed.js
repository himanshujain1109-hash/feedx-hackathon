const Activity = require('../models/Activity');

// Writes an Activity doc and pushes it over Socket.io to any connected
// clients so the "Live activity" feed updates in real time instead of the
// frontend's setInterval() simulation.
async function emitActivity(io, { actor, action, foodListing, meals, message }) {
  const activity = await Activity.create({ actor, action, foodListing, meals, message });
  const populated = await activity.populate('actor', 'name avatarInitials');

  if (io) {
    io.emit('activity:new', populated);
  }
  return populated;
}

module.exports = { emitActivity };
