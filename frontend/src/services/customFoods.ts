/**
 * Custom foods service for managing user-created food items.
 */
import api from './api';

export interface CustomFood {
  id: string;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface CreateCustomFoodRequest {
  name: string;
  brand?: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface UpdateCustomFoodRequest {
  name?: string;
  brand?: string | null;
  serving_size?: number;
  serving_unit?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

/**
 * Get all custom foods for the current user.
 */
export async function getCustomFoods(): Promise<CustomFood[]> {
  const response = await api.get('/custom-foods');
  return response.data;
}

/**
 * Get a specific custom food by ID.
 */
export async function getCustomFood(foodId: string): Promise<CustomFood> {
  const response = await api.get(`/custom-foods/${foodId}`);
  return response.data;
}

/**
 * Create a new custom food.
 */
export async function createCustomFood(data: CreateCustomFoodRequest): Promise<CustomFood> {
  const response = await api.post('/custom-foods', data);
  return response.data;
}

/**
 * Update an existing custom food.
 */
export async function updateCustomFood(
  foodId: string,
  data: UpdateCustomFoodRequest
): Promise<CustomFood> {
  const response = await api.put(`/custom-foods/${foodId}`, data);
  return response.data;
}

/**
 * Delete a custom food.
 */
export async function deleteCustomFood(foodId: string): Promise<void> {
  await api.delete(`/custom-foods/${foodId}`);
}
