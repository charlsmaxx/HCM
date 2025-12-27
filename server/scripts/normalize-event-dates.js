require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function normalizeEventDates() {
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('hcm_church');
    const events = db.collection('events');

    const cursor = events.find({ date: { $type: 'string' } });
    let converted = 0;
    let skipped = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const parsed = new Date(doc.date);
      if (!isNaN(parsed.getTime())) {
        await events.updateOne({ _id: doc._id }, { $set: { date: parsed } });
        converted += 1;
      } else {
        skipped += 1;
        console.warn(`Skipped event ${doc._id.toString()} due to invalid date string: ${doc.date}`);
      }
    }

    console.log(`Converted ${converted} event date(s).`);
    if (skipped > 0) {
      console.log(`Skipped ${skipped} event(s) with invalid date strings.`);
    }
  } catch (error) {
    console.error('Failed to normalize event dates:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

normalizeEventDates();


