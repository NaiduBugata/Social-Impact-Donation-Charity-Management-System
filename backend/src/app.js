// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const responseSerializer = require('./middleware/responseSerializer');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Existing routes
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const geoRoutes = require('./routes/geoRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const impactRoutes = require('./routes/impactRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const kycRoutes = require('./routes/kycRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const userRoutes = require('./routes/userRoutes');
const publicOrgRoutes = require('./routes/publicOrgRoutes');

// ✅ NEW: Mail routes
const mailRoutes = require('./routes/mailRoutes');

// ✅ NEW: Impact Stories routes
const impactStoryRoutes = require('./routes/impactStoryRoutes');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginEmbedderPolicy: false
}));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://donation-frontend-phi.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Response serializer
app.use(responseSerializer);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter rate limit to auth
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donate', transactionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public-org', publicOrgRoutes);

// ✅ NEW: Mail API
app.use('/api/mail', mailRoutes);

// ✅ NEW: Impact Stories API
app.use('/api/impact-stories', impactStoryRoutes);

// Also expose singular service endpoint (existing)
app.post(
  '/api/service/complete',
  (req, res) => require('./controllers/requestController').completeService(req, res)
);

// Base Route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Backend server running successfully!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

module.exports = app;
