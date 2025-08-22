const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { auth, loginLimiter } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);

// Protected routes
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ 
      success: true,
      user: req.user 
    });
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile' 
    });
  }
});

module.exports = router;
