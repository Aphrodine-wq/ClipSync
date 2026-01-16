# ClipSync Quick Reference

## 🚀 Quick Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm run db:migrate      # Run migrations
npm start               # Start server
npm run dev             # Development mode
```

### Frontend
```bash
cd clipsync-app
npm install              # Install dependencies
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

### Desktop
```bash
cd clipsync-desktop
npm install              # Install dependencies
npm start                # Start Electron app
npm run build            # Build for all platforms
```

### Mobile
```bash
cd clipsync-mobile
npm install              # Install dependencies
npm run ios              # Run on iOS
npm run android          # Run on Android
```

### CLI
```bash
cd clipsync-cli
npm install              # Install dependencies
npm link                 # Link globally
clipsync login           # Authenticate
clipsync list            # List clips
```

---

## 🔑 Key Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=...
ENCRYPTION_KEY=...
FRONTEND_URL=http://localhost:5173

# Optional
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📝 Common Tasks

### Add a new API endpoint
1. Create route in `backend/routes/`
2. Add middleware if needed
3. Implement business logic in `backend/services/`
4. Add to `backend/server.js`
5. Test endpoint

### Add a new React component
1. Create component in `clipsync-app/src/components/`
2. Add styles if needed
3. Export from index if reusable
4. Use in parent component

### Run migrations
```bash
cd backend
npm run db:migrate
```

### Run tests
```bash
npm test                 # All tests
npm run test:unit        # Unit only
npm run test:integration # Integration only
npm run test:e2e         # E2E only
```

---

## 🔍 Useful URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

---

## 📚 Documentation Links

- [Getting Started](GETTING-STARTED.md)
- [API Reference](api/PUBLIC-API.md)
- [Architecture](SYSTEM-OVERVIEW.md)
- [Features](FEATURES-COMPLETE.md)

---

## 🐛 Common Issues

### Database Connection
```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **API Docs**: `docs/api/PUBLIC-API.md`

