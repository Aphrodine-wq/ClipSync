/**
 * Chrome Extension Background Service Worker
 * Handles clipboard monitoring and sync
 */

const API_URL = chrome.runtime.getManifest().host_permissions?.[0]?.replace('/*', '') || 'http://localhost:3001';
let monitoringInterval = null;
let lastClipboardContent = '';
let isMonitoring = false;

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log('ClipSync extension installed');
  startMonitoring();
});

// Start clipboard monitoring
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  
  monitoringInterval = setInterval(async () => {
    try {
      // Read clipboard (requires active tab permission)
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      // Inject script to read clipboard
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return navigator.clipboard.readText().catch(() => '');
        },
      });

      const content = results[0]?.result || '';
      
      if (content && content !== lastClipboardContent && content.length > 0) {
        lastClipboardContent = content;
        
        // Get auth token
        const { token } = await chrome.storage.local.get(['token']);
        if (!token) return;

        // Send to API
        try {
          await fetch(`${API_URL}/api/clips`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              content,
              type: detectType(content),
              source: 'browser-extension',
            }),
          });

          // Notify popup
          chrome.runtime.sendMessage({
            type: 'clip-captured',
            content,
          });
        } catch (error) {
          console.error('Failed to sync clip:', error);
        }
      }
    } catch (error) {
      // Clipboard access may be denied, that's okay
      console.debug('Clipboard monitoring:', error.message);
    }
  }, 500);
}

// Stop monitoring
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  isMonitoring = false;
}

// Detect content type
function detectType(content) {
  if (/^[\s\n]*\{[\s\S]*\}$/.test(content) || /^[\s\n]*\[[\s\S]*\]$/.test(content)) {
    return 'json';
  }
  if (/^https?:\/\//.test(content)) {
    return 'url';
  }
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(content)) {
    return 'uuid';
  }
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(content)) {
    return 'email';
  }
  if (/^#?[0-9a-fA-F]{6}$/.test(content)) {
    return 'color';
  }
  if (/^[a-z]+:\/\/[^\s]+/.test(content)) {
    return 'url';
  }
  return 'text';
}

// Handle messages from popup/content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'start-monitoring') {
    startMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'stop-monitoring') {
    stopMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'sync-clip') {
    syncClip(message.content);
    sendResponse({ success: true });
  }
  return true;
});

// Sync clip to server
async function syncClip(content) {
  const { token } = await chrome.storage.local.get(['token']);
  if (!token) return;

  try {
    await fetch(`${API_URL}/api/clips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        type: detectType(content),
        source: 'browser-extension',
      }),
    });
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Handle commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-clipsync') {
    chrome.action.openPopup();
  } else if (command === 'quick-paste') {
    // Open quick paste interface
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?action=paste') });
  }
});

