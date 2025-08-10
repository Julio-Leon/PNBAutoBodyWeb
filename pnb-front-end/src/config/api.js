// API Configuration
const isDevelopment = import.meta.env.DEV;

const API_CONFIG = {
  // Development API (local server)
  development: {
    baseURL: 'http://localhost:5000/api'
  },
  // Production API (Firebase Functions)
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://us-central1-pnbautobody-33725.cloudfunctions.net/api/api'
  }
};

export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development.baseURL 
  : API_CONFIG.production.baseURL;

// Export individual endpoints for easy access
export const API_ENDPOINTS = {
  appointments: `${API_BASE_URL}/appointments`,
  auth: `${API_BASE_URL}/admin`,
  admin: `${API_BASE_URL}/admin`
};

export default API_CONFIG;
