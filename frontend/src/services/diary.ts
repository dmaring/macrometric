/**
 * Diary service for API interactions.
 */
import api from './api';

export interface Food {
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

export interface DiaryEntry {
  id: string;
  food: Food;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
  is_default: boolean;
  entries: DiaryEntry[];
}

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DiaryData {
  date: string;
  categories: Category[];
  totals: DailyTotals;
  goals?: DailyTotals;
}

export interface FoodInput {
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface AddEntryRequest {
  category_id: string;
  food_id?: string;
  food?: FoodInput;
  quantity: number;
}

export interface UpdateEntryRequest {
  quantity?: number;
  category_id?: string;
}

/**
 * Get diary data for a specific date.
 */
export async function getDiary(date: Date): Promise<DiaryData> {
  const dateStr = date.toISOString().split('T')[0];
  const response = await api.get<DiaryData>(`/diary/${dateStr}`);
  return response.data;
}

/**
 * Add a new entry to the diary.
 */
export async function addEntry(
  date: Date,
  data: AddEntryRequest
): Promise<DiaryEntry> {
  const dateStr = date.toISOString().split('T')[0];
  const payload: Record<string, unknown> = {
    category_id: data.category_id,
    quantity: data.quantity,
  };

  // Support either food_id (existing food) or food (new food inline)
  if (data.food_id) {
    payload.food_id = data.food_id;
  } else if (data.food) {
    payload.food = data.food;
  }

  const response = await api.post<DiaryEntry>(`/diary/${dateStr}/entries`, payload);
  return response.data;
}

/**
 * Update an existing diary entry.
 */
export async function updateEntry(
  entryId: string,
  data: UpdateEntryRequest
): Promise<DiaryEntry> {
  const response = await api.put<DiaryEntry>(`/diary/entries/${entryId}`, {
    quantity: data.quantity,
    category_id: data.category_id,
  });
  return response.data;
}

/**
 * Delete a diary entry.
 */
export async function deleteEntry(entryId: string): Promise<void> {
  await api.delete(`/diary/entries/${entryId}`);
}

/**
 * Get user's meal categories.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

/**
 * Add a custom meal to the diary.
 * All foods in the meal are added to the specified category.
 */
export async function addMealToDiary(
  date: Date,
  mealId: string,
  categoryId: string
): Promise<DiaryEntry[]> {
  const dateStr = date.toISOString().split('T')[0];
  const response = await api.post<DiaryEntry[]>(`/diary/${dateStr}/add-meal`, {
    meal_id: mealId,
    category_id: categoryId,
  });
  return response.data;
}
