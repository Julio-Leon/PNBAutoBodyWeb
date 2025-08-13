const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check admin credentials
    if (username !== 'PNBAdmin' || password !== 'v83hbv9s73b') {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      {
        uid: 'admin-001',
        username: 'PNBAdmin',
        role: 'admin',
        type: 'admin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
      }
    );

    res.status(200).json({
      success: true,
      data: {
        uid: 'admin-001',
        username: 'PNBAdmin',
        role: 'admin',
        type: 'admin'
      },
      token,
      message: 'Admin login successful'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin login failed'
    });
  }
});

/**
 * Verify admin token
 */
router.get('/verify', verifyToken, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
    message: 'Admin token valid'
  });
});

module.exports = router;
