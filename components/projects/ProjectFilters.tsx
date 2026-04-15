import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';

interface ProjectFiltersProps {
  search: string;
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
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl shadow-xl shadow-slate-950/30">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.8fr))]">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <FiSearch className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by project name, code or description"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
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

        <label className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
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

        <label className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
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
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]"
        >
          <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </section>
  );
}
