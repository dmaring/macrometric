/**
 * Meal categories service for managing user's meal categories.
 */
import api from './api';

export interface MealCategory {
  id: string;
  name: string;
  display_order: number;
  is_default: boolean;
  created_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface ReorderCategoriesRequest {
  category_ids: string[];
}

/**
 * Get all meal categories for the current user.
 *
 * @returns Array of meal categories sorted by display_order
 */
export async function getCategories(): Promise<MealCategory[]> {
  const response = await api.get('/categories');
  return response.data;
}

/**
 * Create a new meal category.
 *
 * @param categoryData - Category name
 * @returns Created category
 */
export async function createCategory(categoryData: CreateCategoryRequest): Promise<MealCategory> {
  const response = await api.post('/categories', categoryData);
  return response.data;
}

/**
 * Update an existing meal category (rename).
 *
 * @param categoryId - Category identifier
 * @param categoryData - Updated category data
 * @returns Updated category
 */
export async function updateCategory(
  categoryId: string,
  categoryData: UpdateCategoryRequest
): Promise<MealCategory> {
  const response = await api.put(`/categories/${categoryId}`, categoryData);
  return response.data;
}

/**
 * Delete a meal category.
 * Will fail if category has diary entries.
 *
 * @param categoryId - Category identifier
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

/**
 * Reorder meal categories via drag and drop.
 *
 * @param categoryIds - Array of category IDs in new order
 */
export async function reorderCategories(categoryIds: string[]): Promise<void> {
  await api.put('/categories/reorder', { category_ids: categoryIds });
}
