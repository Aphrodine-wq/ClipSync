/**
 * Auto-Categorization (Frontend)
 * Client-side categorization for immediate feedback
 */

import { detectSensitiveData } from './sensitiveDataDetector.js';

// Language detection patterns (simplified)
const LANGUAGE_PATTERNS = {
  javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /=>\s*{/, /import\s+.*from/],
  python: [/def\s+\w+\s*\(/, /import\s+\w+/, /print\s*\(/],
  sql: [/SELECT\s+.*FROM/i, /INSERT\s+INTO/i, /UPDATE\s+.*SET/i],
  html: [/<!DOCTYPE\s+html>/i, /<html/i, /<div/i],
  css: [/@media/, /\.\w+\s*{/, /#\w+\s*{/],
  json: [/^\s*\{/, /^\s*\[/, /"[\w]+"\s*:/],
};

// Detect programming language
export const detectLanguage = (content) => {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const scores = {};

  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        score++;
      }
    }
    if (score > 0) {
      scores[language] = score;
    }
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
};

// Auto-categorize content
export const autoCategorize = (content, type) => {
  if (!content || typeof content !== 'string') {
    return {
      category: 'text',
      confidence: 0.5,
      language: null,
      suggestedTags: [],
    };
  }

  const contentLower = content.toLowerCase();
  const result = {
    category: 'text',
    confidence: 0.5,
    language: null,
    suggestedTags: [],
  };

  // Check for sensitive data
  const sensitiveDetection = detectSensitiveData(content);
  if (sensitiveDetection.isSensitive) {
    result.category = 'credentials';
    result.confidence = 0.9;
    result.suggestedTags.push('sensitive', 'security');
  }

  // Detect language
  if (type === 'code' || type === 'text') {
    const language = detectLanguage(content);
    if (language) {
      result.language = language;
      result.category = 'code';
      result.confidence = 0.8;
      result.suggestedTags.push(language, 'code');
    }
  }

  // Type-based tags
  switch (type) {
    case 'json':
      result.suggestedTags.push('json', 'data');
      break;
    case 'url':
      result.suggestedTags.push('url', 'link');
      break;
    case 'code':
      result.suggestedTags.push('code');
      break;
    case 'email':
      result.suggestedTags.push('email', 'contact');
      break;
    case 'ip':
      result.suggestedTags.push('ip', 'network');
      break;
    case 'uuid':
      result.suggestedTags.push('uuid', 'id');
      break;
    case 'color':
      result.suggestedTags.push('color', 'design');
      break;
    case 'token':
      result.suggestedTags.push('token', 'auth', 'security');
      break;
    case 'env':
      result.suggestedTags.push('env', 'config');
      break;
    case 'path':
      result.suggestedTags.push('path', 'file');
      break;
  }
  
  // Detect phone numbers
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  if (phonePattern.test(content)) {
    result.suggestedTags.push('phone', 'contact');
  }
  
  // Detect dates (common formats)
  const datePattern = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}-\d{2}-\d{2}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i;
  if (datePattern.test(content)) {
    result.suggestedTags.push('date', 'time');
  }

  // Remove duplicates
  result.suggestedTags = [...new Set(result.suggestedTags)];

  return result;
};

