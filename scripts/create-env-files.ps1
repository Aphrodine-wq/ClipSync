# Script to create .env files from .env.example templates
# Run this if .env.example files are not being created automatically

$ErrorActionPreference = "Stop"

Write-Host "Creating environment variable files..." -ForegroundColor Cyan

# Backend .env.example
$backendEnvExample = @'
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clipsync
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
'@

# Frontend .env.example
$frontendEnvExample = @'
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Google OAuth Configuration (for frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
'@

# Production .env.production.example
$prodEnvExample = @'
# Production Environment Variables
# Copy this file to .env.production and fill in your actual values

# Server Configuration
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
BACKEND_PORT=3001
FRONTEND_PORT=80

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=clipsync
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD

# Redis Configuration (optional)
REDIS_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_A_VERY_SECURE_RANDOM_STRING
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Frontend Environment Variables (used during build)
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
'@

# Create backend .env.example
$backendPath = Join-Path "backend" ".env.example"
if (-not (Test-Path $backendPath)) {
    $backendEnvExample | Out-File -FilePath $backendPath -Encoding utf8
    Write-Host "Created backend\.env.example" -ForegroundColor Green
} else {
    Write-Host "backend\.env.example already exists, skipping..." -ForegroundColor Yellow
}

# Create frontend .env.example
$frontendPath = Join-Path "clipsync-app" ".env.example"
if (-not (Test-Path $frontendPath)) {
    $frontendEnvExample | Out-File -FilePath $frontendPath -Encoding utf8
    Write-Host "Created clipsync-app\.env.example" -ForegroundColor Green
} else {
    Write-Host "clipsync-app\.env.example already exists, skipping..." -ForegroundColor Yellow
}

# Create production .env.production.example
if (-not (Test-Path ".env.production.example")) {
    $prodEnvExample | Out-File -FilePath ".env.production.example" -Encoding utf8
    Write-Host "Created .env.production.example" -ForegroundColor Green
} else {
    Write-Host ".env.production.example already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Environment file templates created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "  1. Copy backend\.env.example to backend\.env and update values"
Write-Host "  2. Copy clipsync-app\.env.example to clipsync-app\.env and update values"
Write-Host "  3. For production, copy .env.production.example to .env.production and update values"

