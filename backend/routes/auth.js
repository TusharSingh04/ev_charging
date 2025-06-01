const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const sessionAuth = require('../middleware/session');

// Helper function to convert UTC date to IST
function toIST(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role: 'user' // Default role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const session = new Session({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    await session.save();

    const obj = user.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    delete obj.password;
    res.status(201).json({
      user: obj,
      token,
      sessionId: session._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create new session
    const session = new Session({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    await session.save();

    const obj = user.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    delete obj.password;
    res.json({
      user: obj,
      token,
      sessionId: session._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', sessionAuth, async (req, res) => {
  try {
    // Deactivate current session
    req.session.isActive = false;
    await req.session.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current session status
router.get('/session', sessionAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.session._id)
      .populate('chargerInUse');
    
    res.json({
      isActive: session.isActive,
      expiresAt: toIST(session.expiresAt),
      chargerInUse: session.chargerInUse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update charger in use
router.patch('/session/charger', sessionAuth, async (req, res) => {
  try {
    const { chargerId } = req.body;
    req.session.chargerInUse = chargerId;
    await req.session.save();
    res.json({ message: 'Charger status updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', sessionAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const obj = user.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    delete obj.password;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/me', sessionAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    const obj = req.user.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    delete obj.password;
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 