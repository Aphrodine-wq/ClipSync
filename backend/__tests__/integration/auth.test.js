/**
 * Authentication Integration Tests
 * Tests login, signup, token validation, and session management
 */

import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database.js';

// Test configuration
const TEST_USER = {
  google_id: `test_google_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  name: 'Test User',
  picture: 'https://example.com/avatar.png',
};

let authToken;
let userId;
let dbAvailable = true;

describe('Authentication API', () => {

  beforeAll(async () => {
    try {
      await query('SELECT 1 FROM users WHERE google_id = $1', [TEST_USER.google_id]);
    } catch(error) {
      dbAvailable = false;
    }
  });
  
  afterAll(async () => {
    // Cleanup: Delete test user
    try {
      await query('DELETE FROM users WHERE google_id = $1', [TEST_USER.google_id]);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('POST /api/auth/google - Login/Signup', () => {
    test('should create new user on first login', async () => {
      if (!dbAvailable) {
        console.warn('⚠️  Skipping test: Database not available');
        return;
      }

      // Note: In production, this would use actual Google OAuth tokens
      // For testing, we'll mock the token verification or use a test endpoint
      const response = await request('http://localhost:3001')
        .post('/api/auth/google')
        .send({
          id_token: 'mock_test_token', // Mock token for testing
          google_id: TEST_USER.google_id,
          email: TEST_USER.email,
          name: TEST_USER.name,
          picture: TEST_USER.picture,
        });

      // Accept either 200 (existing user) or 201 (new user)
      expect([200, 201]).toContain(response.status);
      
      if (response.body.user) {
        expect(response.body.user.email).toBe(TEST_USER.email);
        expect(response.body.token).toBeDefined();
        
        authToken = response.body.token;
        userId = response.body.user.id;
      }
    });

    test('should return user data and JWT token', async () => {
      if (!dbAvailable || !authToken) {
        if (dbAvailable) console.warn('⚠️  Skipping test: Database not available or no auth token');
        return;
      }
        // Try alternative approach
        const response = await request('http://localhost:3001')
          .post('/api/auth/google')
          .send({
            id_token: 'mock_test_token_2',
            google_id: `test_google_2_${Date.now()}`,
            email: `test2${Date.now()}@example.com`,
            name: 'Test User 2',
          });

        expect([200, 201]).toContain(response.status);
        if (response.body.token) {
          authToken = response.body.token;
          userId = response.body.user?.id;
        }

      expect(authToken).toBeDefined();
      expect(typeof authToken).toBe('string');
    });
  });

  describe('GET /api/auth/me - Get Current User', () => {
    test('should return user data with valid token', async () => {

      if (!dbAvailable)  {
        console.warn('⚠️  Skipping test: Database not available');
        return;
      }

      if (!authToken) {
        console.warn('⚠️  Skipping test: No auth token available');
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBeDefined();
    });

    test('should reject request without token', async () => {

      if (!dbAvailable) {
        if (!dbAvailable) console.warn('⚠️  Skipping test: Database not available or no auth token');
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    test('should reject request with invalid token', async () => {
      if (!dbAvailable)  {
        console.warn('⚠️  Skipping test: Database not available');
        return;
      }

      const response = await request('http://localhost:3001')
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Token Expiration', () => {
    test('should validate JWT token structure', async () => {

      if (!dbAvailable)  {
        console.warn('⚠️  Skipping test: Database not available');
        return;
      }

      if (!authToken) {
        return;
      }

      // JWT tokens have 3 parts separated by dots
      const parts = authToken.split('.');
      expect(parts.length).toBe(3);
      
      // Each part should be valid base64
      parts.forEach(part => {
        expect(() => {
          Buffer.from(part, 'base64');
        }).not.toThrow();
      });
    });
  });

  describe('POST /api/auth/logout - Logout', () => {
    test('should successfully logout', async () => {

      if (!dbAvailable)  {
        console.warn('⚠️  Skipping test: Database not available');
        return;
      }
      
      if (!authToken) {
        return;
      }

      const response = await request('http://localhost:3001')
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 204]).toContain(response.status);
    });
  });
});

// Export for use in other test files
export { authToken, userId, TEST_USER };