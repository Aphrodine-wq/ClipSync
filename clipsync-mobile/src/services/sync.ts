/**
 * Sync Service
 * Handles real-time synchronization with backend
 */

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useClipStore } from '../store/useClipStore';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

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

    const deviceName = Platform.OS === 'web' ? 'Web Browser' : await DeviceInfo.getDeviceName();
    const deviceType = Platform.OS;

    this.socket = io(process.env.API_URL || 'http://localhost:3001', {
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
      console.error('Sync connection error:', error);
      this.reconnectAttempts++;

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

