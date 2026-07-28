const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, location } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const user = await User.create({
    name,
    email,
    password,
    role,
    avatarInitials: initials,
    location,
  });

  res.status(201).json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc  Log in
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc  Get the logged-in user (used by the top bar greeting/avatar)
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
