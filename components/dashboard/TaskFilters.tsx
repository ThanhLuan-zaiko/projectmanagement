import { FiSearch, FiFilter } from 'react-icons/fi';
import type { TaskFilters } from '@/types/work-item';

interface TaskFiltersProps {
  filters: TaskFilters;
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
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
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
    </div>
  );
}
