const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Clipboard operations
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  
  // Storage operations
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Notifications
  showNotification: (title, message) => ipcRenderer.invoke('show-notification', { title, message }),
  
  // Window controls
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Clipboard events - Listen for clipboard changes from main process
  onClipboardChanged: (callback) => {
    const subscription = (event, text) => callback(text);
    ipcRenderer.on('clipboard-changed', subscription);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('clipboard-changed', subscription);
    };
  },
  
  // Quick paste event
  onQuickPaste: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('quick-paste', subscription);
    
    return () => {
      ipcRenderer.removeListener('quick-paste', subscription);
    };
  },
  
  // Settings event
  onOpenSettings: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('open-settings', subscription);
    
    return () => {
      ipcRenderer.removeListener('open-settings', subscription);
    };
  },
  
  // Check if running in Electron
  isElectron: true
});
