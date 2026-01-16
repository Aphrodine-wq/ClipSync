/**
 * Semantic Search Service
 * Vector similarity search for natural language queries
 */

import { query } from '../config/database.js';
import { generateEmbedding, cosineSimilarity, generateEmbeddingOllama } from '../utils/embeddings.js';

/**
 * Semantic search for clips
 */
export async function semanticSearch(userId, queryText, options = {}) {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbeddingOllama(queryText);
    
    // Get all clips for user (with embeddings if available)
    const clipsResult = await query(
      `SELECT id, content, type, metadata
       FROM clips
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1000`,
      [userId]
    );

    const clips = clipsResult.rows;

    // Calculate similarity scores
    const results = [];
    
    for (const clip of clips) {
      // Generate or retrieve embedding for clip
      let clipEmbedding;
      
      // Check if embedding exists in metadata
      if (clip.metadata && clip.metadata.embedding) {
        clipEmbedding = clip.metadata.embedding;
      } else {
        // Generate embedding
        clipEmbedding = await generateEmbedding(clip.content);
        
        // Cache embedding in metadata (async update)
        updateClipEmbedding(clip.id, clipEmbedding);
      }
      
      // Calculate similarity
      const similarity = cosineSimilarity(queryEmbedding, clipEmbedding);
      
      if (similarity > (options.threshold || 0.1)) {
        results.push({
          ...clip,
          similarity,
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    // Apply limit
    const limit = options.limit || 20;
    return results.slice(0, limit);
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
}

/**
 * Update clip embedding in metadata
 */
async function updateClipEmbedding(clipId, embedding) {
  try {
    await query(
      `UPDATE clips
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb),
         '{embedding}',
         $1::jsonb
       )
       WHERE id = $2`,
      [JSON.stringify(embedding), clipId]
    );
  } catch (error) {
    console.error('Update embedding error:', error);
  }
}

/**
 * Batch generate embeddings for clips
 */
export async function batchGenerateEmbeddings(userId, limit = 100) {
  try {
    const result = await query(
      `SELECT id, content
       FROM clips
       WHERE user_id = $1 
         AND deleted_at IS NULL
         AND (metadata->>'embedding' IS NULL OR metadata->>'embedding' = 'null')
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const clips = result.rows;
    let processed = 0;

    for (const clip of clips) {
      const embedding = await generateEmbedding(clip.content);
      await updateClipEmbedding(clip.id, embedding);
      processed++;
      
      // Rate limiting: wait a bit between requests
      if (processed % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { processed, total: clips.length };
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    throw error;
  }
}

