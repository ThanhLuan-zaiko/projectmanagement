'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Project } from '@/types/project';
import { apiFetch } from '@/utils/api-client';

const PROJECTS_CACHE_TTL = 5000;

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseProjectsOptions {
  scope?: 'owned' | 'member' | 'all';
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type ProjectsCacheEntry = {
  data: Project[];
  pagination: PaginationInfo;
  timestamp: number;
  pending: Promise<{ data: Project[]; pagination: PaginationInfo }> | null;
};

const projectsCache = new Map<string, ProjectsCacheEntry>();

export function useProjects(options: UseProjectsOptions = {}) {
  const {
    scope = 'all',
    search = '',
    status = 'all',
    page = 1,
    limit = 6,
    includeDeleted = false,
    deletedOnly = false,
    sortBy = 'updated_at',
    sortOrder = 'desc',
  } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchProjects = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        scope,
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        ...(includeDeleted && { include_deleted: 'true' }),
        ...(deletedOnly && { deleted_only: 'true' }),
      });
      const requestKey = params.toString();
      const existingEntry = projectsCache.get(requestKey);

      if (!force && existingEntry && Date.now() - existingEntry.timestamp < PROJECTS_CACHE_TTL) {
        setProjects(existingEntry.data);
        setPagination(existingEntry.pagination);
        return;
      }

      if (!force && existingEntry?.pending) {
        const cachedResult = await existingEntry.pending;
        setProjects(cachedResult.data);
        setPagination(cachedResult.pagination);
        return;
      }

      const pending = (async () => {
        const response = await apiFetch(`/api/projects?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch projects');
        }

        return {
          data: data.data || [],
          pagination: data.pagination || {
            page,
            limit,
            total: data.data?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      })();

      projectsCache.set(requestKey, {
        data: existingEntry?.data || [],
        pagination: existingEntry?.pagination || {
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        timestamp: existingEntry?.timestamp || 0,
        pending,
      });

      const result = await pending;
      projectsCache.set(requestKey, {
        data: result.data,
        pagination: result.pagination,
        timestamp: Date.now(),
        pending: null,
      });

      setProjects(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const params = new URLSearchParams({
        scope,
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(status && status !== 'all' && { status }),
        ...(includeDeleted && { include_deleted: 'true' }),
        ...(deletedOnly && { deleted_only: 'true' }),
      });
      projectsCache.delete(params.toString());
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [scope, page, limit, sortBy, sortOrder, search, status, includeDeleted, deletedOnly]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    pagination,
    refresh: () => fetchProjects(true),
  };
}
