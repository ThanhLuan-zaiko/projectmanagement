// Custom hook for work schedules data fetching with URL-based pagination and filtering
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkItemSchedule } from '@/types/work-schedule';
import { apiFetch } from '@/utils/api-client';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseWorkSchedulesOptions {
  projectId?: string;
  search?: string;
  status: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
  alwaysShowPagination?: boolean;
}

interface UseWorkSchedulesResult {
  schedules: WorkItemSchedule[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchSchedules: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWorkSchedules(options: UseWorkSchedulesOptions): UseWorkSchedulesResult {
  const {
    projectId,
    search = '',
    status,
    sortBy = 'scheduled_at',
    sortOrder = 'desc',
    page,
    limit,
    includeDeleted = false,
    deletedOnly = false,
    alwaysShowPagination = false,
  } = options;

  const [schedules, setSchedules] = useState<WorkItemSchedule[]>([]);
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

  const fetchSchedules = useCallback(async () => {
    if (!projectId) {
      setSchedules([]);
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
        page: page.toString(),
        limit: limit.toString(),
        project_id: projectId,
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(includeDeleted && { include_deleted: 'true' }),
        ...(deletedOnly && { deleted_only: 'true' }),
      });

      const response = await apiFetch(`/api/work-schedules?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        setSchedules(data.data || []);
        setPagination({
          ...data.pagination,
          totalPages: alwaysShowPagination ? Math.max(data.pagination.totalPages, 1) : data.pagination.totalPages,
        });
      } else {
        setError(data.error || 'Failed to fetch work schedules');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, search, status, sortBy, sortOrder, page, limit, includeDeleted, deletedOnly, alwaysShowPagination]);

  const refresh = useCallback(async () => {
    await fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    pagination,
    fetchSchedules,
    refresh,
  };
}
