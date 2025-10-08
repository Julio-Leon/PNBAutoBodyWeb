const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeFirebase, getDb, getAuth } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Firebase
initializeFirebase();
const db = getDb();
const usersCollection = db.collection('users');

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists in Firestore
    const existingUserSnapshot = await usersCollection.where('email', '==', email).get();
    if (!existingUserSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await getAuth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`
      });
    } catch (firebaseError) {
      console.error('Firebase user creation error:', firebaseError);
      return res.status(400).json({
        success: false,
        error: firebaseError.message
      });
    }

    // Hash password for local storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document in Firestore
    const userData = {
      uid: firebaseUser.uid,
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: 'customer', // Default role
      isActive: true,
      hashedPassword, // Store hashed password for JWT auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.doc(firebaseUser.uid).set(userData);

    // Generate JWT token
    const token = generateToken({
      uid: firebaseUser.uid,
      email,
      role: 'customer'
    });

    res.status(201).json({
      success: true,
      data: {
        uid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        phone,
        role: 'customer'
      },
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from Firestore
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, userData.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await usersCollection.doc(userData.uid).update({
      lastLogin: new Date(),
      updatedAt: new Date()
    });

    // Generate JWT token
    const token = generateToken({
      uid: userData.uid,
      email: userData.email,
      role: userData.role
    });

    res.status(200).json({
      success: true,
      data: {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role
      },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    
    res.status(200).json({
      success: true,
      data: {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt?.toDate(),
        lastLogin: userData.lastLogin?.toDate()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { phone, email, firstName, lastName } = req.body;
    
    // Log the request body for debugging
    console.log('Profile update request body:', req.body);
    
    const updateData = {
      updatedAt: new Date()
    };
    
    // IMPORTANT: We should only update firstName and lastName if they are explicitly provided
    // Otherwise, we keep the existing values to prevent accidental name changes

    if (phone !== undefined) updateData.phone = phone;
    
    // Only update name fields if they are explicitly provided AND not empty
    if (firstName && firstName.trim() !== '') updateData.firstName = firstName;
    if (lastName && lastName.trim() !== '') updateData.lastName = lastName;

    // If email is provided and different from current email, update it
    let emailUpdated = false;
    if (email && email !== req.user.email) {
      try {
        // Check if email is already in use
        const existingUserWithEmail = await usersCollection.where('email', '==', email).get();
        if (!existingUserWithEmail.empty && existingUserWithEmail.docs[0].id !== req.user.uid) {
          return res.status(400).json({
            success: false,
            error: 'Email already in use by another account'
          });
        }

        // Update email in Firebase Auth
        await getAuth().updateUser(req.user.uid, { email });
        
        // Update email in Firestore
        updateData.email = email;
        emailUpdated = true;
        
        console.log(`Email updated for user ${req.user.uid} from ${req.user.email} to ${email}`);
      } catch (firebaseError) {
        console.error('Firebase email update error:', firebaseError);
        return res.status(400).json({
          success: false,
          error: firebaseError.message || 'Failed to update email'
        });
      }
    }

    await usersCollection.doc(req.user.uid).update(updateData);

    // Get updated user data
    const updatedDoc = await usersCollection.doc(req.user.uid).get();
    const userData = updatedDoc.data();

    res.status(200).json({
      success: true,
      data: {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role
      },
      emailUpdated: emailUpdated,
      message: emailUpdated ? 
        'Profile updated successfully. You will need to login again with your new email.' : 
        'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    const userDoc = await usersCollection.doc(req.user.uid).get();
    const userData = userDoc.data();

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userData.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in Firebase Auth
    try {
      await getAuth().updateUser(req.user.uid, {
        password: newPassword
      });
    } catch (firebaseError) {
      console.error('Firebase password update error:', firebaseError);
      return res.status(400).json({
        success: false,
        error: 'Failed to update password'
      });
    }

    // Update password in Firestore
    await usersCollection.doc(req.user.uid).update({
      hashedPassword: hashedNewPassword,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    let query = usersCollection;

    // Apply role filter
    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let users = [];

    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt?.toDate(),
        lastLogin: userData.lastLogin?.toDate()
      });
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(search)
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = users.length;
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/auth/users/:uid/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Check if user exists
    const userDoc = await usersCollection.doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user role
    await usersCollection.doc(uid).update({
      role,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole
};
