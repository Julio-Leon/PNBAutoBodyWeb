const jwt = require('jsonwebtoken');
const { getAuth } = require('../config/firebase');

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || 'customer'
        };
        next();
      } catch (firebaseError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token.'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication.'
    });
  }
};

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * Check if user has staff or admin role
 */
const requireStaff = (req, res, next) => {
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Staff or admin role required.'
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        try {
          const decodedToken = await getAuth().verifyIdToken(token);
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'customer'
          };
        } catch (firebaseError) {
          // Continue without user context
          req.user = null;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireStaff,
  optionalAuth
};
