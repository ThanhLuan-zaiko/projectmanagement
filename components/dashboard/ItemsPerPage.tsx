'use client';

import { FiLayout } from 'react-icons/fi';

interface ItemsPerPageProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export default function ItemsPerPage({
  value,
  onChange,
  options = [5, 10, 20, 50],
}: ItemsPerPageProps) {
  return (
    <div className="flex items-center gap-2">
      <FiLayout className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-400 whitespace-nowrap">Show:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <span className="text-sm text-slate-400 whitespace-nowrap">per page</span>
    </div>
  );
}
