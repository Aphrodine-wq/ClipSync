/**
 * Options Page Script
 */

const isChrome = typeof chrome !== 'undefined';
const storage = isChrome ? chrome.storage.local : browser.storage.local;

// Load settings
document.addEventListener('DOMContentLoaded', async () => {
  const { apiUrl, autoCapture } = await storage.get(['apiUrl', 'autoCapture']);
  
  if (apiUrl) {
    document.getElementById('apiUrl').value = apiUrl;
  }
  
  if (autoCapture !== undefined) {
    document.getElementById('autoCapture').value = String(autoCapture);
  }

  // Save button
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const apiUrl = document.getElementById('apiUrl').value;
    const autoCapture = document.getElementById('autoCapture').value === 'true';
    
    await storage.set({ apiUrl, autoCapture });
    
    alert('Settings saved!');
  });
});

