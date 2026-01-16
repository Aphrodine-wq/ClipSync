# ClipSync Local Development Setup Script (PowerShell)
# This script sets up the local development environment on Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up ClipSync for local development..." -ForegroundColor Cyan

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker is not installed. Please install Docker Desktop first." -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
if (-not (docker compose version 2>$null) -and -not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Node.js is not installed. Please install Node.js first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Step 1: Setting up environment variables..." -ForegroundColor Blue

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env from .env.example..." -ForegroundColor Green
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please update backend\.env with your actual values (especially JWT_SECRET and GOOGLE_CLIENT_ID)" -ForegroundColor Yellow
} else {
    Write-Host "backend\.env already exists, skipping..." -ForegroundColor Blue
}

# Frontend .env
if (-not (Test-Path "clipsync-app\.env")) {
    Write-Host "Creating clipsync-app\.env from .env.example..." -ForegroundColor Green
    Copy-Item "clipsync-app\.env.example" "clipsync-app\.env"
    Write-Host "⚠️  Please update clipsync-app\.env with your actual values (especially VITE_GOOGLE_CLIENT_ID)" -ForegroundColor Yellow
} else {
    Write-Host "clipsync-app\.env already exists, skipping..." -ForegroundColor Blue
}

Write-Host "🐳 Step 2: Starting Docker services (PostgreSQL & Redis)..." -ForegroundColor Blue
docker-compose -f docker-compose.local.yml up -d

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 5

Write-Host "📦 Step 3: Installing backend dependencies..." -ForegroundColor Blue
Push-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "node_modules already exists, skipping npm install..." -ForegroundColor Blue
}

Write-Host "🗄️  Step 4: Running database migrations..." -ForegroundColor Blue
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration may have failed or already run. Check the output above." -ForegroundColor Yellow
}

Pop-Location

Write-Host "📦 Step 5: Installing frontend dependencies..." -ForegroundColor Blue
Push-Location clipsync-app
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "node_modules already exists, skipping npm install..." -ForegroundColor Blue
}
Pop-Location

Write-Host "✅ Local development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "  1. Update backend\.env with your JWT_SECRET and GOOGLE_CLIENT_ID"
Write-Host "  2. Update clipsync-app\.env with your VITE_GOOGLE_CLIENT_ID"
Write-Host "  3. Start the backend: cd backend; npm run dev"
Write-Host "  4. Start the frontend: cd clipsync-app; npm run dev"
Write-Host ""
Write-Host "🐳 Docker services are running:" -ForegroundColor Blue
Write-Host "  - PostgreSQL: localhost:5432"
Write-Host "  - Redis: localhost:6379"
Write-Host ""
Write-Host "To stop Docker services:" -ForegroundColor Blue
Write-Host "  docker-compose -f docker-compose.local.yml down"

