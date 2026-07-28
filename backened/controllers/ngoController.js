const asyncHandler = require('express-async-handler');
const Ngo = require('../models/Ngo');

// @desc  List NGOs (optionally near a point, for donation matching)
// @route GET /api/ngos?lat=&lng=&radiusKm=
const listNgos = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm = 10 } = req.query;
  let ngos;

  if (lat && lng) {
    ngos = await Ngo.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radiusKm) * 1000,
        },
      },
    });
  } else {
    ngos = await Ngo.find().sort({ createdAt: -1 });
  }

  res.json({ success: true, count: ngos.length, data: ngos });
});

// @desc  Register an NGO
// @route POST /api/ngos
// @access Private (ngo/admin)
const createNgo = asyncHandler(async (req, res) => {
  const { name, contactEmail, contactPhone, acceptedCategories, lat, lng, address } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('name is required');
  }

  const ngo = await Ngo.create({
    name,
    owner: req.user._id,
    contactEmail,
    contactPhone,
    acceptedCategories,
    location:
      lat && lng
        ? { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)], address }
        : undefined,
  });

  res.status(201).json({ success: true, data: ngo });
});

module.exports = { listNgos, createNgo };
