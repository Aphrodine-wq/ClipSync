#!/bin/bash

# Script to create .env files from templates
# Run this if .env.example files are not being created automatically

set -e

echo "📝 Creating environment variable files..."

# Backend .env.example
if [ ! -f backend/.env.example ]; then
    cat > backend/.env.example << 'EOF'
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
EOF
    echo "✅ Created backend/.env.example"
else
    echo "⚠️  backend/.env.example already exists, skipping..."
fi

# Frontend .env.example
if [ ! -f clipsync-app/.env.example ]; then
    cat > clipsync-app/.env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Google OAuth Configuration (for frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF
    echo "✅ Created clipsync-app/.env.example"
else
    echo "⚠️  clipsync-app/.env.example already exists, skipping..."
fi

# Production .env.production.example
if [ ! -f .env.production.example ]; then
    cat > .env.production.example << 'EOF'
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
EOF
    echo "✅ Created .env.production.example"
else
    echo "⚠️  .env.production.example already exists, skipping..."
fi

echo ""
echo "✅ Environment file templates created!"
echo ""
echo "Next steps:"
echo "  1. Copy backend/.env.example to backend/.env and update values"
echo "  2. Copy clipsync-app/.env.example to clipsync-app/.env and update values"
echo "  3. For production, copy .env.production.example to .env.production and update values"

