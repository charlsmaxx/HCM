# File Upload Features

## Overview

The admin dashboard now supports file uploads with drag-and-drop functionality. Admins can upload images, audio, and video files directly from their devices, and files are automatically saved to Supabase Storage.

## Features

### ✨ Drag & Drop Upload
- Drag files directly onto the upload area
- Visual feedback when dragging files
- Supports multiple file types

### 📁 File Type Support
- **Images**: JPEG, JPG, PNG, GIF, WEBP
- **Audio**: MP3, WAV, M4A, OGG
- **Video**: MP4, MOV, AVI, WEBM

### 🔄 Upload Progress
- Real-time upload progress bar
- Visual feedback during upload
- Error handling with user-friendly messages

### 💾 Automatic Storage
- Files automatically saved to Supabase Storage
- Organized by file type:
  - Images → `images` bucket
  - Audio → `sermons-audio` bucket
  - Video → `sermons-video` bucket
- Unique filenames to prevent conflicts

### 🖼️ Image Preview
- Instant preview of uploaded images
- File information display
- Link to view uploaded files

### 🔗 Manual URL Option
- Option to paste URLs manually
- Useful for external files (YouTube, etc.)
- Works alongside file upload

## Where File Upload is Available

### 1. Sermons Management
- **Audio files**: Upload sermon audio recordings
- **Video files**: Upload sermon videos
- **Thumbnail images**: Upload sermon thumbnails

### 2. Events Management
- **Event images**: Upload event photos/thumbnails

### 3. Blog Posts Management
- **Featured images**: Upload blog post featured images

### 4. Testimonials Management
- **Profile images**: Upload testimonial photos

## How to Use

### Uploading Files

1. **Click to Upload**:
   - Click on the upload area
   - Select file from your device
   - File uploads automatically

2. **Drag & Drop**:
   - Drag file from your device
   - Drop onto the upload area
   - File uploads automatically

3. **Manual URL**:
   - Paste URL in the manual input field
   - Useful for external files or existing URLs

### File Upload Process

1. **Select File**: Choose file from device or drag & drop
2. **Upload Progress**: See progress bar during upload
3. **Upload Complete**: File URL is automatically populated
4. **Save Content**: Save the form to store the file reference

### Editing Content with Files

1. **Edit existing content**: Click "Edit" on any item
2. **View current file**: Existing file URL is displayed
3. **Replace file**: Upload a new file or change URL manually
4. **Save changes**: File reference is updated in database

## File Storage

### Supabase Storage Buckets

Files are stored in Supabase Storage buckets:
- `images` - All image files
- `sermons-audio` - Audio files
- `sermons-video` - Video files

### File Naming

Files are automatically renamed to prevent conflicts:
- Format: `filename_timestamp_random.ext`
- Example: `sermon_1234567890_abc123def456.mp3`

### File URLs

After upload, files get public URLs:
- Format: `https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]`
- These URLs are stored in the database
- Files are accessible on the public website

## Technical Details

### Backend Upload Route

- **Endpoint**: `/api/upload`
- **Method**: POST
- **Authentication**: Admin only (Bearer token)
- **Max file size**: 500MB (configurable)
- **File validation**: Client and server-side

### Frontend Upload Component

- **Location**: `/public/admin/js/file-upload.js`
- **Features**:
  - Drag & drop support
  - Progress tracking
  - Error handling
  - File validation
  - Preview generation

### Security

- **Admin only**: Only authenticated admins can upload
- **File type validation**: Only allowed file types accepted
- **File size limits**: Prevents oversized uploads
- **Service Role Key**: Backend uses secure key for uploads

## Troubleshooting

### Upload Fails

**Possible causes**:
1. File too large (max 500MB)
2. Invalid file type
3. Network error
4. Supabase not configured
5. Not logged in as admin

**Solutions**:
- Check file size and type
- Verify internet connection
- Check Supabase configuration
- Ensure you're logged in as admin
- Check browser console for errors

### Files Not Showing

**Possible causes**:
1. Bucket not public
2. File upload incomplete
3. URL not saved to database

**Solutions**:
- Verify bucket is set to public in Supabase
- Check upload completed successfully
- Verify file URL is saved in database
- Check file URL in browser

### Slow Uploads

**Possible causes**:
1. Large file size
2. Slow internet connection
3. Server issues

**Solutions**:
- Compress files before uploading
- Check internet connection
- Check server logs for errors
- Consider increasing upload timeout

## Best Practices

### File Optimization

1. **Images**: 
   - Compress images before uploading
   - Use appropriate formats (JPEG for photos, PNG for graphics)
   - Recommended max size: 2MB per image

2. **Audio**:
   - Use MP3 format for compatibility
   - Compress audio files
   - Recommended bitrate: 128-192 kbps

3. **Video**:
   - Use MP4 format for compatibility
   - Compress videos
   - Consider hosting large videos on YouTube/Vimeo

### File Organization

- Files are automatically organized by type
- Unique filenames prevent conflicts
- Consider organizing by date or category (future feature)

### Backup

- Regularly backup important files
- Keep copies of critical content
- Monitor storage usage in Supabase

## Future Enhancements

Potential improvements:
- Bulk file upload
- File management interface
- File deletion from storage
- Image cropping/editing
- Video compression
- File organization by folders
- File search functionality
- Storage usage statistics

## Support

For issues or questions:
1. Check `SUPABASE_STORAGE_SETUP.md` for setup instructions
2. Check browser console for errors
3. Check server logs for backend errors
4. Verify Supabase configuration
5. Check file upload limits and types

