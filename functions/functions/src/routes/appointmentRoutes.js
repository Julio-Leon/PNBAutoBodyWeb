const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const { verifyToken, requireStaff, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { validateAppointment } = require('../models/appointmentValidation');

const router = express.Router();

// Public routes
router.post(
  '/',
  optionalAuth,
  upload.array('images', 10),
  handleMulterError,
  validateAppointment(),
  handleValidationErrors,
  createAppointment
);

// Protected routes - require authentication
router.use(verifyToken);

// Get user's own appointments
router.get('/my-appointments', getUserAppointments);

// Get single appointment
router.get('/:id', getAppointment);

// Update appointment (customer can update their own, staff can update any)
router.put(
  '/:id',
  upload.array('images', 10),
  handleMulterError,
  validateAppointment(),
  handleValidationErrors,
  updateAppointment
);

// Staff/Admin only routes
router.get('/', requireStaff, getAppointments);
router.delete('/:id', requireStaff, deleteAppointment);
router.patch('/:id/status', requireStaff, updateAppointmentStatus);

// Get appointments for a specific user (staff/admin only)
router.get('/user/:userId', requireStaff, getUserAppointments);

module.exports = router;
