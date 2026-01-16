/**
 * Hotkey Manager
 * Global hotkey registration for desktop app
 */

const { globalShortcut } = require('electron');

class HotkeyManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.registeredShortcuts = new Map();
  }

  /**
   * Register hotkey for clip
   */
  registerShortcut(shortcut, clipId, handler) {
    try {
      // Normalize shortcut for platform
      const normalized = this.normalizeShortcut(shortcut);
      
      // Unregister if already exists
      if (this.registeredShortcuts.has(normalized)) {
        this.unregisterShortcut(normalized);
      }

      // Register global shortcut
      const success = globalShortcut.register(normalized, () => {
        if (handler) {
          handler(clipId);
        } else {
          // Default: copy clip to clipboard
          this.mainWindow.webContents.send('hotkey-triggered', { shortcut, clipId });
        }
      });

      if (success) {
        this.registeredShortcuts.set(normalized, { clipId, handler, original: shortcut });
        return true;
      } else {
        console.error(`Failed to register shortcut: ${shortcut}`);
        return false;
      }
    } catch (error) {
      console.error('Hotkey registration error:', error);
      return false;
    }
  }

  /**
   * Unregister hotkey
   */
  unregisterShortcut(shortcut) {
    const normalized = this.normalizeShortcut(shortcut);
    
    if (this.registeredShortcuts.has(normalized)) {
      globalShortcut.unregister(normalized);
      this.registeredShortcuts.delete(normalized);
      return true;
    }
    
    return false;
  }

  /**
   * Unregister all shortcuts
   */
  unregisterAll() {
    for (const [shortcut] of this.registeredShortcuts) {
      globalShortcut.unregister(shortcut);
    }
    this.registeredShortcuts.clear();
  }

  /**
   * Normalize shortcut for platform
   */
  normalizeShortcut(shortcut) {
    // Convert platform-specific modifiers
    const isMac = process.platform === 'darwin';
    
    let normalized = shortcut;
    
    if (isMac) {
      // Mac: Ctrl -> Cmd, Meta -> Cmd
      normalized = normalized.replace(/Ctrl/g, 'Command');
      normalized = normalized.replace(/Meta/g, 'Command');
    } else {
      // Windows/Linux: Cmd -> Ctrl
      normalized = normalized.replace(/Cmd/g, 'Ctrl');
      normalized = normalized.replace(/Command/g, 'Ctrl');
    }
    
    return normalized;
  }

  /**
   * Get all registered shortcuts
   */
  getRegisteredShortcuts() {
    return Array.from(this.registeredShortcuts.entries()).map(([shortcut, data]) => ({
      shortcut: data.original,
      normalized: shortcut,
      clipId: data.clipId,
    }));
  }

  /**
   * Check if shortcut is available
   */
  isAvailable(shortcut) {
    const normalized = this.normalizeShortcut(shortcut);
    return !this.registeredShortcuts.has(normalized);
  }
}

module.exports = HotkeyManager;

