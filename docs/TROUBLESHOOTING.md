# Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### Database Connection Failed
**Symptoms**: `Error: connect ECONNREFUSED`

**Solutions**:
```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Port Already in Use
**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Linux/Mac: Find and kill
lsof -ti:3001 | xargs kill -9
```

#### JWT Secret Missing
**Symptoms**: `JWT_SECRET is required in production`

**Solutions**:
```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=your-generated-secret
```

### Frontend Issues

#### Module Not Found
**Symptoms**: `Cannot find module 'xxx'`

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### Build Fails
**Symptoms**: Build errors or warnings

**Solutions**:
```bash
# Check Node.js version (should be 18+)
node --version

# Clear build cache
rm -rf dist .vite

# Try building again
npm run build
```

### Sync Issues

#### Clips Not Syncing
**Symptoms**: Clips appear on one device but not others

**Solutions**:
1. Check WebSocket connection status
2. Verify authentication on all devices
3. Check network connectivity
4. Try logging out and back in
5. Force sync: `clipsync sync` (CLI)

#### WebSocket Connection Failed
**Symptoms**: Real-time sync not working

**Solutions**:
```javascript
// Check WebSocket URL in frontend
const wsUrl = process.env.VITE_WS_URL || 'http://localhost:3001';

// Verify Socket.IO connection
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### Desktop App Issues

#### Clipboard Access Denied
**Symptoms**: Cannot access clipboard

**Solutions**:
- **Windows**: Run as administrator or grant permissions
- **Mac**: Grant clipboard access in System Preferences → Security & Privacy
- **Linux**: Check permissions in desktop environment settings

#### Hotkeys Not Working
**Symptoms**: Keyboard shortcuts not responding

**Solutions**:
1. Check for conflicts with other applications
2. Verify hotkey permissions in system settings
3. Restart the application
4. Check hotkey configuration in settings

### Mobile App Issues

#### Clipboard Not Accessible (iOS)
**Symptoms**: Cannot read clipboard on iOS

**Solutions**:
- iOS restricts clipboard access - extension or share sheet required
- Use the share extension instead
- Enable clipboard access in Settings → Privacy → Clipboard

#### Sync Not Working (Android)
**Symptoms**: Android app not syncing

**Solutions**:
1. Check background data restrictions
2. Verify battery optimization settings
3. Check internet connectivity
4. Reinstall the app

### Browser Extension Issues

#### Clipboard Not Capturing
**Symptoms**: Extension not capturing clipboard changes

**Solutions**:
1. Grant clipboard permissions in extension settings
2. Check if extension is enabled
3. Verify content script is loaded
4. Check browser console for errors

#### Popup Not Opening
**Symptoms**: Extension popup not showing

**Solutions**:
1. Check extension is installed correctly
2. Verify manifest permissions
3. Clear browser cache
4. Reinstall extension

### Payment Issues

#### Stripe Webhook Not Working
**Symptoms**: Payment processed but subscription not updated

**Solutions**:
```bash
# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Check webhook endpoint
# Should be: https://your-domain.com/api/stripe/webhook

# Test webhook
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Performance Issues

#### Slow API Responses
**Symptoms**: API taking too long to respond

**Solutions**:
1. Check database query performance
2. Verify indexes are created
3. Check Redis caching
4. Monitor server resources
5. Optimize database queries

#### High Memory Usage
**Symptoms**: Application using too much memory

**Solutions**:
1. Limit cache size
2. Optimize image processing
3. Check for memory leaks
4. Increase server resources

---

## Debug Mode

### Enable Debug Logging

**Backend**:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

**Frontend**:
```javascript
localStorage.setItem('debug', 'clipsync:*');
```

### Common Debug Commands

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Check Redis connection
redis-cli ping

# Test API endpoint
curl http://localhost:3001/health

# Check WebSocket
wscat -c ws://localhost:3001
```

---

## Getting Help

1. Check this troubleshooting guide
2. Review [Documentation](INDEX.md)
3. Check [GitHub Issues](https://github.com/yourusername/clipsync/issues)
4. Contact support: support@clipsync.com

---

**Last Updated**: January 2026

