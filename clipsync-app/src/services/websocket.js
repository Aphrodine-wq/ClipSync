// WebSocket client for real-time sync

import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token, deviceInfo = {}) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const deviceName = deviceInfo.deviceName || this.getDeviceName();
    const deviceType = deviceInfo.deviceType || 'browser';

    this.socket = io(WS_URL, {
      auth: {
        token,
        deviceName,
        deviceType,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connected = true;
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.connected = false;
      this.emit('connection-status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection-error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
      this.emit('reconnecting', { attemptNumber });
    });

    // Clip sync events
    this.socket.on('clip:created', (clip) => {
      this.emit('clip:created', clip);
    });

    this.socket.on('clip:updated', (clip) => {
      this.emit('clip:updated', clip);
    });

    this.socket.on('clip:deleted', (clipId) => {
      this.emit('clip:deleted', clipId);
    });

    // Team clip sync events
    this.socket.on('team-clip:created', ({ teamId, clip }) => {
      this.emit('team-clip:created', { teamId, clip });
    });

    this.socket.on('team-clip:updated', ({ teamId, clip }) => {
      this.emit('team-clip:updated', { teamId, clip });
    });

    this.socket.on('team-clip:deleted', ({ teamId, clipId }) => {
      this.emit('team-clip:deleted', { teamId, clipId });
    });

    // Team typing indicator
    this.socket.on('team:typing', ({ userId, userName, isTyping }) => {
      this.emit('team:typing', { userId, userName, isTyping });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  // Join team rooms
  joinTeams(teamIds) {
    if (this.socket?.connected) {
      this.socket.emit('join-teams', teamIds);
    }
  }

  // Emit clip events
  notifyClipCreated(clip) {
    if (this.socket?.connected) {
      this.socket.emit('clip:created', clip);
    }
  }

  notifyClipUpdated(clip) {
    if (this.socket?.connected) {
      this.socket.emit('clip:updated', clip);
    }
  }

  notifyClipDeleted(clipId) {
    if (this.socket?.connected) {
      this.socket.emit('clip:deleted', clipId);
    }
  }

  // Emit team clip events
  notifyTeamClipCreated(teamId, clip) {
    if (this.socket?.connected) {
      this.socket.emit('team-clip:created', { teamId, clip });
    }
  }

  notifyTeamClipUpdated(teamId, clip) {
    if (this.socket?.connected) {
      this.socket.emit('team-clip:updated', { teamId, clip });
    }
  }

  notifyTeamClipDeleted(teamId, clipId) {
    if (this.socket?.connected) {
      this.socket.emit('team-clip:deleted', { teamId, clipId });
    }
  }

  // Typing indicator
  notifyTyping(teamId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('team:typing', { teamId, isTyping });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Helper to get device name
  getDeviceName() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    
    return 'Web Browser';
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
