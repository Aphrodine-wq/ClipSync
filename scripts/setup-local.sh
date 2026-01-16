#!/bin/bash

# ClipSync Local Development Setup Script
# This script sets up the local development environment

set -e

echo "🚀 Setting up ClipSync for local development..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Setting up environment variables...${NC}"

# Backend .env
if [ ! -f backend/.env ]; then
    echo -e "${GREEN}Creating backend/.env from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your actual values (especially JWT_SECRET and GOOGLE_CLIENT_ID)${NC}"
else
    echo -e "${BLUE}backend/.env already exists, skipping...${NC}"
fi

# Frontend .env
if [ ! -f clipsync-app/.env ]; then
    echo -e "${GREEN}Creating clipsync-app/.env from .env.example...${NC}"
    cp clipsync-app/.env.example clipsync-app/.env
    echo -e "${YELLOW}⚠️  Please update clipsync-app/.env with your actual values (especially VITE_GOOGLE_CLIENT_ID)${NC}"
else
    echo -e "${BLUE}clipsync-app/.env already exists, skipping...${NC}"
fi

echo -e "${BLUE}🐳 Step 2: Starting Docker services (PostgreSQL & Redis)...${NC}"
cd "$(dirname "$0")/.."
docker-compose -f docker-compose.local.yml up -d

echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5

echo -e "${BLUE}📦 Step 3: Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${BLUE}node_modules already exists, skipping npm install...${NC}"
fi

echo -e "${BLUE}🗄️  Step 4: Running database migrations...${NC}"
npm run db:migrate || echo -e "${YELLOW}⚠️  Migration may have failed or already run. Check the output above.${NC}"

cd ..

echo -e "${BLUE}📦 Step 5: Installing frontend dependencies...${NC}"
cd clipsync-app
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${BLUE}node_modules already exists, skipping npm install...${NC}"
fi

cd ..

echo -e "${GREEN}✅ Local development environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "  1. Update backend/.env with your JWT_SECRET and GOOGLE_CLIENT_ID"
echo -e "  2. Update clipsync-app/.env with your VITE_GOOGLE_CLIENT_ID"
echo -e "  3. Start the backend: ${GREEN}cd backend && npm run dev${NC}"
echo -e "  4. Start the frontend: ${GREEN}cd clipsync-app && npm run dev${NC}"
echo ""
echo -e "${BLUE}🐳 Docker services are running:${NC}"
echo -e "  - PostgreSQL: localhost:5432"
echo -e "  - Redis: localhost:6379"
echo ""
echo -e "${BLUE}To stop Docker services:${NC}"
echo -e "  ${GREEN}docker-compose -f docker-compose.local.yml down${NC}"

