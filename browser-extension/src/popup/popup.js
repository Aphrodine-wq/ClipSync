/**
 * Popup Script
 * Main UI logic for extension popup
 */

const API_URL = 'http://localhost:3001/api'; // Update for production
let clips = [];
let currentTab = 'history';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadClips();
  setupEventListeners();
  checkAuth();
});

// Check authentication
async function checkAuth() {
  const isChrome = typeof chrome !== 'undefined';
  const storage = isChrome ? chrome.storage.local : browser.storage.local;
  
  const { token } = await storage.get(['token']);
  if (!token) {
    showLoginPrompt();
    return;
  }
}

// Show login prompt
function showLoginPrompt() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="empty-state">
      <p>Please sign in to use ClipSync</p>
      <button id="loginBtn" style="margin-top: 16px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Sign In
      </button>
    </div>
  `;
  
  document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://clipsync.com' });
  });
}

// Load clips from API
async function loadClips() {
  const isChrome = typeof chrome !== 'undefined';
  const storage = isChrome ? chrome.storage.local : browser.storage.local;
  
  const { token } = await storage.get(['token']);
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/clips?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      clips = data.clips || [];
      renderClips();
    }
  } catch (error) {
    console.error('Failed to load clips:', error);
    updateSyncStatus('offline');
  }
}

// Render clips
function renderClips() {
  const clipList = document.getElementById('clipList');
  const emptyState = document.getElementById('emptyState');
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  let filteredClips = clips;
  
  if (searchQuery) {
    filteredClips = clips.filter(clip =>
      clip.content.toLowerCase().includes(searchQuery) ||
      clip.type.toLowerCase().includes(searchQuery)
    );
  }

  if (filteredClips.length === 0) {
    clipList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  clipList.style.display = 'block';
  emptyState.style.display = 'none';

  clipList.innerHTML = filteredClips.slice(0, 20).map(clip => `
    <div class="clip-item" data-clip-id="${clip.id}">
      <div class="clip-header">
        <span class="clip-type">${clip.type}</span>
        ${clip.pinned ? '<span style="color: #6366f1;">📌</span>' : ''}
      </div>
      <div class="clip-content">${escapeHtml(clip.content.substring(0, 100))}${clip.content.length > 100 ? '...' : ''}</div>
      <div class="clip-time">${formatTime(clip.createdAt)}</div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.clip-item').forEach(item => {
    item.addEventListener('click', async () => {
      const clipId = item.dataset.clipId;
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        await copyToClipboard(clip.content);
        window.close();
      }
    });
  });
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    
    // Show notification
    const isChrome = typeof chrome !== 'undefined';
    if (isChrome) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'ClipSync',
        message: 'Copied to clipboard!',
      });
    }
  } catch (error) {
    console.error('Copy error:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  document.getElementById('searchInput')?.addEventListener('input', renderClips);

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      // Load appropriate content
    });
  });

  // Sync button
  document.getElementById('syncBtn')?.addEventListener('click', async () => {
    updateSyncStatus('syncing');
    await loadClips();
    updateSyncStatus('synced');
  });

  // Settings button
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Update sync status
function updateSyncStatus(status) {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  
  statusDot.className = `status-dot ${status}`;
  
  if (status === 'synced') {
    statusText.textContent = 'Synced';
  } else if (status === 'syncing') {
    statusText.textContent = 'Syncing...';
  } else {
    statusText.textContent = 'Offline';
  }
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for clip updates from background
const isChrome = typeof chrome !== 'undefined';
if (isChrome) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'clip-captured') {
      loadClips();
    }
  });
}

