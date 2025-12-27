/**
 * Middleware to validate MongoDB ObjectId format
 * Prevents invalid ObjectId errors and potential injection attacks
 */
const { ObjectId } = require('mongodb');

function validateObjectId(req, res, next) {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  next();
}

module.exports = validateObjectId;

