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
app.get('/api/appointments', async (req, res) => {
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
        updatedAt: data.updatedAt?.toDate()
      });
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    const appointmentData = {
      customerName: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      vehicleInfo: req.body.vehicleInfo,
      serviceType: req.body.damageType,
      description: req.body.description,
      preferredDate: req.body.preferredDate ? new Date(req.body.preferredDate) : null,
      preferredTime: req.body.preferredTime,
      paymentMethod: req.body.paymentMethod,
      insuranceCompany: req.body.insuranceCompany,
      isUrgent: req.body.isUrgent || false,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('appointments').add(appointmentData);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...appointmentData },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

// Update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
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

// Admin login
app.post('/api/admin/login', (req, res) => {
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
app.get('/api/admin/verify', (req, res) => {
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
