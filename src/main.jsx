import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// .............................this is only for mobile view ...........................................
import axios from 'axios'

// Dynamically rewrite localhost:5000 requests to use current hostname for local network mobile testing
axios.interceptors.request.use((config) => {
  if (
    config.url &&
    config.url.includes('localhost:5000') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    config.url = config.url.replace('localhost:5000', `${window.location.hostname}:5000`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ___________________________________________________________________________
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
