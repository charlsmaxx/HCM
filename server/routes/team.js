const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const team = await db.collection('team').find({}).sort({ order: 1 }).toArray();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('team').insertOne({ ...req.body, createdAt: new Date() });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('team').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', validateObjectId, verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const result = await db.collection('team').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

