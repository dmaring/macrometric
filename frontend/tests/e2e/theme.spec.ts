/**
 * E2E Test: Theme Toggle Functionality
 *
 * Tests the dark/light theme toggle feature in the Settings page
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Start on the login page
    await page.goto('http://localhost:3000');

    // Clear localStorage to start with clean state
    await page.evaluate(() => localStorage.clear());
  });

  test('should default to system theme on first visit', async ({ page }) => {
    await page.reload();

    // Check that localStorage has 'system' as default
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBeNull(); // First visit, no theme set yet, or defaults to system
  });

  test('should toggle to light theme and persist', async ({ page }) => {
    // Navigate to settings (assuming user is logged in or can access settings)
    // For this test, we'll navigate directly to settings
    await page.goto('http://localhost:3000/settings');

    // Find and click the light theme button
    await page.getByRole('button', { name: /light/i }).click();

    // Verify the root element does NOT have 'dark' class
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(false);

    // Verify localStorage is updated
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('light');

    // Reload page and verify theme persists
    await page.reload();
    const themeAfterReload = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeAfterReload).toBe('light');

    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDarkAfterReload).toBe(false);
  });

  test('should toggle to dark theme and persist', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Find and click the dark theme button
    await page.getByRole('button', { name: /^dark$/i }).click();

    // Verify the root element has 'dark' class
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);

    // Verify localStorage is updated
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Reload page and verify theme persists
    await page.reload();
    const themeAfterReload = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeAfterReload).toBe('dark');

    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDarkAfterReload).toBe(true);
  });

  test('should toggle to system theme', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // First set to light
    await page.getByRole('button', { name: /light/i }).click();

    // Then click system
    await page.getByRole('button', { name: /system/i }).click();

    // Verify localStorage is updated to system
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('system');

    // System theme should match the OS preference
    // We can't change OS settings in the test, but we can verify it uses the system preference
    const prefersDark = await page.evaluate(() =>
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    expect(isDark).toBe(prefersDark);
  });

  test('should show visual feedback for active theme', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Click light theme
    await page.getByRole('button', { name: /light/i }).click();

    // Verify light theme button has active styling (border-primary class or similar)
    const lightButton = page.getByRole('button', { name: /light/i });
    const lightButtonClass = await lightButton.getAttribute('class');
    expect(lightButtonClass).toContain('border-primary');

    // Click dark theme
    await page.getByRole('button', { name: /^dark$/i }).click();

    // Verify dark theme button has active styling
    const darkButton = page.getByRole('button', { name: /^dark$/i });
    const darkButtonClass = await darkButton.getAttribute('class');
    expect(darkButtonClass).toContain('border-primary');
  });

  test('should apply theme colors throughout the app', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Switch to light theme
    await page.getByRole('button', { name: /light/i }).click();

    // Get computed background color of body or main element
    const lightBg = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });

    // Switch to dark theme
    await page.getByRole('button', { name: /^dark$/i }).click();

    // Get computed background color again
    const darkBg = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });

    // Background colors should be different
    expect(lightBg).not.toBe(darkBg);
  });

  test('should apply theme without flash on page load', async ({ page }) => {
    // Set dark theme in localStorage before navigation
    await page.goto('http://localhost:3000/settings');
    await page.getByRole('button', { name: /^dark$/i }).click();

    // Navigate to another page
    await page.goto('http://localhost:3000/diary');

    // The dark class should be present immediately (FOUC prevention)
    // We can't really test the exact timing, but we can verify the class is present
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
  });

  test('should maintain theme across different pages', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Set dark theme
    await page.getByRole('button', { name: /^dark$/i }).click();

    // Navigate to diary
    await page.goto('http://localhost:3000/diary');

    // Verify dark theme is still active
    let isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);

    // Navigate back to settings
    await page.goto('http://localhost:3000/settings');

    // Verify dark theme is still active
    isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
  });
});
