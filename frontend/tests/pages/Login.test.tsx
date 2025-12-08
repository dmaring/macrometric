/**
 * Login Page Component Tests
 *
 * These tests verify the Login page UI and behavior.
 * They should FAIL before implementation.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';

// Mock the auth service
jest.mock('../../src/services/auth', () => ({
  login: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { login } from '../../src/services/auth';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders email input field', () => {
      renderLogin();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders password input field', () => {
      renderLogin();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      renderLogin();
      expect(screen.getByRole('button', { name: /log in|sign in/i })).toBeInTheDocument();
    });

    it('renders link to registration page', () => {
      renderLogin();
      expect(screen.getByRole('link', { name: /register|sign up|create account/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      renderLogin();
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty on submit', async () => {
      renderLogin();
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required|please enter.*email/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is empty on submit', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required|please enter.*password/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'not-an-email');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email|valid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls login service with email and password', async () => {
      (login as jest.Mock).mockResolvedValue({ access_token: 'token' });
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
        });
      });
    });

    it('shows loading state during submission', async () => {
      (login as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logging in|loading/i })).toBeDisabled();
      });
    });

    it('navigates to diary page on successful login', async () => {
      (login as jest.Mock).mockResolvedValue({ access_token: 'token' });
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/diary');
      });
    });

    it('shows error message on login failure', async () => {
      (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'WrongPassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials|login failed|incorrect/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('supports keyboard navigation', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);

      // Tab to email, type, tab to password, type, tab to submit, enter
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));

      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /log in|sign in/i }));
    });
  });
});
