'use client';

import { useState, useEffect } from 'react';
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

  // Update local search when filters change from outside
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  // Handle real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleClearFilters = () => {
    setLocalSearch('');
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-xl">
      <div className="space-y-4">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setIsSearching(true);
              }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
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
            className="w-full px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
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
            className="w-full px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
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
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Active filters:</span>
              <div className="flex gap-2">
                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    Search: "{filters.searchQuery}"
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
