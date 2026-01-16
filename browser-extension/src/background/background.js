/**
 * Firefox Extension Background Script
 * Handles clipboard monitoring and sync
 */

const API_URL = 'http://localhost:3001'; // Update for production
let monitoringInterval = null;
let lastClipboardContent = '';
let isMonitoring = false;

// Initialize
browser.runtime.onInstalled.addListener(() => {
  console.log('ClipSync extension installed');
  startMonitoring();
});

// Start clipboard monitoring
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  
  monitoringInterval = setInterval(async () => {
    try {
      // Firefox clipboard access requires content script
      // We'll use a different approach - content script will notify us
      // This is a placeholder - actual implementation would use content script messaging
    } catch (error) {
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

// Handle messages from popup/content
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'start-monitoring') {
    startMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'stop-monitoring') {
    stopMonitoring();
    sendResponse({ success: true });
  } else if (message.type === 'clip-captured') {
    syncClip(message.content);
    sendResponse({ success: true });
  }
  return true;
});

// Sync clip to server
async function syncClip(content) {
  const { token } = await browser.storage.local.get(['token']);
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
  return 'text';
}

