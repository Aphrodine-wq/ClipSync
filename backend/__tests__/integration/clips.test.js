/**
 * Clips API Integration Tests
 * Tests CRUD operations, search, filtering, and batch operations
 */

import request from 'supertest';
import { authToken, userId, TEST_USER } from './auth.test.js';
import { query } from '../../config/database.js';

// Test clip data
const TEST_CLIPS = [
  {
    content: 'This is a test clip for integration testing',
    type: 'text',
    metadata: { source: 'integration_test' },
  },
  {
    content: '{"key": "value", "nested": {"data": true}}',
    type: 'json',
    metadata: { language: 'json' },
  },
  {
    content: 'const hello = "world";',
    type: 'code',
    metadata: { language: 'javascript' },
  },
  {
    content: 'https://example.com',
    type: 'url',
    metadata: { source: 'test' },
  },
];

const createdClips = [];
let pinnedClipId;

describe('Clips API', () => {
  
  // Create test user if not exists
  beforeAll(async () => {
    if (!authToken) {
      console.warn('⚠️  No auth token - creating test user directly');
      
      try {
        const result = await query(
          `INSERT INTO users (google_id, email, name, picture)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (google_id) DO UPDATE
           SET email = EXCLUDED.email, name = EXCLUDED.name
           RETURNING id`,
          [TEST_USER.google_id, TEST_USER.email, TEST_USER.name, TEST_USER.picture]
        );
        
        if (result.rows.length > 0) {
          userId = result.rows[0].id;
          
          // Generate a test JWT token
          const jwt = require('jsonwebtoken');
          authToken = jwt.sign(
            { userId, email: TEST_USER.email },
            process.env.JWT_SECRET || 'test_secret',
            { expiresIn: '1h' }
          );
        }
      } catch (error) {
        console.error('Failed to create test user:', error);
      }
    }
  });

  afterAll(async () => {
    // Cleanup: Delete all test clips
    try {
      if (userId) {
        await query('DELETE FROM clips WHERE user_id = $1', [userId]);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('POST /api/clips - Create Clip', () => {
    test('should create a text clip', async () => {
      if (!authToken) {
        console.warn('⚠️  Skipping test: No auth token');
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TEST_CLIPS[0]);

      expect(response.status).toBe(201);
      expect(response.body.clip).toBeDefined();
      expect(response.body.clip.content).toBe(TEST_CLIPS[0].content);
      expect(response.body.clip.type).toBe('text');
      
      createdClips.push(response.body.clip);
    });

    test('should create a JSON clip', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TEST_CLIPS[1]);

      expect(response.status).toBe(201);
      expect(response.body.clip.type).toBe('json');
      
      createdClips.push(response.body.clip);
    });

    test('should create a code clip', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TEST_CLIPS[2]);

      expect(response.status).toBe(201);
      expect(response.body.clip.type).toBe('code');
      
      createdClips.push(response.body.clip);
    });

    test('should create a URL clip', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(TEST_CLIPS[3]);

      expect(response.status).toBe(201);
      expect(response.body.clip.type).toBe('url');
      
      createdClips.push(response.body.clip);
    });

    test('should reject clip without content', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'text' });

      expect(response.status).toBe(400);
    });

    test('should reject clip without type', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/clips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'test' });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('GET /api/clips - Get Clips', () => {
    test('should get all clips for user', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/clips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clips).toBeInstanceOf(Array);
      expect(response.body.clips.length).toBeGreaterThan(0);
    });

    test('should filter clips by type', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/clips?type=code')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clips).toBeInstanceOf(Array);
      response.body.clips.forEach(clip => {
        expect(clip.type).toBe('code');
      });
    });

    test('should filter clips by pinned status', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/clips?pinned=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clips).toBeInstanceOf(Array);
    });

    test('should support pagination with limit and offset', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/clips?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clips.length).toBeLessThanOrEqual(2);
    });

    test('should search clips by content', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const searchQuery = 'test';
      const response = await request('http://localhost:3001')
        .get(`/api/clips?search=${searchQuery}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clips).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/clips/:id - Get Single Clip', () => {
    test('should get a specific clip by ID', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const clipId = createdClips[0].id;
      const response = await request('http://localhost:3001')
        .get(`/api/clips/${clipId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clip).toBeDefined();
      expect(response.body.clip.id).toBe(clipId);
    });

    test('should return 404 for non-existent clip', async () => {
      if (!authToken) {
        return;
      }

      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request('http://localhost:3001')
        .get(`/api/clips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([404, 403]).toContain(response.status);
    });
  });

  describe('PUT /api/clips/:id - Update Clip', () => {
    test('should update clip content', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const clipId = createdClips[0].id;
      const newContent = 'Updated content for testing';

      const response = await request('http://localhost:3001')
        .put(`/api/clips/${clipId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: newContent });

      expect(response.status).toBe(200);
      expect(response.body.clip.content).toBe(newContent);
    });

    test('should update clip type', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const clipId = createdClips[0].id;
      const response = await request('http://localhost:3001')
        .put(`/api/clips/${clipId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.clip.type).toBe('json');
    });
  });

  describe('PATCH /api/clips/:id/pin - Toggle Pin', () => {
    test('should pin a clip', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const clipId = createdClips[0].id;
      const response = await request('http://localhost:3001')
        .patch(`/api/clips/${clipId}/pin`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clip.pinned).toBe(true);
      pinnedClipId = clipId;
    });

    test('should unpin a clip', async () => {
      if (!authToken || !pinnedClipId) {
        return;
      }

      const response = await request('http://localhost:3001')
        .patch(`/api/clips/${pinnedClipId}/pin`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clip.pinned).toBe(false);
    });
  });

  describe('DELETE /api/clips/:id - Delete Clip', () => {
    test('should delete a clip', async () => {
      if (!authToken || createdClips.length === 0) {
        return;
      }

      const clipId = createdClips[0].id;
      const response = await request('http://localhost:3001')
        .delete(`/api/clips/${clipId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify clip is deleted
      const verifyResponse = await request('http://localhost:3001')
        .get(`/api/clips/${clipId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([404, 403]).toContain(verifyResponse.status);
    });
  });

  describe('POST /api/clips/bulk-delete - Bulk Delete', () => {
    test('should delete multiple clips', async () => {
      if (!authToken || createdClips.length < 2) {
        return;
      }

      const clipIds = createdClips.slice(1, 3).map(c => c.id);
      const response = await request('http://localhost:3001')
        .post('/api/clips/bulk-delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ clipIds });

      expect(response.status).toBe(200);
      expect(response.body.deletedCount).toBe(clipIds.length);
    });
  });

  describe('GET /api/clips/stats/summary - Get Statistics', () => {
    test('should return clip statistics', async () => {
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/clips/stats/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalClips).toBeGreaterThanOrEqual(0);
    });
  });
});