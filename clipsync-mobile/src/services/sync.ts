/**
 * Sync Service
 * Handles real-time synchronization with backend
 */

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useClipStore } from '../store/useClipStore';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// WebSocket server URL configuration
const WEBSOCKET_URL = process.env.API_URL || 'http://localhost:3001';
console.log('[Sync Service] Initializing WebSocket with URL:', WEBSOCKET_URL);

class SyncServiceClass {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  /**
   * Connect to sync server
   */
  async connect() {
    const { token, user } = useAuthStore.getState();

    if (!token || !user) {
      console.warn('Cannot connect: Not authenticated');
      return;
    }

    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    try {
      const deviceName = Platform.OS === 'web' ? 'Web Browser' : (Device.deviceName || 'Unknown Device');
      const deviceType = Platform.OS;

      console.log('[Sync] Attempting to connect...', {
        url: WEBSOCKET_URL,
        deviceName,
        deviceType,
      });

      this.socket = io(WEBSOCKET_URL, {
        auth: {
          token,
          deviceName,
          deviceType: `${deviceType}-mobile`,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('[Sync] Connection initialization failed:', error);
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Sync connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      const { setSyncStatus } = useClipStore.getState();
      setSyncStatus('synced');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Sync disconnected:', reason);
      this.isConnected = false;

      const { setSyncStatus } = useClipStore.getState();
      setSyncStatus('offline');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(
        '[Sync] Connection error (attempt ' + this.reconnectAttempts + '/' + this.maxReconnectAttempts + '):', error
      );

      // Helpful diagnostics for Expo Go
      if (error.message && error.message.includes('ECONNREFUSED')) {
        console.error(
          '[Sync] ⚠️  Cannot reach backend. Make sure:',
          '1) Backend is running (npm run dev in backend/)',
          '2) Use your computer IP address in .env, NOT localhost',
          '3) iPhone and computer are on same Wi-Fi'
        );
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        const { setSyncStatus } = useClipStore.getState();
        setSyncStatus('offline');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Sync reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    // Clip sync events
    this.socket.on('clip:created', (clip) => {
      const { addClip } = useClipStore.getState();
      addClip(clip.content, { ...clip, manual: false });
    });

    this.socket.on('clip:updated', (clip) => {
      const { updateClip } = useClipStore.getState();
      updateClip(clip.id, clip);
    });

    this.socket.on('clip:deleted', (clipId) => {
      const { deleteClip } = useClipStore.getState();
      deleteClip(clipId);
    });

    // Team clip events
    this.socket.on('team-clip:created', ({ teamId, clip }) => {
      const { addTeamClip } = useClipStore.getState();
      addTeamClip(teamId, clip);
    });
  }

  /**
   * Disconnect from sync server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Join team rooms
   */
  joinTeams(teamIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('join-teams', teamIds);
    }
  }

  /**
   * Leave team rooms
   */
  leaveTeams(teamIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('leave-teams', teamIds);
    }
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

export const SyncService = new SyncServiceClass();

