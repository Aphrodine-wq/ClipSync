/**
 * Clip Store
 * Manages clipboard data state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

interface AddClipOptions {
  type?: string;
  pinned?: boolean;
  folderId?: string;
  tags?: string[];
  encrypted?: boolean;
  metadata?: Record<string, unknown>;
  manual?: boolean;
}

export interface Clip {
  id: string;
  content: string;
  type: string;
  pinned: boolean;
  folderId?: string;
  tags: string[];
  encrypted: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ClipState {
  clips: Clip[];
  selectedClip: Clip | null;
  searchQuery: string;
  activeFilter: 'all' | 'pinned' | 'recent';
  isLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  initialize: () => Promise<void>;
  addClip: (content: string, options?: AddClipOptions) => Promise<Clip | null>;
  updateClip: (id: string, updates: Partial<Clip>) => Promise<void>;
  deleteClip: (id: string) => Promise<void>;
  pinClip: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'pinned' | 'recent') => void;
  setSelectedClip: (clip: Clip | null) => void;
  setSyncStatus: (status: 'synced' | 'syncing' | 'offline') => void;
  syncWithServer: () => Promise<void>;
  addTeamClip: (teamId: string, clip: Clip) => void;
}

export const useClipStore = create<ClipState>((set, get) => ({
  clips: [],
  selectedClip: null,
  searchQuery: '',
  activeFilter: 'all',
  isLoading: false,
  syncStatus: 'synced',

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Load from local storage
      const localClips = await AsyncStorage.getItem('clipsync_clips');
      if (localClips) {
        set({ clips: JSON.parse(localClips) });
      }

      // Sync with server
      await get().syncWithServer();
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Clip store initialization error:', error);
      set({ isLoading: false });
    }
  },

  addClip: async (content: string, options = {}) => {
    try {
      const clip: Clip = {
        id: `mobile-${Date.now()}-${Math.random()}`,
        content,
        type: options.type || 'text',
        pinned: options.pinned || false,
        folderId: options.folderId,
        tags: options.tags || [],
        encrypted: options.encrypted || false,
        metadata: options.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to local state
      const { clips } = get();
      const newClips = [clip, ...clips];
      set({ clips: newClips });
      
      // Save to local storage
      await AsyncStorage.setItem('clipsync_clips', JSON.stringify(newClips));

      // Sync with server if authenticated
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && !options.manual) {
        try {
          await apiClient.post('/clips', {
            content,
            type: clip.type,
            pinned: clip.pinned,
            tags: clip.tags,
            encrypted: clip.encrypted,
            metadata: clip.metadata,
          });
        } catch (error) {
          console.error('Failed to sync clip:', error);
          // Queue for later sync
        }
      }

      return clip;
    } catch (error) {
      console.error('Add clip error:', error);
      return null;
    }
  },

  updateClip: async (id: string, updates: Partial<Clip>) => {
    const { clips } = get();
    const updatedClips = clips.map(clip =>
      clip.id === id ? { ...clip, ...updates, updatedAt: new Date().toISOString() } : clip
    );
    
    set({ clips: updatedClips });
    await AsyncStorage.setItem('clipsync_clips', JSON.stringify(updatedClips));

    // Sync with server
    try {
      await apiClient.put(`/clips/${id}`, updates);
    } catch (error) {
      console.error('Failed to sync clip update:', error);
    }
  },

  deleteClip: async (id: string) => {
    const { clips } = get();
    const updatedClips = clips.filter(clip => clip.id !== id);
    
    set({ clips: updatedClips });
    await AsyncStorage.setItem('clipsync_clips', JSON.stringify(updatedClips));

    // Sync with server
    try {
      await apiClient.delete(`/clips/${id}`);
    } catch (error) {
      console.error('Failed to sync clip deletion:', error);
    }
  },

  pinClip: async (id: string) => {
    const { clips } = get();
    const clip = clips.find(c => c.id === id);
    if (clip) {
      await get().updateClip(id, { pinned: !clip.pinned });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setActiveFilter: (filter: 'all' | 'pinned' | 'recent') => {
    set({ activeFilter: filter });
  },

  setSelectedClip: (clip: Clip | null) => {
    set({ selectedClip: clip });
  },

  setSyncStatus: (status: 'synced' | 'syncing' | 'offline') => {
    set({ syncStatus: status });
  },

  syncWithServer: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    try {
      set({ syncStatus: 'syncing' });
      
      const response = await apiClient.get('/clips?limit=1000');
      const serverClips = response.clips || [];

      // Merge with local clips
      const { clips: localClips } = get();
      const mergedClips = [...serverClips, ...localClips].reduce((acc, clip) => {
        const existing = acc.find(c => c.id === clip.id);
        if (!existing) {
          acc.push(clip);
        } else if (new Date(clip.updatedAt) > new Date(existing.updatedAt)) {
          const index = acc.indexOf(existing);
          acc[index] = clip;
        }
        return acc;
      }, [] as Clip[]);

      // Sort by created date
      mergedClips.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({ clips: mergedClips, syncStatus: 'synced' });
      await AsyncStorage.setItem('clipsync_clips', JSON.stringify(mergedClips));
    } catch (error) {
      console.error('Sync error:', error);
      set({ syncStatus: 'offline' });
    }
  },

  addTeamClip: (_teamId: string, _clip: Clip) => {
    // Handle team clip addition
    // This would be managed by a separate team store
  },
}));

