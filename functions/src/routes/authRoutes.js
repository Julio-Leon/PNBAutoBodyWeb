const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole
} = require('../controllers/authController');

const { verifyToken, requireAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const UserValidation = require('../models/userValidation');

const router = express.Router();

// Public routes
router.post('/register', UserValidation.registerUser(), handleValidationErrors, register);
router.post('/login', UserValidation.loginUser(), handleValidationErrors, login);

// Protected routes
router.use(verifyToken);

/**
 * Verify user token
 */
router.get('/verify', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    },
    message: 'User token valid'
  });
});

// User profile routes
router.get('/me', getMe);
router.put('/profile', UserValidation.updateProfile(), handleValidationErrors, updateProfile);
router.put('/password', UserValidation.changePassword(), handleValidationErrors, changePassword);

// Admin only routes
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:uid/role', requireAdmin, updateUserRole);

module.exports = router;
