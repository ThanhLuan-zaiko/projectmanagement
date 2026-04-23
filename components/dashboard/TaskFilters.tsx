'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface TaskFiltersProps {
  filters: {
    searchQuery: string;
    filterStatus: string;
    filterPriority: string;
    filterType: string;
  };
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export default function TaskFilters({
  filters,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
}: TaskFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const queueSearchChange = (nextSearch: string) => {
    setLocalSearch(nextSearch);
    setIsSearching(true);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      onSearchChange(nextSearch);
      setIsSearching(false);
      searchTimerRef.current = null;
    }, 300);
  };

  const handleClearFilters = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    setLocalSearch('');
    setIsSearching(false);
    onSearchChange('');
    onStatusChange('all');
    onPriorityChange('all');
    onTypeChange('all');
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.filterStatus !== 'all' ||
    filters.filterPriority !== 'all' ||
    filters.filterType !== 'all';

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_52px_-34px_rgba(2,6,23,0.88),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[24px] sm:mb-6 sm:rounded-[28px] sm:p-6">
      <div className="space-y-4">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={isSearching ? localSearch : filters.searchQuery}
              onChange={(e) => {
                queueSearchChange(e.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white/[0.06] sm:rounded-xl sm:py-2.5 sm:pl-10 sm:text-base"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <select
              value={filters.filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white/[0.06] sm:rounded-xl sm:py-2.5 sm:pl-10 sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={filters.filterPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white/[0.06] sm:rounded-xl sm:py-2.5 sm:text-base"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.filterType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white/[0.06] sm:rounded-xl sm:py-2.5 sm:text-base"
          >
            <option value="all">All Types</option>
            <option value="task">Task</option>
            <option value="subtask">Subtask</option>
            <option value="milestone">Milestone</option>
            <option value="bug">Bug</option>
          </select>
        </div>

        {/* Bottom Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Active filters:</span>
              <div className="flex gap-2">
                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    {`Search: "${filters.searchQuery}"`}
                  </span>
                )}
                {filters.filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    Status: {filters.filterStatus.replace('_', ' ')}
                  </span>
                )}
                {filters.filterPriority !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    Priority: {filters.filterPriority}
                  </span>
                )}
                {filters.filterType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    Type: {filters.filterType}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
