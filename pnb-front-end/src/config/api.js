// API Configuration
// Automatically detect environment
const isDevelopment = import.meta.env.DEV;

const API_CONFIG = {
  // Development API (local server)
  development: {
    baseURL: 'http://localhost:5000/api'
  },
  // Production API (Firebase Functions)
  production: {
    baseURL: 'https://us-central1-pnbautobody-33725.cloudfunctions.net/api'
  }
};

export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development.baseURL 
  : API_CONFIG.production.baseURL;

// Debug logging for production
console.log('API Config Debug:', {
  isDevelopment,
  hostname: window.location.hostname,
  API_BASE_URL,
  env_DEV: import.meta.env.DEV,
  env_MODE: import.meta.env.MODE
});

// Export individual endpoints for easy access
export const API_ENDPOINTS = {
  appointments: `${API_BASE_URL}/appointments`,
  auth: `${API_BASE_URL}/admin`,
  admin: `${API_BASE_URL}/admin`
};

export default API_CONFIG;
