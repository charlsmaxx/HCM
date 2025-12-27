-- =====================================================
-- Supabase Storage Policies for HCM Church Website
-- =====================================================
-- 
-- This file contains SQL policies for three storage buckets:
-- 1. sermons-audio
-- 2. sermons-video
-- 3. images
--
-- Each bucket needs the following policies:
-- - Public Read Access (SELECT) - allows anyone to read files
-- - Admin Upload Access (INSERT) - allows admins to upload files
-- - Admin Update Access (UPDATE) - allows admins to update files
-- - Admin Delete Access (DELETE) - allows admins to delete files
--
-- =====================================================

-- =====================================================
-- SERMONS-AUDIO BUCKET POLICIES
-- =====================================================

-- Policy 1: Public Read Access for sermons-audio
-- Allows anyone to read/download audio files
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'sermons-audio'
);

-- Policy 2: Admin Upload Access for sermons-audio
-- Allows users with admin role to upload audio files
CREATE POLICY "Admin Upload Access"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'sermons-audio' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 3: Admin Update Access for sermons-audio
-- Allows users with admin role to update audio files
CREATE POLICY "Admin Update Access"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'sermons-audio' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  bucket_id = 'sermons-audio' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 4: Admin Delete Access for sermons-audio
-- Allows users with admin role to delete audio files
CREATE POLICY "Admin Delete Access"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'sermons-audio' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- =====================================================
-- SERMONS-VIDEO BUCKET POLICIES
-- =====================================================

-- Policy 1: Public Read Access for sermons-video
-- Allows anyone to read/download video files
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'sermons-video'
);

-- Policy 2: Admin Upload Access for sermons-video
-- Allows users with admin role to upload video files
CREATE POLICY "Admin Upload Access"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'sermons-video' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 3: Admin Update Access for sermons-video
-- Allows users with admin role to update video files
CREATE POLICY "Admin Update Access"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'sermons-video' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  bucket_id = 'sermons-video' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 4: Admin Delete Access for sermons-video
-- Allows users with admin role to delete video files
CREATE POLICY "Admin Delete Access"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'sermons-video' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- =====================================================
-- IMAGES BUCKET POLICIES
-- =====================================================

-- Policy 1: Public Read Access for images
-- Allows anyone to read/download image files
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images'
);

-- Policy 2: Admin Upload Access for images
-- Allows users with admin role to upload image files
CREATE POLICY "Admin Upload Access"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 3: Admin Update Access for images
-- Allows users with admin role to update image files
CREATE POLICY "Admin Update Access"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  bucket_id = 'images' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- Policy 4: Admin Delete Access for images
-- Allows users with admin role to delete image files
CREATE POLICY "Admin Delete Access"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);

-- =====================================================
-- NOTES:
-- =====================================================
--
-- 1. These policies assume you're using Row Level Security (RLS)
-- 2. The admin role check uses: auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
-- 3. If your backend uses Service Role Key, it bypasses these policies
-- 4. These policies are useful for client-side uploads with user tokens
-- 5. Public read policies allow anyone to access files via URL
-- 6. Admin policies restrict write operations to users with admin role
--
-- =====================================================
-- ALTERNATIVE: Simplified Public Read Only (If you only need public read)
-- =====================================================
--
-- If you only want public read access and handle all writes via Service Role Key,
-- you can use this simpler policy for each bucket:
--
-- CREATE POLICY "Public Read Access"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'BUCKET_NAME');
--
-- Replace BUCKET_NAME with: 'sermons-audio', 'sermons-video', or 'images'
--
-- =====================================================












