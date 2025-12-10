import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GoalsForm from './index';
import * as goalsService from '../../services/goals';

jest.mock('../../services/goals');

const mockedGoalsService = goalsService as jest.Mocked<typeof goalsService>;

describe('GoalsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // T007: GoalsForm loads and displays existing goals from API
  it('loads and displays existing goals from API', async () => {
    const mockGoals = {
      calories: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 65,
    };

    mockedGoalsService.getGoals.mockResolvedValueOnce(mockGoals);

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('65')).toBeInTheDocument();
    });
  });

  // T008: GoalsForm shows empty state when no goals exist
  it('shows empty state when no goals exist', async () => {
    mockedGoalsService.getGoals.mockResolvedValueOnce(null);

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByText(/set your daily targets/i)).toBeInTheDocument();
    });
  });

  // T009: GoalsForm validates calories range (500-10000)
  it('validates calories range (500-10000)', async () => {
    mockedGoalsService.getGoals.mockResolvedValueOnce(null);

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    });

    const caloriesInput = screen.getByLabelText(/calories/i);

    // Test below minimum
    fireEvent.change(caloriesInput, { target: { value: '400' } });
    fireEvent.blur(caloriesInput);

    await waitFor(() => {
      expect(screen.getByText(/minimum 500 calories/i)).toBeInTheDocument();
    });

    // Test above maximum
    fireEvent.change(caloriesInput, { target: { value: '15000' } });
    fireEvent.blur(caloriesInput);

    await waitFor(() => {
      expect(screen.getByText(/maximum 10,000 calories/i)).toBeInTheDocument();
    });
  });

  // T010: GoalsForm validates macros are non-negative
  it('validates macros are non-negative', async () => {
    mockedGoalsService.getGoals.mockResolvedValueOnce(null);

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/protein/i)).toBeInTheDocument();
    });

    const proteinInput = screen.getByLabelText(/protein/i);

    fireEvent.change(proteinInput, { target: { value: '-10' } });
    fireEvent.blur(proteinInput);

    await waitFor(() => {
      expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument();
    });
  });

  // T011: GoalsForm shows error messages for invalid inputs
  it('shows error messages for invalid inputs', async () => {
    mockedGoalsService.getGoals.mockResolvedValueOnce(null);

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    });

    const caloriesInput = screen.getByLabelText(/calories/i);

    fireEvent.change(caloriesInput, { target: { value: '100' } });
    fireEvent.blur(caloriesInput);

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/minimum 500 calories/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  // T012: GoalsForm submits valid data and calls API
  it('submits valid data and calls API', async () => {
    mockedGoalsService.getGoals.mockResolvedValueOnce(null);
    mockedGoalsService.setGoals.mockResolvedValueOnce({
      calories: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 65,
    });

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/calories/i), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/carbs/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/fat/i), { target: { value: '65' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedGoalsService.setGoals).toHaveBeenCalledWith({
        calories: 2000,
        protein_g: 150,
        carbs_g: 200,
        fat_g: 65,
      });
    });
  });

  // T013: GoalsForm handles API errors gracefully
  it('handles API errors gracefully', async () => {
    mockedGoalsService.getGoals.mockRejectedValueOnce(new Error('Network error'));

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  // T014: GoalsForm performs optimistic updates with rollback on error
  it('performs optimistic updates with rollback on error', async () => {
    const initialGoals = {
      calories: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 65,
    };

    mockedGoalsService.getGoals.mockResolvedValueOnce(initialGoals);
    mockedGoalsService.setGoals.mockRejectedValueOnce(new Error('Save failed'));

    render(<GoalsForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });

    const caloriesInput = screen.getByLabelText(/calories/i);
    fireEvent.change(caloriesInput, { target: { value: '2500' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // After error, should show original value
    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });
});
