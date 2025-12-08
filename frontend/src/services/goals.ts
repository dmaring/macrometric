/**
 * Goals service for API interactions.
 */
import api from './api';

export interface Goals {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export interface SetGoalsRequest {
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

/**
 * Get user's daily goals.
 */
export async function getGoals(): Promise<Goals | null> {
  const response = await api.get<Goals | null>('/goals');
  return response.data;
}

/**
 * Set or update daily goals.
 */
export async function setGoals(data: SetGoalsRequest): Promise<Goals> {
  const response = await api.put<Goals>('/goals', data);
  return response.data;
}

/**
 * Delete daily goals.
 */
export async function deleteGoals(): Promise<void> {
  await api.delete('/goals');
}

/**
 * Skip onboarding without setting goals.
 */
export async function skipOnboarding(): Promise<void> {
  await api.post('/goals/skip-onboarding');
}
