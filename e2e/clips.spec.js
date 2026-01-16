/**
 * E2E Tests for Clips
 */

import { test, expect } from '@playwright/test';

test.describe('Clips Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    // Perform login
  });

  test('should create and display a clip', async ({ page }) => {
    // Create clip
    await page.click('text=New Clip');
    await page.fill('[placeholder="Enter content"]', 'Test E2E clip');
    await page.click('button:has-text("Save")');

    // Verify clip appears
    await expect(page.locator('text=Test E2E clip')).toBeVisible();
  });

  test('should search clips', async ({ page }) => {
    await page.fill('[placeholder="Search clips..."]', 'test');
    
    // Verify search results
    const results = page.locator('.clip-item');
    await expect(results.first()).toBeVisible();
  });

  test('should pin a clip', async ({ page }) => {
    // Find first clip
    const firstClip = page.locator('.clip-item').first();
    
    // Click pin button
    await firstClip.locator('button:has-text("Pin")').click();
    
    // Verify pin icon appears
    await expect(firstClip.locator('text=📌')).toBeVisible();
  });
});

