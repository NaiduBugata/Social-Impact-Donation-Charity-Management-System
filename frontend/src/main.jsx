import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
// import './index.css'
// 🌍 Social Impact Donation & Charity Management System - localStorage API
import './api/backendProxy';
import App from './App.jsx'

// Polyfills for simple-peer
window.Buffer = Buffer;
window.global = window;
window.process = { env: {} };

console.log('📦 main.jsx loading...');
console.log('📦 Root element:', document.getElementById('root'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log('✅ React app rendered');
