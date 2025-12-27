# Admin Pages Guide

## Overview

The admin dashboard now includes full content management capabilities for sermons, events, blog posts, and testimonials. Admins can create, edit, delete, and manage all content that appears on the website.

## Admin Pages Created

### 1. Sermons Management (`/admin/sermons.html`)
- **View all sermons** in a table format
- **Add new sermons** with:
  - Title, Speaker, Date
  - Description
  - Audio URL (for audio files)
  - Video URL (for video files or YouTube)
  - Thumbnail image URL
- **Edit existing sermons**
- **Delete sermons**
- Shows download count for each sermon

### 2. Events Management (`/admin/events.html`)
- **View all events** in a table format
- **Add new events** with:
  - Title, Description
  - Date and Time
  - Location
  - Image URL
- **Edit existing events**
- **Delete events**
- Shows event status (Upcoming/Past) based on date

### 3. Blog Posts Management (`/admin/blog.html`)
- **View all blog posts** in a table format
- **Add new blog posts** with:
  - Title, Author
  - Publish Date
  - Featured Image URL
  - Excerpt/Summary
  - Content (supports HTML)
  - Tags (comma-separated)
- **Edit existing blog posts**
- **Delete blog posts**

### 4. Testimonials Management (`/admin/testimonials.html`)
- **View all testimonials** with filtering:
  - All testimonials
  - Approved only
  - Pending approval only
- **Add new testimonials** with:
  - Name
  - Testimonial text
  - Date
  - Location/Title
  - Image URL
  - Approval status (admin can set as approved)
- **Approve pending testimonials** (one-click approval)
- **Edit existing testimonials**
- **Delete testimonials**

## Features

### Shared Admin Layout
- Consistent navigation sidebar across all admin pages
- Active page highlighting
- Logout functionality
- "View Site" link to public website
- Authentication check (redirects to login if not authenticated)

### Dashboard Overview (`/admin/`)
- Statistics cards showing:
  - Total Sermons
  - Upcoming Events
  - Blog Posts
  - Testimonials
  - Total Donations
  - Prayer Requests
- Quick action buttons for common tasks

### Modal Forms
- All admin pages use modal forms for adding/editing content
- Clean, user-friendly interface
- Form validation
- Error handling

### Real-time Updates
- Content updates immediately after save/delete
- No page refresh needed
- Loading states during API calls

## How to Use

### Adding Content

1. **Navigate to the appropriate admin page** (e.g., `/admin/sermons.html`)
2. **Click the "+ Add New" button** in the top right
3. **Fill in the form fields**
4. **Click "Save"** to create the content
5. **The content will appear in the table** and be visible on the public website (if applicable)

### Editing Content

1. **Find the item** in the table
2. **Click the "Edit" button** next to the item
3. **Modify the fields** in the modal
4. **Click "Save"** to update
5. **Changes are reflected immediately**

### Deleting Content

1. **Find the item** in the table
2. **Click the "Delete" button** next to the item
3. **Confirm the deletion** in the prompt
4. **The item is removed** from the database and website

### Approving Testimonials

1. **Go to Testimonials page** (`/admin/testimonials.html`)
2. **Filter by "Pending"** to see unapproved testimonials
3. **Click "Approve"** next to a testimonial
4. **The testimonial is immediately approved** and visible on the public website

## API Integration

All admin pages use the API endpoints defined in `/public/js/api.js`:

- **Sermons**: `/api/sermons` (GET, POST, PUT, DELETE)
- **Events**: `/api/events` (GET, POST, PUT, DELETE)
- **Blog**: `/api/blog` (GET, POST, PUT, DELETE)
- **Testimonials**: `/api/testimonials` (GET, POST, PUT, DELETE)

All POST, PUT, and DELETE operations require admin authentication (Bearer token).

## Content Display on Public Website

### Sermons
- Displayed on `/sermons.html`
- Sorted by date (newest first)
- Audio/video players available
- Download functionality

### Events
- Displayed on `/events.html` (or homepage)
- Upcoming events shown first
- Past events available for viewing
- Event details with date, location, description

### Blog Posts
- Displayed on `/blog.html`
- Sorted by publish date (newest first)
- Full post content with images
- Tags for categorization

### Testimonials
- Displayed on public pages (homepage, about page, etc.)
- Only approved testimonials are shown
- Can include name, text, image, location
- Sorted by date (newest first)

## Security

- All admin pages require authentication
- API endpoints for creating/updating/deleting require admin role
- Authentication token stored in localStorage
- Automatic logout if token is invalid or missing
- Public endpoints only show approved/published content

## Tips

1. **URLs for Media**: When adding audio, video, or image URLs:
   - Use full URLs (https://...)
   - For Supabase Storage, use the public URL
   - For YouTube videos, use the embed URL format

2. **Date Formatting**: Dates are automatically formatted for display
   - Use the date picker for consistency
   - Dates are stored in ISO format

3. **Content Preview**: After saving, content is immediately available on the public website
   - Check the public pages to see how content appears
   - Use "View Site" link to quickly navigate

4. **Bulk Operations**: Currently, operations are done one at a time
   - For bulk deletions, delete items individually
   - Consider adding bulk operations in future updates

## Troubleshooting

### Content not appearing on public website
- Check if the content was saved successfully (look for it in admin table)
- Verify the API endpoint is working (check browser console)
- Check if content meets display criteria (e.g., testimonials must be approved)

### Cannot edit/delete content
- Verify you're logged in as admin
- Check browser console for errors
- Ensure the content ID is valid

### Form validation errors
- Check that all required fields are filled
- Verify date formats are correct
- Ensure URLs are valid (if provided)

## Future Enhancements

Potential improvements:
- Bulk operations (delete multiple items)
- Content search/filtering
- Rich text editor for blog posts
- Image upload functionality (currently requires URLs)
- Content scheduling (publish dates)
- Content drafts (save without publishing)
- Content preview before publishing
- Export functionality
- Content analytics

## Support

For issues or questions:
1. Check browser console for errors
2. Verify server is running
3. Check API endpoints are accessible
4. Verify database connection
5. Check authentication token is valid

