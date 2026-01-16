// Clipboard API utilities

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        throw new Error('Failed to copy');
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
};

// Read from clipboard
export const readFromClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text;
    } else {
      throw new Error('Clipboard API not supported');
    }
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    throw error;
  }
};

// Check if clipboard API is available
export const isClipboardAvailable = () => {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
};

// Request clipboard permissions
export const requestClipboardPermission = async () => {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'clipboard-read' });
      return result.state === 'granted' || result.state === 'prompt';
    }
    return true; // Assume available if permissions API not supported
  } catch (error) {
    console.error('Failed to check clipboard permission:', error);
    return false;
  }
};

// Format relative time
export const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hr ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};

// Truncate text for display
export const truncateText = (text, maxLength = 80) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Check if content is duplicate and return existing clip if found
export const isDuplicate = (content, existingClips) => {
  return existingClips.find(clip => clip.content === content) || null;
};

// Check if content is a duplicate (boolean check)
export const hasDuplicate = (content, existingClips) => {
  return existingClips.some(clip => clip.content === content);
};

// Detect source from content patterns
export const detectSourceFromContent = (content) => {
  // Try to detect source based on content patterns
  // This is a fallback - in a real implementation, you might use
  // clipboard API metadata if available
  if (content.includes('file://') || content.includes('C:\\') || content.includes('/Users/')) {
    return 'File Path';
  }
  if (content.includes('http://') || content.includes('https://')) {
    return 'Browser';
  }
  if (content.includes('function ') || content.includes('const ') || content.includes('import ')) {
    return 'Code Editor';
  }
  if (content.includes('@') && content.includes('.')) {
    return 'Email Client';
  }
  return 'Unknown';
};

// Sanitize content (remove sensitive patterns)
export const sanitizeContent = (content) => {
  // This is a basic implementation - in production, you'd want more sophisticated detection
  const sensitivePatterns = [
    /password\s*[:=]\s*\S+/gi,
    /api[_-]?key\s*[:=]\s*\S+/gi,
    /secret\s*[:=]\s*\S+/gi,
    /token\s*[:=]\s*\S+/gi,
  ];
  
  let sanitized = content;
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  return sanitized;
};

// Detect if content should be captured
export const shouldCapture = (content) => {
  // Don't capture empty or very short content
  if (!content || content.trim().length < 2) return false;
  
  // Don't capture single characters or whitespace
  if (content.trim().length === 1) return false;
  
  return true;
};

// Paste as plain text (strips all formatting)
export const pasteAsPlainText = async (text) => {
  try {
    // Create a temporary textarea to strip formatting
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    // Use execCommand for maximum compatibility
    const success = document.execCommand('paste');
    textarea.remove();
    
    if (!success) {
      // Fallback: just copy the plain text
      await copyToClipboard(text);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to paste as plain text:', error);
    // Fallback to regular copy
    return await copyToClipboard(text);
  }
};
