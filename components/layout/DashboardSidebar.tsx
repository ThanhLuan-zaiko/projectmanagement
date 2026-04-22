'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiBriefcase, FiChevronLeft, FiChevronRight, FiClipboard, FiFolderPlus, FiX } from 'react-icons/fi';
import {
  dashboardNavItems as sharedDashboardNavItems,
  getActiveDashboardNavItem,
  getProjectDashboardNavItems,
  type DashboardNavItem,
} from '@/components/dashboard/dashboardNavigation';

export function useProjectNavItems(): DashboardNavItem[] {
  const params = useParams();
  const projectCode = typeof params?.projectCode === 'string' ? params.projectCode : undefined;

  return getProjectDashboardNavItems(projectCode);
}

export const dashboardNavItems = sharedDashboardNavItems;

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  variant?: 'desktop' | 'mobile';
}

export default function DashboardSidebar({
  isCollapsed = false,
  onClose,
  onToggleCollapse,
  variant = 'desktop',
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = useProjectNavItems();
  const [pendingNav, setPendingNav] = useState<{ href: string; id: string } | null>(null);
  const navContainerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const prefetchedHrefsRef = useRef(new Set<string>());
  const optimisticNavId = pendingNav && pathname !== pendingNav.href ? pendingNav.id : null;
  const activeItemId = optimisticNavId ?? getActiveDashboardNavItem(pathname, navItems)?.id ?? null;
  const desktopCollapsed = variant === 'desktop' && isCollapsed;

  useEffect(() => {
    if (!activeItemId) {
      return;
    }

    const navContainer = navContainerRef.current;
    const activeItem = itemRefs.current[activeItemId];

    if (!navContainer || !activeItem) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const prefersInstantScroll =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      activeItem.scrollIntoView({
        behavior: prefersInstantScroll ? 'auto' : optimisticNavId ? 'smooth' : 'auto',
        block: 'nearest',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeItemId, optimisticNavId]);

  useEffect(() => {
    if (navItems.length === 0) {
      return;
    }

    const prefetchRoutes = () => {
      navItems.forEach((item) => {
        if (prefetchedHrefsRef.current.has(item.href)) {
          return;
        }

        prefetchedHrefsRef.current.add(item.href);
        router.prefetch(item.href);
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 180);
    return () => globalThis.clearTimeout(timeoutId);
  }, [navItems, router]);

  useEffect(() => {
    const handlePreviewNavigation = (event: Event) => {
      const detail = (event as CustomEvent<{ href: string; id: string }>).detail;

      if (!detail?.href || !detail?.id) {
        return;
      }

      setPendingNav(detail);
    };

    window.addEventListener('dashboard-nav-preview', handlePreviewNavigation);

    return () => {
      window.removeEventListener('dashboard-nav-preview', handlePreviewNavigation);
    };
  }, []);

  const handleLinkClick = () => {
    if (variant === 'mobile') {
      onClose?.();
    }
  };

  const renderNavLink = (item: DashboardNavItem) => {
    const active = item.id === activeItemId;
    const Icon = item.icon;

    if (variant === 'mobile') {
      return (
        <Link
          key={item.id}
          href={item.href}
          prefetch={true}
          ref={(node) => {
            itemRefs.current[item.id] = node;
          }}
          onPointerDown={() => setPendingNav({ id: item.id, href: item.href })}
          onClick={() => {
            setPendingNav({ id: item.id, href: item.href });
            handleLinkClick();
          }}
          className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 transition-all duration-200 ease-out ${
            active
              ? 'border-blue-500/40 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-violet-600/20 text-white shadow-lg shadow-blue-950/40'
              : 'border-transparent text-slate-300 hover:border-slate-700/70 hover:bg-slate-800/80 hover:text-white'
          }`}
          aria-current={active ? 'page' : undefined}
          title={item.label}
        >
          <div
            className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-400 to-violet-500 transition-opacity duration-200 ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              active
                ? 'bg-blue-500/10 text-sky-300'
                : 'text-slate-400 group-hover:bg-slate-700/80 group-hover:text-slate-100'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{item.label}</span>
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        prefetch={true}
        ref={(node) => {
          itemRefs.current[item.id] = node;
        }}
        onPointerDown={() => setPendingNav({ id: item.id, href: item.href })}
        onClick={() => setPendingNav({ id: item.id, href: item.href })}
        className={`group relative flex h-14 items-center overflow-hidden rounded-2xl border transition-all duration-300 ease-out ${
          desktopCollapsed ? 'justify-center px-0' : 'gap-3 px-4'
        } ${
          active
            ? 'border-blue-500/40 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-violet-600/20 text-white shadow-lg shadow-blue-950/35'
            : 'border-transparent text-slate-400 hover:border-slate-700/70 hover:bg-slate-800/70 hover:text-white'
        }`}
        aria-current={active ? 'page' : undefined}
        title={desktopCollapsed ? item.label : undefined}
      >
        <div
          className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-400 to-violet-500 transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
            active
              ? 'bg-blue-500/10 text-sky-300'
              : 'text-slate-400 group-hover:bg-slate-700/70 group-hover:text-slate-100'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={`grid min-w-0 transition-[grid-template-columns,opacity,transform] duration-300 ease-out ${
            desktopCollapsed ? 'grid-cols-[0fr] opacity-0 -translate-x-2' : 'grid-cols-[1fr] opacity-100 translate-x-0'
          }`}
        >
          <div className="min-w-0 overflow-hidden">
            <span className="block truncate text-sm font-semibold">{item.label}</span>
          </div>
        </div>
      </Link>
    );
  };

  if (variant === 'mobile') {
    return (
      <aside className="flex h-full w-full flex-col overflow-hidden border-r border-slate-700/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiClipboard className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white">Project</h1>
              <p className="truncate text-xs text-slate-400">Management</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-2xl border border-slate-700/70 bg-slate-800/80 p-2.5 text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Close sidebar"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>

        <div
          ref={(node) => {
            navContainerRef.current = node;
          }}
          className="flex-1 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <nav className="space-y-2">{navItems.map(renderNavLink)}</nav>

          <div className="mt-6 grid gap-3">
            <Link
              href="/projects/workspace"
              prefetch={true}
              data-speculate="prefetch"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-slate-600/70 hover:bg-white/[0.08]"
            >
              <FiBriefcase className="h-5 w-5 text-cyan-300" />
              <span>Project Hub</span>
            </Link>
            <Link
              href="/projects/create"
              prefetch={true}
              data-speculate="prefetch"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              <FiFolderPlus className="h-5 w-5" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-700/50 p-4">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/10 p-4">
            <p className="text-sm font-semibold text-white">Need Help?</p>
            <p className="mt-1 text-xs text-slate-400">Contact support for assistance</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-slate-700/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 shadow-2xl shadow-black/20">
      <div className={`border-b border-slate-700/50 transition-[padding] duration-300 ease-out ${desktopCollapsed ? 'px-3 py-5' : 'px-4 py-6'}`}>
        <div className={`flex transition-all duration-300 ease-out ${desktopCollapsed ? 'flex-col items-center gap-4' : 'items-center gap-3'}`}>
          <div className={`flex min-w-0 items-center transition-all duration-300 ease-out ${desktopCollapsed ? 'justify-center' : 'flex-1 gap-3'}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiClipboard className="h-5 w-5 text-white" />
            </div>
            <div
              className={`overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out ${
                desktopCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-40 opacity-100 translate-x-0'
              }`}
            >
              <h1 className="truncate text-lg font-bold text-white">Project</h1>
              <p className="truncate text-xs text-slate-400">Management</p>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800/80 text-slate-300 transition-all duration-200 hover:border-slate-600 hover:text-white"
            title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {desktopCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        ref={(node) => {
          navContainerRef.current = node;
        }}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navItems.map(renderNavLink)}
      </nav>

      <div className="px-3 pb-4">
        <div className="space-y-2">
          <Link
            href="/projects/workspace"
            prefetch={true}
            data-speculate="prefetch"
            className={`group flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-100 transition-all duration-300 ease-out hover:border-slate-600/70 hover:bg-white/[0.08] ${
              desktopCollapsed ? 'h-14 justify-center px-0' : 'gap-3 px-4 py-3.5'
            }`}
            title={desktopCollapsed ? 'Project Hub' : undefined}
          >
            <FiBriefcase className="h-5 w-5 shrink-0 text-cyan-300" />
            <div
              className={`grid min-w-0 transition-[grid-template-columns,opacity,transform] duration-300 ease-out ${
                desktopCollapsed ? 'grid-cols-[0fr] opacity-0 -translate-x-2' : 'grid-cols-[1fr] opacity-100 translate-x-0'
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <span className="block truncate">Project Hub</span>
              </div>
            </div>
          </Link>

          <Link
            href="/projects/create"
            prefetch={true}
            data-speculate="prefetch"
            className={`group flex items-center overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-110 ${
              desktopCollapsed ? 'h-14 justify-center px-0' : 'gap-3 px-4 py-3.5'
            }`}
            title={desktopCollapsed ? 'Create Project' : undefined}
          >
            <FiFolderPlus className="h-5 w-5 shrink-0" />
            <div
              className={`grid min-w-0 transition-[grid-template-columns,opacity,transform] duration-300 ease-out ${
                desktopCollapsed ? 'grid-cols-[0fr] opacity-0 -translate-x-2' : 'grid-cols-[1fr] opacity-100 translate-x-0'
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <span className="block truncate">Create Project</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div
        className={`overflow-hidden px-3 transition-[max-height,opacity,padding-bottom] duration-300 ease-out ${
          desktopCollapsed ? 'max-h-0 opacity-0 pb-0' : 'max-h-40 opacity-100 pb-4'
        }`}
      >
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/10 p-4">
          <p className="text-sm font-semibold text-white">Need Help?</p>
          <p className="mt-1 text-xs text-slate-400">Contact support for assistance</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
