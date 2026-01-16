// IndexedDB storage utilities for clipboard history

const DB_NAME = 'ClipSyncDB';
const DB_VERSION = 1;
const STORE_NAME = 'clips';

let db = null;

// Initialize database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        
        // Create indexes
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('pinned', 'pinned', { unique: false });
      }
    };
  });
};

// Add a clip to storage
export const addClip = async (clipData) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const clip = {
      ...clipData,
      timestamp: clipData.timestamp || Date.now(),
      pinned: clipData.pinned || false,
      copyCount: clipData.copyCount || 1,
      source: clipData.source || 'unknown',
    };

    const request = objectStore.add(clip);

    request.onsuccess = () => {
      resolve({ ...clip, id: request.result });
    };

    request.onerror = () => {
      reject(new Error('Failed to add clip'));
    };
  });
};

// Increment copy count for a clip
export const incrementCopyCount = async (id) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      const clip = request.result;
      if (!clip) {
        reject(new Error('Clip not found'));
        return;
      }

      const updatedClip = {
        ...clip,
        copyCount: (clip.copyCount || 1) + 1,
        timestamp: Date.now(), // Update timestamp when copied again
      };

      const updateRequest = objectStore.put(updatedClip);
      updateRequest.onsuccess = () => {
        resolve(updatedClip);
      };
      updateRequest.onerror = () => {
        reject(new Error('Failed to update copy count'));
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to get clip'));
    };
  });
};

// Get all clips
export const getAllClips = async () => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      // Sort by timestamp, newest first
      const clips = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(clips);
    };

    request.onerror = () => {
      reject(new Error('Failed to get clips'));
    };
  });
};

// Get clip by ID
export const getClipById = async (id) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to get clip'));
    };
  });
};

// Update a clip
export const updateClip = async (id, updates) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
      const clip = getRequest.result;
      if (!clip) {
        reject(new Error('Clip not found'));
        return;
      }

      const updatedClip = { ...clip, ...updates };
      const updateRequest = objectStore.put(updatedClip);

      updateRequest.onsuccess = () => {
        resolve(updatedClip);
      };

      updateRequest.onerror = () => {
        reject(new Error('Failed to update clip'));
      };
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to get clip'));
    };
  });
};

// Delete a clip
export const deleteClip = async (id) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(new Error('Failed to delete clip'));
    };
  });
};

// Toggle pin status
export const togglePin = async (id) => {
  if (!db) await initDB();

  const clip = await getClipById(id);
  if (!clip) throw new Error('Clip not found');

  return updateClip(id, { pinned: !clip.pinned });
};

// Clear all clips
export const clearAllClips = async () => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(new Error('Failed to clear clips'));
    };
  });
};

// Search clips
export const searchClips = async (query) => {
  const allClips = await getAllClips();
  
  if (!query || query.trim() === '') {
    return allClips;
  }

  const lowerQuery = query.toLowerCase();
  
  return allClips.filter(clip => 
    clip.content.toLowerCase().includes(lowerQuery) ||
    clip.type.toLowerCase().includes(lowerQuery)
  );
};

// Get clips by type
export const getClipsByType = async (type) => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('type');
    const request = index.getAll(type);

    request.onsuccess = () => {
      const clips = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(clips);
    };

    request.onerror = () => {
      reject(new Error('Failed to get clips by type'));
    };
  });
};

// Get pinned clips
export const getPinnedClips = async () => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('pinned');
    const request = index.getAll(true);

    request.onsuccess = () => {
      const clips = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(clips);
    };

    request.onerror = () => {
      reject(new Error('Failed to get pinned clips'));
    };
  });
};

// Export all clips as JSON
export const exportClips = async () => {
  const clips = await getAllClips();
  return JSON.stringify(clips, null, 2);
};

// Import clips from JSON
export const importClips = async (jsonString) => {
  try {
    const clips = JSON.parse(jsonString);
    
    if (!Array.isArray(clips)) {
      throw new Error('Invalid format: expected array of clips');
    }

    const promises = clips.map(clip => {
      const { id, ...clipData } = clip; // Remove id to let DB generate new ones
      return addClip(clipData);
    });

    await Promise.all(promises);
    return true;
  } catch (error) {
    throw new Error('Failed to import clips: ' + error.message);
  }
};
