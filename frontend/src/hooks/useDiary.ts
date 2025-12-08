/**
 * useDiary hook for diary state management.
 */
import { useState, useEffect, useCallback } from 'react';
import * as diaryService from '../services/diary';
import type { DiaryData, AddEntryRequest, UpdateEntryRequest, DiaryEntry } from '../services/diary';

interface UseDiaryReturn {
  diary: DiaryData | null;
  loading: boolean;
  error: string | null;
  pending: boolean;
  addEntry: (data: AddEntryRequest) => Promise<DiaryEntry>;
  updateEntry: (entryId: string, data: UpdateEntryRequest) => Promise<DiaryEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDiary(date: Date): UseDiaryReturn {
  const [diary, setDiary] = useState<DiaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fetchDiary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await diaryService.getDiary(date);
      setDiary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load diary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const addEntry = useCallback(async (data: AddEntryRequest): Promise<DiaryEntry> => {
    setPending(true);
    try {
      const entry = await diaryService.addEntry(date, data);
      // Refresh diary to get updated totals
      await fetchDiary();
      return entry;
    } finally {
      setPending(false);
    }
  }, [date, fetchDiary]);

  const updateEntry = useCallback(async (entryId: string, data: UpdateEntryRequest): Promise<DiaryEntry> => {
    setPending(true);
    try {
      const entry = await diaryService.updateEntry(entryId, data);
      // Refresh diary to get updated totals
      await fetchDiary();
      return entry;
    } finally {
      setPending(false);
    }
  }, [fetchDiary]);

  const deleteEntry = useCallback(async (entryId: string): Promise<void> => {
    setPending(true);
    try {
      await diaryService.deleteEntry(entryId);
      // Refresh diary to get updated totals
      await fetchDiary();
    } finally {
      setPending(false);
    }
  }, [fetchDiary]);

  const refresh = useCallback(async () => {
    await fetchDiary();
  }, [fetchDiary]);

  return {
    diary,
    loading,
    error,
    pending,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh,
  };
}

export default useDiary;
