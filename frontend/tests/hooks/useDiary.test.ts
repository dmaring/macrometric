/**
 * useDiary Hook Tests
 *
 * These tests verify the diary state management hook.
 * They should FAIL before implementation.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDiary } from '../../src/hooks/useDiary';
import * as diaryService from '../../src/services/diary';

jest.mock('../../src/services/diary');

const mockDiaryData = {
  date: '2025-12-06',
  categories: [
    {
      id: 'cat-1',
      name: 'Breakfast',
      display_order: 1,
      entries: [
        {
          id: 'entry-1',
          food: { name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
          quantity: 1,
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Lunch',
      display_order: 2,
      entries: [],
    },
  ],
  totals: {
    calories: 95,
    protein_g: 0.5,
    carbs_g: 25,
    fat_g: 0.3,
  },
};

describe('useDiary Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (diaryService.getDiary as jest.Mock).mockResolvedValue(mockDiaryData);
  });

  describe('Initial State', () => {
    it('starts with loading true', () => {
      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));
      expect(result.current.loading).toBe(true);
    });

    it('loads diary data on mount', async () => {
      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.diary).toEqual(mockDiaryData);
    });

    it('sets error on fetch failure', async () => {
      (diaryService.getDiary as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Date Changes', () => {
    it('reloads diary when date changes', async () => {
      const { result, rerender } = renderHook(
        ({ date }) => useDiary(date),
        { initialProps: { date: new Date('2025-12-06') } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      rerender({ date: new Date('2025-12-07') });

      expect(diaryService.getDiary).toHaveBeenCalledTimes(2);
    });
  });

  describe('Add Entry', () => {
    it('adds entry and updates totals', async () => {
      (diaryService.addEntry as jest.Mock).mockResolvedValue({
        id: 'entry-2',
        food: { name: 'Banana', calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4 },
        quantity: 1,
      });

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addEntry({
          categoryId: 'cat-1',
          foodId: 'food-2',
          quantity: 1,
        });
      });

      expect(diaryService.addEntry).toHaveBeenCalled();
    });

    it('shows optimistic update while adding', async () => {
      let resolveAdd: (value: unknown) => void;
      (diaryService.addEntry as jest.Mock).mockImplementation(
        () => new Promise((resolve) => { resolveAdd = resolve; })
      );

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.addEntry({
          categoryId: 'cat-1',
          foodId: 'food-2',
          quantity: 1,
        });
      });

      // Should show pending state
      expect(result.current.pending).toBe(true);
    });

    it('rolls back on add failure', async () => {
      (diaryService.addEntry as jest.Mock).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalTotals = { ...result.current.diary?.totals };

      try {
        await act(async () => {
          await result.current.addEntry({
            categoryId: 'cat-1',
            foodId: 'food-2',
            quantity: 1,
          });
        });
      } catch {
        // Expected to throw
      }

      expect(result.current.diary?.totals).toEqual(originalTotals);
    });
  });

  describe('Update Entry', () => {
    it('updates entry quantity', async () => {
      (diaryService.updateEntry as jest.Mock).mockResolvedValue({
        id: 'entry-1',
        food: { name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
        quantity: 2,
      });

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEntry('entry-1', { quantity: 2 });
      });

      expect(diaryService.updateEntry).toHaveBeenCalledWith('entry-1', { quantity: 2 });
    });

    it('recalculates totals after update', async () => {
      (diaryService.updateEntry as jest.Mock).mockResolvedValue({
        id: 'entry-1',
        food: { name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
        quantity: 2,
      });

      // Mock refetch to return updated totals
      (diaryService.getDiary as jest.Mock).mockResolvedValue({
        ...mockDiaryData,
        totals: { calories: 190, protein_g: 1, carbs_g: 50, fat_g: 0.6 },
      });

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEntry('entry-1', { quantity: 2 });
      });

      // Either optimistic or refetched
      expect(result.current.diary?.totals.calories).toBeGreaterThan(95);
    });
  });

  describe('Delete Entry', () => {
    it('deletes entry', async () => {
      (diaryService.deleteEntry as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEntry('entry-1');
      });

      expect(diaryService.deleteEntry).toHaveBeenCalledWith('entry-1');
    });

    it('removes entry from local state', async () => {
      (diaryService.deleteEntry as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialEntryCount = result.current.diary?.categories[0].entries.length;

      await act(async () => {
        await result.current.deleteEntry('entry-1');
      });

      // Entry should be removed or marked as deleted
      expect(
        result.current.diary?.categories[0].entries.length
      ).toBeLessThan(initialEntryCount!);
    });
  });

  describe('Categories', () => {
    it('returns categories sorted by display_order', async () => {
      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categories = result.current.diary?.categories;
      expect(categories?.[0].name).toBe('Breakfast');
      expect(categories?.[1].name).toBe('Lunch');
    });
  });

  describe('Refresh', () => {
    it('provides refresh function', async () => {
      const { result } = renderHook(() => useDiary(new Date('2025-12-06')));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(diaryService.getDiary).toHaveBeenCalledTimes(2);
    });
  });
});
