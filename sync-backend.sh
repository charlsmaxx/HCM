#!/bin/bash
# Script to sync backend files to backend-repo for pushing to GitHub
# Usage: ./sync-backend.sh

echo "Syncing backend files to backend-repo..."

# Copy backend files to backend-repo
cp -r server backend-repo/
cp package.json backend-repo/
cp env.example backend-repo/ 2>/dev/null || true

echo "Backend files synced successfully!"
echo "To push backend changes:"
echo "  cd backend-repo"
echo "  git add ."
echo "  git commit -m 'Your message'"
echo "  git push origin main"

