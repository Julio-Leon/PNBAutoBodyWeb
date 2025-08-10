const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'pnbautobody-33725.appspot.com'
  });
}

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://pnbautobody-33725.web.app',
    'https://pnbautobody-33725.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PNJ Auto Body API is running on Firebase Functions',
    timestamp: new Date().toISOString()
  });
});

// Basic appointments endpoint for testing
app.get('/api/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('appointments').orderBy('createdAt', 'desc').get();
    
    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

// Basic appointment creation endpoint
app.post('/api/appointments', async (req, res) => {
  try {
    const db = admin.firestore();
    const appointmentData = {
      ...req.body,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('appointments').add(appointmentData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...appointmentData
      },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

// Status update endpoint
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = admin.firestore();

    await db.collection('appointments').doc(id).update({
      status,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status'
    });
  }
});

// Admin login endpoint (simplified)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple hardcoded authentication for now
  if (username === 'PNBAdmin' && password === 'v83hbv9s73b') {
    res.status(200).json({
      success: true,
      data: {
        user: { username: 'PNBAdmin', role: 'admin' },
        token: 'firebase-functions-token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Admin verification endpoint
app.get('/api/admin/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token === 'firebase-functions-token') {
    res.status(200).json({
      success: true,
      data: { user: { username: 'PNBAdmin', role: 'admin' } }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
