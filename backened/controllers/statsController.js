const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');

// @desc  Powers the hero "rescue ring" + meals counter + hero-stat carousel
// @route GET /api/stats/overview?goal=1000
// @access Public
const getOverview = asyncHandler(async (req, res) => {
  const goal = parseInt(req.query.goal, 10) || 1000;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [mealsToday, activeListings, completedTotal] = await Promise.all([
    FoodListing.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$servings' } } },
    ]),
    FoodListing.countDocuments({ status: 'available' }),
    FoodListing.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$servings' } } },
    ]),
  ]);

  const mealsRescuedToday = mealsToday[0]?.total || 0;
  const totalCompleted = completedTotal[0]?.total || 0;

  res.json({
    success: true,
    data: {
      mealsRescuedToday,
      goal,
      progressPct: Math.min(mealsRescuedToday / goal, 1),
      activeListings,
      totalMealsRescued: totalCompleted,
    },
  });
});

module.exports = { getOverview };
