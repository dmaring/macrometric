/**
 * Password Reset Page Tests
 *
 * Tests for the password reset flow including request and confirmation.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PasswordReset from '../../src/pages/PasswordReset';
import * as authService from '../../src/services/auth';

// Mock the auth service
vi.mock('../../src/services/auth', () => ({
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

describe('PasswordReset Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Password Reset', () => {
    it('should render the request form', () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should validate email field', async () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // Submit without email
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Submit with invalid email
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should submit password reset request successfully', async () => {
      vi.mocked(authService.requestPasswordReset).mockResolvedValue({
        message: 'If the email exists, a password reset link has been sent',
      });

      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
        expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument();
      });
    });

    it('should handle request error gracefully', async () => {
      vi.mocked(authService.requestPasswordReset).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      vi.mocked(authService.requestPasswordReset).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });
  });

  describe('Confirm Password Reset', () => {
    beforeEach(() => {
      // Mock URL with token parameter
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams('token=valid-token-123'),
        vi.fn(),
      ]);
    });

    it('should render the confirmation form when token is present', () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should validate new password', async () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /reset password/i });

      // Submit without password
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Submit with weak password
      const passwordInput = screen.getByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation matches', async () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
      });
    });

    it('should submit password reset confirmation successfully', async () => {
      vi.mocked(authService.confirmPasswordReset).mockResolvedValue({
        message: 'Password has been reset successfully',
      });

      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.confirmPasswordReset).toHaveBeenCalledWith(
          'valid-token-123',
          'SecurePass123'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle invalid token error', async () => {
      vi.mocked(authService.confirmPasswordReset).mockRejectedValue(
        new Error('Invalid or expired reset token')
      );

      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'SecurePass123' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
      });
    });

    it('should show password requirements hint', () => {
      render(
        <BrowserRouter>
          <PasswordReset />
        </BrowserRouter>
      );

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/letter and number/i)).toBeInTheDocument();
    });
  });
});
