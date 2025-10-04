const express = require('express');
const { check, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile information
 * @access  Private (requires authentication)
 */
router.put(
  '/profile',
  auth,
  [
    check('firstName', 'First name is required').notEmpty(),
    check('lastName', 'Last name is required').notEmpty(),
    check('phone')
      .optional()
      .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
      .withMessage('Please provide a valid US phone number')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;

    try {
      // Get user reference
      const userRef = admin.firestore().collection('users').doc(req.user.uid);
      
      // Create update object
      const updateData = {
        firstName,
        lastName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Only update phone if provided
      if (phone) {
        updateData.phone = phone;
      }

      // Update user document
      await userRef.update(updateData);

      // Get the updated user data
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Return the updated user data (excluding sensitive fields)
      res.json({
        success: true,
        user: {
          uid: req.user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || '',
          role: userData.role,
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Server error while updating profile' });
    }
  }
);

module.exports = router;
