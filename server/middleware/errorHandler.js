/**
 * Centralized error handling middleware
 */

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    });
  }

  // Database connection errors
  if (err.message && err.message.includes('Database not connected')) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection is not ready. Please try again in a moment.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
}

module.exports = errorHandler;















