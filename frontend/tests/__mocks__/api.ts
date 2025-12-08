/**
 * Mock API client for testing.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const checkOnline = (): boolean => true;

export default api;
