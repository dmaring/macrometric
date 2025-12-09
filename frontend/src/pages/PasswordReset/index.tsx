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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface to-surface-secondary p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-surface-secondary rounded-xl p-10 sm:p-8 shadow-2xl border border-border">
          <h1 className="m-0 mb-6 text-3xl sm:text-2xl font-bold text-content text-center">
            {mode === 'request' ? 'Reset Password' : 'Set New Password'}
          </h1>

          {mode === 'request' ? (
            // Request reset form
            requestSent ? (
              <div className="text-center py-8">
                <p className="text-6xl text-success m-0 mb-4">✓</p>
                <p className="text-lg font-semibold text-content m-0 mb-3">
                  Check your email for password reset instructions.
                </p>
                <p className="text-sm text-content-secondary m-0 mb-6">
                  If you don't see the email, check your spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover min-h-[44px]"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
                <p className="m-0 mb-6 text-content-secondary text-sm text-center leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                {requestError && (
                  <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-medium" role="alert">
                    {requestError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-semibold text-sm text-content-secondary">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={requestLoading}
                    className="px-4 py-3 border border-border rounded-lg text-base text-content bg-surface-tertiary transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:bg-surface disabled:cursor-not-allowed placeholder:text-content-tertiary min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-h-[44px]"
                  disabled={requestLoading}
                >
                  {requestLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-transparent text-content-secondary border border-border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-surface hover:text-content disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
                  disabled={requestLoading}
                >
                  Back to Login
                </button>
              </form>
            )
          ) : (
            // Reset password form
            resetSuccess ? (
              <div className="text-center py-8">
                <p className="text-6xl text-success m-0 mb-4">✓</p>
                <p className="text-lg font-semibold text-content m-0 mb-3">
                  Your password has been reset successfully!
                </p>
                <p className="text-sm text-content-secondary m-0 mb-6">
                  Redirecting to login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <p className="m-0 mb-6 text-content-secondary text-sm text-center leading-relaxed">
                  Enter your new password below.
                </p>

                {resetError && (
                  <div className="px-4 py-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-medium" role="alert">
                    {resetError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className="font-semibold text-sm text-content-secondary">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={8}
                    required
                    disabled={resetLoading}
                    className="px-4 py-3 border border-border rounded-lg text-base text-content bg-surface-tertiary transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:bg-surface disabled:cursor-not-allowed placeholder:text-content-tertiary min-h-[44px]"
                  />
                  <small className="text-xs text-content-tertiary">
                    Must be at least 8 characters
                  </small>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="font-semibold text-sm text-content-secondary">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                    disabled={resetLoading}
                    className="px-4 py-3 border border-border rounded-lg text-base text-content bg-surface-tertiary transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:bg-surface disabled:cursor-not-allowed placeholder:text-content-tertiary min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-h-[44px]"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-transparent text-content-secondary border border-border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-surface hover:text-content disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
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
