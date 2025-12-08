/**
 * Authentication E2E tests
 *
 * Tests for login, registration, and logout flows.
 */
import { test, expect, generateTestEmail, TEST_PASSWORD } from './fixtures';

test.describe('Registration', () => {
  test('user can register with valid credentials', async ({ page }) => {
    const email = generateTestEmail();

    await page.goto('/register');

    // Fill registration form
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('user sees validation error for invalid email', async ({ page }) => {
    await page.goto('/register');

    // Enter invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show email validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('user sees validation error for weak password', async ({ page }) => {
    await page.goto('/register');

    // Enter weak password (too short)
    await page.getByLabel('Email').fill(generateTestEmail());
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').fill('short');

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show password validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('user sees validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    // Enter mismatched passwords
    await page.getByLabel('Email').fill(generateTestEmail());
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill('DifferentPassword123');

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show password mismatch error
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('user can navigate to login page', async ({ page }) => {
    await page.goto('/register');

    // Click login link
    await page.getByRole('link', { name: /log in/i }).click();

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login', () => {
  test('user can login with valid credentials', async ({ page, testUser }) => {
    // First register a user and complete onboarding
    await page.goto('/register');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for registration to complete
    await expect(page).toHaveURL(/\/onboarding/);

    // Skip onboarding to complete registration
    await page.getByRole('button', { name: 'Skip for Now' }).click();
    await expect(page).toHaveURL(/\/diary/);

    // Logout (navigate to login)
    await page.goto('/login');

    // Login
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should redirect to diary (onboarding already completed)
    await expect(page).toHaveURL(/\/diary/);
  });

  test('user sees error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid credentials
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('WrongPassword123');

    // Submit form
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('user sees validation error for empty email', async ({ page }) => {
    await page.goto('/login');

    // Leave email empty
    await page.getByLabel('Password').fill(TEST_PASSWORD);

    // Submit form
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should show validation error
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('user sees validation error for empty password', async ({ page }) => {
    await page.goto('/login');

    // Leave password empty
    await page.getByLabel('Email').fill('test@example.com');

    // Submit form
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should show validation error
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('user can navigate to register page', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByRole('link', { name: /create an account/i }).click();

    // Should navigate to register page
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('Logout', () => {
  test('authenticated user can logout', async ({ authenticatedPage }) => {
    // Click logout button
    await authenticatedPage.getByRole('button', { name: 'Logout' }).click();

    // Should redirect to login
    await expect(authenticatedPage).toHaveURL(/\/login/);
  });
});

test.describe('Protected routes', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/diary');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
