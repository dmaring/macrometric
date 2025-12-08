/**
 * Diary E2E tests
 *
 * Tests for diary functionality including viewing, adding food, and date navigation.
 */
import { test, expect } from './fixtures';

test.describe('Diary page', () => {
  test('authenticated user can view diary page', async ({ authenticatedPage }) => {
    // Diary page should be visible
    await expect(authenticatedPage.getByTestId('diary-page')).toBeVisible();

    // Should show MacroMetric header
    await expect(authenticatedPage.getByRole('heading', { name: 'MacroMetric' })).toBeVisible();

    // Should show date navigator
    await expect(authenticatedPage.getByTestId('date-navigator')).toBeVisible();
  });

  test('diary shows today by default', async ({ authenticatedPage }) => {
    // Wait for date navigator to be visible
    await expect(authenticatedPage.getByTestId('date-navigator')).toBeVisible();

    // Date navigator should show "Today" label
    await expect(authenticatedPage.locator('.date-label').filter({ hasText: 'Today' })).toBeVisible();
  });
});

test.describe('Date navigation', () => {
  test('user can navigate to previous day', async ({ authenticatedPage }) => {
    // Click previous day button
    await authenticatedPage.getByRole('button', { name: 'Previous day' }).click();

    // Should show "Yesterday"
    await expect(authenticatedPage.getByText('Yesterday')).toBeVisible();
  });

  test('user can navigate to next day', async ({ authenticatedPage }) => {
    // First go to yesterday
    await authenticatedPage.getByRole('button', { name: 'Previous day' }).click();
    await expect(authenticatedPage.locator('.date-label').filter({ hasText: 'Yesterday' })).toBeVisible();

    // Then navigate forward
    await authenticatedPage.getByRole('button', { name: 'Next day' }).click();

    // Should show "Today" again
    await expect(authenticatedPage.locator('.date-label').filter({ hasText: 'Today' })).toBeVisible();
  });

  test('user can return to today using Today button', async ({ authenticatedPage }) => {
    // Navigate to previous day twice
    await authenticatedPage.getByRole('button', { name: 'Previous day' }).click();
    await authenticatedPage.getByRole('button', { name: 'Previous day' }).click();

    // Click Today button
    await authenticatedPage.getByRole('button', { name: 'Go to today' }).click();

    // Should show "Today"
    await expect(authenticatedPage.locator('.date-label').filter({ hasText: 'Today' })).toBeVisible();
  });

  test('Today button is disabled when viewing today', async ({ authenticatedPage }) => {
    // Today button should be disabled by default
    await expect(authenticatedPage.getByRole('button', { name: 'Go to today' })).toBeDisabled();
  });
});

test.describe('Meal categories', () => {
  test('diary shows meal categories', async ({ authenticatedPage }) => {
    // Wait for diary to load (categories come from backend)
    // Categories should be visible (Breakfast, Lunch, Dinner are defaults)
    const categories = authenticatedPage.locator('.meal-category');

    // Should have at least one category (backend creates defaults on registration)
    await expect(categories.first()).toBeVisible({ timeout: 10000 });
  });

  test('user can click Add button to open add food modal', async ({ authenticatedPage }) => {
    // Wait for categories to load
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });

    // Click the first "Add" button
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();

    // Modal should appear
    await expect(authenticatedPage.getByTestId('add-food-modal')).toBeVisible();
  });
});

test.describe('Add food modal', () => {
  test('add food modal has required elements', async ({ authenticatedPage }) => {
    // Wait for categories and open modal
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();

    // Get modal reference for scoped queries
    const modal = authenticatedPage.getByTestId('add-food-modal');

    // Modal should have title
    await expect(modal.getByRole('heading', { name: /Add Food to/i })).toBeVisible();

    // Should have search section
    await expect(modal.getByRole('heading', { name: 'Search Foods' })).toBeVisible();

    // Should have manual entry fields
    await expect(modal.getByLabel('Food Name *')).toBeVisible();
    await expect(modal.getByLabel('Calories *')).toBeVisible();
    await expect(modal.getByLabel('Protein (g) *')).toBeVisible();
    await expect(modal.getByLabel('Carbs (g) *')).toBeVisible();
    await expect(modal.getByLabel('Fat (g) *')).toBeVisible();

    // Should have submit and cancel buttons (scoped to modal)
    await expect(modal.getByRole('button', { name: 'Add Food' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('user can close modal with Cancel button', async ({ authenticatedPage }) => {
    // Open modal
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();
    await expect(authenticatedPage.getByTestId('add-food-modal')).toBeVisible();

    // Click cancel
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();

    // Modal should close
    await expect(authenticatedPage.getByTestId('add-food-modal')).not.toBeVisible();
  });

  test('user can close modal with X button', async ({ authenticatedPage }) => {
    // Open modal
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();
    await expect(authenticatedPage.getByTestId('add-food-modal')).toBeVisible();

    // Click close button
    await authenticatedPage.getByRole('button', { name: 'Close modal' }).click();

    // Modal should close
    await expect(authenticatedPage.getByTestId('add-food-modal')).not.toBeVisible();
  });

  test('user can add food manually', async ({ authenticatedPage }) => {
    // Open modal
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();

    // Get modal reference for scoped queries
    const modal = authenticatedPage.getByTestId('add-food-modal');
    await expect(modal).toBeVisible();

    // Fill in food details
    await modal.getByLabel('Food Name *').fill('Test Chicken');
    await modal.getByLabel('Serving Size *').fill('100');
    await modal.getByLabel('Serving Unit *').fill('g');
    await modal.getByLabel('Calories *').fill('165');
    await modal.getByLabel('Protein (g) *').fill('31');
    await modal.getByLabel('Carbs (g) *').fill('0');
    await modal.getByLabel('Fat (g) *').fill('3.6');

    // Submit (scoped to modal to avoid matching "Add food to X" buttons)
    await modal.getByRole('button', { name: 'Add Food' }).click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Food should appear in the diary (entry list)
    await expect(authenticatedPage.getByText('Test Chicken')).toBeVisible({ timeout: 5000 });
  });

  test('form shows validation error for empty food name', async ({ authenticatedPage }) => {
    // Open modal
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });
    await authenticatedPage.getByRole('button', { name: /add food to/i }).first().click();

    // Get modal reference for scoped queries
    const modal = authenticatedPage.getByTestId('add-food-modal');
    await expect(modal).toBeVisible();

    // Try to submit without food name (scoped to modal)
    await modal.getByRole('button', { name: 'Add Food' }).click();

    // Should show validation error
    await expect(modal.getByText('Food name is required')).toBeVisible();
  });
});

test.describe('Macro display', () => {
  test('diary shows macro totals', async ({ authenticatedPage }) => {
    // Wait for diary to load
    await authenticatedPage.waitForSelector('.meal-category', { timeout: 10000 });

    // Macro display should show labels
    await expect(authenticatedPage.getByText(/calories/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/protein/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/carbs/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/fat/i)).toBeVisible();
  });
});
