// src/config.js
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  AI_ENABLED: import.meta.env.VITE_AI_ENABLED || true,
};

// Alternative for older React setups:
export const API_BASE_URL = 'http://localhost:5001';