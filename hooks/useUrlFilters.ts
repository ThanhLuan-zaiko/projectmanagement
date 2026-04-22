// Reusable hook for URL-based filtering and pagination
// Works with useSearchParams and useRouter for SEO-friendly URLs
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useTransition } from 'react';

export interface UseUrlFiltersOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  alwaysShowPagination?: boolean;
  searchDebounceMs?: number;
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
  isNavigating: boolean;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}): UrlFiltersState & UrlFiltersActions {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSortBy = 'created_at',
    defaultSortOrder = 'desc',
    searchDebounceMs = 0,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const searchDebounceRef = useRef<number | null>(null);

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

    return { page, limit, search, sortBy, sortOrder, filters };
  }, [searchParams, defaultPage, defaultLimit, defaultSortBy, defaultSortOrder]);

  // Update URL with new params
  const navigate = useCallback(
    (href: string, method: 'push' | 'replace') => {
      startTransition(() => {
        if (method === 'replace') {
          router.replace(href, { scroll: false });
          return;
        }

        router.push(href, { scroll: false });
      });
    },
    [router]
  );

  const updateParams = useCallback(
    (
      updates: Record<string, string | number | null>,
      method: 'push' | 'replace' = 'replace'
    ) => {
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

      const nextQuery = params.toString();
      navigate(nextQuery ? `${pathname}?${nextQuery}` : pathname, method);
    },
    [searchParams, pathname, navigate, defaultLimit]
  );

  const setPage = useCallback(
    (page: number) => updateParams({ page }, 'push'),
    [updateParams]
  );

  const setLimit = useCallback(
    (limit: number) => updateParams({ limit, page: 1 }),
    [updateParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      if (searchDebounceRef.current !== null) {
        window.clearTimeout(searchDebounceRef.current);
      }

      if (searchDebounceMs <= 0) {
        updateParams({ search }, 'replace');
        return;
      }

      searchDebounceRef.current = window.setTimeout(() => {
        updateParams({ search }, 'replace');
      }, searchDebounceMs);
    },
    [searchDebounceMs, updateParams]
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder?: 'asc' | 'desc') => {
      const updates: Record<string, string> = { sort_by: sortBy };
      if (sortOrder) {
        updates.sort_order = sortOrder;
      }
      updateParams(updates, 'replace');
    },
    [updateParams]
  );

  const toggleSort = useCallback(
    (sortBy: string) => {
      const currentSortBy = state.sortBy;
      const currentSortOrder = state.sortOrder;

      if (currentSortBy === sortBy) {
        // Toggle order
        updateParams({ sort_order: currentSortOrder === 'asc' ? 'desc' : 'asc' }, 'replace');
      } else {
        // New sort field, default to desc
        updateParams({ sort_by: sortBy, sort_order: 'desc' }, 'replace');
      }
    },
    [state.sortBy, state.sortOrder, updateParams]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      updateParams({ [key]: value || null }, 'replace');
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    // Keep only page=1
    navigate(pathname, 'replace');
  }, [navigate, pathname]);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current !== null) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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
    isNavigating,
  };
}
