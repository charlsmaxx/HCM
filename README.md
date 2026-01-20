# HCM Church Website - Frontend

Frontend repository for Heavenly Concordance Ministry International Church Website.

> **Note**: This repository contains only the frontend code. The backend API is in a separate repository: [HCM-Backend](https://github.com/charlsmaxx/HCM-Backend)

## Features

### Public Pages
- **Homepage** with hero section, upcoming events, latest sermons, and testimonials
- **Sermons Page** with audio/video streaming and downloadable sermons
- **Events Page** for upcoming and past church events
- **Blog Page** for church news and articles
- **Contact Page** with contact form
- **Donate Page** for online giving

### Admin Dashboard
- **Authentication** via Supabase with role-based access
- **Sermon Management** - Upload audio/video files to Supabase Storage
- **Content Management** for events, blog posts, team members, testimonials
- **Donations Tracking** - View donation history
- **Prayer Requests Management** - Review and respond to prayer requests
- **Site Settings** - Manage banners, announcements, live streaming URL
- **Statistics Dashboard** with overview of all content

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Authentication & Storage**: Supabase
- **Package Manager**: npm

## Prerequisites

- Node.js (v14 or higher) - for building CSS
- npm (v6 or higher)
- Supabase account (for authentication and file storage)
- Backend API server (see [HCM-Backend](https://github.com/charlsmaxx/HCM-Backend))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/charlsmaxx/HCM.git
   cd HCM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Create storage buckets: `sermons-audio`, `sermons-video`, `images` (all public)
   - Set storage policies for public read access
   - Get your project URL and anon key from Settings > API
   - Update `public/js/supabase-client.js` with your Supabase credentials

4. **Build CSS** (optional, for development)
   ```bash
   npm run build-css
   ```
   
   This will watch for changes and rebuild the CSS automatically.

5. **Set up Backend API**
   - Clone and set up the [HCM-Backend](https://github.com/charlsmaxx/HCM-Backend) repository
   - Update API endpoints in `public/js/api.js` to point to your backend server URL

6. **Serve the files**
   - You can use any static file server (e.g., `http-server`, `live-server`, or deploy to Netlify/Vercel)
   - Or use the backend server to serve static files (see backend repository)

## Project Structure

```
HCM/
├── public/
│   ├── index.html               # Homepage
│   ├── about.html
│   ├── sermons.html             # Sermons listing and player
│   ├── events.html
│   ├── blog.html
│   ├── contact.html
│   ├── donate.html
│   ├── admin/
│   │   ├── index.html           # Admin dashboard
│   │   ├── login.html           # Admin login
│   │   ├── sermons.html         # Sermon management
│   │   ├── events.html          # Event management
│   │   ├── blog.html            # Blog management
│   │   ├── testimonials.html    # Testimonial management
│   │   └── js/
│   │       ├── admin-layout.js  # Shared admin JavaScript
│   │       └── file-upload.js   # File upload utilities
│   ├── css/
│   │   ├── input.css            # Tailwind input
│   │   └── styles.css           # Compiled CSS
│   ├── js/
│   │   ├── api.js               # API helper functions
│   │   └── supabase-client.js   # Supabase client initialization
│   └── images/                  # Static images
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
```

## API Integration

The frontend communicates with the backend API. Make sure to:

1. Update the API base URL in `public/js/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api'; // or your backend URL
   ```

2. Ensure CORS is properly configured on the backend to allow requests from your frontend domain.

## Deployment

### Static Hosting (Frontend Only)

You can deploy this frontend to any static hosting service:

- **Netlify**: Connect your GitHub repository and deploy
- **Vercel**: Connect your GitHub repository and deploy
- **GitHub Pages**: Enable GitHub Pages in repository settings

### Environment Variables

For static hosting, you may need to configure:
- Supabase URL and keys (can be hardcoded in `supabase-client.js` or injected via build process)
- Backend API URL (update in `api.js`)

## Related Repositories

- **Backend API**: [HCM-Backend](https://github.com/charlsmaxx/HCM-Backend)

## Contributing

This is a church website project. For suggestions or improvements, please contact the development team.

## License

© 2024 Heavenly Concordance Ministry International. All rights reserved.

## Support

For technical support or questions, please contact the ministry administration.
