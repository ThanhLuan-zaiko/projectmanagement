'use client';

import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface SortControlProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string) => void;
  options?: Array<{ value: string; label: string }>;
}

export default function SortControl({
  sortBy,
  sortOrder,
  onSortChange,
  options = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'due_date', label: 'Due Date' },
  ],
}: SortControlProps) {
  const currentOption = options.find((opt) => opt.value === sortBy) || options[0];

  const toggleSort = () => {
    onSortChange(sortBy);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400 whitespace-nowrap">Sort:</span>
      <div className="flex items-center gap-1 bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-transparent px-3 py-2 pr-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleSort}
          className="p-2 hover:bg-slate-600/50 transition-all text-slate-400 hover:text-white"
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
  );
}
