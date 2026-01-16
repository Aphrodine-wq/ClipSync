/**
 * Clips API Integration Tests
 */

import request from 'supertest';
import app from '../../server.js';

describe('Clips API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup: Create test user and get token
    // In production, use test database and fixtures
  });

  test('should create a clip', async () => {
    const response = await request(app)
      .post('/api/clips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Test clip',
        type: 'text',
      });

    expect(response.status).toBe(201);
    expect(response.body.clip).toBeDefined();
    expect(response.body.clip.content).toBe('Test clip');
  });

  test('should get clips', async () => {
    const response = await request(app)
      .get('/api/clips')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.clips).toBeInstanceOf(Array);
  });

  test('should search clips', async () => {
    const response = await request(app)
      .get('/api/clips?search=test')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.clips).toBeInstanceOf(Array);
  });
});

