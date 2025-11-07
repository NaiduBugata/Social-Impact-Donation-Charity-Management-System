// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error to console
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Development error response (detailed)
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production error response (user-friendly)
  if (err.isOperational) {
    // Operational, trusted error: send message to client
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.'
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  catchAsync,
  AppError
};
