import { create } from 'zustand';
import { 
  initDB, 
  addClip as addClipToDB, 
  getAllClips, 
  deleteClip as deleteClipFromDB,
  togglePin as togglePinInDB,
  searchClips as searchClipsInDB,
  getClipsByType,
  getPinnedClips,
  clearAllClips as clearAllClipsFromDB
} from '../utils/storage';
import { detectClipType } from '../utils/typeDetection';
import { copyToClipboard, getRelativeTime, shouldCapture, isDuplicate } from '../utils/clipboard';

const useClipStore = create((set, get) => ({
  // State
  clips: [],
  selectedClip: null,
  searchQuery: '',
  activeTab: 'history',
  activeFilter: 'all',
  isLoading: false,
  error: null,
  syncStatus: 'synced', // 'synced', 'syncing', 'offline'
  showTransforms: false,

  // Initialize store
  initialize: async () => {
    try {
      set({ isLoading: true });
      await initDB();
      const clips = await getAllClips();
      set({ clips, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add a new clip
  addClip: async (content) => {
    try {
      const { clips } = get();
      
      // Check if should capture
      if (!shouldCapture(content)) {
        return null;
      }

      // Check for duplicates
      if (isDuplicate(content, clips)) {
        console.log('Duplicate clip, skipping');
        return null;
      }

      // Detect type
      const type = detectClipType(content);
      
      // Add to local database
      const newClip = await addClipToDB({
        content,
        type,
        timestamp: Date.now(),
        pinned: false,
      });

      // Update state
      set({ clips: [newClip, ...clips] });
      
      // Sync to backend if authenticated
      try {
        const apiClient = (await import('../services/api')).default;
        const wsClient = (await import('../services/websocket')).default;
        
        if (apiClient.getToken()) {
          const response = await apiClient.createClip({
            content,
            type,
            pinned: false,
          });
          
          // Notify other devices via WebSocket
          if (wsClient.isConnected()) {
            wsClient.notifyClipCreated(response.clip);
          }
        }
      } catch (syncError) {
        console.error('Failed to sync clip:', syncError);
        // Continue even if sync fails - clip is saved locally
      }
      
      return newClip;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Sync clip from remote device
  syncClipFromRemote: async (clip) => {
    try {
      const { clips } = get();
      
      // Check if clip already exists
      const exists = clips.some(c => c.id === clip.id);
      if (exists) {
        console.log('Clip already exists, skipping');
        return;
      }

      // Add to local database
      await addClipToDB({
        id: clip.id,
        content: clip.content,
        type: clip.type,
        timestamp: new Date(clip.created_at).getTime(),
        pinned: clip.pinned || false,
      });

      // Update state
      set({ clips: [clip, ...clips] });
    } catch (error) {
      console.error('Failed to sync remote clip:', error);
    }
  },

  // Update clip from remote device
  updateClipFromRemote: async (clip) => {
    try {
      const { clips } = get();
      
      // Update in local database
      await togglePinInDB(clip.id);
      
      // Update state
      set({
        clips: clips.map(c => c.id === clip.id ? { ...c, ...clip } : c)
      });
    } catch (error) {
      console.error('Failed to update remote clip:', error);
    }
  },

  // Delete clip from remote device
  deleteClipFromRemote: async (clipId) => {
    try {
      const { clips } = get();
      
      // Delete from local database
      await deleteClipFromDB(clipId);
      
      // Update state
      set({ 
        clips: clips.filter(clip => clip.id !== clipId),
        selectedClip: get().selectedClip?.id === clipId ? null : get().selectedClip
      });
    } catch (error) {
      console.error('Failed to delete remote clip:', error);
    }
  },

  // Delete a clip
  deleteClip: async (id) => {
    try {
      await deleteClipFromDB(id);
      const { clips } = get();
      set({ 
        clips: clips.filter(clip => clip.id !== id),
        selectedClip: null 
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Toggle pin status
  togglePin: async (id) => {
    try {
      const updatedClip = await togglePinInDB(id);
      const { clips } = get();
      set({
        clips: clips.map(clip => clip.id === id ? updatedClip : clip)
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Copy clip to clipboard
  copyClip: async (clip) => {
    try {
      await copyToClipboard(clip.content);
      return true;
    } catch (error) {
      set({ error: 'Failed to copy to clipboard' });
      throw error;
    }
  },

  // Select a clip
  selectClip: (clip) => {
    set({ selectedClip: clip });
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedClip: null });
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Search clips
  searchClips: async (query) => {
    try {
      set({ isLoading: true });
      const results = await searchClipsInDB(query);
      set({ clips: results, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set active tab
  setActiveTab: async (tab) => {
    set({ activeTab: tab, isLoading: true });
    
    try {
      let clips;
      if (tab === 'pinned') {
        clips = await getPinnedClips();
      } else if (tab === 'team') {
        // Mock team clips for now
        clips = [];
      } else {
        clips = await getAllClips();
      }
      set({ clips, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set active filter
  setActiveFilter: async (filter) => {
    set({ activeFilter: filter, isLoading: true });
    
    try {
      let clips;
      if (filter === 'all') {
        clips = await getAllClips();
      } else {
        clips = await getClipsByType(filter);
      }
      set({ clips, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Toggle transforms panel
  toggleTransforms: () => {
    set({ showTransforms: !get().showTransforms });
  },

  // Clear all clips
  clearAllClips: async () => {
    try {
      await clearAllClipsFromDB();
      set({ clips: [], selectedClip: null });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Get filtered clips
  getFilteredClips: () => {
    const { clips, searchQuery, activeFilter } = get();
    
    let filtered = clips;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(clip => 
        clip.content.toLowerCase().includes(query) ||
        clip.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(clip => clip.type === activeFilter);
    }

    return filtered;
  },

  // Get clip counts by type
  getClipCounts: () => {
    const { clips } = get();
    const counts = {
      all: clips.length,
      code: 0,
      json: 0,
      url: 0,
      uuid: 0,
      color: 0,
      email: 0,
      ip: 0,
      token: 0,
      env: 0,
      path: 0,
      text: 0,
    };

    clips.forEach(clip => {
      if (counts[clip.type] !== undefined) {
        counts[clip.type]++;
      }
    });

    return counts;
  },

  // Update sync status
  setSyncStatus: (status) => {
    set({ syncStatus: status });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useClipStore;
