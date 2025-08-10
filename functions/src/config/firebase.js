const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');

const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      console.log('🔍 Environment variables:');
      console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      console.log('- FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
      
      let credential;

      // For Firebase Functions, use default credentials in production
      if (process.env.FUNCTIONS_EMULATOR) {
        // Use service account key file for local development
        const serviceAccountPath = path.resolve(__dirname, '../../firebase-admin-key.json');
        console.log('🔍 Looking for Firebase key at:', serviceAccountPath);
        
        try {
          const fs = require('fs');
          if (fs.existsSync(serviceAccountPath)) {
            credential = admin.credential.cert(serviceAccountPath);
            console.log('🔑 Using Firebase service account key file');
          } else {
            // Fallback to default credentials
            credential = admin.credential.applicationDefault();
            console.log('🔑 Using default application credentials');
          }
        } catch (fileError) {
          console.log('⚠️ Service account file not found, using default credentials');
          credential = admin.credential.applicationDefault();
        }
      } else {
        // In production Firebase Functions, use default credentials
        credential = admin.credential.applicationDefault();
        console.log('🔑 Using Firebase Functions default credentials');
      }

      admin.initializeApp({
        credential: credential,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'pnbautobody-33725.appspot.com',
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase');
  }
};

/**
 * Get Firestore database instance
 */
const getDb = () => {
  try {
    return getFirestore();
  } catch (error) {
    console.error('❌ Failed to get Firestore instance:', error);
    throw error;
  }
};

/**
 * Get Firebase Storage instance
 */
const getBucket = () => {
  try {
    return getStorage().bucket();
  } catch (error) {
    console.error('❌ Failed to get Storage bucket:', error);
    throw error;
  }
};

/**
 * Get Firebase Auth instance
 */
const getAuth = () => {
  try {
    return admin.auth();
  } catch (error) {
    console.error('❌ Failed to get Auth instance:', error);
    throw error;
  }
};

/**
 * Collections names constants
 */
const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  USERS: 'users',
  REPAIRS: 'repairs',
  ESTIMATES: 'estimates',
  SERVICES: 'services',
  ADMIN_LOGS: 'admin_logs'
};

/**
 * Storage folders constants
 */
const STORAGE_FOLDERS = {
  APPOINTMENT_PHOTOS: 'appointment-photos',
  REPAIR_GALLERY: 'repair-gallery',
  USER_AVATARS: 'user-avatars',
  DOCUMENTS: 'documents'
};

module.exports = {
  initializeFirebase,
  getDb,
  getBucket,
  getAuth,
  COLLECTIONS,
  STORAGE_FOLDERS,
  admin
};
