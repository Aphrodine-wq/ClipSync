/**
 * Embeddings Utility
 * Generate vector embeddings for semantic search
 */

/**
 * Generate embedding for text (placeholder - integrate with Ollama/OpenAI)
 */
export async function generateEmbedding(text) {
  // Placeholder: In production, call Ollama or OpenAI API
  // For now, return a simple hash-based vector
  
  // Simple TF-IDF-like approach (placeholder)
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Convert to simple vector (in production, use proper embeddings)
  const vector = new Array(384).fill(0); // 384-dim vector (typical for embeddings)
  
  Object.entries(wordFreq).forEach(([word, freq], idx) => {
    const hash = hashString(word);
    vector[hash % vector.length] += freq / words.length;
  });
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return vector.map(val => val / magnitude);
  }
  
  return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }
  
  return dotProduct / (mag1 * mag2);
}

/**
 * Hash string to number
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate embedding using Ollama (if available)
 */
export async function generateEmbeddingOllama(text, model = 'nomic-embed-text') {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.embedding;
    }
  } catch (error) {
    console.error('Ollama embedding error:', error);
  }
  
  // Fallback to simple embedding
  return generateEmbedding(text);
}

