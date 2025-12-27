# Supabase Storage Setup Guide

## Overview

This guide will help you set up Supabase Storage buckets for file uploads (images, audio, video) in your HCM Church Website admin dashboard.

## Prerequisites

1. A Supabase account and project
2. Admin access to your Supabase project
3. Service Role Key from Supabase (for backend uploads)

## Step 1: Create Storage Buckets

📖 **For detailed step-by-step instructions, see: `HOW_TO_CREATE_SUPABASE_BUCKETS.md`**

### Quick Overview:

1. **Log in to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Navigate to Storage** in the left sidebar
4. **Click "New bucket"** and create the following buckets:

### Required Buckets:

1. **`sermons-audio`**
   - Purpose: Store sermon audio files (MP3, WAV, M4A)
   - Public: **Yes** (toggle ON)
   - File size limit: 500MB (or your preference)

2. **`sermons-video`**
   - Purpose: Store sermon video files (MP4, MOV, AVI, WEBM)
   - Public: **Yes** (toggle ON)
   - File size limit: 1000MB or more (for videos)

3. **`images`**
   - Purpose: Store images for events, blog posts, testimonials, thumbnails
   - Public: **Yes** (toggle ON)
   - File size limit: 10MB (for images)

**Important**: Make sure all buckets are set to **Public** when creating them!

## Step 2: Configure Bucket Policies

For each bucket, you need to set up policies that allow:
- **Public read access** (so files can be accessed on the website)
- **Admin write access** (so admins can upload files)

### Public Read Policy

1. Go to **Storage** > Select a bucket (e.g., `sermons-audio`)
2. Click on **Policies** tab
3. Click **New Policy**
4. Select **For full customization**, click **Use this template**
5. Create a policy with:
   - **Policy name**: `Public Read Access`
   - **Allowed operation**: `SELECT` (for reading)
   - **Policy definition**:
     ```sql
     true
     ```
   - This allows anyone to read files from the bucket

### Admin Write Policy

For admin uploads, you have two options:

#### Option A: Service Role Key (Recommended - Current Implementation)

The backend uses the Service Role Key to upload files, which bypasses RLS policies. This is the current implementation and doesn't require additional policies.

#### Option B: Authenticated User Policy (Alternative)

If you want to use client-side uploads with user tokens:

1. Create a policy:
   - **Policy name**: `Admin Write Access`
   - **Allowed operation**: `INSERT` and `UPDATE`
   - **Policy definition**:
     ```sql
     auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
     ```
   - This allows only users with admin role to upload files

2. Repeat for `DELETE` operation if you want admins to delete files

## Step 3: Get Service Role Key

1. Go to **Settings** > **API**
2. Find **Service Role** key (under "Project API keys")
3. **Copy the key** (keep it secret!)
4. Add it to your `.env` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Verify Setup

### Test File Upload

1. Start your server:
   ```bash
   npm start
   ```

2. Log in to admin dashboard: `http://localhost:3000/admin/login.html`

3. Go to **Sermons** > **Add New Sermon**

4. Try uploading an audio file:
   - Click on the upload area or drag & drop a file
   - Wait for upload to complete
   - Check that the file URL is populated

5. **Verify in Supabase**:
   - Go to Storage > `sermons-audio` bucket
   - You should see your uploaded file

## Step 5: File Organization (Optional)

Files are automatically organized with unique names to prevent conflicts:
- Format: `filename_timestamp_random.ext`
- Example: `sermon_1234567890_abc123def456.mp3`

If you want to organize files in folders, you can specify a folder parameter when uploading (currently not exposed in UI, but can be added).

## Troubleshooting

### "Supabase not configured" Error

**Solution**: 
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
- Restart your server after adding the key
- Verify the key is correct in Supabase Dashboard

### "Failed to upload file to Supabase" Error

**Possible causes**:
1. **Bucket doesn't exist**: Create the required buckets in Supabase
2. **Bucket not public**: Make sure buckets are set to public
3. **Service Role Key incorrect**: Verify the key in `.env` file
4. **File size too large**: Default limit is 500MB (can be adjusted in `server/routes/upload.js`)

### Files uploaded but not accessible

**Solution**:
- Check that buckets are set to **Public**
- Verify the public read policy is set
- Check file URL in browser to see error message

### "Authentication required" Error

**Solution**:
- Make sure you're logged in as admin
- Check that auth token is stored in localStorage
- Try logging out and logging back in

## File Size Limits

Default limits:
- **Maximum file size**: 500MB per file
- Can be adjusted in `server/routes/upload.js`:
  ```javascript
  limits: {
    fileSize: 500 * 1024 * 1024, // Adjust this value
  }
  ```

## Supported File Types

### Images
- JPEG, JPG, PNG, GIF, WEBP

### Audio
- MP3, WAV, M4A, OGG

### Video
- MP4, MOV, AVI, WEBM

## Security Notes

1. **Service Role Key**: 
   - Keep it secret and never commit to git
   - It has full access to your Supabase project
   - Only use it on the backend

2. **Public Buckets**:
   - Files in public buckets are accessible to anyone with the URL
   - Consider using private buckets for sensitive content
   - Implement access control if needed

3. **File Validation**:
   - Files are validated on both client and server
   - Only allowed file types are accepted
   - File size is checked before upload

## Storage Usage

Monitor your storage usage in Supabase Dashboard:
- Go to **Storage** > **Overview**
- Check total storage used
- Free tier includes 1GB of storage
- Upgrade if you need more space

## Backup Recommendations

1. **Regular backups**: Export important files periodically
2. **Version control**: Keep track of file changes
3. **External storage**: Consider backing up to external storage for critical files

## Next Steps

After setting up storage:
1. Test file uploads in admin dashboard
2. Verify files are accessible on public website
3. Monitor storage usage
4. Set up backups if needed

## Support

If you encounter issues:
1. Check Supabase Dashboard for error messages
2. Check server logs for backend errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

