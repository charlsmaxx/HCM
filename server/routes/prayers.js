const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { sanitizeText } = require('../utils/sanitize');
const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name is required and must be less than 200 characters')
    .escape(),
  body('request')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Prayer request is required and must be less than 2000 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .escape()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const db = getDB();
    // Sanitize prayer request text
    const sanitizedRequest = sanitizeText(req.body.request || '');
    const result = await db.collection('prayerRequests').insertOne({ 
      ...req.body,
      request: sanitizedRequest,
      status: 'pending', 
      date: new Date() 
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // Get total count for pagination metadata
    const total = await db.collection('prayerRequests').countDocuments({});
    
    // Get paginated prayer requests
    const prayers = await db.collection('prayerRequests')
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(prayers, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('prayerRequests').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

