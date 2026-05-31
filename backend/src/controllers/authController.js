// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
exports.register = async (req, res) => {
  try {
    const { username, mobileNumber, password, role } = req.body;

    console.log('Registration attempt:', { username, mobileNumber, role });

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ mobileNumber }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or Mobile Number already exists' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      mobileNumber,
      password,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    console.log('User registered successfully:', user.username);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      $or: [{ mobileNumber: identifier }, { username: identifier }] 
    });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};