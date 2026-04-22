'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProjectSummaryResponse } from '@/types/project';
import { apiFetch } from '@/utils/api-client';

const SUMMARY_CACHE_TTL = 5000;

let summaryCache: {
  data: ProjectSummaryResponse | null;
  timestamp: number;
  pending: Promise<ProjectSummaryResponse | null> | null;
} = {
  data: null,
  timestamp: 0,
  pending: null,
};

export function useProjectSummary() {
  const [summary, setSummary] = useState<ProjectSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!force && summaryCache.data && Date.now() - summaryCache.timestamp < SUMMARY_CACHE_TTL) {
        setSummary(summaryCache.data);
        return;
      }

      if (!force && summaryCache.pending) {
        const cachedSummary = await summaryCache.pending;
        setSummary(cachedSummary);
        return;
      }

      summaryCache.pending = (async () => {
        const response = await apiFetch('/api/projects/summary', {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch project summary');
        }

        summaryCache = {
          data: data.data,
          timestamp: Date.now(),
          pending: null,
        };

        return data.data as ProjectSummaryResponse;
      })();

      const nextSummary = await summaryCache.pending;
      setSummary(nextSummary);
    } catch (err) {
      summaryCache.pending = null;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: () => fetchSummary(true),
  };
}
