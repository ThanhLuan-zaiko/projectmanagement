// Custom hook for expert estimates data fetching with URL-based pagination and filtering
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpertTimeEstimate } from '@/types/expert-estimate';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseExpertEstimatesOptions {
  projectId: string;
  workItemId: string;
  expertId: string;
  confidence: string;
  method: string;
  page: number;
  limit: number;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
  alwaysShowPagination?: boolean;
}

interface UseExpertEstimatesResult {
  estimates: ExpertTimeEstimate[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchEstimates: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useExpertEstimates(options: UseExpertEstimatesOptions): UseExpertEstimatesResult {
  const {
    projectId,
    workItemId,
    expertId,
    confidence,
    method,
    page,
    limit,
    includeDeleted = false,
    deletedOnly = false,
    alwaysShowPagination = false,
  } = options;

  const [estimates, setEstimates] = useState<ExpertTimeEstimate[]>([]);
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

  const fetchEstimates = useCallback(async () => {
    if (!projectId && !expertId) {
      setEstimates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(projectId && { project_id: projectId }),
        ...(workItemId && { work_item_id: workItemId }),
        ...(expertId && { expert_id: expertId }),
        ...(confidence && confidence !== 'all' && { confidence }),
        ...(method && method !== 'all' && { method }),
        ...(includeDeleted && { include_deleted: 'true' }),
        ...(deletedOnly && { deleted_only: 'true' }),
      });

      const response = await fetch(`/api/expert-estimates?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        setEstimates(data.data || []);
        setPagination({
          ...data.pagination,
          totalPages: alwaysShowPagination ? Math.max(data.pagination.totalPages, 1) : data.pagination.totalPages,
        });
      } else {
        setError(data.error || 'Failed to fetch expert estimates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, workItemId, expertId, confidence, method, page, limit, includeDeleted, deletedOnly, alwaysShowPagination]);

  const refresh = useCallback(async () => {
    await fetchEstimates();
  }, [fetchEstimates]);

  // Fetch when any filter/pagination param changes
  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  return {
    estimates,
    loading,
    error,
    pagination,
    fetchEstimates,
    refresh,
  };
}
