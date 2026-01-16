// Nintendo DS Pictochat-inspired color palette for users
export const USER_COLORS = [
  { 
    name: 'Ocean Blue', 
    bg: '#3B82F6', 
    text: '#FFFFFF', 
    light: '#DBEAFE',
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
  },
  { 
    name: 'Sunset Orange', 
    bg: '#F97316', 
    text: '#FFFFFF', 
    light: '#FFEDD5',
    dark: '#C2410C',
    gradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)'
  },
  { 
    name: 'Forest Green', 
    bg: '#10B981', 
    text: '#FFFFFF', 
    light: '#D1FAE5',
    dark: '#047857',
    gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
  },
  { 
    name: 'Royal Purple', 
    bg: '#8B5CF6', 
    text: '#FFFFFF', 
    light: '#EDE9FE',
    dark: '#6D28D9',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
  },
  { 
    name: 'Cherry Red', 
    bg: '#EF4444', 
    text: '#FFFFFF', 
    light: '#FEE2E2',
    dark: '#B91C1C',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
  },
  { 
    name: 'Sunshine Yellow', 
    bg: '#F59E0B', 
    text: '#FFFFFF', 
    light: '#FEF3C7',
    dark: '#B45309',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
  },
  { 
    name: 'Bubblegum Pink', 
    bg: '#EC4899', 
    text: '#FFFFFF', 
    light: '#FCE7F3',
    dark: '#BE185D',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
  },
  { 
    name: 'Mint Green', 
    bg: '#14B8A6', 
    text: '#FFFFFF', 
    light: '#CCFBF1',
    dark: '#0F766E',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)'
  },
  { 
    name: 'Lavender', 
    bg: '#A78BFA', 
    text: '#FFFFFF', 
    light: '#EDE9FE',
    dark: '#7C3AED',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)'
  },
  { 
    name: 'Coral', 
    bg: '#FB923C', 
    text: '#FFFFFF', 
    light: '#FFEDD5',
    dark: '#EA580C',
    gradient: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)'
  },
  { 
    name: 'Sky Blue', 
    bg: '#0EA5E9', 
    text: '#FFFFFF', 
    light: '#E0F2FE',
    dark: '#0369A1',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)'
  },
  { 
    name: 'Lime', 
    bg: '#84CC16', 
    text: '#FFFFFF', 
    light: '#ECFCCB',
    dark: '#4D7C0F',
    gradient: 'linear-gradient(135deg, #84CC16 0%, #4D7C0F 100%)'
  },
];

/**
 * Get a consistent color for a user based on their ID
 * Uses a simple hash function to ensure the same user always gets the same color
 */
export function getUserColor(userId) {
  if (!userId) {
    return USER_COLORS[0]; // Default to first color
  }

  // Simple hash function
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

/**
 * Get color by index (for manual selection)
 */
export function getColorByIndex(index) {
  return USER_COLORS[index % USER_COLORS.length];
}

/**
 * Get all available colors
 */
export function getAllColors() {
  return USER_COLORS;
}

/**
 * Get a random color (for new users without preference)
 */
export function getRandomColor() {
  const index = Math.floor(Math.random() * USER_COLORS.length);
  return USER_COLORS[index];
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a lighter version of a color (for hover states)
 */
export function lightenColor(color, amount = 0.1) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
