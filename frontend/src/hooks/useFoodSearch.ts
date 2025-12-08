/**
 * useFoodSearch Hook
 *
 * Manages food search state with debouncing and caching.
 * Implements 300ms debounce for optimal UX.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchFoods, Food, FoodSearchResponse } from '../services/foods';

const DEBOUNCE_DELAY = 300; // ms
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: FoodSearchResponse;
  timestamp: number;
}

// Simple in-memory cache for search results
const searchCache = new Map<string, CacheEntry>();

interface UseFoodSearchResult {
  results: Food[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export function useFoodSearch(): UseFoodSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search for empty or very short queries
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.data.results);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce the search
    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await searchFoods(query.trim(), 10);

        // Only update if this request wasn't aborted
        if (!controller.signal.aborted) {
          setResults(response.results);

          // Cache the results
          searchCache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
          });

          // Clean old cache entries (keep cache size reasonable)
          if (searchCache.size > 50) {
            const oldestKeys = Array.from(searchCache.entries())
              .sort((a, b) => a[1].timestamp - b[1].timestamp)
              .slice(0, 10)
              .map(([key]) => key);
            oldestKeys.forEach(key => searchCache.delete(key));
          }

          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          // Check if offline
          if (!navigator.onLine) {
            setError('You appear to be offline. Please check your internet connection.');
          } else {
            setError('Failed to search for foods. Please try again.');
          }

          // Try to use cached results as fallback
          const cached = searchCache.get(cacheKey);
          if (cached) {
            setResults(cached.data.results);
            setError('Showing cached results (unable to fetch latest data)');
          } else {
            setResults([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}
