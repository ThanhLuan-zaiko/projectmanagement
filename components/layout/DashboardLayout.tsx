'use client';

import { useEffect, useState } from 'react';
import { FiClipboard, FiMenu } from 'react-icons/fi';
import DashboardSidebar from './DashboardSidebar';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function DashboardLayout({ children, header }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { user } = useAuth();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    window.localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[110] w-full sm:max-w-80 transform transition-transform duration-300 ease-out lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <DashboardSidebar
          variant="mobile"
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`fixed left-0 top-0 z-30 hidden h-screen transition-[width] duration-300 ease-out lg:block ${
          sidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <DashboardSidebar
          variant="desktop"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((currentValue) => !currentValue)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-300 ease-out ${
          sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        {/* Mobile Header */}
        <header className="sticky top-0 z-[90] border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-700/50"
            >
              <FiMenu className="w-6 h-6 text-white" />
            </button>

            <div className="mx-3 flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
                <FiClipboard className="h-4 w-4 text-white" />
              </div>
              <h1 className="truncate text-lg font-bold text-white">Project Management</h1>
            </div>

            {/* Mobile User Menu */}
            <div className="relative z-10 shrink-0">
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        {/* Desktop Header or Custom Header */}
        {header && (
          <div className="hidden lg:block">
            {header}
          </div>
        )}

        {/* Page Content */}
        <main className="relative z-0 flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
