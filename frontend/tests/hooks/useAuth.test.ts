/**
 * useAuth Hook Tests
 *
 * These tests verify the authentication hook behavior.
 * They should FAIL before implementation.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';
import * as authService from '../../src/services/auth';

// Mock the auth service
jest.mock('../../src/services/auth');

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Initial State', () => {
    it('returns loading true initially', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.loading).toBe(true);
    });

    it('returns null user when not authenticated', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('restores user from stored token on mount', async () => {
      mockLocalStorage.setItem('access_token', 'valid-token');
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'stored@example.com',
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: '123',
        email: 'stored@example.com',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Login', () => {
    it('updates user state on successful login', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'refresh-token',
        user: { id: '456', email: 'login@example.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: 'login@example.com', password: 'password' });
      });

      expect(result.current.user).toEqual({ id: '456', email: 'login@example.com' });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('stores tokens on successful login', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        user: { id: '456', email: 'login@example.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: 'login@example.com', password: 'password' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token-123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token-123');
    });

    it('throws error on failed login', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login({ email: 'bad@example.com', password: 'wrong' });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets error state on failed login', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      try {
        await act(async () => {
          await result.current.login({ email: 'bad@example.com', password: 'wrong' });
        });
      } catch {
        // Expected to throw
      }

      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('Register', () => {
    it('updates user state on successful registration', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'refresh-token',
        user: { id: '789', email: 'register@example.com', onboarding_completed: false },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({ email: 'register@example.com', password: 'password' });
      });

      expect(result.current.user).toEqual({
        id: '789',
        email: 'register@example.com',
        onboarding_completed: false,
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns onboarding status after registration', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'refresh-token',
        user: { id: '789', email: 'register@example.com', onboarding_completed: false },
      });

      const { result } = renderHook(() => useAuth());

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register({ email: 'register@example.com', password: 'password' });
      });

      expect(registerResult).toHaveProperty('onboarding_completed', false);
    });
  });

  describe('Logout', () => {
    it('clears user state on logout', async () => {
      // Setup authenticated state
      mockLocalStorage.setItem('access_token', 'valid-token');
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'user@example.com',
      });
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('removes stored tokens on logout', async () => {
      mockLocalStorage.setItem('access_token', 'valid-token');
      mockLocalStorage.setItem('refresh_token', 'refresh-token');
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'user@example.com',
      });
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Token Refresh', () => {
    it('automatically refreshes token when expired', async () => {
      mockLocalStorage.setItem('access_token', 'expired-token');
      mockLocalStorage.setItem('refresh_token', 'valid-refresh');

      // First call fails with 401, then refresh succeeds
      (authService.getCurrentUser as jest.Mock)
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce({ id: '123', email: 'user@example.com' });
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authService.refreshToken).toHaveBeenCalled();
    });

    it('logs out user when refresh token is invalid', async () => {
      mockLocalStorage.setItem('access_token', 'expired-token');
      mockLocalStorage.setItem('refresh_token', 'invalid-refresh');

      (authService.getCurrentUser as jest.Mock).mockRejectedValue({ response: { status: 401 } });
      (authService.refreshToken as jest.Mock).mockRejectedValue(new Error('Invalid refresh token'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Onboarding Status', () => {
    it('returns needsOnboarding true when onboarding not completed', async () => {
      mockLocalStorage.setItem('access_token', 'valid-token');
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'user@example.com',
        onboarding_completed: false,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.needsOnboarding).toBe(true);
    });

    it('returns needsOnboarding false when onboarding completed', async () => {
      mockLocalStorage.setItem('access_token', 'valid-token');
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'user@example.com',
        onboarding_completed: true,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.needsOnboarding).toBe(false);
    });
  });
});
