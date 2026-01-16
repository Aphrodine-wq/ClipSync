/**
 * Smart Paste System
 * Context-aware formatting and auto-conversion
 */

const { clipboard } = require('electron');
const { getActiveWindow } = require('./contextDetector');

/**
 * Smart paste with context-aware formatting
 */
async function smartPaste(content, options = {}) {
  try {
    // Detect active application context
    const context = await getActiveWindow();
    
    // Transform content based on context
    let transformed = content;
    
    // Auto-format based on application
    if (context.appName) {
      transformed = await formatForApp(content, context.appName);
    }
    
    // Auto-convert based on content type
    transformed = await autoConvert(transformed, context);
    
    // Paste transformed content
    clipboard.writeText(transformed);
    
    // Simulate paste (application-specific)
    if (options.autoPaste) {
      await simulatePaste(context);
    }
    
    return transformed;
  } catch (error) {
    console.error('Smart paste error:', error);
    return content;
  }
}

/**
 * Format content for specific application
 */
async function formatForApp(content, appName) {
  const appNameLower = appName.toLowerCase();
  
  // VS Code / Editors
  if (appNameLower.includes('code') || appNameLower.includes('editor')) {
    // Ensure proper indentation for code
    return ensureCodeFormatting(content);
  }
  
  // Slack / Messaging
  if (appNameLower.includes('slack') || appNameLower.includes('discord')) {
    // Convert URLs to markdown links
    return convertLinksToMarkdown(content);
  }
  
  // Email clients
  if (appNameLower.includes('mail') || appNameLower.includes('outlook')) {
    // Format for email (clean up, proper line breaks)
    return formatForEmail(content);
  }
  
  // Terminal
  if (appNameLower.includes('terminal') || appNameLower.includes('cmd')) {
    // Escape special characters
    return escapeForTerminal(content);
  }
  
  return content;
}

/**
 * Auto-convert based on content type
 */
async function autoConvert(content, context) {
  // Detect content type
  const type = detectContentType(content);
  
  switch (type) {
    case 'url':
      // If in browser, just paste URL
      // If in markdown editor, convert to link
      if (context.appName && context.appName.toLowerCase().includes('markdown')) {
        return `[${content}](${content})`;
      }
      return content;
      
    case 'json':
      // If in code editor, format JSON
      if (context.appName && context.appName.toLowerCase().includes('code')) {
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch (e) {
          return content;
        }
      }
      return content;
      
    case 'email':
      // Convert to mailto link if in markdown/HTML context
      if (context.appName && (context.appName.toLowerCase().includes('markdown') || 
                              context.appName.toLowerCase().includes('html'))) {
        return `<a href="mailto:${content}">${content}</a>`;
      }
      return content;
      
    default:
      return content;
  }
}

/**
 * Detect content type
 */
function detectContentType(content) {
  // URL
  if (/^https?:\/\/.+/.test(content.trim())) {
    return 'url';
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.trim())) {
    return 'email';
  }
  
  // JSON
  if (/^[\s\n]*[\{\[].*[\}\]]/.test(content.trim())) {
    try {
      JSON.parse(content);
      return 'json';
    } catch (e) {
      // Not valid JSON
    }
  }
  
  return 'text';
}

/**
 * Ensure code formatting
 */
function ensureCodeFormatting(content) {
  // Basic indentation fix
  const lines = content.split('\n');
  let indentLevel = 0;
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // Decrease indent for closing braces
    if (trimmed.match(/^[\}\]\)]/)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const indented = '  '.repeat(indentLevel) + trimmed;
    
    // Increase indent for opening braces
    if (trimmed.match(/[{\[\(]$/)) {
      indentLevel++;
    }
    
    return indented;
  }).join('\n');
}

/**
 * Convert URLs to markdown links
 */
function convertLinksToMarkdown(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(urlRegex, '<$1>');
}

/**
 * Format for email
 */
function formatForEmail(content) {
  // Remove excessive line breaks
  return content
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Escape for terminal
 */
function escapeForTerminal(content) {
  // Escape special shell characters
  return content
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`');
}

/**
 * Simulate paste action
 */
async function simulatePaste(context) {
  // Use keyboard shortcut to paste (Cmd+V / Ctrl+V)
  const { globalShortcut } = require('electron');
  // In production, use robotjs or similar library
  // robotjs.keyTap('v', process.platform === 'darwin' ? 'command' : 'control');
}

module.exports = {
  smartPaste,
  formatForApp,
  autoConvert,
};

