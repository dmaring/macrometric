/**
 * Password Reset Page
 *
 * Allows users to reset their password via email link.
 * Two-step process:
 * 1. Request reset (enter email)
 * 2. Reset password (enter new password with token from email)
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './styles.css';

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Two modes: request reset or complete reset
  const [mode, setMode] = useState<'request' | 'reset'>(token ? 'reset' : 'request');

  // Request reset state
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);

    try {
      const response = await fetch('/api/v1/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to send reset email');
      }

      setRequestSent(true);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    // Validation
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/password-reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      setResetSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="password-reset">
      <div className="password-reset__container">
        <div className="password-reset__card">
          <h1 className="password-reset__title">
            {mode === 'request' ? 'Reset Password' : 'Set New Password'}
          </h1>

          {mode === 'request' ? (
            // Request reset form
            requestSent ? (
              <div className="password-reset__success">
                <p className="password-reset__success-icon">✓</p>
                <p className="password-reset__success-message">
                  Check your email for password reset instructions.
                </p>
                <p className="password-reset__success-note">
                  If you don't see the email, check your spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="password-reset__back-btn"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="password-reset__form">
                <p className="password-reset__description">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                {requestError && (
                  <div className="password-reset__error" role="alert">
                    {requestError}
                  </div>
                )}

                <div className="password-reset__field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={requestLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="password-reset__submit"
                  disabled={requestLoading}
                >
                  {requestLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="password-reset__cancel"
                  disabled={requestLoading}
                >
                  Back to Login
                </button>
              </form>
            )
          ) : (
            // Reset password form
            resetSuccess ? (
              <div className="password-reset__success">
                <p className="password-reset__success-icon">✓</p>
                <p className="password-reset__success-message">
                  Your password has been reset successfully!
                </p>
                <p className="password-reset__success-note">
                  Redirecting to login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="password-reset__form">
                <p className="password-reset__description">
                  Enter your new password below.
                </p>

                {resetError && (
                  <div className="password-reset__error" role="alert">
                    {resetError}
                  </div>
                )}

                <div className="password-reset__field">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={8}
                    required
                    disabled={resetLoading}
                  />
                  <small className="password-reset__hint">
                    Must be at least 8 characters
                  </small>
                </div>

                <div className="password-reset__field">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                    disabled={resetLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="password-reset__submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="password-reset__cancel"
                  disabled={resetLoading}
                >
                  Cancel
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
