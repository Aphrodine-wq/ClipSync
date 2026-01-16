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
  clearAllClips as clearAllClipsFromDB,
  incrementCopyCount,
  updateClip
} from '../utils/storage';
import { detectClipType } from '../utils/typeDetection';
import { copyToClipboard, getRelativeTime, shouldCapture, isDuplicate, detectSourceFromContent } from '../utils/clipboard';
import { autoCategorize } from '../utils/autoCategorize';

const useClipStore = create((set, get) => ({
  // State
  clips: [],
  selectedClip: null,
  selectedClips: [], // For multi-select operations
  searchQuery: '',
  activeTab: 'history',
  activeFilter: 'all',
  isLoading: false,
  error: null,
  syncStatus: 'synced', // 'synced', 'syncing', 'offline'
  showTransforms: false,
  incognitoMode: false, // Pause history recording
  regexSearchMode: false, // Enable regex in search
  fuzzySearchMode: false, // Enable fuzzy search
  codeOnlySearch: false, // Search only in code clips
  excludeTerms: '', // Terms to exclude from search
  dateRange: null, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  compactMode: false, // Compact list view

  // Initialize store
  initialize: async () => {
    try {
      set({ isLoading: true });
      await initDB();
      const clips = await getAllClips();
      
      // Load preferences from localStorage
      const savedIncognito = localStorage.getItem('clipsync_incognito') === 'true';
      const savedCompactMode = localStorage.getItem('clipsync_compact_mode') === 'true';
      
      set({ 
        clips, 
        isLoading: false,
        incognitoMode: savedIncognito,
        compactMode: savedCompactMode
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add a new clip
  addClip: async (content, options = {}) => {
    try {
      const { clips, incognitoMode } = get();
      
      // Skip if incognito mode is enabled (unless manually created)
      if (!options.manual && incognitoMode) {
        console.log('Incognito mode: skipping clipboard capture');
        return null;
      }
      
      const {
        type: providedType,
        pinned = false,
        folderId = null,
        tags = [],
        encrypt = false,
        metadata = {},
        source = 'unknown',
        template = false,
        templatePlaceholders = null,
        expiresInMinutes = null,
      } = options;
      
      // Check if should capture (unless manually created)
      if (!options.manual && !shouldCapture(content)) {
        return null;
      }

      // Check for duplicates (unless manually created)
      if (!options.manual) {
        const existingClip = isDuplicate(content, clips);
        if (existingClip) {
          // Increment copy count instead of creating new clip
          try {
            const updatedClip = await incrementCopyCount(existingClip.id);
            
            // Update in state
            set({
              clips: clips.map(c => c.id === existingClip.id ? updatedClip : c),
              selectedClip: get().selectedClip?.id === existingClip.id ? updatedClip : get().selectedClip
            });
            
            // Show "copied again" indicator via event (can be caught by Toast)
            window.dispatchEvent(new CustomEvent('clipCopiedAgain', { 
              detail: { clip: updatedClip, copyCount: updatedClip.copyCount } 
            }));
            
            return updatedClip;
          } catch (error) {
            console.error('Failed to increment copy count:', error);
            // Fall through to create new clip if increment fails
          }
        }
      }

      // Detect type if not provided
      const type = providedType || detectClipType(content);
      
      // Detect source if not provided (try to get from clipboard metadata)
      let detectedSource = source;
      if (source === 'unknown' && !options.manual) {
        // Try to detect source from clipboard API or content patterns
        detectedSource = detectSourceFromContent(content);
      }
      
      // Auto-tagging based on content patterns
      let finalTags = tags;
      if (tags.length === 0) {
        const categorization = autoCategorize(content, type);
        finalTags = categorization.suggestedTags || [];
      }
      
      // Build metadata object
      const clipMetadata = {
        ...metadata,
        tags: finalTags,
        autoCategorized: !providedType,
        autoTagged: tags.length === 0,
        categoryConfidence: providedType ? 1.0 : 0.9,
        encrypted: encrypt,
        patterns: finalTags, // Store detected patterns as metadata
      };
      
      // Add to local database
      const newClip = await addClipToDB({
        content,
        type,
        timestamp: Date.now(),
        pinned,
        copyCount: 1,
        source: detectedSource,
        metadata: clipMetadata,
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
            pinned,
            folderId,
            metadata: clipMetadata,
            template,
            templatePlaceholders,
            expiresInMinutes,
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

  // Create clip with full metadata (for manual creation)
  createClipWithMetadata: async (clipData) => {
    return get().addClip(clipData.content, {
      ...clipData,
      manual: true,
    });
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
    const { clips, searchQuery, activeFilter, regexSearchMode, fuzzySearchMode, codeOnlySearch, excludeTerms, dateRange } = get();
    
    let filtered = clips;

    // Apply code-only filter first
    if (codeOnlySearch) {
      filtered = filtered.filter(clip => clip.type === 'code');
    }

    // Apply date range filter
    if (dateRange) {
      filtered = filtered.filter(clip => {
        const clipDate = new Date(clip.timestamp || clip.created_at);
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          if (clipDate < startDate) return false;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end date
          if (clipDate > endDate) return false;
        }
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      if (regexSearchMode) {
        try {
          const regex = new RegExp(searchQuery, 'i');
          filtered = filtered.filter(clip => 
            regex.test(clip.content) ||
            regex.test(clip.type) ||
            (clip.source && regex.test(clip.source))
          );
        } catch (error) {
          // Invalid regex, fall back to normal search
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(clip => 
            clip.content.toLowerCase().includes(query) ||
            clip.type.toLowerCase().includes(query)
          );
        }
      } else if (fuzzySearchMode) {
        // Simple fuzzy search using Levenshtein-like approach
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(clip => {
          const content = clip.content.toLowerCase();
          // Check if query is similar to content (allowing for typos)
          if (content.includes(query)) return true;
          // Check for character similarity (simple implementation)
          let matches = 0;
          for (let i = 0; i < query.length; i++) {
            if (content.includes(query[i])) matches++;
          }
          return matches >= query.length * 0.6; // 60% character match
        });
      } else {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(clip => 
          clip.content.toLowerCase().includes(query) ||
          clip.type.toLowerCase().includes(query) ||
          (clip.source && clip.source.toLowerCase().includes(query))
        );
      }
    }

    // Apply exclude terms filter
    if (excludeTerms && excludeTerms.trim()) {
      const excludeList = excludeTerms.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      filtered = filtered.filter(clip => {
        const content = clip.content.toLowerCase();
        return !excludeList.some(term => content.includes(term));
      });
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(clip => clip.type === activeFilter);
    }

    return filtered;
  },
  
  // Toggle incognito mode
  toggleIncognitoMode: () => {
    const newMode = !get().incognitoMode;
    set({ incognitoMode: newMode });
    localStorage.setItem('clipsync_incognito', newMode.toString());
  },
  
  // Toggle regex search mode
  toggleRegexSearchMode: () => {
    set({ regexSearchMode: !get().regexSearchMode });
  },
  
  // Toggle fuzzy search mode
  toggleFuzzySearchMode: () => {
    set({ fuzzySearchMode: !get().fuzzySearchMode });
  },
  
  // Toggle code-only search
  toggleCodeOnlySearch: () => {
    set({ codeOnlySearch: !get().codeOnlySearch });
  },
  
  // Set exclude terms
  setExcludeTerms: (terms) => {
    set({ excludeTerms: terms });
  },
  
  // Set date range
  setDateRange: (range) => {
    set({ dateRange: range });
  },
  
  // Toggle compact mode
  toggleCompactMode: () => {
    const newMode = !get().compactMode;
    set({ compactMode: newMode });
    localStorage.setItem('clipsync_compact_mode', newMode.toString());
  },
  
  // Group clips by time periods
  getGroupedClips: () => {
    const filtered = get().getFilteredClips();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    
    filtered.forEach(clip => {
      const age = now - clip.timestamp;
      if (age < oneDay) {
        groups.today.push(clip);
      } else if (age < oneDay * 2) {
        groups.yesterday.push(clip);
      } else if (age < oneWeek) {
        groups.thisWeek.push(clip);
      } else {
        groups.older.push(clip);
      }
    });
    
    return groups;
  },
  
  // Select multiple clips
  toggleClipSelection: (clipId) => {
    const { selectedClips } = get();
    if (selectedClips.includes(clipId)) {
      set({ selectedClips: selectedClips.filter(id => id !== clipId) });
    } else {
      set({ selectedClips: [...selectedClips, clipId] });
    }
  },
  
  // Clear selection
  clearSelection: () => {
    set({ selectedClips: [] });
  },
  
  // Merge selected clips
  mergeClips: async (separator = '\n') => {
    try {
      const { selectedClips, clips } = get();
      if (selectedClips.length < 2) {
        throw new Error('Select at least 2 clips to merge');
      }
      
      const clipsToMerge = clips.filter(c => selectedClips.includes(c.id));
      const mergedContent = clipsToMerge.map(c => c.content).join(separator);
      
      // Create new merged clip
      const mergedClip = await get().addClip(mergedContent, {
        manual: true,
        type: detectClipType(mergedContent),
        tags: [...new Set(clipsToMerge.flatMap(c => c.metadata?.tags || []))],
      });
      
      // Clear selection
      set({ selectedClips: [] });
      
      return mergedClip;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Paste sequence of clips
  pasteSequence: async (clipIds, delayMs = 100) => {
    const { clips } = get();
    const clipsToPaste = clips.filter(c => clipIds.includes(c.id));
    
    for (const clip of clipsToPaste) {
      await copyToClipboard(clip.content);
      if (delayMs > 0 && clip !== clipsToPaste[clipsToPaste.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  },
  
  // Bulk delete clips
  bulkDeleteClips: async (clipIds) => {
    try {
      for (const id of clipIds) {
        await deleteClipFromDB(id);
      }
      const { clips } = get();
      set({ 
        clips: clips.filter(c => !clipIds.includes(c.id)),
        selectedClips: [],
        selectedClip: clipIds.includes(get().selectedClip?.id) ? null : get().selectedClip
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Bulk tag clips
  bulkTagClips: async (clipIds, tags, action = 'add') => {
    try {
      const { clips } = get();
      const updatedClips = clips.map(clip => {
        if (!clipIds.includes(clip.id)) return clip;
        
        const currentTags = clip.metadata?.tags || [];
        let newTags;
        if (action === 'add') {
          newTags = [...new Set([...currentTags, ...tags])];
        } else if (action === 'remove') {
          newTags = currentTags.filter(t => !tags.includes(t));
        } else {
          newTags = tags;
        }
        
        return {
          ...clip,
          metadata: { ...clip.metadata, tags: newTags }
        };
      });
      
      // Update in storage
      for (const clip of updatedClips) {
        if (clipIds.includes(clip.id)) {
          await updateClip(clip.id, { metadata: clip.metadata });
        }
      }
      
      set({ clips: updatedClips });
      set({ selectedClips: [] });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Export clips
  exportClips: (clipIds = null) => {
    const { clips } = get();
    const clipsToExport = clipIds 
      ? clips.filter(c => clipIds.includes(c.id))
      : clips;
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      clipCount: clipsToExport.length,
      clips: clipsToExport.map(clip => ({
        content: clip.content,
        type: clip.type,
        timestamp: clip.timestamp,
        pinned: clip.pinned,
        copyCount: clip.copyCount || 1,
        source: clip.source,
        metadata: clip.metadata,
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipsync-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // Import clips
  importClips: async (file, mode = 'merge') => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.clips || !Array.isArray(data.clips)) {
        throw new Error('Invalid import file format');
      }
      
      if (mode === 'replace') {
        await get().clearAllClips();
      }
      
      let importedCount = 0;
      for (const clipData of data.clips) {
        await get().addClip(clipData.content, {
          manual: true,
          type: clipData.type,
          pinned: clipData.pinned,
          source: clipData.source || 'imported',
          metadata: clipData.metadata || {},
        });
        importedCount++;
      }
      
      return importedCount;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
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

  // Expand template with placeholders
  expandTemplate: async (clipId, placeholders) => {
    try {
      const apiClient = (await import('../services/api')).default;
      const response = await apiClient.expandTemplate(clipId, placeholders);
      
      // Add the expanded clip to the store
      await get().addClip(response.clip.content, {
        type: response.clip.type,
        manual: true,
      });
      
      return response.clip;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Set clip expiration
  setClipExpiration: async (clipId, expiresInMinutes) => {
    try {
      const apiClient = (await import('../services/api')).default;
      const response = await apiClient.setClipExpiration(clipId, expiresInMinutes);
      
      // Update clip in store
      const { clips } = get();
      set({
        clips: clips.map(clip => 
          clip.id === clipId 
            ? { ...clip, expires_at: response.clip.expires_at }
            : clip
        )
      });
      
      return response.clip;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Split clip
  splitClip: async (clipId, delimiter) => {
    try {
      const apiClient = (await import('../services/api')).default;
      const response = await apiClient.splitClip(clipId, delimiter);
      
      // Add new clips to store
      for (const newClip of response.clips) {
        await get().addClip(newClip.content, {
          type: newClip.type,
          manual: true,
        });
      }
      
      return response.clips;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useClipStore;
