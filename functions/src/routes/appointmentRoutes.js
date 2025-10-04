const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  getUserAppointmentHistory,
  getAdminAppointmentHistory,
  sendAppointmentSMS
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

// DEBUG: Test admin permissions on appointments
router.get('/debug-admin-test', (req, res) => {
  const isAdmin = req.user.role === 'admin' || req.user.type === 'admin';
  
  res.status(200).json({
    success: true,
    message: 'Admin permission test for appointments',
    user: req.user,
    permissions: {
      isAdmin,
      canEditAnyAppointment: isAdmin,
      role: req.user.role,
      type: req.user.type,
      uid: req.user.uid
    }
  });
});

// Get user's own appointments
router.get('/my-appointments', getUserAppointments);

// Get user's appointment history
router.get('/history', getUserAppointmentHistory);

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

// Admin appointment history
router.get('/admin/history', requireStaff, getAdminAppointmentHistory);

// Get appointments for a specific user (staff/admin only)
router.get('/user/:userId', requireStaff, getUserAppointments);

// Send/Resend SMS notification for an appointment
router.post('/:id/send-sms', requireStaff, sendAppointmentSMS);

module.exports = router;
