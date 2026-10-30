// =========================================================================
// Centralized Backend API Configuration
// =========================================================================
// Deploy karne ke liye:
// 1. Ya to niche 'http://localhost:5000' ki jagah apna backend URL daal dein
//    (jaise: 'https://your-backend-api.onrender.com')
// 2. Ya fir .env file me VITE_API_URL=https://your-backend-api.onrender.com set karein
// =========================================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API = API_BASE_URL;

export default API;

