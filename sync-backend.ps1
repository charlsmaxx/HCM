# Script to sync backend files to backend-repo for pushing to GitHub
# Usage: .\sync-backend.ps1

Write-Host "Syncing backend files to backend-repo..." -ForegroundColor Green

# Copy backend files to backend-repo
Copy-Item -Path "server" -Destination "backend-repo\server" -Recurse -Force
Copy-Item -Path "package.json" -Destination "backend-repo\package.json" -Force
Copy-Item -Path "env.example" -Destination "backend-repo\env.example" -Force -ErrorAction SilentlyContinue

# Copy README if it exists in backend-repo structure
if (Test-Path "backend-repo\README.md") {
    Write-Host "README.md already exists in backend-repo" -ForegroundColor Yellow
}

Write-Host "Backend files synced successfully!" -ForegroundColor Green
Write-Host "To push backend changes:" -ForegroundColor Cyan
Write-Host "  cd backend-repo" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor Cyan
Write-Host "  git commit -m 'Your message'" -ForegroundColor Cyan
Write-Host "  git push origin main" -ForegroundColor Cyan

