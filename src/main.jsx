import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Global Axios configuration
axios.defaults.withCredentials = true;

// Request interceptor:
// 1. Rewrite localhost:5000 requests to use current hostname for local network mobile testing
// 2. Attach Authorization Bearer token to all outgoing requests from localStorage
axios.interceptors.request.use((config) => {
  if (
    config.url &&
    config.url.includes('localhost:5000') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    config.url = config.url.replace('localhost:5000', `${window.location.hostname}:5000`);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor:
// If 401 Unauthorized occurs on protected routes, clear local storage
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginOrHome = window.location.pathname === '/login' || window.location.pathname === '/';
      if (!isLoginOrHome) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
