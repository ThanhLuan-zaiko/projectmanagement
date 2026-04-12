'use client';

import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and neighbors
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
      {/* Info */}
      <div className="text-sm text-slate-400">
        Showing <span className="text-white font-medium">{totalItems}</span> tasks
        {totalPages > 1 && (
          <>
            {' '}· Page <span className="text-white font-medium">{currentPage}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="First page"
        >
          <FiChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : page === '...'
                  ? 'text-slate-500 cursor-default'
                  : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Last page"
        >
          <FiChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
