/**
 * Register Page Component
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (hasLetter && hasNumber && hasSpecial && password.length >= 12) {
    return 'strong';
  }
  if (hasLetter && hasNumber) {
    return 'medium';
  }
  return 'weak';
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[a-zA-Z]/.test(password)) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!/\d/.test(password)) {
        newErrors.password = 'Password must contain at least one number';
      }
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password });
      navigate('/onboarding');
    } catch (err) {
      setServerError('Registration failed. Email may already be registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColors = {
    weak: 'text-error bg-error/10',
    medium: 'text-warning bg-warning/10',
    strong: 'text-success bg-success/10',
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-surface">
      <div className="w-full max-w-md p-8 bg-surface-secondary rounded-lg shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center mb-2 text-content">Create Account</h1>
        <p className="text-center text-content-secondary mb-6">Join Macrometric today</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-content"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-base border rounded-md bg-surface-tertiary border-border text-content transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-error"
            />
            {errors.email && (
              <span
                id="email-error"
                className="block mt-1 text-sm text-error"
                role="alert"
              >
                {errors.email}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-content"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-base border rounded-md bg-surface-tertiary border-border text-content transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-error"
            />
            {password && (
              <div className="mt-2" data-testid="password-strength">
                <span className={`inline-block text-sm px-2 py-1 rounded ${strengthColors[passwordStrength]}`}>
                  Password strength: {passwordStrength}
                </span>
              </div>
            )}
            {errors.password && (
              <span
                id="password-error"
                className="block mt-1 text-sm text-error"
                role="alert"
              >
                {errors.password}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 font-medium text-content"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-base border rounded-md bg-surface-tertiary border-border text-content transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed aria-[invalid=true]:border-error"
            />
            {errors.confirmPassword && (
              <span
                id="confirm-error"
                className="block mt-1 text-sm text-error"
                role="alert"
              >
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {serverError && (
            <div
              className="p-3 bg-error/10 border border-error rounded-md text-error text-center text-sm"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-base font-semibold text-white bg-primary rounded-md transition-colors duration-200 hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="text-primary hover:underline transition-all duration-150"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
