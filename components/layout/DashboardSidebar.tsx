'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiHome,
  FiClipboard,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiList,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  activePattern: string;
}

export const dashboardNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
    activePattern: '/dashboard',
  },
  {
    id: 'tasks',
    label: 'Task Board',
    href: '/dashboard/tasks',
    icon: FiClipboard,
    activePattern: '/dashboard/tasks',
  },
  {
    id: 'expert-estimation',
    label: 'Expert Time Estimation',
    href: '/dashboard/expert-estimation',
    icon: FiUsers,
    activePattern: '/dashboard/expert-estimation',
  },
  {
    id: 'cost-estimation',
    label: 'Project Cost Estimation',
    href: '/dashboard/cost-estimation',
    icon: FiDollarSign,
    activePattern: '/dashboard/cost-estimation',
  },
  {
    id: 'project-schedule',
    label: 'Project Schedule',
    href: '/dashboard/project-schedule',
    icon: FiCalendar,
    activePattern: '/dashboard/project-schedule',
  },
  {
    id: 'work-schedule',
    label: 'Work Schedule',
    href: '/dashboard/work-schedule',
    icon: FiList,
    activePattern: '/dashboard/work-schedule',
  },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'desktop' | 'mobile';
}

export default function DashboardSidebar({ isOpen, onClose, variant = 'desktop' }: DashboardSidebarProps) {
  const pathname = usePathname();

  // Initialize state lazily from localStorage to prevent flash on F5
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (variant === 'desktop' && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Save collapsed state to localStorage when changed
  useEffect(() => {
    if (variant === 'desktop') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('sidebar-collapse-change'));
    }
  }, [isCollapsed, variant]);

  const isActive = (pattern: string) => {
    if (pattern === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(pattern);
  };

  const handleLinkClick = () => {
    if (variant === 'mobile' && onClose) {
      onClose();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Mobile variant
  if (variant === 'mobile') {
    return (
      <aside className="h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent w-full">
        {/* Mobile Close Button */}
        {onClose && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FiClipboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Project</h1>
                <p className="text-xs text-slate-400">Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-2">
          {dashboardNavItems.map((item) => {
            const active = isActive(item.activePattern);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'hover:bg-slate-700/30 border border-transparent'
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 transition-colors duration-200
                    ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-sm font-medium transition-colors duration-200
                    ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                  `}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-700/50">
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-white font-medium mb-1">Need Help?</p>
            <p className="text-xs text-slate-400 mb-3">Contact support for assistance</p>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Desktop variant
  return (
    <>
      <aside
        className={`
          h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50
          overflow-hidden flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Desktop Header */}
        <div className="relative px-4 py-6 border-b border-slate-700/50 hidden lg:flex items-center gap-3">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-300 flex-1 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <FiClipboard className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-lg font-bold text-white">Project</h1>
                <p className="text-xs text-slate-400">Management</p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex-shrink-0 group"
              title="Collapse sidebar"
            >
              <FiChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {dashboardNavItems.map((item) => {
            const active = isActive(item.activePattern);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center' : ''}
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'hover:bg-slate-700/30 border border-transparent'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 transition-colors duration-200
                    ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Label */}
                {!isCollapsed && (
                  <span
                    className={`
                      text-sm font-medium transition-colors duration-200 whitespace-nowrap overflow-hidden
                      ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                    `}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-t border-slate-700/50">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-white font-medium mb-1">Need Help?</p>
              <p className="text-xs text-slate-400 mb-3">Contact support for assistance</p>
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Floating Toggle Button (visible only when collapsed) */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex fixed left-20 top-1/2 -translate-y-1/2 z-40 p-2 bg-slate-800 border border-slate-700 rounded-r-lg hover:bg-slate-700 transition-all duration-200 group shadow-lg shadow-black/30"
          title="Expand sidebar"
        >
          <FiChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      )}
    </>
  );
}
