/**
 * Theme System
 * Manages themes and customization
 */

const THEMES = {
  light: {
    name: 'Light',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
    },
  },
  blue: {
    name: 'Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#ffffff',
      surface: '#eff6ff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#dbeafe',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    },
  },
  green: {
    name: 'Green',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1fae5',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    },
  },
};

/**
 * Get current theme
 */
export function getCurrentTheme() {
  const saved = localStorage.getItem('clipsync-theme');
  return saved && THEMES[saved] ? THEMES[saved] : THEMES.light;
}

/**
 * Set theme
 */
export function setTheme(themeName) {
  if (!THEMES[themeName]) {
    console.warn(`Theme ${themeName} not found`);
    return;
  }

  localStorage.setItem('clipsync-theme', themeName);
  applyTheme(THEMES[themeName]);
}

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

/**
 * Get all available themes
 */
export function getThemes() {
  return Object.keys(THEMES).map(key => ({
    id: key,
    ...THEMES[key],
  }));
}

/**
 * Initialize theme on load
 */
export function initTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);
}

/**
 * Create custom theme
 */
export function createCustomTheme(name, colors) {
  const customTheme = {
    name,
    colors: {
      ...THEMES.light.colors,
      ...colors,
    },
  };

  // Store in localStorage
  const customThemes = JSON.parse(localStorage.getItem('clipsync-custom-themes') || '{}');
  customThemes[name.toLowerCase().replace(/\s+/g, '-')] = customTheme;
  localStorage.setItem('clipsync-custom-themes', JSON.stringify(customThemes));

  return customTheme;
}

/**
 * Get custom themes
 */
export function getCustomThemes() {
  const customThemes = JSON.parse(localStorage.getItem('clipsync-custom-themes') || '{}');
  return Object.values(customThemes);
}

