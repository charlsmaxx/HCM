const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { sanitizeText } = require('../utils/sanitize');
const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // For public access, only show approved testimonials
    // For admin access, show all (will be filtered by middleware if needed)
    const query = {};
    
    // Check if this is an admin request (has auth token)
    const authHeader = req.headers.authorization;
    const isAdmin = authHeader && authHeader.startsWith('Bearer ');
    
    // If not admin, only show approved testimonials
    if (!isAdmin) {
      query.approved = true;
    }
    
    // Get total count for pagination metadata
    const total = await db.collection('testimonials').countDocuments(query);
    
    // Get paginated testimonials
    const testimonials = await db.collection('testimonials')
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const normalizedTestimonials = testimonials.map(testimonial => ({
      ...testimonial,
      _id: testimonial._id.toString(),
    }));

    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(normalizedTestimonials, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single testimonial by ID (public)
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    const testimonial = await db.collection('testimonials').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    // If not admin and not approved, don't show it
    const authHeader = req.headers.authorization;
    const isAdmin = authHeader && authHeader.startsWith('Bearer ');
    
    if (!isAdmin && !testimonial.approved) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    res.json({
      ...testimonial,
      _id: testimonial._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new testimonial (public - for submissions, admin can also use this)
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name is required and must be less than 200 characters')
    .escape(),
  body('testimonial')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Testimonial is required and must be less than 2000 characters'),
  body('text')
    .optional()
    .trim()
    .isLength({ max: 2000 }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
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
    const authHeader = req.headers.authorization;
    const isAdmin = authHeader && authHeader.startsWith('Bearer ');
    
    // Sanitize testimonial text
    const testimonialText = req.body.testimonial || req.body.text || '';
    const sanitizedTestimonial = sanitizeText(testimonialText);
    
    // Admins can create approved testimonials directly
    // Public submissions are not approved by default
    const newTestimonial = { 
      ...req.body,
      testimonial: sanitizedTestimonial,
      text: sanitizedTestimonial,
      approved: isAdmin ? (req.body.approved !== undefined ? req.body.approved : true) : false, 
      createdAt: new Date() 
    };
    const result = await db.collection('testimonials').insertOne(newTestimonial);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('testimonials').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

