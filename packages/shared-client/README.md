# @clipsync/shared-client

Shared API and WebSocket client for ClipSync applications.

## Installation

This package is part of the ClipSync monorepo and is automatically linked via npm workspaces.

## Usage

### API Client

```javascript
import { ApiClient } from '@clipsync/shared-client';

const apiClient = new ApiClient({
  baseURL: 'http://localhost:3001/api',
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  onTokenExpired: async () => {
    // Handle token refresh
    return false;
  },
});

// Use HTTP methods
const clips = await apiClient.get('/clips');
const newClip = await apiClient.post('/clips', { content: 'Hello' });
```

### Socket Client

```javascript
import { SocketClient } from '@clipsync/shared-client';

const socketClient = new SocketClient({
  url: 'http://localhost:3001',
  getToken: () => localStorage.getItem('token'),
  getDeviceInfo: () => ({
    deviceName: 'My Device',
    deviceType: 'browser',
  }),
});

// Connect
socketClient.connect();

// Listen to events
socketClient.on('clip:created', (clip) => {
  console.log('New clip:', clip);
});

// Emit events
socketClient.notifyClipCreated({ id: '123', content: 'Hello' });
```

## API

See source files for detailed API documentation:
- `src/api.js` - API Client
- `src/socket.js` - Socket.IO Client
