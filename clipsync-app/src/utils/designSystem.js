/**
 * ClipSync Design System
 * A comprehensive design system for consistent, modern UI
 * 
 * Inspired by: Linear, Vercel, Stripe, Notion
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Accent Colors (Purple gradient)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Semantic Colors
  success: {
    light: '#d1fae5',
    main: '#10b981',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1d4ed8',
  },
  
  // Neutral Colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
};

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
  // Primary Gradients
  primary: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
  primaryHover: 'linear-gradient(135deg, #0284c7 0%, #6b21a8 100%)',
  
  // Accent Gradients
  accent: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  accentHover: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
  
  // Subtle Gradients
  subtle: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)',
  subtleHover: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%)',
  
  // Dark Gradients
  dark: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  darkHover: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)',
  
  // Glass Effect
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  
  // Rainbow (for special effects)
  rainbow: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)',
  
  // Mesh Gradients
  mesh: `
    radial-gradient(at 40% 20%, hsla(28,100%,74%,0.1) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(340,100%,76%,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(22,100%,77%,0.1) 0px, transparent 50%),
    radial-gradient(at 80% 100%, hsla(242,100%,70%,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 0%, hsla(343,100%,76%,0.1) 0px, transparent 50%)
  `,
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  // Elevation Shadows
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Colored Shadows
  primary: '0 10px 40px -10px rgba(14, 165, 233, 0.4)',
  accent: '0 10px 40px -10px rgba(168, 85, 247, 0.4)',
  success: '0 10px 40px -10px rgba(16, 185, 129, 0.4)',
  error: '0 10px 40px -10px rgba(239, 68, 68, 0.4)',
  
  // Glow Effects
  glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  glowAccent: '0 0 20px rgba(168, 85, 247, 0.3)',
  
  // Inner Shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  innerLg: 'inset 0 4px 8px 0 rgb(0 0 0 / 0.1)',
};

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    display: "'Cal Sans', 'Inter', sans-serif",
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ============================================
// ANIMATIONS
// ============================================

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easings
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Keyframes (as CSS strings)
  keyframes: {
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    slideUp: `
      @keyframes slideUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
    slideDown: `
      @keyframes slideDown {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
    scaleIn: `
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `,
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    spin: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
  },
};

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// ============================================
// CLIP TYPE STYLES (Enhanced)
// ============================================

export const clipTypeStyles = {
  code: {
    bg: gradients.primary,
    bgLight: 'rgba(14, 165, 233, 0.1)',
    text: '#ffffff',
    textDark: '#0284c7',
    icon: 'Code2',
    label: 'Code',
  },
  json: {
    bg: gradients.accent,
    bgLight: 'rgba(168, 85, 247, 0.1)',
    text: '#ffffff',
    textDark: '#9333ea',
    icon: 'Braces',
    label: 'JSON',
  },
  url: {
    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgLight: 'rgba(16, 185, 129, 0.1)',
    text: '#ffffff',
    textDark: '#047857',
    icon: 'Link',
    label: 'URL',
  },
  uuid: {
    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    bgLight: 'rgba(245, 158, 11, 0.1)',
    text: '#ffffff',
    textDark: '#b45309',
    icon: 'Fingerprint',
    label: 'UUID',
  },
  color: {
    bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    bgLight: 'rgba(236, 72, 153, 0.1)',
    text: '#ffffff',
    textDark: '#be185d',
    icon: 'Palette',
    label: 'Color',
  },
  email: {
    bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    bgLight: 'rgba(99, 102, 241, 0.1)',
    text: '#ffffff',
    textDark: '#4338ca',
    icon: 'Mail',
    label: 'Email',
  },
  ip: {
    bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    bgLight: 'rgba(20, 184, 166, 0.1)',
    text: '#ffffff',
    textDark: '#0f766e',
    icon: 'Globe',
    label: 'IP',
  },
  token: {
    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bgLight: 'rgba(239, 68, 68, 0.1)',
    text: '#ffffff',
    textDark: '#b91c1c',
    icon: 'Key',
    label: 'Token',
  },
  env: {
    bg: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    bgLight: 'rgba(132, 204, 22, 0.1)',
    text: '#ffffff',
    textDark: '#4d7c0f',
    icon: 'Settings2',
    label: 'ENV',
  },
  path: {
    bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    bgLight: 'rgba(249, 115, 22, 0.1)',
    text: '#ffffff',
    textDark: '#c2410c',
    icon: 'FolderOpen',
    label: 'Path',
  },
  text: {
    bg: 'linear-gradient(135deg, #71717a 0%, #52525b 100%)',
    bgLight: 'rgba(113, 113, 122, 0.1)',
    text: '#ffffff',
    textDark: '#3f3f46',
    icon: 'Type',
    label: 'Text',
  },
};

// ============================================
// COMPONENT STYLES
// ============================================

export const componentStyles = {
  // Button Variants
  button: {
    primary: {
      background: gradients.primary,
      color: colors.neutral[0],
      shadow: shadows.primary,
      hoverBackground: gradients.primaryHover,
    },
    secondary: {
      background: colors.neutral[100],
      color: colors.neutral[900],
      shadow: shadows.sm,
      hoverBackground: colors.neutral[200],
    },
    ghost: {
      background: 'transparent',
      color: colors.neutral[600],
      shadow: 'none',
      hoverBackground: colors.neutral[100],
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: colors.neutral[0],
      shadow: shadows.error,
      hoverBackground: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    },
  },
  
  // Card Variants
  card: {
    default: {
      background: colors.neutral[0],
      border: `1px solid ${colors.neutral[200]}`,
      shadow: shadows.sm,
      borderRadius: borderRadius['2xl'],
    },
    elevated: {
      background: colors.neutral[0],
      border: 'none',
      shadow: shadows.lg,
      borderRadius: borderRadius['2xl'],
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      shadow: shadows.lg,
      borderRadius: borderRadius['2xl'],
    },
    gradient: {
      background: gradients.subtle,
      border: `1px solid ${colors.neutral[200]}`,
      shadow: shadows.sm,
      borderRadius: borderRadius['2xl'],
    },
  },
  
  // Input Variants
  input: {
    default: {
      background: colors.neutral[50],
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius.xl,
      focusBorder: colors.primary[500],
      focusRing: `0 0 0 3px ${colors.primary[100]}`,
    },
    filled: {
      background: colors.neutral[100],
      border: 'none',
      borderRadius: borderRadius.xl,
      focusBorder: colors.primary[500],
      focusRing: `0 0 0 3px ${colors.primary[100]}`,
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get clip type style by type name
 */
export function getClipTypeStyle(type) {
  return clipTypeStyles[type] || clipTypeStyles.text;
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSVariables() {
  const vars = {};
  
  // Colors
  Object.entries(colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([shade, value]) => {
        vars[`--color-${category}-${shade}`] = value;
      });
    }
  });
  
  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });
  
  // Border Radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value;
  });
  
  return vars;
}

/**
 * Create a gradient string from two colors
 */
export function createGradient(from, to, angle = 135) {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Lighten a hex color
 */
export function lightenColor(hex, amount = 0.1) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color
 */
export function darkenColor(hex, amount = 0.1) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default {
  colors,
  gradients,
  shadows,
  typography,
  spacing,
  borderRadius,
  animations,
  breakpoints,
  zIndex,
  clipTypeStyles,
  componentStyles,
  getClipTypeStyle,
  generateCSSVariables,
  createGradient,
  lightenColor,
  darkenColor,
};
