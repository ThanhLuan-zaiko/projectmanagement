// Reusable hook for URL-based filtering and pagination
// Works with useSearchParams and useRouter for SEO-friendly URLs
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UseUrlFiltersOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  alwaysShowPagination?: boolean;
}

export interface UrlFiltersState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  // Dynamic filters
  filters: Record<string, string>;
}

export interface UrlFiltersActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  toggleSort: (sortBy: string) => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  refresh: () => void;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}): UrlFiltersState & UrlFiltersActions {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSortBy = 'created_at',
    defaultSortOrder = 'desc',
    alwaysShowPagination = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current values from URL
  const state = useMemo<UrlFiltersState>(() => {
    const page = parseInt(searchParams.get('page') || '') || defaultPage;
    const limit = parseInt(searchParams.get('limit') || '') || defaultLimit;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || defaultSortBy;
    const sortOrder = (searchParams.get('sort_order') || defaultSortOrder) as 'asc' | 'desc';

    // Collect all other filters (excluding pagination/sort params)
    const excludeKeys = new Set(['page', 'limit', 'search', 'sort_by', 'sort_order']);
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!excludeKeys.has(key)) {
        filters[key] = value;
      }
    });

    return { page, limit, search, sortBy, sortOrder, filters, alwaysShowPagination };
  }, [searchParams, defaultPage, defaultLimit, defaultSortBy, defaultSortOrder, alwaysShowPagination]);

  // Update URL with new params
  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === defaultLimit && key === 'limit') {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      });

      // Reset to page 1 when filters change (unless explicitly setting page)
      if (!('page' in updates) && Object.keys(updates).some((k) => k !== 'page')) {
        params.set('page', '1');
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router, defaultLimit]
  );

  const setPage = useCallback(
    (page: number) => updateParams({ page }),
    [updateParams]
  );

  const setLimit = useCallback(
    (limit: number) => updateParams({ limit, page: 1 }),
    [updateParams]
  );

  const setSearch = useCallback(
    (search: string) => updateParams({ search }),
    [updateParams]
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder?: 'asc' | 'desc') => {
      const updates: Record<string, string> = { sort_by: sortBy };
      if (sortOrder) {
        updates.sort_order = sortOrder;
      }
      updateParams(updates);
    },
    [updateParams]
  );

  const toggleSort = useCallback(
    (sortBy: string) => {
      const currentSortBy = state.sortBy;
      const currentSortOrder = state.sortOrder;

      if (currentSortBy === sortBy) {
        // Toggle order
        updateParams({ sort_order: currentSortOrder === 'asc' ? 'desc' : 'asc' });
      } else {
        // New sort field, default to desc
        updateParams({ sort_by: sortBy, sort_order: 'desc' });
      }
    },
    [state.sortBy, state.sortOrder, updateParams]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      updateParams({ [key]: value || null });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    // Keep only page=1
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    ...state,
    setPage,
    setLimit,
    setSearch,
    setSort,
    toggleSort,
    setFilter,
    clearFilters,
    refresh,
  };
}
