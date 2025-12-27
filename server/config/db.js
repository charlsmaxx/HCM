const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  console.log('Please create a .env file with MONGODB_URI=your_connection_string');
}

// Configure connection pool options
const clientOptions = {
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50'),
  serverSelectionTimeoutMS: 30000, // Increased from 5000ms to 30 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // Increased from 10000ms to 30 seconds
  retryWrites: true,
  retryReads: true,
};

const client = new MongoClient(uri, clientOptions);

let db;

async function connectDB() {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
    }

    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string format:', uri.substring(0, 20) + '...' + (uri.includes('@') ? ' (contains credentials)' : ' (check format)'));
    
    await client.connect();
    db = client.db('hcm_church');
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    // Create indexes after connection
    await createIndexes();
    
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.error('2. Verify your MONGODB_URI in .env file is correct');
    console.error('3. Ensure your MongoDB Atlas cluster is running (not paused)');
    console.error('4. Check your network/firewall settings');
    console.error('5. Verify your MongoDB username and password are correct');
    throw err;
  }
}

async function createIndexes() {
  try {
    console.log('Creating database indexes...');
    
    // Sermons indexes
    await db.collection('sermons').createIndex({ date: -1 });
    await db.collection('sermons').createIndex({ createdAt: -1 });
    await db.collection('sermons').createIndex({ title: 'text', description: 'text' });
    
    // Events indexes
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ createdAt: -1 });
    await db.collection('events').createIndex({ date: 1, _id: 1 }); // Compound index for upcoming events query
    
    // Blog indexes
    await db.collection('blog').createIndex({ publishDate: -1 });
    await db.collection('blog').createIndex({ createdAt: -1 });
    await db.collection('blog').createIndex({ title: 'text', content: 'text' });
    
    // Testimonials indexes
    await db.collection('testimonials').createIndex({ approved: 1, date: -1 });
    await db.collection('testimonials').createIndex({ date: -1 });
    await db.collection('testimonials').createIndex({ createdAt: -1 });
    
    // Donations indexes
    await db.collection('donations').createIndex({ date: -1 });
    await db.collection('donations').createIndex({ createdAt: -1 });
    await db.collection('donations').createIndex({ email: 1 });
    
    // Prayer requests indexes
    await db.collection('prayerRequests').createIndex({ date: -1 });
    await db.collection('prayerRequests').createIndex({ createdAt: -1 });
    await db.collection('prayerRequests').createIndex({ status: 1, date: -1 });
    
    // Team indexes
    await db.collection('team').createIndex({ order: 1 });
    await db.collection('team').createIndex({ createdAt: -1 });
    
    console.log('Database indexes created successfully');
  } catch (err) {
    console.error('Error creating indexes:', err);
    // Don't throw - indexes might already exist
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

module.exports = { connectDB, getDB, createIndexes };
