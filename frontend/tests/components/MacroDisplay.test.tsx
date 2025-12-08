/**
 * MacroDisplay Component Tests
 *
 * These tests verify the macro display component.
 * They should FAIL before implementation.
 */
import { render, screen } from '@testing-library/react';
import MacroDisplay from '../../src/components/MacroDisplay';

describe('MacroDisplay Component', () => {
  const defaultProps = {
    calories: 1500,
    protein: 75,
    carbs: 200,
    fat: 50,
  };

  describe('Rendering', () => {
    it('renders calories value', () => {
      render(<MacroDisplay {...defaultProps} />);
      expect(screen.getByText('1500')).toBeInTheDocument();
    });

    it('renders protein value with unit', () => {
      render(<MacroDisplay {...defaultProps} />);
      expect(screen.getByText(/75/)).toBeInTheDocument();
      expect(screen.getByText(/protein/i)).toBeInTheDocument();
    });

    it('renders carbs value with unit', () => {
      render(<MacroDisplay {...defaultProps} />);
      expect(screen.getByText(/200/)).toBeInTheDocument();
      expect(screen.getByText(/carbs/i)).toBeInTheDocument();
    });

    it('renders fat value with unit', () => {
      render(<MacroDisplay {...defaultProps} />);
      expect(screen.getByText(/50/)).toBeInTheDocument();
      expect(screen.getByText(/fat/i)).toBeInTheDocument();
    });

    it('renders zero values correctly', () => {
      render(<MacroDisplay calories={0} protein={0} carbs={0} fat={0} />);
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('With Goals', () => {
    const goalsProps = {
      ...defaultProps,
      goals: {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 65,
      },
    };

    it('shows progress toward calorie goal', () => {
      render(<MacroDisplay {...goalsProps} />);
      // Should show something like "1500 / 2000" or a progress bar
      expect(screen.getByText(/2000/)).toBeInTheDocument();
    });

    it('shows progress bars when goals are set', () => {
      render(<MacroDisplay {...goalsProps} />);
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(1);
    });

    it('calculates correct percentage', () => {
      render(<MacroDisplay {...goalsProps} />);
      // 1500/2000 = 75%
      expect(screen.getByText(/75%?/)).toBeInTheDocument();
    });

    it('handles over-goal values', () => {
      render(
        <MacroDisplay
          calories={2500}
          protein={75}
          carbs={200}
          fat={50}
          goals={{ calories: 2000, protein: 100, carbs: 250, fat: 65 }}
        />
      );
      // Should indicate over goal, e.g., red color or "125%"
      const overIndicator = screen.getByTestId('calories-progress') || screen.getByText(/125%|over/i);
      expect(overIndicator).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('rounds decimal values appropriately', () => {
      render(<MacroDisplay calories={1523} protein={75.5} carbs={199.8} fat={50.2} />);
      // Should display rounded or formatted values
      expect(screen.getByText(/1523|1,523/)).toBeInTheDocument();
    });

    it('formats large calorie values with commas', () => {
      render(<MacroDisplay calories={2500} protein={100} carbs={300} fat={80} />);
      expect(screen.getByText(/2,?500/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for screen readers', () => {
      render(<MacroDisplay {...defaultProps} />);
      expect(screen.getByLabelText(/calories/i) || screen.getByText(/calories/i)).toBeInTheDocument();
    });

    it('progress bars have aria attributes', () => {
      render(
        <MacroDisplay
          {...defaultProps}
          goals={{ calories: 2000, protein: 100, carbs: 250, fat: 65 }}
        />
      );
      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('aria-valuemax');
      });
    });
  });

  describe('Compact Mode', () => {
    it('supports compact display mode', () => {
      render(<MacroDisplay {...defaultProps} compact />);
      const container = screen.getByTestId('macro-display');
      expect(container).toHaveClass('compact');
    });
  });
});
