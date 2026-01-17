# ClipSync Deployment Guide

Guide for deploying ClipSync to production.

## 🚀 Deployment Options

### Recommended Stack

- **Backend:** Railway, Render, or Fly.io
- **Database:** Railway PostgreSQL, Supabase, or AWS RDS
- **Frontend:** Vercel, Netlify, or Cloudflare Pages
- **Redis (optional):** Upstash or AWS ElastiCache

---

## 📦 Backend Deployment

### Option 1: Railway (Recommended)

Railway provides easy deployment with PostgreSQL included.

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login to Railway

```bash
railway login
```

#### 3. Initialize Project

```bash
cd backend
railway init
```

#### 4. Add PostgreSQL

```bash
railway add postgresql
```

#### 5. Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-production-jwt-secret
railway variables set GOOGLE_CLIENT_ID=your-google-client-id
railway variables set GOOGLE_CLIENT_SECRET=your-google-client-secret
railway variables set FRONTEND_URL=https://your-frontend-domain.com
```

#### 6. Deploy

```bash
railway up
```

#### 7. Run Migrations

```bash
railway run npm run db:migrate
```

Your backend will be available at: `https://your-app.railway.app`

---

### Option 2: Render

#### 1. Create New Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** clipsync-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`

#### 2. Add PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name it `clipsync-db`
3. Copy the Internal Database URL

#### 3. Set Environment Variables

Add in Render dashboard:

```env
NODE_ENV=production
DATABASE_URL=<internal-database-url>
JWT_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3001
```

#### 4. Deploy

Render will automatically deploy on git push.

#### 5. Run Migrations

Use Render Shell:

```bash
npm run db:migrate
```

---

### Option 3: Fly.io

#### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Login

```bash
fly auth login
```

#### 3. Launch App

```bash
cd backend
fly launch
```

#### 4. Create PostgreSQL

```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

#### 5. Set Secrets

```bash
fly secrets set JWT_SECRET=your-secret
fly secrets set GOOGLE_CLIENT_ID=your-client-id
fly secrets set GOOGLE_CLIENT_SECRET=your-client-secret
fly secrets set FRONTEND_URL=https://your-frontend.vercel.app
```

#### 6. Deploy

```bash
fly deploy
```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd clipsync-app
vercel
```

#### 3. Set Environment Variables

In Vercel dashboard or CLI:

```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app/api

vercel env add VITE_WS_URL production
# Enter: https://your-backend.railway.app

vercel env add VITE_GOOGLE_CLIENT_ID production
# Enter: your-google-client-id
```

#### 4. Redeploy

```bash
vercel --prod
```

Your frontend will be available at: `https://your-app.vercel.app`

---

### Option 2: Netlify

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Initialize

```bash
cd clipsync-app
netlify init
```

#### 4. Set Environment Variables

```bash
netlify env:set VITE_API_URL https://your-backend.railway.app/api
netlify env:set VITE_WS_URL https://your-backend.railway.app
netlify env:set VITE_GOOGLE_CLIENT_ID your-google-client-id
```

#### 5. Deploy

```bash
netlify deploy --prod
```

---

### Option 3: Cloudflare Pages

#### 1. Build the App

```bash
cd clipsync-app
npm run build
```

#### 2. Deploy via Dashboard

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `clipsync-app`

#### 3. Set Environment Variables

Add in Cloudflare dashboard:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_WS_URL=https://your-backend.railway.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🔐 Google OAuth Production Setup

### 1. Update OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Change to **External** (for public use)
5. Fill in required information:
   - App name: ClipSync
   - User support email
   - Developer contact email
6. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
7. Save and continue

### 2. Update Authorized Redirect URIs

1. Go to **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add production URIs:
   - `https://your-domain.com`
   - `https://your-domain.com/auth/callback`
4. Save

### 3. Update Environment Variables

Update both backend and frontend with production Google Client ID.

---

## 🗄️ Database Management

### Backup Strategy

#### Automated Backups (Railway)

Railway automatically backs up PostgreSQL daily.

#### Manual Backup

```bash
# Export database
pg_dump -h <host> -U <user> -d clipsync > backup.sql

# Restore database
psql -h <host> -U <user> -d clipsync < backup.sql
```

### Migrations

Always run migrations after deploying backend changes:

```bash
# Railway
railway run npm run db:migrate

# Render
# Use Render Shell

# Fly.io
fly ssh console
npm run db:migrate
```

---

## 📊 Monitoring & Logging

### Application Monitoring

**Recommended Tools:**
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://www.datadoghq.com) - Full-stack monitoring

### Setup Sentry

#### Backend

```bash
npm install @sentry/node
```

```javascript
// backend/server.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Frontend

```bash
npm install @sentry/react
```

```javascript
// clipsync-app/src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

## 🔒 Security Checklist

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure security headers (Helmet)
- [ ] Use prepared statements (prevent SQL injection)
- [ ] Validate all user inputs
- [ ] Keep dependencies updated
- [ ] Set up monitoring and alerts
- [ ] Enable 2FA for deployment accounts

---

## ⚡ Performance Optimization

### Backend

1. **Enable Compression**
   - Already configured with `compression` middleware

2. **Database Indexing**
   - Indexes already created in schema

3. **Caching with Redis**

```bash
# Add Redis to Railway
railway add redis

# Update backend
npm install redis
```

```javascript
// backend/config/redis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

await client.connect();
export default client;
```

### Frontend

1. **Code Splitting**

```javascript
// Use React.lazy for route-based splitting
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
```

2. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Use CDN for static assets

3. **Bundle Analysis**

```bash
npm run build -- --analyze
```

---

## 🌍 CDN Setup

### Cloudflare CDN

1. Add your domain to Cloudflare
2. Update DNS records
3. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - Caching

---

## 📈 Scaling

### Horizontal Scaling

**Backend:**
- Use load balancer (Railway/Render provide this)
- Enable sticky sessions for WebSocket
- Use Redis for session storage

**Database:**
- Enable read replicas
- Use connection pooling
- Consider sharding for large datasets

### Vertical Scaling

Upgrade instance sizes as needed:
- Railway: Upgrade plan
- Render: Increase instance size
- Fly.io: Scale machine resources

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 Troubleshooting Production Issues

### Database Connection Errors

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### WebSocket Connection Issues

- Ensure WebSocket is enabled on hosting platform
- Check CORS configuration
- Verify SSL/TLS certificates

### High Memory Usage

- Enable Node.js memory limits
- Optimize database queries
- Implement caching
- Use pagination for large datasets

---

## 📞 Support

For deployment issues:
- Check platform status pages
- Review deployment logs
- Contact platform support
- Open GitHub issue

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible
- [ ] Frontend is accessible
- [ ] Database migrations ran successfully
- [ ] Google OAuth works
- [ ] WebSocket connections work
- [ ] Clips sync across devices
- [ ] Team features work
- [ ] Share links work
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] SSL certificates are valid
- [ ] Custom domain is configured
- [ ] Error tracking is working

---

🎉 **Congratulations!** ClipSync is now live in production!
