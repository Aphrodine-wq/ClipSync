// WebSocket client adapter for ClipSync web app
// Uses shared client with browser-specific device detection

import { SocketClient } from '@clipsync/shared-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// Create WebSocket client instance with browser-specific adapters
const wsClient = new SocketClient({
  url: WS_URL,
  getToken: () => {
    return localStorage.getItem('clipsync_token');
  },
  getDeviceInfo: () => {
    const ua = navigator.userAgent;
    let deviceName = 'Web Browser';
    
    if (ua.includes('Chrome')) deviceName = 'Chrome Browser';
    else if (ua.includes('Firefox')) deviceName = 'Firefox Browser';
    else if (ua.includes('Safari')) deviceName = 'Safari Browser';
    else if (ua.includes('Edge')) deviceName = 'Edge Browser';
    
    return {
      deviceName,
      deviceType: 'browser',
    };
  },
});

// Wrap connect method to handle token parameter (backward compatibility)
const originalConnect = wsClient.connect.bind(wsClient);
wsClient.connect = (token, deviceInfo = {}) => {
  // If token is provided, update localStorage
  if (token) {
    localStorage.setItem('clipsync_token', token);
  }
  
  // Call original connect with device info
  originalConnect(deviceInfo);
};

export default wsClient;
