// Custom hook for work items data fetching with URL-based pagination and filtering
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkItem } from '@/types/work-item';
import { apiFetch } from '@/utils/api-client';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseWorkItemsOptions {
  projectId?: string;
  search: string;
  status: string;
  priority: string;
  workType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  alwaysShowPagination?: boolean;
}

interface UseWorkItemsResult {
  workItems: WorkItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchWorkItems: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWorkItems(options: UseWorkItemsOptions): UseWorkItemsResult {
  const {
    projectId,
    search,
    status,
    priority,
    workType,
    sortBy,
    sortOrder,
    page,
    limit,
    alwaysShowPagination = false,
  } = options;

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit,
    total: 0,
    totalPages: alwaysShowPagination ? 1 : 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchWorkItems = useCallback(async () => {
    if (!projectId) {
      setWorkItems([]);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        total: 0,
        totalPages: alwaysShowPagination ? 1 : 0,
        hasNextPage: false,
        hasPrevPage: false,
      }));
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        project_id: projectId,
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        ...(priority && priority !== 'all' && { priority }),
        ...(workType && workType !== 'all' && { work_type: workType }),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const response = await apiFetch(`/api/work-items?${params.toString()}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });
      const data = await response.json();

      if (data.success) {
        setWorkItems(data.data || []);
        setPagination({
          ...data.pagination,
          totalPages: alwaysShowPagination ? Math.max(data.pagination.totalPages, 1) : data.pagination.totalPages,
        });
      } else {
        setError(data.error || 'Failed to fetch work items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, search, status, priority, workType, sortBy, sortOrder, page, limit, alwaysShowPagination]);

  const refresh = useCallback(async () => {
    await fetchWorkItems();
  }, [fetchWorkItems]);

  // Fetch when any filter/pagination param changes
  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  return {
    workItems,
    loading,
    error,
    pagination,
    fetchWorkItems,
    refresh,
  };
}
