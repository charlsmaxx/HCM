const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    let settings = await db.collection('siteSettings').findOne({});
    if (!settings) {
      // Initialize with default settings
      settings = {
        banners: [],
        announcements: [],
        liveStreamUrl: '',
        socialLinks: {}
      };
      await db.collection('siteSettings').insertOne(settings);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('siteSettings').updateOne(
      {},
      { $set: { ...req.body, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

