import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
import auth, { verifyToken } from '../middleware/auth.js';
import sessionAuth from '../middleware/session.js';
import bcrypt from 'bcryptjs';
import { login, register, verifyRole } from '../controllers/authController.js';

const router = express.Router();

// Helper function to convert UTC date to IST
function toIST(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

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

// Setup first admin user (only works if no admin exists)
router.post('/setup-admin', async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ error: 'Admin user already exists. Please contact existing admin for access.' });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new admin user
    const user = new User({
      email,
      password,
      role: 'admin'
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

// Create additional admin user (only by existing admin)
router.post('/create-admin', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin users can create new admin users' });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new admin user
    const user = new User({
      email,
      password,
      role: 'admin'
    });

    await user.save();

    const obj = user.toObject();
    obj.createdAt = toIST(obj.createdAt);
    obj.updatedAt = toIST(obj.updatedAt);
    delete obj.password;
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
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

// Verify role route (protected)
router.get('/verify-role', verifyToken, verifyRole);

export default router; 