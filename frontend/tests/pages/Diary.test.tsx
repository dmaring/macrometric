/**
 * Diary Page Integration Tests
 *
 * These tests verify the diary page as a whole.
 * They should FAIL before implementation.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Diary from '../../src/pages/Diary';
import * as diaryService from '../../src/services/diary';

jest.mock('../../src/services/diary');
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com', onboarding_completed: true },
    isAuthenticated: true,
    loading: false,
  }),
}));

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
          food: {
            id: 'food-1',
            name: 'Oatmeal',
            calories: 150,
            protein_g: 5,
            carbs_g: 27,
            fat_g: 3
          },
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
    {
      id: 'cat-3',
      name: 'Dinner',
      display_order: 3,
      entries: [],
    },
  ],
  totals: {
    calories: 150,
    protein_g: 5,
    carbs_g: 27,
    fat_g: 3,
  },
  goals: {
    calories: 2000,
    protein_g: 100,
    carbs_g: 250,
    fat_g: 65,
  },
};

const renderDiary = () => {
  return render(
    <BrowserRouter>
      <Diary />
    </BrowserRouter>
  );
};

describe('Diary Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (diaryService.getDiary as jest.Mock).mockResolvedValue(mockDiaryData);
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching', () => {
      (diaryService.getDiary as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderDiary();
      expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides loading indicator after data loads', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Date Navigation', () => {
    it('displays current date', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByText(/dec|december/i)).toBeInTheDocument();
      });
    });

    it('navigates to previous day', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous|back|←/i });
      await userEvent.click(prevButton);

      expect(diaryService.getDiary).toHaveBeenCalledTimes(2);
    });

    it('navigates to next day', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next|forward|→/i });
      await userEvent.click(nextButton);

      expect(diaryService.getDiary).toHaveBeenCalledTimes(2);
    });
  });

  describe('Macro Display', () => {
    it('shows daily totals', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByText(/150/)).toBeInTheDocument();
      });
    });

    it('shows progress toward goals', async () => {
      renderDiary();

      await waitFor(() => {
        // Should show goal values
        expect(screen.getByText(/2000|2,000/)).toBeInTheDocument();
      });
    });
  });

  describe('Meal Categories', () => {
    it('displays all meal categories', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Lunch')).toBeInTheDocument();
        expect(screen.getByText('Dinner')).toBeInTheDocument();
      });
    });

    it('shows entries in correct category', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      });
    });

    it('shows empty state for categories without entries', async () => {
      renderDiary();

      await waitFor(() => {
        const emptyStates = screen.getAllByText(/no foods|add food/i);
        expect(emptyStates.length).toBeGreaterThanOrEqual(2); // Lunch and Dinner
      });
    });
  });

  describe('Add Food Flow', () => {
    it('shows add food button for each category', async () => {
      renderDiary();

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add|plus|\+/i });
        expect(addButtons.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('opens food search when add button clicked', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button', { name: /add|plus|\+/i });
      await userEvent.click(addButtons[0]);

      // Should open food search modal or panel
      expect(screen.getByRole('dialog') || screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  describe('Edit Entry Flow', () => {
    it('opens edit modal when entry clicked', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Oatmeal'));

      // Should open edit modal
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('updates entry quantity', async () => {
      (diaryService.updateEntry as jest.Mock).mockResolvedValue({
        id: 'entry-1',
        quantity: 2,
      });

      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Oatmeal'));

      const quantityInput = screen.getByLabelText(/quantity|servings/i);
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '2');

      const saveButton = screen.getByRole('button', { name: /save|update/i });
      await userEvent.click(saveButton);

      expect(diaryService.updateEntry).toHaveBeenCalledWith('entry-1', { quantity: 2 });
    });
  });

  describe('Delete Entry Flow', () => {
    it('deletes entry when delete clicked', async () => {
      (diaryService.deleteEntry as jest.Mock).mockResolvedValue(undefined);

      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete|remove|×/i });
      await userEvent.click(deleteButton);

      // Might show confirmation
      const confirmButton = screen.queryByRole('button', { name: /confirm|yes/i });
      if (confirmButton) {
        await userEvent.click(confirmButton);
      }

      expect(diaryService.deleteEntry).toHaveBeenCalledWith('entry-1');
    });

    it('updates totals after deletion', async () => {
      (diaryService.deleteEntry as jest.Mock).mockResolvedValue(undefined);
      (diaryService.getDiary as jest.Mock)
        .mockResolvedValueOnce(mockDiaryData)
        .mockResolvedValueOnce({
          ...mockDiaryData,
          categories: [
            { ...mockDiaryData.categories[0], entries: [] },
            ...mockDiaryData.categories.slice(1),
          ],
          totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        });

      renderDiary();

      await waitFor(() => {
        expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete|remove|×/i });
      await userEvent.click(deleteButton);

      const confirmButton = screen.queryByRole('button', { name: /confirm|yes/i });
      if (confirmButton) {
        await userEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Oatmeal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message on fetch failure', async () => {
      (diaryService.getDiary as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderDiary();

      await waitFor(() => {
        expect(screen.getByText(/error|failed|try again/i)).toBeInTheDocument();
      });
    });

    it('provides retry option on error', async () => {
      (diaryService.getDiary as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderDiary();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has page title', async () => {
      renderDiary();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /diary|daily/i })).toBeInTheDocument();
      });
    });

    it('categories are in landmark regions', async () => {
      renderDiary();

      await waitFor(() => {
        const regions = screen.getAllByRole('region');
        expect(regions.length).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
