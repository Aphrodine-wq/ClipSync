# ClipSync iOS Setup Guide (Windows → Expo Go)

This guide walks you through setting up ClipSync to run on your iPhone using **Expo Go**, a managed workflow that doesn't require macOS or Xcode.

## Prerequisites

- **Windows PC** (the one you're developing on)
- **iPhone or iPad** with Expo Go installed from the App Store
- **Node.js 18+** (verify with `node --version`)
- **npm** (comes with Node.js)
- **Same Wi-Fi network** connecting both your PC and iPhone
- **Backend server** running on your Windows PC

## Step 1: Find Your Computer's IP Address

Your iPhone needs to reach the backend API running on your Windows PC. To do this, use your PC's **local IP address** (not `localhost`).

### On Windows:

1. Open **Command Prompt** (press `Win + R`, type `cmd`, press Enter)
2. Type: `ipconfig`
3. Look for your **Wi-Fi adapter** section
4. Find **IPv4 Address** (e.g., `192.168.1.100` or `10.0.0.5`)
5. **Copy this IP address** - you'll need it in the next step

### Alternative using PowerShell:
```powershell
(Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null}).IPv4Address.IPAddress
```

## Step 2: Configure Environment Variables

The `.env` file has been created for you at `clipsync-mobile/.env`

**Edit it and update the API_URL:**

```bash
# Replace 192.168.1.100 with your actual IP from Step 1
API_URL=http://192.168.1.100:3001
```

### Important Notes:
- **Do NOT use `localhost`** - your iPhone won't be able to reach it
- **Use your actual local IP address** from `ipconfig`
- **The port must be 3001** (backend default port)
- **Format:** `http://IP:PORT` (no trailing slash)

## Step 3: Start the Backend Server

The backend API must be running for the app to connect:

```bash
# Open a new Command Prompt/PowerShell window
cd backend
npm install          # Only needed if you haven't done this yet
npm run dev          # Starts backend on port 3001
```

**Wait for the message:** `✅ Server running on http://localhost:3001`

This confirms the backend is ready.

## Step 4: Start the Expo Dev Server

In a different Command Prompt/PowerShell window:

```bash
cd clipsync-mobile
npm start
# or to clear cache: npm run start:clear
```

**You should see something like:**
```
› Metro waiting on exp://192.168.1.100:19000
› Scan this QR code with Expo Go

  █████████████████
  █               █
  █  QR CODE HERE █
  █               █
  █████████████████
```

**Leave this running!** The QR code is how your iPhone connects.

## Step 5: Install Expo Go on Your iPhone

1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Tap **Install**
4. Wait for it to finish

## Step 6: Scan the QR Code

1. Open **Expo Go** on your iPhone
2. Tap the **QR code icon** at the bottom (scan button)
3. **Point your iPhone camera at the QR code** displayed in your terminal/Command Prompt
4. Tap the URL when it appears
5. **Wait for the app to build** - this may take 1-2 minutes on first run

### What to expect:
- Metro bundler compiles JavaScript on your PC
- App downloads the JavaScript bundle to your iPhone
- App starts and displays the login screen (or main screen if already logged in)

## Troubleshooting

### ❌ "Unable to connect to Metro bundler"

**Cause:** Your iPhone can't reach the Metro bundler running on your PC

**Solutions:**
1. Verify both devices are on the **same Wi-Fi network**
2. Check if your firewall is blocking ports 19000-19002:
   - Open **Windows Defender Firewall**
   - Click **Allow an app through firewall**
   - Make sure `node.exe` is allowed for both Private and Public networks
3. Try **tunnel mode** (slower but works through any network):
   ```bash
   npm run start:tunnel
   ```
   Then scan the new QR code

### ❌ "Network request failed" when app tries to load data

**Cause:** App can't reach the backend API at the configured IP address

**Solutions:**
1. **Verify backend is running:**
   ```bash
   # In backend directory
   npm run dev
   ```
2. **Check API_URL in `.env`:**
   - Verify it matches your computer IP from Step 1
   - **Not `localhost`** - must be your actual IP (e.g., `192.168.1.100`)
3. **Test connectivity:**
   - On your iPhone, open Safari
   - Navigate to: `http://192.168.1.100:3001/health`
   - Should show `{"status":"ok"}` or similar
   - If this fails, your network isn't allowing the connection

### ❌ "Unable to resolve module"

**Cause:** Metro bundler cache is stale

**Solution:**
```bash
npm run start:clear
```

Or manually:
```bash
npx expo start -c
```

### ⚪ White screen with no errors

**Cause:** JavaScript error during initialization

**Solutions:**
1. **Check Metro bundler output** - look for red errors
2. **Check iPhone console:**
   - On your iPhone in Expo Go, shake it and tap "View Logs"
3. **Check App.tsx initialization** - verify all services started

### 🔴 Red screen with error

**Cause:** Unhandled JavaScript error in app

**Solution:**
1. Read the error message carefully
2. Check Metro bundler terminal for the full stack trace
3. Fix the issue and Metro will hot-reload automatically

### 📡 Connection refused errors

**Cause:** iPhone can't reach backend or wrong IP address

**Solutions:**
1. Run `ipconfig` again and verify the IP address in `.env` matches
2. Ensure backend is running: `npm run dev` in backend directory
3. Test with tunnel mode: `npm run start:tunnel`

### 🌍 Tunnel mode is slow

**Cause:** Using Expo tunnel instead of local network

**Solution:**
- Switch back to local network if possible (both devices on same Wi-Fi)
- Or accept the slower speed for development

## Network Configuration Explained

### Local Network (Recommended)
```
iPhone ←→ (same Wi-Fi) ←→ Windows PC (192.168.1.100)
          Metro bundler (19000)
          Backend API (3001)
```

**Pros:** Fast, responsive
**Cons:** Both devices must be on same Wi-Fi

### Tunnel Mode
```
iPhone ←→ (internet) ←→ Expo tunnel service ←→ Windows PC
```

**Pros:** Works on any network
**Cons:** Slower, higher latency

## Common IP Address Formats

Different networks use different IP ranges:

- **192.168.x.x** - Most common home networks
- **10.0.0.x** - Common business networks
- **172.16.x.x to 172.31.x.x** - Some networks

Just use **whatever IP address** `ipconfig` shows for your Wi-Fi adapter.

## Testing the App

Once the app loads:

1. **Verify basic UI:**
   - You should see the login screen or main app interface
   - Tap buttons to ensure they respond

2. **Test navigation:**
   - If logged in, try navigating between screens
   - Swipe back should work (gesture handler enabled)
   - Animations should be smooth (Reanimated enabled)

3. **Check connectivity:**
   - If you have data, try using the app
   - Watch Metro bundler console for API requests
   - Should see `[API Client]` log messages

4. **Monitor logs:**
   - Keep your terminal window visible
   - Watch for any errors or warnings
   - These help diagnose issues

## Environment Variables

The `.env` file controls app behavior:

```bash
# Backend API server
API_URL=http://192.168.1.100:3001

# WebSocket connection timeout (milliseconds)
WEBSOCKET_TIMEOUT=5000

# Enable debug logging
DEBUG=clipsync:*
```

## Hot Reload

Metro bundler automatically reloads your app when you make code changes:

1. Edit a file in `src/`
2. Save the file (Ctrl+S)
3. Watch your iPhone - the app will reload automatically
4. No need to restart Expo Go!

## Performance Tips

1. **Hot reload is slower on first change** - takes a few seconds to recompile
2. **Clear Metro cache** if you experience issues: `npm run start:clear`
3. **Force reload on iPhone** - Shake phone, tap "Reload"
4. **Check network latency** - Slow network = slow app responses

## Building for Production (Later)

When ready to distribute on the App Store, you'll need a Mac with Xcode. For now, stick with Expo Go for development!

## Getting Help

If something isn't working:

1. **Check Metro bundler console** - Look for red errors
2. **View app logs** - Shake iPhone, tap "View Logs"
3. **Verify IP address** - Run `ipconfig` again
4. **Restart everything** - Kill Metro, kill backend, start fresh
5. **Check network** - Ensure iPhone and PC on same Wi-Fi

## Next Steps

- ✅ App runs on Expo Go
- ⏭️ Implement actual login screen
- ⏭️ Connect to backend services
- ⏭️ Build clipboard monitoring
- ⏭️ Test real-time sync

Happy developing! 🚀
