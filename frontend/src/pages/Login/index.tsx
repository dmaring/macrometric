/**
 * Login Page Component
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
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
      await login({ email, password });
      navigate('/diary');
    } catch (err) {
      setServerError('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-surface">
      <div className="w-full max-w-md p-8 bg-surface-secondary rounded-lg shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center mb-2 text-content">Log In</h1>
        <p className="text-center text-content-secondary mb-6">Welcome back to Macrometric</p>

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
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex justify-between mt-6 text-sm">
          <Link
            to="/password-reset"
            className="text-primary hover:underline transition-all duration-150"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="text-primary hover:underline transition-all duration-150"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
