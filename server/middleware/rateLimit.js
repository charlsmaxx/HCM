const rateLimit = require('express-rate-limit');

// Public API rate limiter - 100 requests per 15 minutes
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_PUBLIC || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Admin API rate limiter - 50 requests per 15 minutes (stricter)
const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_ADMIN || '50'), // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many admin requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiter - 5 requests per 15 minutes (very strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH || '5'), // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Donation/Payment rate limiter - 10 requests per 15 minutes
const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_DONATION || '10'), // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many donation requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  publicApiLimiter,
  adminApiLimiter,
  authLimiter,
  donationLimiter,
};


