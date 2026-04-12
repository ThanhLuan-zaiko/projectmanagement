// Custom hook for work items data fetching and filtering
'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkItem, TaskFilters } from '@/types/work-item';

// Cache to avoid refetching
let cachedData: WorkItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

export function useWorkItems() {
  const [workItems, setWorkItems] = useState<WorkItem[]>(cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: '',
    filterStatus: 'all',
    filterPriority: 'all',
    filterType: 'all',
  });
  const hasFetchedRef = useRef(false);

  // Fetch work items with caching
  const fetchWorkItems = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if still valid (unless force refresh)
    if (!forceRefresh && cachedData && now - lastFetchTime < CACHE_DURATION) {
      setWorkItems(cachedData);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches (only if not force refresh)
    if (hasFetchedRef.current && !forceRefresh) return;
    if (!forceRefresh) hasFetchedRef.current = true;

    try {
      if (forceRefresh) {
        // Keep current data visible while refreshing
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/work-items', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        const items = data.data || [];
        cachedData = items;
        lastFetchTime = now;
        setWorkItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchWorkItems();
  }, []);

  // Filter work items
  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesStatus = filters.filterStatus === 'all' || item.status === filters.filterStatus;
    const matchesPriority = filters.filterPriority === 'all' || item.priority === filters.filterPriority;
    const matchesType = filters.filterType === 'all' || item.work_type === filters.filterType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.filterStatus !== 'all' ||
    filters.filterPriority !== 'all' ||
    filters.filterType !== 'all'
  );

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    workItems,
    filteredItems,
    loading,
    filters,
    hasActiveFilters,
    fetchWorkItems,
    updateFilter,
    setWorkItems,
  };
}
