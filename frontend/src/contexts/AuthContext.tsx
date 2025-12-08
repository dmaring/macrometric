/**
 * Auth Context for shared authentication state across components.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as authService from '../services/auth';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.hasStoredTokens()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          // Token invalid, try refresh
          try {
            await authService.refreshToken();
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch {
            // Refresh failed, user is not authenticated
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser({
        id: response.id,
        email: response.email,
        onboarding_completed: response.onboarding_completed,
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setError(null);
    try {
      const response = await authService.register(credentials);
      setUser({
        id: response.id,
        email: response.email,
        onboarding_completed: response.onboarding_completed,
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboarding_completed: true } : null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: user !== null,
    needsOnboarding: user !== null && !user.onboarding_completed,
    login,
    register,
    logout,
    clearError,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
