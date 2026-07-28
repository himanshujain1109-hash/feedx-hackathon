const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');

// @desc  Recent activity feed (initial load — live updates come via socket)
// @route GET /api/activity?limit=5
// @access Public
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);
  const items = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor', 'name avatarInitials')
    .populate('foodListing', 'name category');

  res.json({ success: true, data: items });
});

module.exports = { getActivity };
