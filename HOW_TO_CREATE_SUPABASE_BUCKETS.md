# Step-by-Step Guide: Creating Supabase Storage Buckets

This guide will walk you through creating the required storage buckets for your HCM Church Website.

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- A Supabase project created
- Admin access to your Supabase project

## Step 1: Access Your Supabase Project

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Log in** with your Supabase account credentials
3. **Select your project** from the project list
   - If you don't have a project yet, click "New Project" and create one

## Step 2: Navigate to Storage

1. **Look at the left sidebar** in your Supabase dashboard
2. **Click on "Storage"** (usually has a folder/box icon)
   - It's typically located under "Database" and "Authentication"
3. You should now see the Storage page

## Step 3: Create the First Bucket - `sermons-audio`

1. **Click the "New bucket" button** (usually in the top right or center of the page)
2. **Bucket name**: Enter `sermons-audio` (exactly as shown, all lowercase, with hyphen)
3. **Public bucket**: **Toggle this to ON (enabled)**
   - This is important! The bucket must be public so files can be accessed on your website
   - You should see a checkbox or toggle switch
4. **File size limit**: Leave as default or set to your preference (e.g., 500MB)
5. **Allowed MIME types**: Leave empty (allows all types) or specify:
   - For audio: `audio/mpeg,audio/wav,audio/m4a,audio/ogg`
6. **Click "Create bucket"** or "Save"
7. Wait for the bucket to be created (usually takes a few seconds)

## Step 4: Create the Second Bucket - `sermons-video`

1. **Click "New bucket" again**
2. **Bucket name**: Enter `sermons-video` (exactly as shown)
3. **Public bucket**: **Toggle to ON (enabled)**
4. **File size limit**: Set appropriately for videos (e.g., 1000MB or more)
5. **Allowed MIME types**: Optional, or specify:
   - For video: `video/mp4,video/mov,video/avi,video/webm`
6. **Click "Create bucket"**
7. Wait for creation to complete

## Step 5: Create the Third Bucket - `images`

1. **Click "New bucket" again**
2. **Bucket name**: Enter `images` (exactly as shown, all lowercase)
3. **Public bucket**: **Toggle to ON (enabled)**
4. **File size limit**: Set appropriately for images (e.g., 10MB)
5. **Allowed MIME types**: Optional, or specify:
   - For images: `image/jpeg,image/jpg,image/png,image/gif,image/webp`
6. **Click "Create bucket"**
7. Wait for creation to complete

## Step 6: Verify Buckets Are Created

1. **Check your Storage page**
2. You should see three buckets listed:
   - ✅ `sermons-audio`
   - ✅ `sermons-video`
   - ✅ `images`
3. Each bucket should show as **"Public"** (you'll see a public icon or badge)

## Step 7: Set Up Public Read Policies (Important!)

Even though buckets are set to public, you need to set up policies to allow public read access.

### For Each Bucket (`sermons-audio`, `sermons-video`, `images`):

1. **Click on the bucket name** (e.g., click on `sermons-audio`)
2. **Click on the "Policies" tab** (usually at the top of the bucket page)
3. **Click "New Policy"** button
4. **Select "For full customization"** and click "Use this template"
5. **Policy Setup**:
   - **Policy name**: `Public Read Access`
   - **Allowed operation**: Select `SELECT` (this allows reading/downloading files)
   - **Policy definition**: Enter the following SQL:
     ```sql
     true
     ```
     This allows anyone to read files from this bucket
6. **Click "Review"** and then **"Save policy"**
7. **Repeat for the other two buckets** (`sermons-video` and `images`)

## Step 8: Verify Policies Are Active

1. **Go back to each bucket's Policies tab**
2. You should see your "Public Read Access" policy listed
3. It should show `SELECT` operation
4. Status should be "Active" or show a checkmark

## Step 9: Get Your Service Role Key (For Backend Uploads)

1. **Go to Settings** in the left sidebar
2. **Click on "API"** (under Project Settings)
3. **Find "Project API keys"** section
4. **Locate "service_role" key** (this is different from "anon" key)
5. **Click the eye icon** or "Reveal" to show the key
6. **Copy the key** (keep it secret! Don't share it publicly)
7. **Add it to your `.env` file**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
8. **Restart your server** after adding the key

## Step 10: Test Your Setup

### Test 1: Verify Buckets Are Accessible

1. **Go to Storage** in Supabase dashboard
2. **Click on each bucket**
3. **Verify they are empty** (or check existing files)
4. **Verify they show as "Public"**

### Test 2: Test File Upload (After Server Setup)

1. **Start your server**: `npm start`
2. **Log in to admin dashboard**: `http://localhost:3000/admin/login.html`
3. **Go to Sermons** > **Add New Sermon**
4. **Try uploading a test audio file**:
   - Click on the audio upload area
   - Select a small test audio file
   - Wait for upload to complete
5. **Check in Supabase**:
   - Go to Storage > `sermons-audio` bucket
   - You should see your uploaded file
6. **Verify file is accessible**:
   - Click on the file in Supabase
   - Copy the public URL
   - Paste it in a browser - the file should download or play

## Troubleshooting

### Bucket Not Showing as Public

**Problem**: Bucket doesn't have public access enabled

**Solution**:
1. Click on the bucket
2. Look for "Public" toggle or settings
3. Enable public access
4. If option is not available, check bucket settings

### Files Not Accessible After Upload

**Problem**: Files upload but can't be accessed via URL

**Solution**:
1. Verify bucket is set to public
2. Check that public read policy is set up
3. Verify policy is active (not disabled)
4. Check file URL format in browser

### "Permission Denied" Error

**Problem**: Getting permission errors when uploading

**Solution**:
1. Verify Service Role Key is correct in `.env` file
2. Check that Service Role Key is from the same project
3. Restart server after adding key
4. Verify you're logged in as admin

### Bucket Already Exists Error

**Problem**: Trying to create a bucket that already exists

**Solution**:
1. Check if bucket already exists in Storage
2. If it exists, you can use it (just verify it's public)
3. If you need to recreate it, delete the old one first (be careful - this deletes all files!)

## Visual Guide (What to Look For)

### Storage Page Should Show:
```
Storage
├── sermons-audio (Public) 📁
├── sermons-video (Public) 📁
└── images (Public) 📁
```

### Bucket Settings Should Show:
- ✅ **Public bucket**: Enabled/ON
- ✅ **File size limit**: Set appropriately
- ✅ **Policies**: At least one "Public Read Access" policy with SELECT operation

### Policy Should Show:
- **Name**: Public Read Access
- **Operation**: SELECT
- **Definition**: `true`
- **Status**: Active

## Quick Checklist

Before testing file uploads, verify:

- [ ] All three buckets created (`sermons-audio`, `sermons-video`, `images`)
- [ ] All buckets are set to **Public**
- [ ] Public read policies are set up for all buckets
- [ ] Policies are **Active**
- [ ] Service Role Key added to `.env` file
- [ ] Server restarted after adding Service Role Key
- [ ] Admin user created and can log in

## Additional Notes

### Bucket Naming
- Use lowercase letters
- Use hyphens for separators (not underscores or spaces)
- Be consistent with naming

### Public vs Private Buckets
- **Public buckets**: Files are accessible to anyone with the URL
- **Private buckets**: Files require authentication to access
- For this project, we use **public buckets** so files can be displayed on the website

### File Organization
- Files are automatically organized by the upload system
- Each file gets a unique name to prevent conflicts
- You can organize files in folders (advanced feature)

### Storage Limits
- Free tier: 1GB storage
- Monitor your usage in Supabase Dashboard
- Upgrade if you need more storage

## Next Steps

After creating buckets:

1. ✅ **Test file upload** in admin dashboard
2. ✅ **Verify files are accessible** on public website
3. ✅ **Monitor storage usage** in Supabase Dashboard
4. ✅ **Set up backups** if needed (for important files)

## Need Help?

If you're stuck:

1. **Check Supabase documentation**: https://supabase.com/docs/guides/storage
2. **Check browser console** for errors
3. **Check server logs** for backend errors
4. **Verify all steps** were completed correctly
5. **Check file permissions** in bucket settings

## Summary

You've successfully created three storage buckets:
- ✅ `sermons-audio` - For audio files
- ✅ `sermons-video` - For video files  
- ✅ `images` - For image files

All buckets are public and have read access policies set up. Your file upload system is ready to use!












