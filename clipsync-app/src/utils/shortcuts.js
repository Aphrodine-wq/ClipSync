/**
 * Keyboard Shortcuts System
 * Manages customizable keyboard shortcuts
 */

const DEFAULT_SHORTCUTS = {
  openApp: 'Ctrl+Shift+V',
  search: 'Ctrl+K',
  newClip: 'Ctrl+N',
  paste: 'Ctrl+V',
  copy: 'Ctrl+C',
  pin: 'Ctrl+P',
  delete: 'Delete',
  nextClip: 'Ctrl+ArrowDown',
  prevClip: 'Ctrl+ArrowUp',
};

let shortcuts = { ...DEFAULT_SHORTCUTS };
const handlers = {};

/**
 * Initialize shortcuts
 */
export function initShortcuts() {
  // Load saved shortcuts
  const saved = localStorage.getItem('clipsync-shortcuts');
  if (saved) {
    try {
      shortcuts = { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load shortcuts:', e);
    }
  }

  // Setup global listeners
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Register a shortcut handler
 */
export function registerShortcut(name, handler) {
  handlers[name] = handler;
}

/**
 * Unregister a shortcut handler
 */
export function unregisterShortcut(name) {
  delete handlers[name];
}

/**
 * Parse key combo from event
 */
export function parseKeyCombo(e) {
  return getKeyString(e);
}

/**
 * Validate shortcut
 */
export function validateShortcut(keyString, command) {
  return checkConflicts(keyString, command);
}

/**
 * Update shortcut
 */
export function updateShortcut(command, keyString) {
  setShortcut(command, keyString);
}

/**
 * Handle keydown event
 */
function handleKeyDown(e) {
  const key = getKeyString(e);
  const shortcutName = findShortcut(key);

  if (shortcutName && handlers[shortcutName]) {
    e.preventDefault();
    handlers[shortcutName](e);
  }
}

/**
 * Get key string from event
 */
export function getKeyString(e) {
  const parts = [];

  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');

  // Map special keys
  const keyMap = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Enter: 'Enter',
    Escape: 'Escape',
    Delete: 'Delete',
    Backspace: 'Backspace',
    Tab: 'Tab',
    Space: 'Space',
  };

  const key = keyMap[e.key] || e.key.toUpperCase();
  parts.push(key);

  return parts.join('+');
}

/**
 * Find shortcut by key string
 */
function findShortcut(keyString) {
  for (const [name, shortcut] of Object.entries(shortcuts)) {
    if (normalizeShortcut(shortcut) === normalizeShortcut(keyString)) {
      return name;
    }
  }
  return null;
}

/**
 * Normalize shortcut string
 */
function normalizeShortcut(shortcut) {
  return shortcut
    .split('+')
    .map(s => s.trim())
    .sort()
    .join('+')
    .toLowerCase();
}

/**
 * Set shortcut
 */
export function setShortcut(name, shortcut) {
  shortcuts[name] = shortcut;
  localStorage.setItem('clipsync-shortcuts', JSON.stringify(shortcuts));
}

/**
 * Get shortcut
 */
export function getShortcut(name) {
  return shortcuts[name] || DEFAULT_SHORTCUTS[name];
}

/**
 * Get all shortcuts
 */
export function getAllShortcuts() {
  return { ...shortcuts };
}

/**
 * Reset shortcuts to defaults
 */
export function resetShortcuts() {
  shortcuts = { ...DEFAULT_SHORTCUTS };
  localStorage.setItem('clipsync-shortcuts', JSON.stringify(shortcuts));
}

/**
 * Check for conflicts
 */
export function checkConflicts(newShortcut, excludeName = null) {
  const normalized = normalizeShortcut(newShortcut);
  
  for (const [name, shortcut] of Object.entries(shortcuts)) {
    if (name !== excludeName && normalizeShortcut(shortcut) === normalized) {
      return { conflict: true, with: name };
    }
  }
  
  return { conflict: false };
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut) {
  return shortcut
    .split('+')
    .map(key => {
      if (key === 'Ctrl') return '⌃';
      if (key === 'Shift') return '⇧';
      if (key === 'Alt') return '⌥';
      if (key === 'Meta') return '⌘';
      return key;
    })
    .join(' + ');
}
