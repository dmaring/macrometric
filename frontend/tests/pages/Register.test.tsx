/**
 * Register Page Component Tests
 *
 * These tests verify the Register page UI and behavior.
 * They should FAIL before implementation.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../src/pages/Register';

// Mock the auth service
jest.mock('../../src/services/auth', () => ({
  register: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { register } from '../../src/services/auth';

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders email input field', () => {
      renderRegister();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders password input field', () => {
      renderRegister();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('renders confirm password input field', () => {
      renderRegister();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderRegister();
      expect(screen.getByRole('button', { name: /register|sign up|create account/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
      renderRegister();
      expect(screen.getByRole('link', { name: /log in|sign in|already have/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      renderRegister();
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required|please enter.*email/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      renderRegister();
      const emailInput = screen.getByLabelText(/email/i);

      await userEvent.type(emailInput, 'not-valid-email');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email|valid email/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);

      await userEvent.type(passwordInput, 'short');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters|too short|minimum/i)).toBeInTheDocument();
      });
    });

    it('shows error when password has no number', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);

      await userEvent.type(passwordInput, 'NoNumberHere');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/must contain.*number|at least one number/i)).toBeInTheDocument();
      });
    });

    it('shows error when password has no letter', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);

      await userEvent.type(passwordInput, '12345678');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/must contain.*letter|at least one letter/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await userEvent.type(passwordInput, 'Password123');
      await userEvent.type(confirmInput, 'DifferentPass123');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords.*match|do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls register service with email and password', async () => {
      (register as jest.Mock).mockResolvedValue({ access_token: 'token', onboarding_completed: false });
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'NewPassword123');
      await userEvent.type(confirmInput, 'NewPassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'NewPassword123',
        });
      });
    });

    it('shows loading state during submission', async () => {
      (register as jest.Mock).mockImplementation(() => new Promise(() => {}));
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'NewPassword123');
      await userEvent.type(confirmInput, 'NewPassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });

    it('navigates to onboarding on successful registration', async () => {
      (register as jest.Mock).mockResolvedValue({ access_token: 'token', onboarding_completed: false });
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'NewPassword123');
      await userEvent.type(confirmInput, 'NewPassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('shows error message on registration failure', async () => {
      (register as jest.Mock).mockRejectedValue(new Error('Email already exists'));
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'NewPassword123');
      await userEvent.type(confirmInput, 'NewPassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/already exists|registration failed|try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Strength Indicator', () => {
    it('shows password strength indicator', () => {
      renderRegister();
      expect(screen.getByTestId('password-strength') || screen.getByText(/password strength/i)).toBeInTheDocument();
    });

    it('indicates weak password', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);

      await userEvent.type(passwordInput, 'weak1');

      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument();
      });
    });

    it('indicates strong password', async () => {
      renderRegister();
      const passwordInput = screen.getByLabelText(/^password$/i);

      await userEvent.type(passwordInput, 'VeryStrongPassword123!');

      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      renderRegister();

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });

    it('announces validation errors to screen readers', async () => {
      renderRegister();
      const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorElements = screen.getAllByRole('alert');
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });
});
