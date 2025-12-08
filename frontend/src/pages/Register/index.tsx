/**
 * Register Page Component
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Register.css';

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

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <p className="subtitle">Join Macrometric today</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span id="email-error" className="error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
            />
            {password && (
              <div className="password-strength" data-testid="password-strength">
                <span className={`strength-indicator ${passwordStrength}`}>
                  Password strength: {passwordStrength}
                </span>
              </div>
            )}
            {errors.password && (
              <span id="password-error" className="error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <span id="confirm-error" className="error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {serverError && (
            <div className="server-error" role="alert">
              {serverError}
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="links">
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}
