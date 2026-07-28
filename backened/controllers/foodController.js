const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { emitActivity } = require('../utils/activityFeed');

// @desc  List / search food (search bar, category chips, "near me")
// @route GET /api/food?query=&category=&lat=&lng=&radiusKm=&status=
// @access Public
const listFood = asyncHandler(async (req, res) => {
  const { query, category, lat, lng, radiusKm = 5, status = 'available' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category && category !== 'all') filter.category = category;
  if (query) filter.name = { $regex: query, $options: 'i' };

  let results;
  if (lat && lng) {
    results = await FoodListing.find({
      ...filter,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radiusKm) * 1000,
        },
      },
    }).populate('donor', 'name avatarInitials');
  } else {
    results = await FoodListing.find(filter)
      .sort({ createdAt: -1 })
      .populate('donor', 'name avatarInitials');
  }

  res.json({ success: true, count: results.length, data: results });
});

// @desc  Get a single listing
// @route GET /api/food/:id
const getFood = asyncHandler(async (req, res) => {
  const item = await FoodListing.findById(req.params.id).populate('donor', 'name avatarInitials');
  if (!item) {
    res.status(404);
    throw new Error('Listing not found');
  }
  res.json({ success: true, data: item });
});

// @desc  Post a donation (the bottom-sheet form / FAB)
// @route POST /api/food
// @access Private
const createFood = asyncHandler(async (req, res) => {
  const { name, category, servings, description, lat, lng, address, expiresInMinutes } = req.body;

  if (!name || !servings || lat === undefined || lng === undefined || !expiresInMinutes) {
    res.status(400);
    throw new Error('name, servings, lat, lng and expiresInMinutes are required');
  }

  const listing = await FoodListing.create({
    donor: req.user._id,
    name,
    category,
    servings,
    description,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address,
    },
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: {
      'stats.mealsDonated': servings,
      'stats.donationsCount': 1,
      'stats.points': servings * 2,
    },
  });

  await emitActivity(req.app.get('io'), {
    actor: req.user._id,
    action: 'donated',
    foodListing: listing._id,
    meals: servings,
    message: `donated ${servings} meals`,
  });

  res.status(201).json({ success: true, data: listing });
});

// @desc  Claim a listing (the "Claim" button on a food card)
// @route POST /api/food/:id/claim
// @access Private
const claimFood = asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('This listing is no longer available');
  }

  listing.status = 'claimed';
  listing.claimedBy = req.user._id;
  listing.claimedAt = new Date();
  await listing.save();

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'stats.mealsClaimed': listing.servings, 'stats.points': listing.servings },
  });

  await emitActivity(req.app.get('io'), {
    actor: req.user._id,
    action: 'claimed',
    foodListing: listing._id,
    meals: listing.servings,
    message: `claimed ${listing.servings} meals — ${listing.name}`,
  });

  res.json({ success: true, data: listing });
});

// @desc  Cancel / mark delivered — small lifecycle helper
// @route PATCH /api/food/:id/status
// @access Private
const updateFoodStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['completed', 'cancelled'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of ${allowed.join(', ')}`);
  }

  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (![listing.donor.toString(), listing.claimedBy?.toString()].includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  listing.status = status;
  await listing.save();

  if (status === 'completed') {
    await emitActivity(req.app.get('io'), {
      actor: req.user._id,
      action: 'delivered',
      foodListing: listing._id,
      meals: listing.servings,
      message: `delivered ${listing.servings} meals`,
    });
  }

  res.json({ success: true, data: listing });
});

module.exports = { listFood, getFood, createFood, claimFood, updateFoodStatus };
