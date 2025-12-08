/**
 * DateNavigator Component Tests
 *
 * These tests verify the date navigation component.
 * They should FAIL before implementation.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateNavigator from '../../src/components/DateNavigator';

describe('DateNavigator Component', () => {
  const mockDate = new Date('2025-12-06');
  const defaultProps = {
    date: mockDate,
    onDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the current date', () => {
      render(<DateNavigator {...defaultProps} />);
      // Should display something like "December 6, 2025" or "Sat, Dec 6"
      expect(screen.getByText(/dec|december/i)).toBeInTheDocument();
      expect(screen.getByText(/6/)).toBeInTheDocument();
    });

    it('renders previous day button', () => {
      render(<DateNavigator {...defaultProps} />);
      expect(screen.getByRole('button', { name: /previous|back|←|left/i })).toBeInTheDocument();
    });

    it('renders next day button', () => {
      render(<DateNavigator {...defaultProps} />);
      expect(screen.getByRole('button', { name: /next|forward|→|right/i })).toBeInTheDocument();
    });

    it('renders today button', () => {
      render(<DateNavigator {...defaultProps} />);
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onDateChange with previous day', async () => {
      render(<DateNavigator {...defaultProps} />);
      const prevButton = screen.getByRole('button', { name: /previous|back|←|left/i });

      await userEvent.click(prevButton);

      expect(defaultProps.onDateChange).toHaveBeenCalledWith(
        expect.objectContaining({ getDate: expect.any(Function) })
      );
      // Verify it's December 5
      const calledDate = defaultProps.onDateChange.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(5);
    });

    it('calls onDateChange with next day', async () => {
      render(<DateNavigator {...defaultProps} />);
      const nextButton = screen.getByRole('button', { name: /next|forward|→|right/i });

      await userEvent.click(nextButton);

      const calledDate = defaultProps.onDateChange.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(7);
    });

    it('calls onDateChange with today when today button clicked', async () => {
      const pastDate = new Date('2025-11-01');
      render(<DateNavigator {...defaultProps} date={pastDate} />);
      const todayButton = screen.getByRole('button', { name: /today/i });

      await userEvent.click(todayButton);

      // Should be called with today's date
      expect(defaultProps.onDateChange).toHaveBeenCalled();
    });
  });

  describe('Today Indication', () => {
    it('shows "Today" label when viewing today', () => {
      const today = new Date();
      render(<DateNavigator {...defaultProps} date={today} />);
      expect(screen.getByText(/today/i)).toBeInTheDocument();
    });

    it('shows "Yesterday" label when viewing yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      render(<DateNavigator {...defaultProps} date={yesterday} />);
      expect(screen.getByText(/yesterday/i)).toBeInTheDocument();
    });

    it('shows "Tomorrow" label when viewing tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      render(<DateNavigator {...defaultProps} date={tomorrow} />);
      expect(screen.getByText(/tomorrow/i)).toBeInTheDocument();
    });

    it('disables today button when already on today', () => {
      const today = new Date();
      render(<DateNavigator {...defaultProps} date={today} />);
      const todayButton = screen.getByRole('button', { name: /today/i });
      expect(todayButton).toBeDisabled();
    });
  });

  describe('Date Picker', () => {
    it('opens date picker when date is clicked', async () => {
      render(<DateNavigator {...defaultProps} />);
      const dateDisplay = screen.getByRole('button', { name: /dec|december/i }) ||
                          screen.getByText(/december/i);

      await userEvent.click(dateDisplay);

      // Should show a calendar or date picker
      expect(screen.getByRole('dialog') || screen.getByRole('grid')).toBeInTheDocument();
    });

    it('selects date from picker', async () => {
      render(<DateNavigator {...defaultProps} />);
      const dateDisplay = screen.getByText(/december/i);

      await userEvent.click(dateDisplay);

      // Click on a specific date in the picker
      const day15 = screen.getByRole('button', { name: /15/ });
      await userEvent.click(day15);

      expect(defaultProps.onDateChange).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports left arrow for previous day', async () => {
      render(<DateNavigator {...defaultProps} />);
      const navigator = screen.getByTestId('date-navigator');

      navigator.focus();
      await userEvent.keyboard('{ArrowLeft}');

      const calledDate = defaultProps.onDateChange.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(5);
    });

    it('supports right arrow for next day', async () => {
      render(<DateNavigator {...defaultProps} />);
      const navigator = screen.getByTestId('date-navigator');

      navigator.focus();
      await userEvent.keyboard('{ArrowRight}');

      const calledDate = defaultProps.onDateChange.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(7);
    });
  });

  describe('Accessibility', () => {
    it('has accessible date display', () => {
      render(<DateNavigator {...defaultProps} />);
      expect(screen.getByLabelText(/current date|selected date/i) ||
             screen.getByRole('status')).toBeInTheDocument();
    });

    it('navigation buttons have accessible names', () => {
      render(<DateNavigator {...defaultProps} />);
      const prevButton = screen.getByRole('button', { name: /previous|back/i });
      const nextButton = screen.getByRole('button', { name: /next|forward/i });

      expect(prevButton).toHaveAccessibleName();
      expect(nextButton).toHaveAccessibleName();
    });
  });
});
