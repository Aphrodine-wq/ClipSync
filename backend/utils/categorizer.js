/**
 * Auto-Categorization System
 * Automatically categorizes clips based on content analysis
 */

import { detectSensitiveData } from './sensitiveDataDetector.js';

// Category definitions
export const CATEGORIES = {
  CODE: 'code',
  CONFIG: 'config',
  CREDENTIALS: 'credentials',
  URL: 'url',
  TEXT: 'text',
  DATA: 'data',
  COMMAND: 'command',
};

// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript: [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/,
    /=>\s*{/,
    /import\s+.*from/,
    /export\s+(default|const|function|class)/,
    /console\.(log|error|warn)/,
    /\.jsx?$/,
  ],
  python: [
    /def\s+\w+\s*\(/,
    /import\s+\w+/,
    /from\s+\w+\s+import/,
    /print\s*\(/,
    /if\s+__name__\s*==\s*['"]__main__['"]/,
    /\.py$/,
  ],
  java: [
    /public\s+(class|void|static)/,
    /private\s+(class|void|static)/,
    /@Override/,
    /package\s+\w+/,
    /\.java$/,
  ],
  sql: [
    /SELECT\s+.*FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*SET/i,
    /DELETE\s+FROM/i,
    /CREATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
  ],
  html: [
    /<!DOCTYPE\s+html>/i,
    /<html/i,
    /<head/i,
    /<body/i,
    /<div/i,
    /<script/i,
  ],
  css: [
    /@media/,
    /@keyframes/,
    /\.\w+\s*{/,
    /#\w+\s*{/,
    /:\s*[\w-]+\s*;/,
  ],
  json: [
    /^\s*\{/,
    /^\s*\[/,
    /"[\w]+"\s*:/,
  ],
  yaml: [
    /^[\w-]+:/,
    /^\s+-\s+/,
    /^\s+\w+:/,
  ],
  shell: [
    /^#!/,
    /^\$\s/,
    /if\s+\[/,
    /echo\s+/,
    /cd\s+/,
    /ls\s+/,
    /grep\s+/,
  ],
};

// Keyword-based categorization
const KEYWORD_CATEGORIES = {
  [CATEGORIES.CREDENTIALS]: [
    'password', 'api key', 'secret', 'token', 'credential',
    'aws_access', 'private_key', 'oauth', 'bearer',
  ],
  [CATEGORIES.CONFIG]: [
    'config', 'setting', 'environment', 'env', '.env',
    'dockerfile', 'docker-compose', 'package.json',
  ],
  [CATEGORIES.COMMAND]: [
    'npm install', 'git', 'docker', 'kubectl', 'aws',
    'curl', 'wget', 'ssh', 'scp',
  ],
  [CATEGORIES.DATA]: [
    'json', 'csv', 'xml', 'yaml', 'toml',
  ],
};

/**
 * Detect programming language from code content
 */
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

  // Return language with highest score
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
};

/**
 * Auto-categorize clip content
 */
export const autoCategorize = (content, type) => {
  if (!content || typeof content !== 'string') {
    return {
      category: CATEGORIES.TEXT,
      confidence: 0.5,
      language: null,
      tags: [],
    };
  }

  const contentLower = content.toLowerCase();
  const result = {
    category: CATEGORIES.TEXT,
    confidence: 0.5,
    language: null,
    tags: [],
  };

  // Check for sensitive data
  const sensitiveDetection = detectSensitiveData(content);
  if (sensitiveDetection.isSensitive) {
    result.category = CATEGORIES.CREDENTIALS;
    result.confidence = 0.9;
    result.tags.push('sensitive', 'security');
  }

  // Detect language for code
  if (type === 'code' || type === 'text') {
    const language = detectLanguage(content);
    if (language) {
      result.language = language;
      result.category = CATEGORIES.CODE;
      result.confidence = 0.8;
      result.tags.push(language, 'code');
    }
  }

  // Keyword-based categorization
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        if (result.confidence < 0.7) {
          result.category = category;
          result.confidence = 0.7;
        }
        result.tags.push(keyword.replace(/\s+/g, '-'));
        break;
      }
    }
  }

  // Type-based categorization
  switch (type) {
    case 'json':
    case 'yaml':
    case 'xml':
      result.category = CATEGORIES.DATA;
      result.confidence = 0.9;
      result.tags.push(type, 'data');
      break;
    case 'url':
      result.category = CATEGORIES.URL;
      result.confidence = 0.9;
      result.tags.push('url', 'link');
      break;
    case 'code':
      if (!result.language) {
        result.category = CATEGORIES.CODE;
        result.confidence = 0.7;
        result.tags.push('code');
      }
      break;
  }

  // Remove duplicate tags
  result.tags = [...new Set(result.tags)];

  return result;
};

/**
 * Suggest smart folder based on categorization
 */
export const suggestSmartFolder = (categorization) => {
  const { category, language, tags } = categorization;

  const suggestions = [];

  if (category === CATEGORIES.CODE && language) {
    suggestions.push(`Code/${language.charAt(0).toUpperCase() + language.slice(1)}`);
  }

  if (category === CATEGORIES.CREDENTIALS) {
    suggestions.push('Security/Credentials');
  }

  if (category === CATEGORIES.CONFIG) {
    suggestions.push('Configuration');
  }

  if (tags.includes('sensitive') || tags.includes('security')) {
    suggestions.push('Security');
  }

  if (category === CATEGORIES.URL) {
    suggestions.push('Links');
  }

  if (category === CATEGORIES.DATA) {
    suggestions.push('Data');
  }

  return suggestions.length > 0 ? suggestions[0] : 'General';
};

