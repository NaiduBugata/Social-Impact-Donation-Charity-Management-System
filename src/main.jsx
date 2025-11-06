import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// 🌍 Social Impact Donation & Charity Management System - localStorage API
import './api/socialImpactApi';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
