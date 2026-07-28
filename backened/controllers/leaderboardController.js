const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');
const User = require('../models/User');

function rangeToDate(range) {
  const now = new Date();
  if (range === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null; // 'all'
}

// @desc  Top donors, matching the leaderboard tabs (week / month / all-time)
// @route GET /api/leaderboard?range=week|month|all&limit=10
// @access Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const { range = 'all', limit = 10 } = req.query;

  if (range === 'all') {
    const top = await User.find({ 'stats.mealsDonated': { $gt: 0 } })
      .sort({ 'stats.mealsDonated': -1 })
      .limit(parseInt(limit, 10))
      .select('name avatarInitials stats.mealsDonated stats.points');

    return res.json({
      success: true,
      range,
      data: top.map((u) => ({
        userId: u._id,
        name: u.name,
        avatarInitials: u.avatarInitials,
        meals: u.stats.mealsDonated,
        points: u.stats.points,
      })),
    });
  }

  const since = rangeToDate(range);
  const agg = await Activity.aggregate([
    { $match: { action: 'donated', createdAt: { $gte: since } } },
    { $group: { _id: '$actor', meals: { $sum: '$meals' } } },
    { $sort: { meals: -1 } },
    { $limit: parseInt(limit, 10) },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        name: '$user.name',
        avatarInitials: '$user.avatarInitials',
        meals: 1,
      },
    },
  ]);

  res.json({ success: true, range, data: agg });
});

module.exports = { getLeaderboard };
