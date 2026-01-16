#!/bin/bash

# ClipSync Production Deployment Script
# This script deploys ClipSync to production using Docker

set -e

echo "🚀 Deploying ClipSync to production..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with all required environment variables.${NC}"
    echo -e "${BLUE}You can use .env.production.example as a template.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production build

echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down

echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

echo -e "${BLUE}📊 Checking service status...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "  View logs: ${GREEN}docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f${NC}"
echo -e "  Stop services: ${GREEN}docker-compose -f docker-compose.prod.yml --env-file .env.production down${NC}"
echo -e "  Restart services: ${GREEN}docker-compose -f docker-compose.prod.yml --env-file .env.production restart${NC}"

