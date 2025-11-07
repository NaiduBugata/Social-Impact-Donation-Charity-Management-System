// Minimal fetch proxy: forwards any fetch that begins with '/api/' to the backend base URL.
const BACKEND_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const originalFetch = window.fetch.bind(window);

window.fetch = async (url, options = {}) => {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const target = BACKEND_BASE + url;
    
    // Prepare headers with auth token
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    
    // Attach JWT token if available (excluding auth endpoints)
    if (!url.includes('/api/auth/')) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    options.headers = headers;
    
    // Stringify body if it's an object
    if (options.body && typeof options.body !== 'string') {
      try { 
        options.body = JSON.stringify(options.body); 
      } catch (e) {
        console.error('Failed to stringify request body:', e);
      }
    }
    
    try {
      const response = await originalFetch(target, options);
      
      // Handle auth errors
      if (response.status === 401) {
        console.warn('Unauthorized - token may be invalid or expired');
        // Optionally redirect to login
        // window.location.href = '/Role';
      }
      
      return response;
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  }
  return originalFetch(url, options);
};

// Provide a small compatibility layer used by some legacy UI parts.
window.__socialImpactApi = {
  getData: async (key) => {
    try {
      if (key === 'USERS') {
        const res = await fetch('/api/users'); 
        const j = await res.json(); 
        return j.success ? j.data : [];
      }
      if (key === 'REQUESTS') {
        const res = await fetch('/api/requests'); 
        const j = await res.json(); 
        return j.success ? j.data : [];
      }
      if (key === 'TRANSACTIONS') {
        const res = await fetch('/api/donate'); 
        const j = await res.json(); 
        return j.success ? j.data : [];
      }
      if (key === 'KYC') {
        const res = await fetch('/api/kyc'); 
        const j = await res.json(); 
        return j.success ? j.data : [];
      }
    } catch (err) {
      console.warn('compat getData error', err);
    }
    return [];
  },
  setData: async (key, data) => {
    console.warn('setData called for', key, '— prefer calling backend APIs instead');
    return true;
  },
  reset: () => { 
    console.warn('reset is not supported when using backend'); 
  }
};

export default null;

