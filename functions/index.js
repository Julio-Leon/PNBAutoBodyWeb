const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

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

// Get appointments
app.get('/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    let query = db.collection('appointments');
    
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUser = null;
    
    if (token) {
      // Determine user type and ID from token
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
    console.log('Received appointment data:', req.body);
    console.log('Damage type from body:', req.body.damageType);

    const db = admin.firestore();
    
    // Check if user is authenticated and get user ID
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    
    if (token && token.startsWith('user-')) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 2) {
        userId = tokenParts[1];
      }
    }
    
    const appointmentData = {
      customerName: req.body.name || 'N/A',
      email: req.body.email || 'N/A',
      phone: req.body.phone || 'N/A',
      vehicleInfo: req.body.vehicleInfo || 'N/A',
      serviceType: req.body.damageType || 'N/A',
      description: req.body.description || null,
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

    console.log('Processed appointment data:', appointmentData);

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

    console.log('PUT request received for appointment:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Current user:', currentUser);

    // Check if appointment exists
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      console.log('Appointment not found:', id);
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const appointmentData = doc.data();
    
    // Authorization check - customers can only edit their own appointments
    if (!isAdmin && (!currentUser || currentUser.role !== 'customer' || appointmentData.userId !== userId)) {
      return res.status(403).json({ success: false, error: 'You can only edit your own appointments' });
    }

    // Prepare update data with careful date handling
    const updateData = {
      customerName: req.body.customerName || req.body.name || appointmentData.customerName || 'N/A',
      email: req.body.email || appointmentData.email || 'N/A',
      phone: req.body.phone || appointmentData.phone || 'N/A',
      vehicleInfo: req.body.vehicleInfo || appointmentData.vehicleInfo || 'N/A',
      serviceType: req.body.serviceType || req.body.damageType || appointmentData.serviceType || 'N/A',
      preferredTime: req.body.preferredTime || appointmentData.preferredTime || null,
      description: req.body.message || req.body.description || appointmentData.description || null,
      paymentMethod: req.body.paymentMethod || appointmentData.paymentMethod || 'N/A',
      insuranceCompany: req.body.insuranceCompany || appointmentData.insuranceCompany || null,
      updatedAt: new Date()
    };
    
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

  if (token === 'admin-token-123') {
    res.json({
      success: true,
      data: { user: { username: 'PNBAdmin', role: 'admin' } }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Export the function
exports.api = functions.https.onRequest(app);
