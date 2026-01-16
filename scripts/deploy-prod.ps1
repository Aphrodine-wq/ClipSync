# ClipSync Production Deployment Script (PowerShell)
# This script deploys ClipSync to production using Docker

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying ClipSync to production..." -ForegroundColor Cyan

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with all required environment variables." -ForegroundColor Yellow
    Write-Host "You can use .env.production.example as a template." -ForegroundColor Blue
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (docker compose version 2>$null) -and -not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building Docker images..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml --env-file .env.production build

Write-Host "🛑 Stopping existing containers..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml --env-file .env.production down

Write-Host "🚀 Starting services..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Blue
Start-Sleep -Seconds 10

Write-Host "📊 Checking service status..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Blue
Write-Host "  View logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"
Write-Host "  Stop services: docker-compose -f docker-compose.prod.yml --env-file .env.production down"
Write-Host "  Restart services: docker-compose -f docker-compose.prod.yml --env-file .env.production restart"

