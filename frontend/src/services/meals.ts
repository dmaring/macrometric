/**
 * Custom meals service for creating and managing meal presets.
 */
import api from './api';

export interface MealItem {
  food_id: string;
  food_name: string;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface CustomMeal {
  id: string;
  name: string;
  items: Array<{
    food: {
      id: string;
      name: string;
      brand?: string;
      serving_size: number;
      serving_unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      source: string;
    };
    quantity: number;
    is_deleted: boolean;
  }>;
  totals: MacroTotals;
  created_at: string;
}

export interface CreateMealRequest {
  name: string;
  items: Array<{
    food_id: string;
    quantity: number;
  }>;
}

export interface UpdateMealRequest {
  name?: string;
  items?: Array<{
    food_id: string;
    quantity: number;
  }>;
}

/**
 * Get all custom meals for the current user.
 *
 * @returns Array of custom meals
 */
export async function getCustomMeals(): Promise<CustomMeal[]> {
  const response = await api.get('/meals');
  return response.data;
}

/**
 * Get a specific custom meal.
 *
 * @param mealId - Meal identifier
 * @returns Custom meal details
 */
export async function getCustomMeal(mealId: string): Promise<CustomMeal> {
  const response = await api.get(`/meals/${mealId}`);
  return response.data;
}

/**
 * Create a new custom meal.
 *
 * @param mealData - Meal name and items
 * @returns Created custom meal
 */
export async function createCustomMeal(mealData: CreateMealRequest): Promise<CustomMeal> {
  const response = await api.post('/meals', mealData);
  return response.data;
}

/**
 * Update an existing custom meal.
 *
 * @param mealId - Meal identifier
 * @param mealData - Updated meal data
 * @returns Updated custom meal
 */
export async function updateCustomMeal(
  mealId: string,
  mealData: UpdateMealRequest
): Promise<CustomMeal> {
  const response = await api.put(`/meals/${mealId}`, mealData);
  return response.data;
}

/**
 * Delete a custom meal.
 *
 * @param mealId - Meal identifier
 */
export async function deleteCustomMeal(mealId: string): Promise<void> {
  await api.delete(`/meals/${mealId}`);
}
