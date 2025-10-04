const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const emailService = require('./src/services/emailService');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PNJ Auto Body API is running',
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint (for debugging only)
app.get('/test-email', async (req, res) => {
  try {
    console.log('📧 TEST EMAIL - Starting test...');
    
    // Log environment variables (don't log actual values)
    console.log('📧 Environment check:');
    console.log('- SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('- functions.config().sendgrid:', !!functions.config().sendgrid);
    
    const testAppointment = {
      id: 'test-' + Date.now(),
      customerName: 'Test Customer',
      email: req.query.email || 'test@example.com', // Allow email override in query
      phone: '123-456-7890',
      vehicleInfo: '2023 Tesla Model 3',
      serviceType: 'body',
      damageType: 'Front Bumper Damage',
      selectedServices: ['Front Bumper Repair', 'Paint Job'],
      description: 'Test appointment for email debugging',
      preferredDate: new Date(),
      preferredTime: '10:00 AM',
      paymentMethod: 'insurance',
      insuranceCompany: 'Test Insurance',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📧 Sending test email to:', testAppointment.email);
    
    try {
      const emailResult = await emailService.sendAppointmentConfirmation(testAppointment);
      
      if (emailResult.success) {
        console.log('✅ Test email sent successfully:', emailResult.messageId);
        res.json({
          success: true,
          message: 'Test email sent successfully',
          details: emailResult
        });
      } else {
        console.warn('❌ Test email failed:', emailResult.error);
        res.status(500).json({
          success: false,
          error: 'Failed to send test email',
          details: emailResult
        });
      }
    } catch (emailError) {
      console.error('💥 Test email error:', emailError);
      res.status(500).json({
        success: false,
        error: 'Error sending test email',
        stack: emailError.stack,
        message: emailError.message
      });
    }
  } catch (error) {
    console.error('💥 Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint error',
      message: error.message
    });
  }
});

// Database health check
app.get('/db-health', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('appointments').limit(1).get();
    
    res.json({
      status: 'OK',
      message: 'Database connection successful',
      appointmentsCount: snapshot.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// User appointment history endpoint
app.get('/appointments/history', async (req, res) => {
  try {
    const db = admin.firestore();
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    let userEmail = null;
    if (token.startsWith('user-')) {
      // Extract user ID and get user data
      const tokenParts = token.split('-');
      if (tokenParts.length >= 2) {
        const userId = tokenParts[1];
        // For now, we'll use email-based filtering
        // In a real app, you'd look up user by ID first
        userEmail = `user${userId}@example.com`; // This is a temporary solution
      }
    }

    if (!userEmail) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }

    const snapshot = await db.collection('appointments')
      .where('email', '==', userEmail)
      .where('status', '==', 'completed')
      .orderBy('updatedAt', 'desc')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching user appointment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment history'
    });
  }
});

// Admin appointment history endpoint
app.get('/api/appointments/admin/history', async (req, res) => {
  try {
    const db = admin.firestore();
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Check if user is admin
    if (token !== 'admin-token-123') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const snapshot = await db.collection('appointments')
      .where('status', '==', 'completed')
      .orderBy('updatedAt', 'desc')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error fetching admin appointment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment history'
    });
  }
});

// Legacy routes for backward compatibility
// Get appointments
app.get('/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    let query = db.collection('appointments');
    
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUser = null;
    
    if (token) {
      try {
        // First, try to verify with Firebase Auth
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken) {
          // User authenticated with Firebase Auth
          currentUser = { 
            role: decodedToken.role || 'customer',
            id: decodedToken.uid,
            email: decodedToken.email 
          };
          
          if (currentUser.role !== 'admin') {
            // Regular users can only see their own appointments
            query = query.where('userId', '==', currentUser.id);
            // If we don't have userId field, try with email
            if (currentUser.email) {
              query = query.where('email', '==', currentUser.email);
            }
          }
        }
      } catch (authError) {
        console.log('Firebase auth failed, trying legacy token:', authError.message);
        // Legacy token handling
        if (token === 'admin-token-123') {
          // Admin can see all appointments
          currentUser = { role: 'admin' };
        } else if (token.startsWith('user-')) {
          // Regular user - extract user ID
          const tokenParts = token.split('-');
          if (tokenParts.length >= 2) {
            const userId = tokenParts[1];
            currentUser = { role: 'customer', id: userId };
            
            // Filter appointments by user ID
            query = query.where('userId', '==', userId);
          }
        }
      }
    }
    
    // Try to order by createdAt, but fallback to no ordering if it fails
    let snapshot;
    try {
      snapshot = await query.orderBy('createdAt', 'desc').get();
    } catch (orderError) {
      console.log('OrderBy failed, trying without ordering:', orderError.message);
      // If ordering fails (e.g., no documents or missing fields), get without ordering
      snapshot = await query.get();
    }
    
    const appointments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Helper function to safely convert dates
      const convertDate = (dateValue) => {
        if (!dateValue) return null;
        if (dateValue.toDate) {
          return dateValue.toDate().toISOString();
        }
        if (dateValue instanceof Date) {
          return dateValue.toISOString();
        }
        return dateValue;
      };
      
      appointments.push({
        id: doc.id,
        ...data,
        createdAt: convertDate(data.createdAt),
        updatedAt: convertDate(data.updatedAt),
        preferredDate: convertDate(data.preferredDate),
        appointmentDate: convertDate(data.appointmentDate)
      });
    });

    // Sort in JavaScript if Firestore ordering failed
    appointments.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });

    console.log(`Fetched ${appointments.length} appointments for user role: ${currentUser?.role || 'public'}`);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments', details: error.message });
  }
});

// Create appointment
app.post('/appointments', async (req, res) => {
  try {
    console.log('🔍 Received appointment data:', req.body);
    console.log('🔍 Damage type from body:', req.body.damageType);

    const db = admin.firestore();
    
    // Check if user is authenticated and get user ID
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    let isLoggedIn = false;
    
    console.log('🔍 Authorization token:', token ? token.substring(0, 15) + '...' : 'No token');
    
    if (token && token.startsWith('user-')) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 2) {
        userId = tokenParts[1];
        isLoggedIn = true;
        console.log('✅ User authenticated:', userId);
      }
    } else {
      console.log('⏭️ User not authenticated - will skip email notification');
    }
    
    const appointmentData = {
      customerName: req.body.name || req.body.customerName || 'N/A',
      email: req.body.email || 'N/A',
      phone: req.body.phone || 'N/A',
      vehicleInfo: req.body.vehicleInfo || 'N/A',
      vehicleId: req.body.vehicleId || null, // Include vehicleId for logged-in users
      serviceType: req.body.serviceType || req.body.damageType || 'N/A',
      selectedServices: req.body.selectedServices || [], // NEW: Handle selected services array
      damageType: req.body.damageType || (req.body.selectedServices ? req.body.selectedServices.join(', ') : null), // Backward compatibility
      description: req.body.description || req.body.message || null,
      preferredDate: null,
      preferredTime: req.body.preferredTime || null,
      paymentMethod: req.body.paymentMethod || 'N/A',
      insuranceCompany: req.body.insuranceCompany || null,
      isUrgent: req.body.isUrgent || false,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId // Associate with logged-in user
    };

    // Handle date conversion carefully - avoid timezone issues
    if (req.body.preferredDate) {
      try {
        // Parse the date as local date to avoid timezone shifts
        const dateStr = req.body.preferredDate;
        console.log('Received date string:', dateStr);
        
        if (dateStr.includes('T')) {
          // Already has time info, parse as is
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            appointmentData.preferredDate = parsedDate;
            console.log('Valid datetime created:', parsedDate);
          }
        } else {
          // Date only (YYYY-MM-DD), create at local noon to avoid timezone issues
          const [year, month, day] = dateStr.split('-').map(Number);
          const parsedDate = new Date(year, month - 1, day, 12, 0, 0); // Month is 0-indexed, set time to noon
          if (!isNaN(parsedDate.getTime())) {
            appointmentData.preferredDate = parsedDate;
            console.log('Valid local date created:', parsedDate);
          } else {
            console.log('Invalid date format:', dateStr);
          }
        }
      } catch (error) {
        console.error('Date parsing error:', error);
      }
    }

    console.log('📝 Processed appointment data:', appointmentData);

    const docRef = await db.collection('appointments').add(appointmentData);

    // Return the created appointment with properly formatted dates
    const convertDate = (dateValue) => {
      if (!dateValue) return null;
      if (dateValue instanceof Date) {
        return dateValue.toISOString();
      }
      return dateValue;
    };

    const responseData = {
      id: docRef.id,
      ...appointmentData,
      createdAt: convertDate(appointmentData.createdAt),
      updatedAt: convertDate(appointmentData.updatedAt),
      preferredDate: convertDate(appointmentData.preferredDate)
    };

    // 📧 SEND EMAIL NOTIFICATION ONLY IF USER IS LOGGED IN
    if (isLoggedIn && userId) {
      console.log('📧 Sending appointment confirmation email for logged-in user:', userId);
      console.log('📧 Email recipient:', responseData.email);
      try {
        const emailResult = await emailService.sendAppointmentConfirmation({
          ...responseData,
          // Ensure we have all needed fields for email
          selectedServices: appointmentData.selectedServices || [],
          damageType: appointmentData.damageType
        });
        
        if (emailResult.success) {
          console.log('✅ Appointment confirmation email sent successfully:', emailResult.messageId);
        } else {
          console.warn('❌ Failed to send appointment confirmation email:', emailResult.error);
          // Don't fail the appointment creation if email fails
        }
      } catch (emailError) {
        console.error('💥 Error sending appointment confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }
    } else {
      console.log('⏭️ Skipping email notification - user not logged in');
    }

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

// Update appointment status
app.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = admin.firestore();

    await db.collection('appointments').doc(id).update({
      status,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// Update full appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    
    // Check authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUser = null;
    let isAdmin = false;
    let userId = null;
    
    console.log('===== APPOINTMENT UPDATE DEBUG =====');
    console.log('Token received:', token ? token.substring(0, 15) + '...' : 'No token');
    console.log('Expected admin token:', 'admin-token-123');
    
    if (token) {
      if (token === 'admin-token-123') {
        isAdmin = true;
        currentUser = { role: 'admin', username: 'PNBAdmin' };
        console.log('✅ ADMIN TOKEN RECOGNIZED');
      } else if (token.startsWith('user-')) {
        const tokenParts = token.split('-');
        if (tokenParts.length >= 2) {
          userId = tokenParts[1];
          currentUser = { role: 'customer', id: userId };
          console.log('Customer token recognized for user:', userId);
        }
      } else {
        console.log('❌ UNRECOGNIZED TOKEN FORMAT');
      }
    } else {
      console.log('❌ NO TOKEN PROVIDED');
    }

    console.log('PUT request received for appointment:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Current user:', currentUser);
    console.log('Is Admin:', isAdmin);

    // Check if appointment exists
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      console.log('Appointment not found:', id);
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const appointmentData = doc.data();
    
    console.log('Appointment data userId:', appointmentData.userId);
    
    // Authorization check - FIXED ADMIN LOGIC
    if (isAdmin) {
      console.log('✅ ADMIN ACCESS GRANTED - Can edit any appointment');
    } else if (currentUser && currentUser.role === 'customer' && appointmentData.userId === userId) {
      console.log('✅ CUSTOMER ACCESS GRANTED - Owns this appointment');
    } else {
      console.log('❌ ACCESS DENIED');
      console.log('- isAdmin:', isAdmin);
      console.log('- currentUser:', currentUser);
      console.log('- appointmentData.userId:', appointmentData.userId);
      console.log('- userId:', userId);
      return res.status(403).json({ success: false, error: 'You can only edit your own appointments' });
    }
    
    console.log('✅ PROCEEDING WITH UPDATE');

    // Prepare update data with careful date handling
    const updateData = {
      customerName: req.body.customerName || req.body.name || appointmentData.customerName || 'N/A',
      email: req.body.email || appointmentData.email || 'N/A',
      phone: req.body.phone || appointmentData.phone || 'N/A',
      vehicleInfo: req.body.vehicleInfo || appointmentData.vehicleInfo || 'N/A',
      serviceType: req.body.serviceType || req.body.damageType || appointmentData.serviceType || 'N/A',
      selectedServices: req.body.selectedServices || appointmentData.selectedServices || [], // NEW: Handle selected services array
      preferredTime: req.body.preferredTime || appointmentData.preferredTime || null,
      description: req.body.message || req.body.description || appointmentData.description || null,
      paymentMethod: req.body.paymentMethod || appointmentData.paymentMethod || 'N/A',
      insuranceCompany: req.body.insuranceCompany || appointmentData.insuranceCompany || null,
      updatedAt: new Date()
    };
    
    // For backward compatibility, also update the damageType field if selectedServices is provided
    if (req.body.selectedServices && Array.isArray(req.body.selectedServices) && req.body.selectedServices.length > 0) {
      updateData.damageType = req.body.selectedServices.join(', ');
    }
    
    console.log('Update data being saved:', JSON.stringify(updateData, null, 2));
    
    // Only admins can change status
    if (isAdmin && req.body.status) {
      updateData.status = req.body.status;
    }

    // Handle date conversion carefully - avoid timezone issues
    if (req.body.preferredDate !== undefined) {
      if (req.body.preferredDate) {
        try {
          const dateStr = req.body.preferredDate;
          console.log('Processing date:', dateStr);
          
          if (dateStr.includes('T')) {
            // Already has time info, parse as is
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              updateData.preferredDate = parsedDate;
              console.log('Valid datetime updated:', parsedDate);
            }
          } else {
            // Date only (YYYY-MM-DD), create at local noon to avoid timezone issues
            const [year, month, day] = dateStr.split('-').map(Number);
            const parsedDate = new Date(year, month - 1, day, 12, 0, 0); // Month is 0-indexed, set time to noon
            if (!isNaN(parsedDate.getTime())) {
              updateData.preferredDate = parsedDate;
              console.log('Valid local date updated:', parsedDate);
            } else {
              console.log('Invalid date format, setting to null');
              updateData.preferredDate = null;
            }
          }
        } catch (dateError) {
          console.error('Date conversion error:', dateError);
          updateData.preferredDate = null;
        }
      } else {
        updateData.preferredDate = null;
      }
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    // Update the appointment
    await db.collection('appointments').doc(id).update(updateData);

    // Get the updated document
    const updatedDoc = await db.collection('appointments').doc(id).get();
    const updatedData = updatedDoc.data();

    // Helper function to safely convert dates
    const convertDate = (dateValue) => {
      if (!dateValue) return null;
      if (dateValue.toDate) {
        return dateValue.toDate().toISOString();
      }
      if (dateValue instanceof Date) {
        return dateValue.toISOString();
      }
      return dateValue;
    };

    console.log('Update successful');

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: convertDate(updatedData.createdAt),
        updatedAt: convertDate(updatedData.updatedAt),
        preferredDate: convertDate(updatedData.preferredDate),
        appointmentDate: convertDate(updatedData.appointmentDate)
      },
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to update appointment', details: error.message });
  }
});

// Delete appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = admin.firestore();
    
    // Check authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUser = null;
    let isAdmin = false;
    let userId = null;
    
    if (token) {
      if (token === 'admin-token-123') {
        isAdmin = true;
        currentUser = { role: 'admin' };
      } else if (token.startsWith('user-')) {
        const tokenParts = token.split('-');
        if (tokenParts.length >= 2) {
          userId = tokenParts[1];
          currentUser = { role: 'customer', id: userId };
        }
      }
    }

    console.log('DELETE request received for appointment:', id);
    console.log('Current user:', currentUser);

    // Check if appointment exists
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const appointmentData = doc.data();
    
    // Authorization check - customers can only delete their own appointments
    if (!isAdmin && (!currentUser || currentUser.role !== 'customer' || appointmentData.userId !== userId)) {
      return res.status(403).json({ success: false, error: 'You can only delete your own appointments' });
    }

    // Delete the appointment
    await db.collection('appointments').doc(id).delete();

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete appointment' });
  }
});

// User registration endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Full name, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const db = admin.firestore();
    
    // Check if user already exists
    const existingUser = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!existingUser.empty) {
      return res.status(409).json({ 
        success: false, 
        error: 'An account with this email already exists' 
      });
    }

    // Create user document (in a real app, you'd hash the password)
    const userData = {
      fullName,
      email,
      phone: phone || null,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const userRef = await db.collection('users').add(userData);
    
    // Generate a simple token (in production, use proper JWT)
    const userToken = `user-${userRef.id}-${Date.now()}`;
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userRef.id,
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role
        },
        token: userToken
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create account. Please try again.' 
    });
  }
});

// User login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const db = admin.firestore();
    
    // Find user by email
    const userQuery = await db.collection('users')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .get();
    
    if (userQuery.empty) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // In a real app, you'd verify the hashed password
    // For now, we'll just generate a token since we don't store passwords
    
    const userToken = `user-${userDoc.id}-${Date.now()}`;
    
    res.json({
      success: true,
      data: {
        user: {
          id: userDoc.id,
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role
        },
        token: userToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
});

// User authentication verification
app.get('/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from token (simple token format: user-{id}-{timestamp})
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const db = admin.firestore();
    
    // Verify user exists and is active
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (!userData.isActive) {
      return res.status(401).json({ success: false, error: 'Account is inactive' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userDoc.id,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          role: userData.role
        }
      }
    });
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ success: false, error: 'Token verification failed' });
  }
});

// User profile update
app.put('/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract user ID from token (simple token format: user-{id}-{timestamp})
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const { firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Validate phone number if provided
    if (phone) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid US phone number' });
      }
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    
    // Create update object
    const updateData = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
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

    // Return the updated user data
    res.json({
      success: true,
      user: {
        uid: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        phone: userData.phone || '',
        role: userData.role,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'PNBAdmin' && password === 'v83hbv9s73b') {
    res.json({
      success: true,
      data: {
        user: { username: 'PNBAdmin', role: 'admin' },
        token: 'admin-token-123'
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Admin verify
app.get('/admin/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('Admin verify - token:', token);

  if (token === 'admin-token-123') {
    res.json({
      success: true,
      data: { user: { username: 'PNBAdmin', role: 'admin' } },
      debug: {
        token: token,
        isValidAdminToken: true
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Debug endpoint for testing admin permissions
app.get('/admin/test-permissions', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const isAdmin = token === 'admin-token-123';
  
  res.json({
    success: true,
    message: 'Admin permission test endpoint',
    debug: {
      token: token ? token.substring(0, 15) + '...' : 'No token',
      isAdmin,
      canEditAppointments: isAdmin
    }
  });
});

// Debug endpoint for testing appointment permissions
app.get('/appointments/debug-admin-test', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const isAdmin = token === 'admin-token-123';
  
  res.json({
    success: true,
    message: 'Appointment permission test',
    debug: {
      token: token ? token.substring(0, 15) + '...' : 'No token',
      isAdmin,
      canEditAnyAppointment: isAdmin,
      expectedToken: 'admin-token-123'
    }
  });
});

// Vehicle Management Endpoints

// Get user vehicles
app.get('/vehicles', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const db = admin.firestore();
    
    // Get user's vehicles
    const vehiclesSnapshot = await db.collection('vehicles')
      .where('userId', '==', userId)
      .get();

    const vehicles = [];
    vehiclesSnapshot.forEach(doc => {
      vehicles.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt in JavaScript instead of Firestore
    vehicles.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
  }
});

// Add new vehicle
app.post('/vehicles', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const { make, model, year, color, vin, licensePlate, notes } = req.body;

    // Validation
    if (!make || !model || !year) {
      return res.status(400).json({ success: false, error: 'Make, model, and year are required' });
    }

    const db = admin.firestore();
    const vehicleData = {
      userId,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      color: color?.trim() || null,
      vin: vin?.trim() || null,
      licensePlate: licensePlate?.trim() || null,
      notes: notes?.trim() || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('vehicles').add(vehicleData);

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...vehicleData
      }
    });

  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to add vehicle' });
  }
});

// Update vehicle
app.put('/vehicles/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const vehicleId = req.params.id;
    const { make, model, year, color, vin, licensePlate, notes } = req.body;

    // Validation
    if (!make || !model || !year) {
      return res.status(400).json({ success: false, error: 'Make, model, and year are required' });
    }

    const db = admin.firestore();
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Check if user owns this vehicle
    if (vehicleDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this vehicle' });
    }

    const updateData = {
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      color: color?.trim() || null,
      vin: vin?.trim() || null,
      licensePlate: licensePlate?.trim() || null,
      notes: notes?.trim() || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await vehicleRef.update(updateData);

    res.json({
      success: true,
      data: {
        id: vehicleId,
        ...updateData
      }
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
app.delete('/vehicles/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 2 || tokenParts[0] !== 'user') {
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const userId = tokenParts[1];
    const vehicleId = req.params.id;

    const db = admin.firestore();
    const vehicleRef = db.collection('vehicles').doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();

    if (!vehicleDoc.exists) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Check if user owns this vehicle
    if (vehicleDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this vehicle' });
    }

    await vehicleRef.delete();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to delete vehicle' });
  }
});

// Export the function
exports.api = functions.https.onRequest(app);
