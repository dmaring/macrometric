/**
 * Food search service for querying nutrition database.
 */
import api from './api';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  source: 'usda' | 'custom';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: number;
  serving_unit: string;
}

export interface FoodSearchResponse {
  results: Food[];
  total: number;
  query: string;
}

/**
 * Search for foods by name.
 *
 * @param query - Search term
 * @param limit - Maximum number of results (default: 10)
 * @returns Search response with results, total, and query
 */
export async function searchFoods(query: string, limit: number = 10): Promise<FoodSearchResponse> {
  const response = await api.get('/foods/search', {
    params: { q: query, limit },
  });
  return response.data;
}

/**
 * Get detailed information for a specific food.
 *
 * @param foodId - Food identifier (format: "source:id")
 * @returns Food details
 */
export async function getFoodDetails(foodId: string): Promise<Food> {
  const response = await api.get(`/foods/${foodId}`);
  return response.data;
}
