/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if not authenticated.
 * Redirects to onboarding if user hasn't completed it.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({
  children,
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, needsOnboarding, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if required and not completed
  if (requireOnboarding && needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
