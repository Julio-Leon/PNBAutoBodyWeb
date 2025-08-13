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

// Get appointments
app.get('/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('appointments').orderBy('createdAt', 'desc').get();
    
    const appointments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        preferredDate: data.preferredDate?.toDate() // Convert Firestore timestamp to JS Date
      });
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

// Create appointment
app.post('/appointments', async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    
    const db = admin.firestore();
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
      updatedAt: new Date()
    };

    // Handle date conversion carefully
    if (req.body.preferredDate) {
      try {
        const parsedDate = new Date(req.body.preferredDate);
        if (!isNaN(parsedDate.getTime())) {
          appointmentData.preferredDate = parsedDate;
          console.log('Valid date created:', parsedDate);
        } else {
          console.log('Invalid date provided:', req.body.preferredDate);
        }
      } catch (error) {
        console.error('Date parsing error:', error);
      }
    }

    console.log('Processed appointment data:', appointmentData);

    const docRef = await db.collection('appointments').add(appointmentData);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...appointmentData },
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

    console.log('PUT request received for appointment:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if appointment exists
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      console.log('Appointment not found:', id);
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Prepare update data with careful date handling
    const updateData = {
      customerName: req.body.customerName || 'N/A',
      email: req.body.email || 'N/A',
      phone: req.body.phone || 'N/A',
      vehicleInfo: req.body.vehicleInfo || 'N/A',
      serviceType: req.body.serviceType || 'N/A',
      preferredTime: req.body.preferredTime || null,
      status: req.body.status || 'pending',
      description: req.body.message || null, // Map message to description field
      updatedAt: new Date()
    };

    // Handle date conversion carefully
    if (req.body.preferredDate) {
      try {
        const dateStr = req.body.preferredDate;
        console.log('Processing date:', dateStr);
        
        // If it's already a valid date string, create Date object
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          updateData.preferredDate = parsedDate;
          console.log('Converted date:', parsedDate);
        } else {
          console.log('Invalid date format, setting to null');
          updateData.preferredDate = null;
        }
      } catch (dateError) {
        console.error('Date conversion error:', dateError);
        updateData.preferredDate = null;
      }
    } else {
      updateData.preferredDate = null;
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    // Update the appointment
    await db.collection('appointments').doc(id).update(updateData);

    // Get the updated document
    const updatedDoc = await db.collection('appointments').doc(id).get();
    const updatedData = updatedDoc.data();

    console.log('Update successful');

    res.json({ 
      success: true, 
      data: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate(),
        updatedAt: updatedData.updatedAt?.toDate()
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

    // Check if appointment exists
    const doc = await db.collection('appointments').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Delete the appointment
    await db.collection('appointments').doc(id).delete();

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete appointment' });
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
