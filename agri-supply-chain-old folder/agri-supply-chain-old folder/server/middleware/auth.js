const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Create rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased from 5 to 20 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called for path:', req.path);
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header missing' 
      });
    }

    // Check for Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid authorization format:', authHeader);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authorization format. Use Bearer scheme' 
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    try {
      console.log('Verifying token...');
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      console.log('User found:', user.email);
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = { auth, loginLimiter }; 