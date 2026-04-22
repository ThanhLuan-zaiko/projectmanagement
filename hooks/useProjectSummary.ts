'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export function invalidateProjectSummaryCache() {
  summaryCache = {
    data: null,
    timestamp: 0,
    pending: null,
  };
}

export function useProjectSummary() {
  const [summary, setSummary] = useState<ProjectSummaryResponse | null>(summaryCache.data);
  const [loading, setLoading] = useState(() => !summaryCache.data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const summaryRef = useRef<ProjectSummaryResponse | null>(summaryCache.data);

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  const fetchSummary = useCallback(async (force = false) => {
    const hasRenderableData = Boolean(summaryRef.current || summaryCache.data);

    try {
      setError(null);

      if (!force && summaryCache.data && Date.now() - summaryCache.timestamp < SUMMARY_CACHE_TTL && !summaryCache.pending) {
        setSummary(summaryCache.data);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (!force && summaryCache.data) {
        setSummary(summaryCache.data);
      }

      if (!force && summaryCache.pending) {
        setLoading(!hasRenderableData);
        setIsRefreshing(hasRenderableData);
        const cachedSummary = await summaryCache.pending;
        setSummary(cachedSummary);
        return;
      }

      setLoading(!hasRenderableData);
      setIsRefreshing(hasRenderableData);

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

      if (!hasRenderableData) {
        setSummary(null);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    isRefreshing,
    error,
    refresh: () => fetchSummary(true),
  };
}
