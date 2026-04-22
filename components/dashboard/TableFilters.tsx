'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import CustomSelect from '@/components/ui/CustomSelect';

interface FilterOption {
  value: string;
  label: string;
}

interface TableFiltersProps {
  // Search
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filter columns
  filters?: Array<{
    key: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }>;

  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  sortOptions?: Array<{ value: string; label: string }>;
  onSortChange: (sortBy: string) => void;
  onSortOrderToggle?: () => void;

  // Items per page
  limit: number;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];

  // Actions
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onClearFilters?: () => void;
}

export default function TableFilters({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  sortBy,
  sortOrder,
  sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ],
  onSortChange,
  onSortOrderToggle,
  limit,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  onRefresh,
  isRefreshing = false,
  onClearFilters,
}: TableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const hasActiveFilters =
    search || filters.some((f) => f.value && f.value !== 'all');

  const activeFilterTags = [
    ...(search ? [{ label: `Search: "${search}"`, key: 'search' }] : []),
    ...filters
      .filter((f) => f.value && f.value !== 'all')
      .map((f) => ({
        label: `${f.placeholder || f.key}: ${f.options.find((o) => o.value === f.value)?.label || f.value}`,
        key: f.key,
      })),
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-xl">
      <div className="space-y-4">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
              }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search !== localSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Dynamic Filters */}
          {filters.slice(0, 3).map((filter) => (
            <div key={filter.key}>
              <CustomSelect
                name={filter.key}
                value={filter.value}
                options={filter.options}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={filter.placeholder || 'Select...'}
                usePortal={true}
              />
            </div>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 whitespace-nowrap">Show:</span>
              <CustomSelect
                name="limit"
                value={limit.toString()}
                options={limitOptions.map((option) => ({
                  value: option.toString(),
                  label: option.toString(),
                }))}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                usePortal={true}
              />
              <span className="text-sm text-slate-400">per page</span>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 whitespace-nowrap">Sort:</span>
              <div className="flex items-center gap-2">
                <CustomSelect
                  name="sortBy"
                  value={sortBy}
                  options={sortOptions}
                  onChange={(e) => onSortChange(e.target.value)}
                  usePortal={true}
                />
                <button
                  onClick={() => onSortOrderToggle?.()}
                  className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 transition-all text-slate-400 hover:text-white"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? (
                    <FiArrowUp className="w-4 h-4" />
                  ) : (
                    <FiArrowDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && activeFilterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-500">Active filters:</span>
            {activeFilterTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
