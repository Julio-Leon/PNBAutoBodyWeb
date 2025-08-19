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

    // Generate admin JWT token with explicit admin role
    const adminPayload = {
      uid: 'admin-001',
      username: 'PNBAdmin',
      role: 'admin',
      type: 'admin'
    };
    
    console.log('Creating admin token with payload:', adminPayload);
    
    const token = jwt.sign(
      adminPayload,
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
router.get('/verify', verifyToken, (req, res) => {
  // Enhanced verification response with detailed user info
  console.log('Admin verify endpoint - User object:', JSON.stringify(req.user));
  
  res.status(200).json({
    success: true,
    data: req.user,
    message: 'Admin token valid',
    debug: {
      role: req.user.role,
      type: req.user.type,
      uid: req.user.uid,
      username: req.user.username
    }
  });
});

/**
 * Test endpoint for debugging admin permissions
 */
router.get('/test-permissions', verifyToken, (req, res) => {
  const isAdmin = req.user.role === 'admin' || req.user.type === 'admin';
  
  res.status(200).json({
    success: true,
    message: 'Permission test endpoint',
    user: req.user,
    permissions: {
      isAdmin,
      canEditAppointments: isAdmin,
      role: req.user.role,
      type: req.user.type
    }
  });
});

module.exports = router;
