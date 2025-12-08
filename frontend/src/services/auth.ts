/**
 * Authentication service for login, register, and token management.
 */
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  onboarding_completed: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  onboarding_completed: boolean;
}

/**
 * Register a new user account.
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', credentials);

  // Store tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);

  return response.data;
}

/**
 * Login with email and password.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  // Store tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);

  return response.data;
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshToken(): Promise<TokenResponse> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const response = await api.post<TokenResponse>('/auth/refresh', {
    refresh_token: refresh,
  });

  // Store new tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);

  return response.data;
}

/**
 * Logout current user.
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout errors
  } finally {
    // Always clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

/**
 * Get current authenticated user.
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

/**
 * Check if user has valid stored tokens.
 */
export function hasStoredTokens(): boolean {
  return !!localStorage.getItem('access_token');
}
