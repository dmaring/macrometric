/**
 * DiaryEntry Component Tests
 *
 * These tests verify the single diary entry component.
 * They should FAIL before implementation.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiaryEntry from '../../src/components/DiaryEntry';

const mockEntry = {
  id: 'entry-1',
  food: {
    id: 'food-1',
    name: 'Grilled Chicken',
    brand: 'Tyson',
    serving_size: 100,
    serving_unit: 'g',
    calories: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6,
  },
  quantity: 1.5,
};

describe('DiaryEntry Component', () => {
  const defaultProps = {
    entry: mockEntry,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders food name', () => {
      render(<DiaryEntry {...defaultProps} />);
      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    });

    it('renders brand name when available', () => {
      render(<DiaryEntry {...defaultProps} />);
      expect(screen.getByText(/Tyson/)).toBeInTheDocument();
    });

    it('renders quantity and serving info', () => {
      render(<DiaryEntry {...defaultProps} />);
      expect(screen.getByText(/1\.5/)).toBeInTheDocument();
      expect(screen.getByText(/serving|100.*g/i)).toBeInTheDocument();
    });

    it('renders calculated calories', () => {
      render(<DiaryEntry {...defaultProps} />);
      // 165 * 1.5 = 247.5
      expect(screen.getByText(/247|248/)).toBeInTheDocument();
    });

    it('renders calculated macros', () => {
      render(<DiaryEntry {...defaultProps} />);
      // protein: 31 * 1.5 = 46.5
      // fat: 3.6 * 1.5 = 5.4
      expect(screen.getByText(/46|47/)).toBeInTheDocument();
    });

    it('handles missing brand gracefully', () => {
      const entryWithoutBrand = {
        ...mockEntry,
        food: { ...mockEntry.food, brand: null },
      };
      render(<DiaryEntry {...defaultProps} entry={entryWithoutBrand} />);
      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when clicked', async () => {
      render(<DiaryEntry {...defaultProps} />);
      const entry = screen.getByText('Grilled Chicken');

      await userEvent.click(entry);

      expect(defaultProps.onEdit).toHaveBeenCalledWith('entry-1');
    });

    it('calls onDelete when delete button clicked', async () => {
      render(<DiaryEntry {...defaultProps} />);
      const deleteButton = screen.getByRole('button', { name: /delete|remove|×/i });

      await userEvent.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('entry-1');
    });

    it('shows edit button on hover', async () => {
      render(<DiaryEntry {...defaultProps} />);
      const entry = screen.getByTestId('diary-entry');

      await userEvent.hover(entry);

      expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
    });
  });

  describe('Calculations', () => {
    it('multiplies all macros by quantity', () => {
      const entry = {
        ...mockEntry,
        quantity: 2,
      };
      render(<DiaryEntry {...defaultProps} entry={entry} />);

      // calories: 165 * 2 = 330
      expect(screen.getByText(/330/)).toBeInTheDocument();
      // protein: 31 * 2 = 62
      expect(screen.getByText(/62/)).toBeInTheDocument();
    });

    it('handles fractional quantities', () => {
      const entry = {
        ...mockEntry,
        quantity: 0.5,
      };
      render(<DiaryEntry {...defaultProps} entry={entry} />);

      // calories: 165 * 0.5 = 82.5
      expect(screen.getByText(/82|83/)).toBeInTheDocument();
    });
  });

  describe('Display Modes', () => {
    it('supports compact mode', () => {
      render(<DiaryEntry {...defaultProps} compact />);
      const entry = screen.getByTestId('diary-entry');
      expect(entry).toHaveClass('compact');
    });

    it('shows full macros in expanded mode', () => {
      render(<DiaryEntry {...defaultProps} expanded />);
      expect(screen.getByText(/protein/i)).toBeInTheDocument();
      expect(screen.getByText(/carbs/i)).toBeInTheDocument();
      expect(screen.getByText(/fat/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      render(<DiaryEntry {...defaultProps} />);
      const entry = screen.getByTestId('diary-entry');

      entry.focus();
      expect(entry).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      expect(defaultProps.onEdit).toHaveBeenCalled();
    });

    it('has appropriate ARIA attributes', () => {
      render(<DiaryEntry {...defaultProps} />);
      const entry = screen.getByTestId('diary-entry');
      expect(entry).toHaveAttribute('role', 'listitem');
    });

    it('delete button has accessible name', () => {
      render(<DiaryEntry {...defaultProps} />);
      const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
      expect(deleteButton).toHaveAccessibleName();
    });
  });
});
