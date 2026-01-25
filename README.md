# HCM Church Website - Backend API

Backend API server for Heavenly Concordance Ministry International Church Website.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication & Storage**: Supabase
- **Package Manager**: npm

## Features

- RESTful API endpoints for sermons, events, blog, testimonials, team, donations, prayers
- Admin authentication via Supabase
- File uploads to Supabase Storage
- Input validation and sanitization
- Security headers (Helmet.js)
- Rate limiting
- MongoDB connection management
- Pagination support

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/charlsmaxx/HCM-Backend.git
   cd HCM-Backend
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
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     PORT=3000
     ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
     ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or start in development mode with auto-reload:
   ```bash
   npm run dev
   ```

## Project Structure

```
server/
├── index.js                 # Express server entry point
├── config/
│   ├── db.js                # MongoDB connection
│   └── supabase.js          # Supabase client
├── routes/                  # API routes
│   ├── sermons.js
│   ├── events.js
│   ├── blog.js
│   ├── testimonials.js
│   ├── team.js
│   ├── donations.js
│   ├── prayers.js
│   ├── contact.js
│   ├── settings.js
│   └── upload.js
├── middleware/
│   ├── auth.js              # Admin authentication middleware
│   ├── checkDB.js           # Database connection check
│   ├── errorHandler.js      # Error handling middleware
│   ├── rateLimit.js         # Rate limiting middleware
│   └── validateObjectId.js  # MongoDB ObjectId validation
├── utils/
│   ├── pagination.js        # Pagination utilities
│   └── sanitize.js          # HTML/text sanitization
└── scripts/
    ├── recover-admin.js     # Admin recovery script
    ├── setup-admin-user.js  # Admin user setup
    └── ...
```

## API Endpoints

### Public Endpoints
- `GET /api/sermons` - Get all sermons (paginated)
- `GET /api/sermons/:id` - Get single sermon
- `GET /api/events` - Get all events (paginated)
- `GET /api/blog` - Get all blog posts (paginated)
- `GET /api/testimonials` - Get all testimonials (paginated)
- `GET /api/team` - Get team members
- `GET /api/settings` - Get site settings
- `POST /api/donations/initialize` - Initialize donation payment
- `POST /api/donations/webhook` - Payment webhook
- `POST /api/contact` - Submit contact form
- `POST /api/prayers` - Submit prayer request

### Admin Endpoints (Requires Auth)
- `POST /api/sermons` - Create sermon
- `PUT /api/sermons/:id` - Update sermon
- `DELETE /api/sermons/:id` - Delete sermon
- Similar CRUD operations for events, blog, testimonials, team
- `GET /api/donations` - View donation history
- `GET /api/prayers` - View prayer requests
- `PUT /api/prayers/:id` - Update prayer request status

## Database Collections

- `sermons` - Sermon information, URLs, metadata
- `events` - Church events and announcements
- `blog` - Blog posts and articles
- `testimonials` - Member testimonials
- `team` - Team/leadership information
- `donations` - Donation records
- `prayerRequests` - Prayer request submissions
- `siteSettings` - Site configuration

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- HTML sanitization with DOMPurify
- MongoDB ObjectId validation
- Request body size limits
- Rate limiting
- Secure admin authentication via Supabase

## Development

The server uses Express.js and connects to MongoDB Atlas for data storage and Supabase for authentication and file storage.

## License

© 2024 Heavenly Concordance Ministry International. All rights reserved.
