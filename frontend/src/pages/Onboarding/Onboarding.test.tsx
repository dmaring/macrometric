/**
 * Tests for Onboarding page.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingPage from './index';
import * as goalsService from '../../services/goals';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/goals');

describe('OnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderOnboarding = () => {
    return render(
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    );
  };

  it('should render onboarding form', () => {
    renderOnboarding();

    expect(screen.getByText('Set Your Daily Goals')).toBeInTheDocument();
    expect(screen.getByLabelText(/daily calories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carbs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fat/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set goals/i })).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    renderOnboarding();

    const caloriesInput = screen.getByLabelText(/daily calories/i);
    const proteinInput = screen.getByLabelText(/protein/i);

    fireEvent.change(caloriesInput, { target: { value: '2000' } });
    fireEvent.change(proteinInput, { target: { value: '150' } });

    expect(caloriesInput).toHaveValue(2000);
    expect(proteinInput).toHaveValue(150);
  });

  it('should have HTML5 validation on calories input', () => {
    renderOnboarding();

    const caloriesInput = screen.getByLabelText(/daily calories/i) as HTMLInputElement;

    expect(caloriesInput).toHaveAttribute('min', '500');
    expect(caloriesInput).toHaveAttribute('max', '10000');
    expect(caloriesInput).toHaveAttribute('type', 'number');
  });

  it('should have HTML5 validation on macro inputs', () => {
    renderOnboarding();

    const proteinInput = screen.getByLabelText(/protein/i) as HTMLInputElement;
    const carbsInput = screen.getByLabelText(/carbs/i) as HTMLInputElement;
    const fatInput = screen.getByLabelText(/fat/i) as HTMLInputElement;

    expect(proteinInput).toHaveAttribute('min', '0');
    expect(proteinInput).toHaveAttribute('step', '0.1');
    expect(carbsInput).toHaveAttribute('min', '0');
    expect(carbsInput).toHaveAttribute('step', '0.1');
    expect(fatInput).toHaveAttribute('min', '0');
    expect(fatInput).toHaveAttribute('step', '0.1');
  });

  it('should require at least one field', async () => {
    renderOnboarding();

    const submitButton = screen.getByRole('button', { name: /set goals/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please set at least one goal/i)).toBeInTheDocument();
    });
  });

  it('should submit valid full goals', async () => {
    (goalsService.setGoals as jest.Mock).mockResolvedValue({
      calories: 2000,
      protein_g: 150,
      carbs_g: 250,
      fat_g: 65,
    });

    renderOnboarding();

    fireEvent.change(screen.getByLabelText(/daily calories/i), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText(/protein/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/carbs/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/fat/i), { target: { value: '65' } });

    fireEvent.click(screen.getByRole('button', { name: /set goals/i }));

    await waitFor(() => {
      expect(goalsService.setGoals).toHaveBeenCalledWith({
        calories: 2000,
        protein_g: 150,
        carbs_g: 250,
        fat_g: 65,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/diary');
    });
  });

  it('should submit partial goals', async () => {
    (goalsService.setGoals as jest.Mock).mockResolvedValue({
      calories: 1800,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
    });

    renderOnboarding();

    fireEvent.change(screen.getByLabelText(/daily calories/i), { target: { value: '1800' } });

    fireEvent.click(screen.getByRole('button', { name: /set goals/i }));

    await waitFor(() => {
      expect(goalsService.setGoals).toHaveBeenCalledWith({
        calories: 1800,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/diary');
    });
  });

  it('should handle skip onboarding', async () => {
    (goalsService.skipOnboarding as jest.Mock).mockResolvedValue(undefined);

    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: /skip for now/i }));

    await waitFor(() => {
      expect(goalsService.skipOnboarding).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/diary');
    });
  });

  it('should show error on submission failure', async () => {
    (goalsService.setGoals as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderOnboarding();

    fireEvent.change(screen.getByLabelText(/daily calories/i), { target: { value: '2000' } });
    fireEvent.click(screen.getByRole('button', { name: /set goals/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to save goals/i)).toBeInTheDocument();
    });
  });

  it('should disable buttons while submitting', async () => {
    (goalsService.setGoals as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderOnboarding();

    fireEvent.change(screen.getByLabelText(/daily calories/i), { target: { value: '2000' } });
    const submitButton = screen.getByRole('button', { name: /set goals/i });
    const skipButton = screen.getByRole('button', { name: /skip for now/i });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(skipButton).toBeDisabled();
  });

  it('should clear errors when user changes field', async () => {
    (goalsService.setGoals as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderOnboarding();

    const caloriesInput = screen.getByLabelText(/daily calories/i);
    const submitButton = screen.getByRole('button', { name: /set goals/i });

    // Trigger submission error
    fireEvent.change(caloriesInput, { target: { value: '2000' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save goals/i)).toBeInTheDocument();
    });

    // Change field should clear error
    fireEvent.change(caloriesInput, { target: { value: '2100' } });

    expect(screen.queryByText(/failed to save goals/i)).not.toBeInTheDocument();
  });
});
