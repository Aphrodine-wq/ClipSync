# Environment Variables Reference

Complete list of environment variables for ClipSync.

## Backend Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clipsync

# JWT Authentication
JWT_SECRET=your-32-character-secret-key

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
MASTER_ENCRYPTION_KEY=your-32-character-master-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Optional

```env
# Redis (Caching)
REDIS_URL=redis://localhost:6379

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_TEAM=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# OAuth (Google)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info|debug|warn|error

# Server
PORT=3001
NODE_ENV=development|production

# File Storage
STORAGE_TYPE=local|s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=...

# Email (Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=noreply@clipsync.com
```

## Frontend Environment Variables

```env
# API URL
VITE_API_URL=http://localhost:3001/api

# OAuth
VITE_GOOGLE_CLIENT_ID=...

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=false
```

## Desktop App Environment Variables

```env
# API URL
ELECTRON_API_URL=http://localhost:3001

# Auto-updates
ELECTRON_AUTO_UPDATE_URL=https://updates.clipsync.com
```

## Mobile App Environment Variables

```env
# API URL
CLIPSYNC_API_URL=http://localhost:3001
```

## CLI Environment Variables

```env
# API URL
CLIPSYNC_API_URL=http://localhost:3001/api
```

## Generating Secure Keys

```bash
# JWT Secret (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# API Key Prefix (for database)
node -e "console.log(require('crypto').randomBytes(5).toString('hex'))"
```

## Production Checklist

- [ ] All secrets are randomly generated
- [ ] No default/example values in production
- [ ] Database credentials are secure
- [ ] HTTPS enabled (FRONTEND_URL uses https)
- [ ] Webhook secrets configured
- [ ] Stripe keys are production keys (not test)
- [ ] File storage configured (S3 for production)
- [ ] Email service configured
- [ ] Monitoring enabled
- [ ] Log level set to 'info' or 'warn'

---

**Never commit `.env` files to version control!**

