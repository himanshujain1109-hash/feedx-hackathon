require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Ngo = require('../models/Ngo');
const Activity = require('../models/Activity');

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    FoodListing.deleteMany(),
    Ngo.deleteMany(),
    Activity.deleteMany(),
  ]);

  const cafe = await User.create({
    name: 'Urban Bites Cafe',
    email: 'cafe@example.com',
    password: 'password123',
    role: 'donor',
    location: { address: 'MG Road, Indore', lat: 22.7196, lng: 75.8577 },
  });

  const volunteer = await User.create({
    name: 'Priya S.',
    email: 'priya@example.com',
    password: 'password123',
    role: 'volunteer',
    location: { address: 'Vijay Nagar, Indore', lat: 22.7532, lng: 75.8937 },
  });

  const ngo = await Ngo.create({
    name: 'Care & Share NGO',
    owner: volunteer._id,
    contactEmail: 'contact@careshare.org',
    acceptedCategories: ['cooked-meals', 'produce'],
    location: { type: 'Point', coordinates: [75.8577, 22.7196], address: 'Indore' },
    verified: true,
  });

  const listing = await FoodListing.create({
    donor: cafe._id,
    name: 'Veg Biryani (12 boxes)',
    category: 'cooked-meals',
    servings: 12,
    description: 'Freshly cooked, packed at 6pm today.',
    location: { type: 'Point', coordinates: [75.8577, 22.7196], address: 'MG Road, Indore' },
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
  });

  await Activity.create({
    actor: cafe._id,
    action: 'donated',
    foodListing: listing._id,
    meals: 12,
    message: 'donated 12 meals',
  });

  console.log('Seed complete:');
  console.log({ cafeId: cafe._id.toString(), volunteerId: volunteer._id.toString(), ngoId: ngo._id.toString(), listingId: listing._id.toString() });
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
