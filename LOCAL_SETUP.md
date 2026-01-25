# Local Development Setup

This repository contains both **frontend** and **backend** code for local development, but they are pushed to separate GitHub repositories.

## Repository Structure

```
HCM/
├── public/              # Frontend files (HTML, CSS, JS)
├── server/              # Backend API code
├── package.json         # Combined dependencies
├── backend-repo/        # Backend git repo (for pushing to GitHub)
└── .git/               # Frontend git repo (for pushing to GitHub)
```

## How It Works

- **Local Development**: Both frontend and backend files are in the same folder for easy development
- **GitHub**: 
  - Frontend code → `https://github.com/charlsmaxx/HCM.git`
  - Backend code → `https://github.com/charlsmaxx/HCM-Backend.git`

## Starting the Server

### Install Dependencies
```bash
npm install
```

### Start the Backend Server (serves both API and frontend)
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will:
- Serve the API at `http://localhost:3000/api/*`
- Serve frontend files at `http://localhost:3000/*`

## Pushing to GitHub

### Push Frontend Changes
From the root directory:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

This pushes to: `https://github.com/charlsmaxx/HCM.git`

### Push Backend Changes

1. **Sync backend files to backend-repo:**
   ```powershell
   # Windows PowerShell
   .\sync-backend.ps1
   ```
   
   Or on Linux/Mac:
   ```bash
   ./sync-backend.sh
   ```

2. **Push from backend-repo:**
   ```bash
   cd backend-repo
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

This pushes to: `https://github.com/charlsmaxx/HCM-Backend.git`

## Important Notes

- **Backend files** (`server/`, `package.json`, `env.example`) are **ignored** by the frontend git repo
- **Frontend files** (`public/`) are **ignored** by the backend git repo
- Always run `sync-backend.ps1` (or `.sh`) before pushing backend changes
- The `backend-repo/` folder is ignored by the frontend git repo

## Environment Variables

Create a `.env` file in the root directory:
```
MONGODB_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
```

## Development Workflow

1. Make changes to frontend files in `public/` or backend files in `server/`
2. Test locally with `npm start` or `npm run dev`
3. When ready to push:
   - **Frontend**: `git add .` → `git commit` → `git push` (from root)
   - **Backend**: Run `sync-backend.ps1` → `cd backend-repo` → `git add .` → `git commit` → `git push`

