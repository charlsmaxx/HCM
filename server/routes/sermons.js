const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin, verifyUser } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

// GET all sermons (public) - with pagination
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // Get total count for pagination metadata
    const total = await db.collection('sermons').countDocuments({});
    
    // Get paginated sermons
    const sermons = await db.collection('sermons')
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Normalize sermons (convert ObjectId to string, handle dates)
    const normalizedSermons = sermons.map(sermon => ({
      ...sermon,
      _id: sermon._id.toString(),
      date: sermon.date instanceof Date ? sermon.date.toISOString() : sermon.date,
    }));
    
    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(normalizedSermons, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET download sermon file (requires authentication) - MUST BE BEFORE /:id route
router.get('/:id/download/:type', validateObjectId, verifyUser, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid sermon ID' });
    }
    
    const sermon = await db.collection('sermons').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    
    const fileType = req.params.type; // 'audio' or 'video'
    let fileUrl = null;
    let fileName = '';
    
    if (fileType === 'audio' && sermon.audioUrl) {
      fileUrl = sermon.audioUrl;
      fileName = `${sermon.title.replace(/[^a-z0-9]/gi, '_')}_audio.mp3`;
    } else if (fileType === 'video' && sermon.videoUrl) {
      fileUrl = sermon.videoUrl;
      fileName = `${sermon.title.replace(/[^a-z0-9]/gi, '_')}_video.mp4`;
    } else {
      return res.status(404).json({ error: 'File not available for this sermon' });
    }
    
    // Increment download count
    await db.collection('sermons').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { downloads: 1 } }
    );
    
    // If it's a Supabase URL or external URL, redirect to it
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      res.redirect(fileUrl);
    } else {
      // Local file - serve it
      const path = require('path');
      const filePath = path.join(__dirname, '../../public', fileUrl);
      res.download(filePath, fileName);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
});

// GET single sermon by ID (public)
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const sermon = await db.collection('sermons').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!sermon) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    
    // Normalize sermon (convert ObjectId to string, handle dates)
    const normalizedSermon = {
      ...sermon,
      _id: sermon._id.toString(),
      date: sermon.date instanceof Date ? sermon.date.toISOString() : sermon.date,
    };
    
    res.json(normalizedSermon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new sermon (admin only)
router.post('/', verifyAdmin, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters')
    .escape(),
  body('speaker')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('preacher')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .toDate(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .escape(),
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL')
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
    const newSermon = {
      ...req.body,
      downloads: 0,
      createdAt: new Date(),
    };
    
    const result = await db.collection('sermons').insertOne(newSermon);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update sermon (admin only)
router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('sermons').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE sermon (admin only)
router.delete('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('sermons').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    
    res.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST increment download count (public) - for tracking when using direct links
router.post('/:id/download', validateObjectId, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid sermon ID' });
    }
    
    const result = await db.collection('sermons').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { downloads: 1 } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sermon not found' });
    }
    
    res.json({ message: 'Download count updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

