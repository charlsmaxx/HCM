const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { sanitizeHTML } = require('../utils/sanitize');
const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // Get total count for pagination metadata
    const total = await db.collection('blog').countDocuments({});
    
    // Get paginated posts
    const posts = await db.collection('blog')
      .find({})
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(posts, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const post = await db.collection('blog').findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyAdmin, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content is required and must be less than 50000 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .escape(),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .escape(),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date')
    .toDate(),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image URL must be a valid URL')
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
    // Sanitize HTML content
    const sanitizedContent = req.body.content ? sanitizeHTML(req.body.content) : req.body.content;
    const newPost = { 
      ...req.body, 
      content: sanitizedContent,
      createdAt: new Date() 
    };
    const result = await db.collection('blog').insertOne(newPost);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('blog').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('blog').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

