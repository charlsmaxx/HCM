/**
 * Middleware to check if database is connected before processing API requests
 * Returns 503 Service Unavailable if database is not connected
 */
const { getDB } = require('../config/db');

function checkDB(req, res, next) {
  try {
    const db = getDB();
    // If we get here, database is connected
    req.db = db; // Attach db to request for convenience
    next();
  } catch (error) {
    // Database not connected
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection is not ready. Please try again in a moment.',
      retryAfter: 5 // Suggest retrying after 5 seconds
    });
  }
}

module.exports = checkDB;

