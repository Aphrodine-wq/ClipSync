/**
 * Context Detector
 * Detects active application and window context
 */

const { app, BrowserWindow } = require('electron');

/**
 * Get active window context
 */
async function getActiveWindow() {
  try {
    // Get active window
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (!focusedWindow) {
      return {
        appName: null,
        windowTitle: null,
        url: null,
      };
    }
    
    // Get window title
    const windowTitle = focusedWindow.getTitle();
    
    // Try to get URL if it's a webview
    let url = null;
    try {
      url = focusedWindow.webContents.getURL();
    } catch (e) {
      // Not a webview or no URL
    }
    
    // Get process info
    const appName = app.getName();
    
    return {
      appName,
      windowTitle,
      url,
      platform: process.platform,
    };
  } catch (error) {
    console.error('Context detection error:', error);
    return {
      appName: null,
      windowTitle: null,
      url: null,
    };
  }
}

/**
 * Detect content type from active application
 */
function detectContextType(context) {
  if (!context.appName) {
    return 'unknown';
  }
  
  const appNameLower = context.appName.toLowerCase();
  
  // Code editors
  if (appNameLower.includes('code') || 
      appNameLower.includes('sublime') || 
      appNameLower.includes('atom') ||
      appNameLower.includes('vim') ||
      appNameLower.includes('neovim')) {
    return 'code';
  }
  
  // Messaging
  if (appNameLower.includes('slack') || 
      appNameLower.includes('discord') ||
      appNameLower.includes('teams')) {
    return 'messaging';
  }
  
  // Email
  if (appNameLower.includes('mail') || 
      appNameLower.includes('outlook') ||
      appNameLower.includes('gmail')) {
    return 'email';
  }
  
  // Terminal
  if (appNameLower.includes('terminal') || 
      appNameLower.includes('iterm') ||
      appNameLower.includes('cmd') ||
      appNameLower.includes('powershell')) {
    return 'terminal';
  }
  
  // Browser
  if (appNameLower.includes('chrome') || 
      appNameLower.includes('firefox') ||
      appNameLower.includes('safari') ||
      appNameLower.includes('edge')) {
    return 'browser';
  }
  
  return 'general';
}

module.exports = {
  getActiveWindow,
  detectContextType,
};

