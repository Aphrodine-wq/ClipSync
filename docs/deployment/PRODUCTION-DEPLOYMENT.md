# Production Deployment Guide

This guide covers deploying ClipSync to a production environment using Docker.

## Prerequisites

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Domain name** with DNS configured
- **SSL certificate** (Let's Encrypt recommended)
- **Google OAuth** credentials configured for production domain

## Quick Deployment

### 1. Configure Environment Variables

1. Copy the production environment template:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` and fill in all values:
   - Generate secure passwords for database and Redis
   - Set strong JWT secret (use a random string generator)
   - Configure your domain URLs
   - Add Google OAuth client ID

### 2. Deploy

#### Using the deployment script:

```bash
# Linux/macOS
chmod +x scripts/deploy-prod.sh
./scripts/deploy-prod.sh

# Windows (PowerShell)
.\scripts\deploy-prod.ps1
```

#### Manual deployment:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Architecture

The production setup includes:

```
┌─────────────┐
│   Nginx     │  Port 80/443 (Frontend)
│  (Frontend) │
└─────────────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│   Backend   │   │  PostgreSQL │
│  (Node.js)  │   │  (Database) │
└─────────────┘   └─────────────┘
       │
┌──────▼──────┐
│    Redis    │
│   (Cache)   │
└─────────────┘
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend domain | `https://clipsync.com` |
| `DB_PASSWORD` | PostgreSQL password | `secure-password-123` |
| `JWT_SECRET` | JWT signing secret | `random-secure-string` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `VITE_API_URL` | Backend API URL | `https://api.clipsync.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (frontend) | `xxx.apps.googleusercontent.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_PORT` | Backend port | `3001` |
| `FRONTEND_PORT` | Frontend port | `80` |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |

## SSL/TLS Setup

### Option 1: Nginx Reverse Proxy (Recommended)

Use Nginx as a reverse proxy with Let's Encrypt:

```nginx
# /etc/nginx/sites-available/clipsync
server {
    listen 80;
    server_name clipsync.com www.clipsync.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name clipsync.com www.clipsync.com;
    
    ssl_certificate /etc/letsencrypt/live/clipsync.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clipsync.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Docker with SSL

Modify `docker-compose.prod.yml` to include SSL certificates as volumes.

## Database Management

### Backup Database

```bash
docker exec clipsync-postgres-prod pg_dump -U postgres clipsync > backup.sql
```

### Restore Database

```bash
docker exec -i clipsync-postgres-prod psql -U postgres clipsync < backup.sql
```

### Run Migrations

```bash
docker exec clipsync-backend-prod npm run db:migrate
```

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
```

### Health Checks

All services include health checks. Check status:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

### Resource Usage

```bash
docker stats
```

## Updates and Maintenance

### Update Application

1. Pull latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

### Rollback

1. Checkout previous version:
   ```bash
   git checkout <previous-commit>
   ```

2. Rebuild and restart:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

## Security Best Practices

1. **Environment Variables**: Never commit `.env.production` to git
2. **Passwords**: Use strong, unique passwords for all services
3. **JWT Secret**: Generate a cryptographically secure random string
4. **Firewall**: Only expose necessary ports (80, 443)
5. **Updates**: Keep Docker images and dependencies updated
6. **Backups**: Regular database backups
7. **SSL**: Always use HTTPS in production
8. **Rate Limiting**: Already configured in backend
9. **CORS**: Configured for your domain only

## Scaling

### Horizontal Scaling

For high traffic, you can scale services:

```bash
# Scale backend
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --scale backend=3

# Use a load balancer (Nginx, Traefik, etc.) in front
```

### Database Scaling

For production, consider:
- Managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Connection pooling
- Read replicas for read-heavy workloads

## Troubleshooting

### Services Won't Start

1. Check logs:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production logs
   ```

2. Verify environment variables:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production config
   ```

3. Check disk space:
   ```bash
   df -h
   ```

### Database Connection Issues

1. Verify database is healthy:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production logs postgres
   ```

### Frontend Not Loading

1. Check frontend container:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production logs frontend
   ```

2. Verify build succeeded:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production build frontend
   ```

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] Google OAuth configured for production domain
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Rate limiting tested
- [ ] CORS configured correctly
- [ ] Security headers verified
- [ ] Performance tested

## Support

For issues or questions:
- Check logs first
- Review [LOCAL-SETUP.md](./LOCAL-SETUP.md) for development setup
- Review [TESTING.md](./TESTING.md) for testing procedures

