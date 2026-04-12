'use client';

import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function DashboardLayout({ children, header }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <DashboardSidebar
          variant="mobile"
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-72 z-30">
        <DashboardSidebar variant="desktop" />
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FiMenu className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Project Management</h1>
            </div>

            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Desktop Header or Custom Header */}
        {header && (
          <div className="hidden lg:block">
            {header}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
