/**
 * Playwright test fixtures for authenticated user state
 */
import { test as base, expect, Page } from '@playwright/test';

// Generate unique email for each test run to avoid conflicts
function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

const TEST_PASSWORD = 'TestPassword123';

export interface TestUser {
  email: string;
  password: string;
}

// Helper to register a new user
async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm Password').fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for redirect to onboarding
  await expect(page).toHaveURL(/\/onboarding/);
}

// Helper to login an existing user
async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for redirect to diary
  await expect(page).toHaveURL(/\/diary/);
}

// Extended test fixture with authenticated user
export const test = base.extend<{
  testUser: TestUser;
  authenticatedPage: Page;
}>({
  // Create a fresh test user for each test
  testUser: async ({}, use) => {
    const user: TestUser = {
      email: generateTestEmail(),
      password: TEST_PASSWORD,
    };
    await use(user);
  },

  // Page with authenticated user (registers, skips onboarding, goes to diary)
  authenticatedPage: async ({ page, testUser }, use) => {
    await registerUser(page, testUser);

    // Wait for onboarding page to be ready
    await expect(page.getByTestId('onboarding-page')).toBeVisible();

    // Skip onboarding by clicking "Skip for Now" button
    const skipButton = page.getByRole('button', { name: 'Skip for Now' });
    await expect(skipButton).toBeEnabled();
    await skipButton.click();

    // Wait for redirect to diary
    await expect(page).toHaveURL(/\/diary/, { timeout: 15000 });

    // Wait for diary to load
    await expect(page.getByTestId('diary-page')).toBeVisible({ timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';
export { registerUser, loginUser, generateTestEmail, TEST_PASSWORD };
