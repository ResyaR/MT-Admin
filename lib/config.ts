// API Configuration
export const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:4000',
    timeout: 10000,
  },
  // Production
  production: {
    baseURL: 'https://be-mt-trans.vercel.app',
    timeout: 10000,
  }
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Export current config
export const CURRENT_CONFIG = isDevelopment 
  ? API_CONFIG.development 
  : API_CONFIG.production;

// Export base URL for easy access
export const API_BASE_URL = CURRENT_CONFIG.baseURL;

