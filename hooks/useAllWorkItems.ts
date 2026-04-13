// Custom hook for fetching all work items (for dropdowns/selects)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkItem } from '@/types/work-item';

interface UseAllWorkItemsOptions {
  projectId?: string;
}

interface UseAllWorkItemsResult {
  workItems: WorkItem[];
  loading: boolean;
  error: string | null;
  fetchWorkItems: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAllWorkItems(options: UseAllWorkItemsOptions = {}): UseAllWorkItemsResult {
  const { projectId } = options;

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        limit: '1000', // Fetch all
      });

      const response = await fetch(`/api/work-items?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        setWorkItems(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch work items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchWorkItems();
  }, [fetchWorkItems]);

  // Fetch when options change
  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  return {
    workItems,
    loading,
    error,
    fetchWorkItems,
    refresh,
  };
}
