import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    // Create new user with default role as 'user'
    const user = new User({
      email,
      password,
      role: 'user'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Email, password, and role are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify role matches the one in database
    if (user.role !== role) {
      return res.status(403).json({
        error: 'Invalid role for this user'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Verify role controller
export const verifyRole = async (req, res) => {
  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Return user role
    res.json({
      role: user.role
    });
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}; 