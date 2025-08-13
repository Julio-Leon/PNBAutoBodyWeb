const { body, param, query } = require('express-validator');

/**
 * Appointment validation schemas
 */
class AppointmentValidation {
  /**
   * Validate appointment creation
   */
  static createAppointment() {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
      
      body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
      
      body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
      
      body('damageType')
        .notEmpty()
        .withMessage('Damage type is required')
        .isIn([
          'Collision Damage',
          'Dent Repair',
          'Scratch Repair',
          'Paint Touch-up',
          'Bumper Repair',
          'Hail Damage',
          'Other'
        ])
        .withMessage('Invalid damage type'),
      
      body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
      
      body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['insurance', 'outofpocket'])
        .withMessage('Invalid payment method'),
      
      body('insuranceCompany')
        .if(body('paymentMethod').equals('insurance'))
        .notEmpty()
        .withMessage('Insurance company is required when using insurance'),
      
      body('preferredDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (date < today) {
            throw new Error('Preferred date cannot be in the past');
          }
          return true;
        }),
      
      body('photos')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 photos allowed'),
      
      body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Invalid status')
    ];
  }

  /**
   * Validate appointment update
   */
  static updateAppointment() {
    return [
      param('id')
        .notEmpty()
        .withMessage('Appointment ID is required'),
      
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
      
      body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
      
      body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
      
      body('damageType')
        .optional()
        .isIn([
          'Collision Damage',
          'Dent Repair',
          'Scratch Repair',
          'Paint Touch-up',
          'Bumper Repair',
          'Hail Damage',
          'Other'
        ])
        .withMessage('Invalid damage type'),
      
      body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
      
      body('paymentMethod')
        .optional()
        .isIn(['insurance', 'outofpocket'])
        .withMessage('Invalid payment method'),
      
      body('insuranceCompany')
        .optional(),
      
      body('preferredDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
      
      body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
      
      body('estimatedCost')
        .optional()
        .isNumeric()
        .withMessage('Estimated cost must be a number'),
      
      body('actualCost')
        .optional()
        .isNumeric()
        .withMessage('Actual cost must be a number'),
      
      body('completedDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
    ];
  }

  /**
   * Validate appointment ID parameter
   */
  static validateId() {
    return [
      param('id')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .isLength({ min: 1 })
        .withMessage('Invalid appointment ID')
    ];
  }

  /**
   * Validate query parameters for listing appointments
   */
  static validateQuery() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('status')
        .optional()
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Invalid status filter'),
      
      query('damageType')
        .optional()
        .isIn([
          'Collision Damage',
          'Dent Repair',
          'Scratch Repair',
          'Paint Touch-up',
          'Bumper Repair',
          'Hail Damage',
          'Other'
        ])
        .withMessage('Invalid damage type filter'),
      
      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
      
      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),
      
      query('search')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Search term must be less than 100 characters')
    ];
  }
}

module.exports = {
  validateAppointment: AppointmentValidation.createAppointment,
  validateAppointmentUpdate: AppointmentValidation.updateAppointment,
  validateAppointmentId: AppointmentValidation.validateId,
  validateAppointmentQuery: AppointmentValidation.validateQuery
};
