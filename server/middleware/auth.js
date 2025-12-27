const supabase = require('../config/supabase');
const { adminApiLimiter } = require('./rateLimit');

async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user has admin role
    // Only check app_metadata (secure - only admins can modify via Supabase dashboard)
    // user_metadata can be modified by users themselves, so it's not secure for role checks
    const userRole = user.app_metadata?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required',
        hint: 'Please ensure your user role is set in app_metadata via Supabase dashboard'
      });
    }

    // Attach user info to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Verify any authenticated user (not just admins)
async function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided. Please login to download sermons.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    }

    // Attach user info to request (any authenticated user)
    req.user = user;
    next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Combined middleware: Admin rate limiting + Admin verification
const adminAuth = [adminApiLimiter, verifyAdmin];

module.exports = { verifyAdmin, verifyUser, adminAuth };

