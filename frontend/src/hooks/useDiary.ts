/**
 * useDiary hook for diary state management.
 */
import { useState, useEffect, useCallback } from 'react';
import * as diaryService from '../services/diary';
import type { DiaryData, AddEntryRequest, UpdateEntryRequest, DiaryEntry } from '../services/diary';

interface UseDiaryReturn {
  diary: DiaryData | null;
  loading: boolean;
  error: string | null;
  pending: boolean;
  addEntry: (data: AddEntryRequest) => Promise<DiaryEntry>;
  updateEntry: (entryId: string, data: UpdateEntryRequest) => Promise<DiaryEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDiary(date: Date): UseDiaryReturn {
  const [diary, setDiary] = useState<DiaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fetchDiary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await diaryService.getDiary(date);
      setDiary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load diary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const addEntry = useCallback(async (data: AddEntryRequest): Promise<DiaryEntry> => {
    setPending(true);

    // Optimistic update: immediately add entry to UI
    if (diary && data.food) {
      const optimisticEntry: DiaryEntry = {
        id: `temp-${Date.now()}`, // Temporary ID
        food: {
          id: data.food_id || `temp-food-${Date.now()}`,
          name: data.food.name,
          brand: data.food.brand,
          serving_size: data.food.serving_size,
          serving_unit: data.food.serving_unit,
          calories: data.food.calories,
          protein_g: data.food.protein_g,
          carbs_g: data.food.carbs_g,
          fat_g: data.food.fat_g,
        },
        quantity: data.quantity,
      };

      setDiary((prevDiary) => {
        if (!prevDiary) return prevDiary;

        const updatedCategories = prevDiary.categories.map((cat) => {
          if (cat.id === data.category_id) {
            return {
              ...cat,
              entries: [...cat.entries, optimisticEntry],
            };
          }
          return cat;
        });

        // Recalculate totals
        const newTotals = { ...prevDiary.totals };
        newTotals.calories += optimisticEntry.food.calories * optimisticEntry.quantity;
        newTotals.protein_g += optimisticEntry.food.protein_g * optimisticEntry.quantity;
        newTotals.carbs_g += optimisticEntry.food.carbs_g * optimisticEntry.quantity;
        newTotals.fat_g += optimisticEntry.food.fat_g * optimisticEntry.quantity;

        return {
          ...prevDiary,
          categories: updatedCategories,
          totals: newTotals,
        };
      });
    }

    try {
      const entry = await diaryService.addEntry(date, data);
      // Refresh diary to get accurate server data
      await fetchDiary();
      return entry;
    } catch (error) {
      // On error, revert optimistic update
      await fetchDiary();
      throw error;
    } finally {
      setPending(false);
    }
  }, [date, fetchDiary, diary]);

  const updateEntry = useCallback(async (entryId: string, data: UpdateEntryRequest): Promise<DiaryEntry> => {
    setPending(true);
    try {
      const entry = await diaryService.updateEntry(entryId, data);
      // Refresh diary to get updated totals
      await fetchDiary();
      return entry;
    } finally {
      setPending(false);
    }
  }, [fetchDiary]);

  const deleteEntry = useCallback(async (entryId: string): Promise<void> => {
    setPending(true);

    // Optimistic update: immediately remove entry from UI
    let removedEntry: DiaryEntry | null = null;
    let categoryId: string | null = null;

    if (diary) {
      setDiary((prevDiary) => {
        if (!prevDiary) return prevDiary;

        const updatedCategories = prevDiary.categories.map((cat) => {
          const entryIndex = cat.entries.findIndex((e) => e.id === entryId);
          if (entryIndex !== -1) {
            removedEntry = cat.entries[entryIndex];
            categoryId = cat.id;
            return {
              ...cat,
              entries: cat.entries.filter((e) => e.id !== entryId),
            };
          }
          return cat;
        });

        // Recalculate totals if entry was found
        let newTotals = { ...prevDiary.totals };
        if (removedEntry) {
          newTotals.calories -= removedEntry.food.calories * removedEntry.quantity;
          newTotals.protein_g -= removedEntry.food.protein_g * removedEntry.quantity;
          newTotals.carbs_g -= removedEntry.food.carbs_g * removedEntry.quantity;
          newTotals.fat_g -= removedEntry.food.fat_g * removedEntry.quantity;
        }

        return {
          ...prevDiary,
          categories: updatedCategories,
          totals: newTotals,
        };
      });
    }

    try {
      await diaryService.deleteEntry(entryId);
      // Refresh diary to get accurate server data
      await fetchDiary();
    } catch (error) {
      // On error, revert optimistic update
      await fetchDiary();
      throw error;
    } finally {
      setPending(false);
    }
  }, [fetchDiary, diary]);

  const refresh = useCallback(async () => {
    await fetchDiary();
  }, [fetchDiary]);

  return {
    diary,
    loading,
    error,
    pending,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh,
  };
}

export default useDiary;
