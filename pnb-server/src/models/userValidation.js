const { body, param } = require('express-validator');

/**
 * User validation schemas
 */
class UserValidation {
  /**
   * Validate user registration
   */
  static registerUser() {
    return [
      body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
      
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
      
      body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
      
      body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
      
      body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
      
      body('role')
        .optional()
        .isIn(['customer', 'admin', 'staff'])
        .withMessage('Invalid role')
    ];
  }

  /**
   * Validate user login
   */
  static loginUser() {
    return [
      body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  /**
   * Validate user profile update
   */
  static updateProfile() {
    return [
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
      
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
      
      body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
      
      body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object')
    ];
  }

  /**
   * Validate password change
   */
  static changePassword() {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      
      body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
      
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
          }
          return true;
        })
    ];
  }

  /**
   * Validate email for password reset
   */
  static forgotPassword() {
    return [
      body('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail()
    ];
  }

  /**
   * Validate password reset token and new password
   */
  static resetPassword() {
    return [
      body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
      
      body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
      
      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
          }
          return true;
        })
    ];
  }
}

module.exports = {
  validateUser: UserValidation.registerUser,
  validateLogin: UserValidation.loginUser,
  validatePasswordChange: UserValidation.changePassword,
  validateUserUpdate: UserValidation.updateProfile,
  validateForgotPassword: UserValidation.forgotPassword,
  validateResetPassword: UserValidation.resetPassword
};
