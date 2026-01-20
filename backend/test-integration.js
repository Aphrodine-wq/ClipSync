#!/usr/bin/env node

/**
 * Manual Integration Test Script
 * Tests ClipSync backend API endpoints
 */

import { query } from './config/database.js';

const API_URL = 'http://localhost:3001';
const TEST_USER = {
  google_id: `test_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  name: 'Test User',
};

let authToken;
let userId;
let testClips = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}▸ ${name}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}  ✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}  ✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.yellow}  ℹ ${message}${colors.reset}`);
}

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClipSync-Integration-Test/1.0',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function setupTestUser() {
  logTest('Setting up test user');
  
  try {
    const result = await query(
      `INSERT INTO users (google_id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email
       RETURNING id`,
      [TEST_USER.google_id, TEST_USER.email, TEST_USER.name, 'https://example.com/avatar.png']
    );
    
    if (result.rows.length > 0) {
      userId = result.rows[0].id;
      
      // Generate test JWT
      const jwt = (await import('jsonwebtoken')).default;
      authToken = jwt.sign(
        { userId, email: TEST_USER.email },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );
      
      logSuccess(`Test user created: ${TEST_USER.email}`);
      logInfo(`User ID: ${userId}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to create test user: ${error.message}`);
    return false;
  }
}

async function testHealthCheck() {
  logTest('Health Check');
  
  const { status, data } = await fetchAPI('/health');
  
  if (status === 200) {
    logSuccess('Health check passed');
    logInfo(`Status: ${data.status}`);
    logInfo(`Database: ${data.services.database?.status || 'unknown'}`);
    return true;
  } else {
    logError(`Health check failed: ${status}`);
    return false;
  }
}

async function testCreateClip() {
  logTest('Create Clip');
  
  const { status, data } = await fetchAPI('/api/clips', {
    method: 'POST',
    body: JSON.stringify({
      content: 'Test clip from integration test',
      type: 'text',
      metadata: { source: 'test' },
    }),
  });
  
  if (status === 201) {
    testClips.push(data.clip);
    logSuccess(`Clip created: ${data.clip.id}`);
    logInfo(`Content: ${data.clip.content.substring(0, 50)}...`);
    return true;
  } else {
    logError(`Failed to create clip: ${status}`);
    logInfo(`Response: ${JSON.stringify(data).substring(0, 100)}`);
    return false;
  }
}

async function testGetClips() {
  logTest('Get Clips');
  
  const { status, data } = await fetchAPI('/api/clips');
  
  if (status === 200) {
    logSuccess(`Retrieved ${data.clips?.length || 0} clips`);
    return true;
  } else {
    logError(`Failed to get clips: ${status}`);
    return false;
  }
}

async function testSearchClips() {
  logTest('Search Clips');
  
  const { status, data } = await fetchAPI('/api/clips?search=test');
  
  if (status === 200) {
    logSuccess(`Search returned ${data.clips?.length || 0} clips`);
    return true;
  } else {
    logError(`Failed to search clips: ${status}`);
    return false;
  }
}

async function testUpdateClip() {
  logTest('Update Clip');
  
  if (testClips.length === 0) {
    logInfo('No clips to update');
    return false;
  }
  
  const clipId = testClips[0].id;
  const { status, data } = await fetchAPI(`/api/clips/${clipId}`, {
    method: 'PUT',
    body: JSON.stringify({ content: 'Updated test clip' }),
  });
  
  if (status === 200) {
    logSuccess(`Clip updated: ${clipId}`);
    return true;
  } else {
    logError(`Failed to update clip: ${status}`);
    return false;
  }
}

async function testPinClip() {
  logTest('Pin/Unpin Clip');
  
  if (testClips.length === 0) {
    logInfo('No clips to pin');
    return false;
  }
  
  const clipId = testClips[0].id;
  
  // Pin
  let { status } = await fetchAPI(`/api/clips/${clipId}/pin`, { method: 'PATCH' });
  if (status !== 200) {
    logError(`Failed to pin clip: ${status}`);
    return false;
  }
  
  // Unpin
  status = (await fetchAPI(`/api/clips/${clipId}/pin`, { method: 'PATCH' })).status;
  
  if (status === 200) {
    logSuccess('Clip pinned and unpinned successfully');
    return true;
  } else {
    logError(`Failed to unpin clip: ${status}`);
    return false;
  }
}

async function testDeleteClip() {
  logTest('Delete Clip');
  
  if (testClips.length === 0) {
    logInfo('No clips to delete');
    return false;
  }
  
  const clipId = testClips[0].id;
  const { status } = await fetchAPI(`/api/clips/${clipId}`, { method: 'DELETE' });
  
  if (status === 200) {
    logSuccess(`Clip deleted: ${clipId}`);
    testClips.shift();
    return true;
  } else {
    logError(`Failed to delete clip: ${status}`);
    return false;
  }
}

async function testGetStats() {
  logTest('Get Statistics');
  
  const { status, data } = await fetchAPI('/api/clips/stats/summary');
  
  if (status === 200) {
    logSuccess(`Statistics retrieved`);
    logInfo(`Total clips: ${data.stats?.totalClips || 0}`);
    return true;
  } else {
    logError(`Failed to get statistics: ${status}`);
    return false;
  }
}

async function cleanup() {
  logTest('Cleanup');
  
  if (userId) {
    try {
      await query('DELETE FROM clips WHERE user_id = $1', [userId]);
      await query('DELETE FROM users WHERE id = $1', [userId]);
      logSuccess('Test data cleaned up');
    } catch (error) {
      logError(`Cleanup failed: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('  ClipSync Integration Tests');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Setup
  const setupSuccess = await setupTestUser();
  if (!setupSuccess) {
    console.log('\n' + colors.red + '✗ Tests aborted: Setup failed' + colors.reset);
    process.exit(1);
  }
  
  // Run tests
  results.push(await testHealthCheck());
  results.push(await testCreateClip());
  results.push(await testGetClips());
  results.push(await testSearchClips());
  results.push(await testUpdateClip());
  results.push(await testPinClip());
  results.push(await testDeleteClip());
  results.push(await testGetStats());
  
  // Cleanup
  await cleanup();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log(`All ${total} tests passed!`, colors.green);
  } else {
    log(`${passed}/${total} tests passed`, colors.yellow);
  }
  console.log('='.repeat(50) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error(colors.red + 'Test suite error:' + colors.reset, error);
  process.exit(1);
});