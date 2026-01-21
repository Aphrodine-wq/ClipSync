// Text transformation utilities ported for Mobile
// Matches features from clipsync-app/src/utils/transforms.js

// Case transformations
export const toLowerCase = (text: string): string => text.toLowerCase();
export const toUpperCase = (text: string): string => text.toUpperCase();
export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const toCamelCase = (text: string): string => {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

export const toSnakeCase = (text: string): string => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};

export const toKebabCase = (text: string): string => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('-');
};

export const toPascalCase = (text: string): string => {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Text utilities
export const trimWhitespace = (text: string): string => text.trim();

export const collapseWhitespace = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

export const reverseString = (text: string): string => text.split('').reverse().join('');

// JSON utilities
export const beautifyJSON = (text: string): string => {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    return text; // Return original on error
  }
};

export const minifyJSON = (text: string): string => {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed);
  } catch (error) {
    return text;
  }
};

export interface Transformer {
  id: string;
  name: string;
  fn: (text: string) => string;
  category: 'case' | 'format' | 'util';
}

export const TRANSFORMS: Transformer[] = [
  { id: 'upper', name: 'UPPERCASE', fn: toUpperCase, category: 'case' },
  { id: 'lower', name: 'lowercase', fn: toLowerCase, category: 'case' },
  { id: 'title', name: 'Title Case', fn: toTitleCase, category: 'case' },
  { id: 'camel', name: 'camelCase', fn: toCamelCase, category: 'case' },
  { id: 'snake', name: 'snake_case', fn: toSnakeCase, category: 'case' },
  { id: 'kebab', name: 'kebab-case', fn: toKebabCase, category: 'case' },
  { id: 'pascal', name: 'PascalCase', fn: toPascalCase, category: 'case' },
  { id: 'json-pretty', name: 'Beautify JSON', fn: beautifyJSON, category: 'format' },
  { id: 'json-mini', name: 'Minify JSON', fn: minifyJSON, category: 'format' },
  { id: 'trim', name: 'Trim Whitespace', fn: trimWhitespace, category: 'util' },
  { id: 'collapse', name: 'Collapse Spaces', fn: collapseWhitespace, category: 'util' },
  { id: 'reverse', name: 'Reverse', fn: reverseString, category: 'util' },
];
