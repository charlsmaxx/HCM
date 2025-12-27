# HCM Church Website - Heavenly Concordance Ministry International

A modern, full-stack church website built with HTML, Tailwind CSS, JavaScript, Node.js, MongoDB Atlas, and Supabase.

## Features

### Public Features
- **Homepage** with hero section, upcoming events, latest sermons, and ministries overview
- **Sermons Page** with audio/video streaming and downloadable sermons
- **Events Page** for upcoming and past church events
- **Blog Page** for church news and articles
- **Gallery Page** for event photos
- **Ministries Page** showcasing different church ministries
- **Contact Page** with contact form
- **Donate Page** for online giving

### Admin Dashboard
- **Authentication** via Supabase with role-based access
- **Sermon Management** - Upload audio/video files to Supabase Storage
- **Content Management** for events, blog posts, team members, testimonials, gallery
- **Donations Tracking** - View donation history
- **Prayer Requests Management** - Review and respond to prayer requests
- **Site Settings** - Manage banners, announcements, live streaming URL
- **Statistics Dashboard** with overview of all content

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication & Storage**: Supabase
- **Package Manager**: npm

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HCM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Copy the contents from `env.example`
   - Fill in your credentials:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     PORT=3000
     ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Create storage buckets: `sermons-audio`, `sermons-video`, `images` (all public)
   - Set storage policies for public read access
   - Get Service Role Key from Settings > API and add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`
   - Create an admin user with `role: 'admin'` in user metadata
   - See `SUPABASE_STORAGE_SETUP.md` for detailed instructions

5. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas account
   - Create a cluster and get your connection string
   - Add your connection string to the `.env` file

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or start in production mode:
   ```bash
   npm start
   ```

7. **Open your browser**
   - Visit `http://localhost:3000`
   - Admin login: `http://localhost:3000/admin/login.html`

## Project Structure

```
HCM/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── supabase.js          # Supabase client
│   ├── routes/                  # API routes
│   │   ├── sermons.js
│   │   ├── events.js
│   │   ├── blog.js
│   │   ├── testimonials.js
│   │   ├── team.js
│   │   ├── gallery.js
│   │   ├── ministries.js
│   │   ├── donations.js
│   │   ├── prayers.js
│   │   └── settings.js
│   └── middleware/
│       └── auth.js              # Admin authentication middleware
├── public/
│   ├── index.html               # Homepage
│   ├── about.html
│   ├── sermons.html             # Sermons listing and player
│   ├── events.html
│   ├── blog.html
│   ├── gallery.html
│   ├── ministries.html
│   ├── contact.html
│   ├── donate.html
│   ├── admin/
│   │   ├── index.html           # Admin dashboard
│   │   ├── login.html           # Admin login
│   │   └── ...                  # Other admin pages
│   ├── css/
│   │   ├── input.css            # Tailwind input
│   │   └── styles.css           # Compiled CSS
│   └── js/
│       ├── api.js               # API helper functions
│       ├── supabase-client.js   # Supabase client init
│       └── ...                  # Other JS files
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /api/sermons` - Get all sermons
- `GET /api/sermons/:id` - Get single sermon
- `POST /api/sermons/:id/download` - Track sermon download
- `GET /api/events` - Get all events
- `GET /api/blog` - Get all blog posts
- `GET /api/team` - Get team members
- `GET /api/settings` - Get site settings
- `POST /api/donations` - Submit donation
- `POST /api/prayers` - Submit prayer request

### Admin Endpoints (Requires Auth)
- `POST /api/sermons` - Create sermon
- `PUT /api/sermons/:id` - Update sermon
- `DELETE /api/sermons/:id` - Delete sermon
- Similar CRUD operations for other content types

## Database Collections

- `sermons` - Sermon information, URLs, metadata
- `events` - Church events and announcements
- `blog` - Blog posts and articles
- `testimonials` - Member testimonials
- `team` - Team/leadership information
- `gallery` - Photo gallery items
- `donations` - Donation records
- `prayerRequests` - Prayer request submissions
- `ministries` - Church ministries information
- `siteSettings` - Site configuration

## Admin Access

To create an admin user:
1. Sign up a new user in Supabase
2. In Supabase dashboard, go to Authentication > Users
3. Edit the user and add `role: 'admin'` in the user_metadata field
4. Use that email and password to log into the admin dashboard

## Deployment

### Environment Setup
1. Set environment variables on your hosting platform
2. Ensure MongoDB Atlas allows connections from your server IP
3. Configure Supabase project URL and keys

### Recommended Hosting
- **Frontend & Backend**: Vercel, Netlify, or Heroku
- **Database**: MongoDB Atlas
- **Authentication & Storage**: Supabase

## Contributing

This is a church website project. For suggestions or improvements, please contact the development team.

## License

© 2024 Heavenly Concordance Ministry International. All rights reserved.

## Support

For technical support or questions, please contact the ministry administration.







