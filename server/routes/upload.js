const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase with Service Role Key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase Service Role Key not configured. File uploads will not work.');
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio, video, and image files
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|mpeg|wav|m4a|ogg|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, and video files are allowed.'));
    }
  },
});

// Helper function to determine bucket based on file type
function getBucketForFile(mimetype, originalname) {
  if (mimetype.startsWith('image/')) {
    return 'images';
  } else if (mimetype.startsWith('audio/')) {
    return 'sermons-audio';
  } else if (mimetype.startsWith('video/')) {
    return 'sermons-video';
  }
  
  // Fallback based on extension
  const ext = path.extname(originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return 'images';
  } else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) {
    return 'sermons-audio';
  } else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
    return 'sermons-video';
  }
  
  return 'images'; // Default
}

// Helper function to generate unique filename
function generateFileName(originalname, prefix = '') {
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const cleanName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${prefix}${cleanName}_${timestamp}_${random}${ext}`;
}

// POST /api/upload - Upload file to Supabase Storage (admin only)
router.post('/', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Supabase not configured. Please check your environment variables.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { file } = req;
    const { folder, bucket: specifiedBucket } = req.body; // Optional folder and bucket parameters
    
    // Determine bucket based on file type or specified bucket
    const bucket = specifiedBucket || getBucketForFile(file.mimetype, file.originalname);
    
    // Generate unique filename with optional folder prefix
    const fileName = folder ? `${folder}/${generateFileName(file.originalname)}` : generateFileName(file.originalname);
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ 
        error: 'Failed to upload file to Supabase',
        details: error.message 
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    res.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      bucket: bucket,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: error.message 
    });
  }
});

// POST /api/upload/multiple - Upload multiple files (admin only)
router.post('/multiple', verifyAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Supabase not configured. Please check your environment variables.' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { folder } = req.body;
    const uploadResults = [];

    for (const file of req.files) {
      try {
        const bucket = folder || getBucketForFile(file.mimetype, file.originalname);
        const fileName = generateFileName(file.originalname, folder ? `${folder}/` : '');
        
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          uploadResults.push({
            originalName: file.originalname,
            success: false,
            error: error.message,
          });
          continue;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadResults.push({
          originalName: file.originalname,
          success: true,
          url: urlData.publicUrl,
          path: fileName,
          bucket: bucket,
          size: file.size,
          mimetype: file.mimetype,
        });
      } catch (error) {
        uploadResults.push({
          originalName: file.originalname,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results: uploadResults,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload files',
      message: error.message 
    });
  }
});

// DELETE /api/upload - Delete file from Supabase Storage (admin only)
router.delete('/', verifyAdmin, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ 
        error: 'Supabase not configured' 
      });
    }

    const { bucket, path: filePath } = req.body;

    if (!bucket || !filePath) {
      return res.status(400).json({ 
        error: 'Bucket and path are required' 
      });
    }

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return res.status(500).json({ 
        error: 'Failed to delete file',
        details: error.message 
      });
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      message: error.message 
    });
  }
});

module.exports = router;

