const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');

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

      // Option 1: Use service account key file (recommended for development)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const path = require('path');
        const serviceAccountPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS) 
          ? process.env.GOOGLE_APPLICATION_CREDENTIALS 
          : path.resolve(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
        
        console.log('🔍 Looking for Firebase key at:', serviceAccountPath);
        
        try {
          // Check if file exists
          const fs = require('fs');
          if (!fs.existsSync(serviceAccountPath)) {
            throw new Error(`Firebase service account key file not found at: ${serviceAccountPath}`);
          }
          credential = admin.credential.cert(serviceAccountPath);
        } catch (fileError) {
          console.error('❌ Firebase key file error:', fileError.message);
          throw fileError;
        }
        
        console.log('🔑 Using Firebase service account key file');
      }
      // Option 2: Use individual environment variables (for production)
      else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI,
          token_uri: process.env.FIREBASE_TOKEN_URI,
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };
        credential = admin.credential.cert(serviceAccount);
        console.log('🔑 Using Firebase environment variables');
      } else {
        console.error('❌ No Firebase credentials found!');
        console.log('Available options:');
        console.log('1. Set GOOGLE_APPLICATION_CREDENTIALS to path of service account JSON file');
        console.log('2. Set individual Firebase environment variables');
        throw new Error('Firebase credentials not properly configured. Please set GOOGLE_APPLICATION_CREDENTIALS or individual Firebase environment variables.');
      }

      admin.initializeApp({
        credential: credential,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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
