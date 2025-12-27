require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const { connectDB } = require('./config/db');
const { publicApiLimiter, donationLimiter } = require('./middleware/rateLimit');
const checkDB = require('./middleware/checkDB');

// Import routes
const sermonsRoutes = require('./routes/sermons');
const eventsRoutes = require('./routes/events');
const blogRoutes = require('./routes/blog');
const testimonialsRoutes = require('./routes/testimonials');
const teamRoutes = require('./routes/team');
const donationsRoutes = require('./routes/donations');
const prayersRoutes = require('./routes/prayers');
const settingsRoutes = require('./routes/settings');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - MUST be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://supabase.co", "https://*.supabase.co", "https://*.supabase.in", "wss://*.supabase.co", "https:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for Supabase
}));

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Public config endpoint (MUST be before rate limiting and static files)
// This endpoint needs to be accessible even if database connection fails
app.get('/api/config', (req, res) => {
  try {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_ANON_KEY || ''
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load configuration',
      message: error.message
    });
  }
});

// Apply database check to all API routes (except webhooks and config)
app.use('/api', (req, res, next) => {
  // Skip database check for webhook endpoints and config
  if (req.path.includes('/webhook') || req.path === '/config') {
    return next();
  }
  // Check database connection
  checkDB(req, res, next);
});

// Apply rate limiting to all API routes (except webhooks and config)
app.use('/api', (req, res, next) => {
  // Skip rate limiting for webhook endpoints and config
  if (req.path.includes('/webhook') || req.path === '/config') {
    return next();
  }
  // Apply rate limiting
  publicApiLimiter(req, res, next);
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes with rate limiting
app.use('/api/sermons', sermonsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/team', teamRoutes);

// Donations routes - webhook excluded from rate limiting
app.use('/api/donations', (req, res, next) => {
  // Skip rate limiting for webhook endpoint (webhooks come from Flutterwave servers)
  if (req.path === '/webhook') {
    return next();
  }
  // Apply rate limiting for other donation endpoints
  donationLimiter(req, res, next);
}, donationsRoutes);

app.use('/api/prayers', prayersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { getDB } = require('./config/db');
    const db = getDB();
    
    // Check database connection
    await db.admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Connect to database and start server
async function startServer() {
  try {
    // Try to connect to database first (with timeout)
    console.log('Connecting to database...');
    const connectPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Warning: Database connection failed or timed out');
    console.warn('   The server will start, but database features will not work until connection is established.');
    console.warn('   Error:', error.message);
    console.warn('\n   You can still access:');
    console.warn('   - Admin login page: http://localhost:' + PORT + '/admin/login.html');
    console.warn('   - Config endpoint: http://localhost:' + PORT + '/api/config');
    console.warn('   - API endpoints will return 503 until database is connected');
    
    // Continue trying to connect in the background
    connectDB().catch(() => {
      // Already logged above
    });
  }
  
  // Start server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   Visit http://localhost:${PORT}\n`);
  });
}

startServer();

