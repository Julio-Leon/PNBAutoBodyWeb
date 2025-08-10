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
const { validateUser } = require('../models/userValidation');

const router = express.Router();

// Public routes
router.post('/register', validateUser(), handleValidationErrors, register);
router.post('/login', handleValidationErrors, login);

// Protected routes
router.use(verifyToken);

// User profile routes
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Admin only routes
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:uid/role', requireAdmin, updateUserRole);

module.exports = router;
