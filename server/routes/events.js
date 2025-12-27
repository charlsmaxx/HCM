const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

// GET all events (public) - with pagination
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { upcoming } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // Normalize any legacy string dates to Date objects so filtering works
    try {
      await db.collection('events').updateMany(
        { date: { $type: 'string' } },
        [{ $set: { date: { $toDate: '$date' } } }]
      );
    } catch (conversionError) {
      console.warn('Event date normalization skipped:', conversionError.message);
    }

    let query = {};
    // If upcoming=true, only return events with date >= today
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      query.date = { $gte: today };
    }
    
    // Get total count for pagination metadata
    const total = await db.collection('events').countDocuments(query);
    
    // Get paginated events
    const events = await db.collection('events')
      .find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const normalizedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
    }));

    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(normalizedEvents, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET/POST seed events (one-time setup - must be before /:id route)
router.get('/seed', async (req, res) => {
  try {
    console.log('Seed route called');
    const db = getDB();
    if (!db) {
      console.error('Database not available');
      return res.status(500).json({ error: 'Database not connected. Please check your MongoDB connection.' });
    }
    console.log('Database connected, accessing events collection');
    const eventsCollection = db.collection('events');
    
    // Check if events already exist
    console.log('Checking for existing events...');
    const existingEvents = await eventsCollection.find({
      title: { $in: [
        'Sunday Worship Service',
        'Youth Conference 2025',
        'Prayer & Fasting Week',
        'HCM Holy Ghost Conference',
        'HCM Thanksgiving',
        'HCM Carol Service'
      ]}
    }).toArray();
    
    if (existingEvents.length > 0) {
      console.log(`Events already exist: ${existingEvents.length}`);
      return res.json({ message: 'Events already exist', count: existingEvents.length });
    }
    
    console.log('Creating new events...');
    // Get current date and calculate future dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const twoMonths = new Date(today);
    twoMonths.setMonth(today.getMonth() + 2);
    
    const threeMonths = new Date(today);
    threeMonths.setMonth(today.getMonth() + 3);

    const events = [
      {
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly Sunday worship service. Experience powerful praise and worship, inspiring messages, and fellowship with our church family.',
        date: nextWeek,
        location: 'HCM Main Auditorium',
        image: '/images/events/worship-service.jpg',
        createdAt: new Date()
      },
      {
        title: 'Youth Conference 2025',
        description: 'An exciting conference designed for young people to grow in their faith, connect with peers, and discover their purpose in Christ. Special guest speakers and worship sessions.',
        date: nextMonth,
        location: 'HCM Main Auditorium',
        image: '/images/events/youth-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'Prayer & Fasting Week',
        description: 'A week of dedicated prayer and fasting. Join us as we seek God\'s face together, intercede for our community, and experience spiritual breakthrough.',
        date: twoMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/prayer-fasting.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Holy Ghost Conference',
        description: 'Join us for a powerful time of worship, prayer, and the move of the Holy Spirit. Experience God\'s presence in a fresh and transformative way.',
        date: threeMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/holy-ghost-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Thanksgiving',
        description: 'A special service to give thanks to God for His faithfulness throughout the year. Come celebrate with us as we express our gratitude.',
        date: new Date(nextMonth.getFullYear(), 11, 20), // December 20th
        location: 'HCM Main Auditorium',
        image: '/images/events/thanksgiving.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Carol Service',
        description: 'Celebrate the birth of our Savior with beautiful carols, special music, and the true meaning of Christmas. A joyous event for the whole family.',
        date: new Date(nextMonth.getFullYear(), 11, 23), // December 23rd
        location: 'HCM Main Auditorium',
        image: '/images/events/carol-service.jpg',
        createdAt: new Date()
      }
    ];
    
    console.log('Inserting events into database...');
    const result = await eventsCollection.insertMany(events);
    console.log(`Successfully inserted ${result.insertedCount} events`);
    res.json({ 
      message: 'Events seeded successfully', 
      insertedCount: result.insertedCount,
      events: events.map(e => ({ title: e.title, date: e.date.toLocaleDateString() }))
    });
  } catch (error) {
    console.error('Seed events error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to seed events',
      stack: error.stack
    });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ error: 'Database not connected. Please check your MongoDB connection.' });
    }
    const eventsCollection = db.collection('events');
    
    // Check if events already exist
    const existingEvents = await eventsCollection.find({
      title: { $in: [
        'Sunday Worship Service',
        'Youth Conference 2025',
        'Prayer & Fasting Week',
        'HCM Holy Ghost Conference',
        'HCM Thanksgiving',
        'HCM Carol Service'
      ]}
    }).toArray();
    
    if (existingEvents.length > 0) {
      return res.json({ message: 'Events already exist', count: existingEvents.length });
    }
    
    // Get current date and calculate future dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const twoMonths = new Date(today);
    twoMonths.setMonth(today.getMonth() + 2);
    
    const threeMonths = new Date(today);
    threeMonths.setMonth(today.getMonth() + 3);
    
    const events = [
      {
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly Sunday worship service. Experience powerful praise and worship, inspiring messages, and fellowship with our church family.',
        date: nextWeek,
        location: 'HCM Main Auditorium',
        image: '/images/events/worship-service.jpg',
        createdAt: new Date()
      },
      {
        title: 'Youth Conference 2025',
        description: 'An exciting conference designed for young people to grow in their faith, connect with peers, and discover their purpose in Christ. Special guest speakers and worship sessions.',
        date: nextMonth,
        location: 'HCM Main Auditorium',
        image: '/images/events/youth-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'Prayer & Fasting Week',
        description: 'A week of dedicated prayer and fasting. Join us as we seek God\'s face together, intercede for our community, and experience spiritual breakthrough.',
        date: twoMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/prayer-fasting.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Holy Ghost Conference',
        description: 'Join us for a powerful time of worship, prayer, and the move of the Holy Spirit. Experience God\'s presence in a fresh and transformative way.',
        date: threeMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/holy-ghost-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Thanksgiving',
        description: 'A special service to give thanks to God for His faithfulness throughout the year. Come celebrate with us as we express our gratitude.',
        date: new Date(nextMonth.getFullYear(), 11, 20), // December 20th
        location: 'HCM Main Auditorium',
        image: '/images/events/thanksgiving.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Carol Service',
        description: 'Celebrate the birth of our Savior with beautiful carols, special music, and the true meaning of Christmas. A joyous event for the whole family.',
        date: new Date(nextMonth.getFullYear(), 11, 23), // December 23rd
        location: 'HCM Main Auditorium',
        image: '/images/events/carol-service.jpg',
        createdAt: new Date()
      }
    ];
    
    const result = await eventsCollection.insertMany(events);
    res.json({ 
      message: 'Events seeded successfully', 
      insertedCount: result.insertedCount,
      events: events.map(e => ({ title: e.title, date: e.date.toLocaleDateString() }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single event by ID (public)
// Note: validateObjectId middleware will handle 'seed' route differently
router.get('/:id', async (req, res, next) => {
  // Skip validation for 'seed' route
  if (req.params.id === 'seed') {
    return next('route'); // Skip to next route handler
  }
  validateObjectId(req, res, next);
}, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      ...event,
      _id: event._id.toString(),
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new event (admin only)
router.post('/', verifyAdmin, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters')
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description is required and must be less than 5000 characters')
    .escape(),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .toDate(),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .escape(),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
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
    const newEvent = {
      ...req.body,
      createdAt: new Date(),
    };

    if (Object.prototype.hasOwnProperty.call(newEvent, 'date')) {
      const eventDate = new Date(newEvent.date);
      if (!isNaN(eventDate.getTime())) {
        newEvent.date = eventDate;
      } else {
        delete newEvent.date;
      }
    }
    
    const result = await db.collection('events').insertOne(newEvent);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update event (admin only)
router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    if (Object.prototype.hasOwnProperty.call(updateData, 'date')) {
      const eventDate = new Date(updateData.date);
      if (!isNaN(eventDate.getTime())) {
        updateData.date = eventDate;
      } else {
        delete updateData.date;
      }
    }

    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE event (admin only)
router.delete('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('events').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

