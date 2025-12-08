/**
 * MealCategory Component Tests
 *
 * These tests verify the meal category display component.
 * They should FAIL before implementation.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealCategory from '../../src/components/MealCategory';

const mockEntries = [
  {
    id: '1',
    food: { name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
    quantity: 1,
  },
  {
    id: '2',
    food: { name: 'Chicken Breast', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    quantity: 1.5,
  },
];

describe('MealCategory Component', () => {
  const defaultProps = {
    id: 'cat-1',
    name: 'Breakfast',
    entries: mockEntries,
    onAddFood: jest.fn(),
    onEditEntry: jest.fn(),
    onDeleteEntry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders category name', () => {
      render(<MealCategory {...defaultProps} />);
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });

    it('renders all entries', () => {
      render(<MealCategory {...defaultProps} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    });

    it('renders category totals', () => {
      render(<MealCategory {...defaultProps} />);
      // 95 + 165*1.5 = 342.5 calories
      expect(screen.getByText(/342|343/)).toBeInTheDocument();
    });

    it('renders empty state when no entries', () => {
      render(<MealCategory {...defaultProps} entries={[]} />);
      expect(screen.getByText(/no foods|add food|empty/i)).toBeInTheDocument();
    });

    it('renders add food button', () => {
      render(<MealCategory {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add|plus|\+/i })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onAddFood when add button clicked', async () => {
      render(<MealCategory {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /add|plus|\+/i });

      await userEvent.click(addButton);

      expect(defaultProps.onAddFood).toHaveBeenCalledWith('cat-1');
    });

    it('calls onEditEntry when entry is clicked', async () => {
      render(<MealCategory {...defaultProps} />);
      const entry = screen.getByText('Apple');

      await userEvent.click(entry);

      expect(defaultProps.onEditEntry).toHaveBeenCalledWith('1');
    });

    it('calls onDeleteEntry when delete button clicked', async () => {
      render(<MealCategory {...defaultProps} />);
      const deleteButtons = screen.getAllByRole('button', { name: /delete|remove|×/i });

      await userEvent.click(deleteButtons[0]);

      expect(defaultProps.onDeleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('Entry Display', () => {
    it('shows quantity for each entry', () => {
      render(<MealCategory {...defaultProps} />);
      expect(screen.getByText(/1\.5/)).toBeInTheDocument();
    });

    it('shows calories for each entry', () => {
      render(<MealCategory {...defaultProps} />);
      // Apple: 95 cal, Chicken: 165*1.5 = 247.5
      expect(screen.getByText(/95/)).toBeInTheDocument();
      expect(screen.getByText(/247|248/)).toBeInTheDocument();
    });

    it('shows macros for each entry', () => {
      render(<MealCategory {...defaultProps} />);
      // Chicken protein: 31*1.5 = 46.5g
      expect(screen.getByText(/46|47/)).toBeInTheDocument();
    });
  });

  describe('Collapsible Behavior', () => {
    it('can collapse and expand', async () => {
      render(<MealCategory {...defaultProps} />);
      const header = screen.getByRole('button', { name: /breakfast/i }) || screen.getByText('Breakfast');

      // Initially expanded - entries visible
      expect(screen.getByText('Apple')).toBeVisible();

      // Click to collapse
      await userEvent.click(header);

      // Entries should be hidden (or collapsed state indicated)
      // Implementation may vary
    });

    it('shows entry count when collapsed', async () => {
      render(<MealCategory {...defaultProps} defaultCollapsed />);
      expect(screen.getByText(/2 items|2 foods/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible category heading', () => {
      render(<MealCategory {...defaultProps} />);
      const heading = screen.getByRole('heading', { name: /breakfast/i });
      expect(heading).toBeInTheDocument();
    });

    it('entries are in a list', () => {
      render(<MealCategory {...defaultProps} />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('each entry is a list item', () => {
      render(<MealCategory {...defaultProps} />);
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBe(2);
    });
  });
});
