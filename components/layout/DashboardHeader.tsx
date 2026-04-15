'use client';

import { FiPlus } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <div className="relative z-50 overflow-visible border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{title}</h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-400">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3 relative overflow-visible">
            {children}

            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all duration-200 whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{actionLabel}</span>
              </button>
            )}

            {/* Desktop User Menu */}
            <div className="hidden lg:block">
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
