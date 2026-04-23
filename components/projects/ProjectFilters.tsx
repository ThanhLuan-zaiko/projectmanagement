'use client';

import { useEffect, useState } from 'react';
import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';

interface ProjectFiltersProps {
  search: string;
  searchPlaceholder?: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isRefreshing?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onRefresh: () => void;
}

export default function ProjectFilters({
  search,
  searchPlaceholder = 'Search by project name, code or description',
  status,
  sortBy,
  sortOrder,
  isRefreshing = false,
  onSearchChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onRefresh,
}: ProjectFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  return (
    <section className="projects-bento-panel rounded-[28px] p-5 backdrop-blur-xl">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.8fr))]">
        <label className="projects-bento-input flex items-center gap-3 rounded-2xl px-4 py-3">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            value={searchDraft}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchDraft(nextValue);
              onSearchChange(nextValue);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <label className="projects-bento-input flex items-center gap-3 rounded-2xl px-4 py-3">
          <FiFilter className="h-4 w-4 text-slate-400" />
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option value="all">All statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="projects-bento-input rounded-2xl px-4 py-3">
          <span className="sr-only">Sort field</span>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option value="updated_at">Recently updated</option>
            <option value="created_at">Created date</option>
            <option value="project_name">Project name</option>
            <option value="budget">Budget</option>
            <option value="target_end_date">Target end date</option>
            <option value="team_size">Team size</option>
          </select>
        </label>

        <label className="projects-bento-input rounded-2xl px-4 py-3">
          <span className="sr-only">Sort direction</span>
          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as 'asc' | 'desc')}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onRefresh}
          className="projects-bento-subpanel inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/25"
        >
          <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </section>
  );
}
