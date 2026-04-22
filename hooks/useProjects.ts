'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '@/types/project';
import { apiFetch } from '@/utils/api-client';

const PROJECTS_CACHE_TTL = 5000;

export interface PaginationInfo {
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

function createDefaultPagination(limit: number): PaginationInfo {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

function buildProjectsParams({
  scope,
  search,
  status,
  page,
  limit,
  includeDeleted,
  deletedOnly,
  sortBy,
  sortOrder,
}: Required<UseProjectsOptions>) {
  return new URLSearchParams({
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
}

function recomputePagination(currentPagination: PaginationInfo, total: number): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(total / currentPagination.limit));

  return {
    ...currentPagination,
    total,
    totalPages,
    hasNextPage: currentPagination.page < totalPages,
    hasPrevPage: currentPagination.page > 1,
  };
}

function readProjectsCache(requestKey: string) {
  return projectsCache.get(requestKey) ?? null;
}

function writeProjectsCache(requestKey: string, entry: ProjectsCacheEntry) {
  projectsCache.set(requestKey, entry);
}

export function invalidateProjectsCache() {
  projectsCache.clear();
}

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

  const resolvedOptions = useMemo<Required<UseProjectsOptions>>(
    () => ({
      scope,
      search,
      status,
      page,
      limit,
      includeDeleted,
      deletedOnly,
      sortBy,
      sortOrder,
    }),
    [scope, search, status, page, limit, includeDeleted, deletedOnly, sortBy, sortOrder]
  );
  const requestKey = useMemo(
    () => buildProjectsParams(resolvedOptions).toString(),
    [resolvedOptions]
  );
  const cachedEntry = readProjectsCache(requestKey);
  const defaultPagination = useMemo(() => createDefaultPagination(limit), [limit]);

  const [projects, setProjects] = useState<Project[]>(cachedEntry?.data ?? []);
  const [loading, setLoading] = useState(() => !cachedEntry);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>(cachedEntry?.pagination ?? defaultPagination);

  const stateRef = useRef({
    projects: cachedEntry?.data ?? [],
    pagination: cachedEntry?.pagination ?? defaultPagination,
  });

  useEffect(() => {
    stateRef.current = { projects, pagination };
  }, [projects, pagination]);

  const applyState = useCallback((nextProjects: Project[], nextPagination: PaginationInfo) => {
    setProjects(nextProjects);
    setPagination(nextPagination);
    stateRef.current = {
      projects: nextProjects,
      pagination: nextPagination,
    };
  }, []);

  const fetchProjects = useCallback(
    async (force = false) => {
      const params = buildProjectsParams(resolvedOptions);
      const existingEntry = readProjectsCache(requestKey);
      const hasRenderableData =
        stateRef.current.projects.length > 0 ||
        stateRef.current.pagination.total > 0 ||
        Boolean(existingEntry);

      try {
        setError(null);

        if (!force && existingEntry && Date.now() - existingEntry.timestamp < PROJECTS_CACHE_TTL && !existingEntry.pending) {
          applyState(existingEntry.data, existingEntry.pagination);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }

        if (!force && existingEntry?.data.length) {
          applyState(existingEntry.data, existingEntry.pagination);
        }

        if (!force && existingEntry?.pending) {
          setLoading(!hasRenderableData);
          setIsRefreshing(hasRenderableData);
          const cachedResult = await existingEntry.pending;
          applyState(cachedResult.data, cachedResult.pagination);
          return;
        }

        setLoading(!hasRenderableData);
        setIsRefreshing(hasRenderableData);

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

        writeProjectsCache(requestKey, {
          data: existingEntry?.data ?? [],
          pagination: existingEntry?.pagination ?? createDefaultPagination(limit),
          timestamp: existingEntry?.timestamp ?? 0,
          pending,
        });

        const result = await pending;

        writeProjectsCache(requestKey, {
          data: result.data,
          pagination: result.pagination,
          timestamp: Date.now(),
          pending: null,
        });

        applyState(result.data, result.pagination);
      } catch (err) {
        projectsCache.delete(requestKey);
        setError(err instanceof Error ? err.message : 'Unknown error');

        if (!hasRenderableData) {
          applyState([], defaultPagination);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyState, defaultPagination, limit, page, requestKey, resolvedOptions]
  );

  useEffect(() => {
    const nextCachedEntry = readProjectsCache(requestKey);

    if (nextCachedEntry) {
      applyState(nextCachedEntry.data, nextCachedEntry.pagination);
      setLoading(false);
      setIsRefreshing(Boolean(nextCachedEntry.pending));
    }

    void fetchProjects();
  }, [applyState, fetchProjects, requestKey]);

  const optimisticallyRemove = useCallback(
    (projectId: string) => {
      const previousState = {
        projects: stateRef.current.projects,
        pagination: stateRef.current.pagination,
      };
      const nextProjects = previousState.projects.filter((project) => project.project_id !== projectId);

      if (nextProjects.length === previousState.projects.length) {
        return () => {};
      }

      const nextPagination = recomputePagination(
        previousState.pagination,
        Math.max(0, previousState.pagination.total - 1)
      );

      applyState(nextProjects, nextPagination);

      const existingEntry = readProjectsCache(requestKey);
      writeProjectsCache(requestKey, {
        data: nextProjects,
        pagination: nextPagination,
        timestamp: existingEntry?.timestamp ?? Date.now(),
        pending: existingEntry?.pending ?? null,
      });

      return () => {
        applyState(previousState.projects, previousState.pagination);

        const rollbackEntry = readProjectsCache(requestKey);
        writeProjectsCache(requestKey, {
          data: previousState.projects,
          pagination: previousState.pagination,
          timestamp: rollbackEntry?.timestamp ?? Date.now(),
          pending: rollbackEntry?.pending ?? null,
        });
      };
    },
    [applyState, requestKey]
  );

  return {
    projects,
    loading,
    isRefreshing,
    error,
    pagination,
    refresh: () => fetchProjects(true),
    optimisticallyRemove,
  };
}
