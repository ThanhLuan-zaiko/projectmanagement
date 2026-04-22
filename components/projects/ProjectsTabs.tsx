'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiFolderPlus, FiGrid, FiLayers, FiTrash2 } from 'react-icons/fi';

const tabs = [
  { href: '/projects', label: 'Overview', icon: FiGrid },
  { href: '/projects/workspace', label: 'Workspace', icon: FiLayers },
  { href: '/projects/create', label: 'Create & Join', icon: FiFolderPlus },
  { href: '/projects/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/projects/trash', label: 'Trash', icon: FiTrash2 },
];

function isProjectsTabActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === '/projects') {
    return pathname === '/projects';
  }

  if (href === '/projects/workspace' && pathname.startsWith('/projects/') && pathname.endsWith('/edit')) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProjectsTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const prefetchedHrefsRef = useRef(new Set<string>());
  const [pendingTabHref, setPendingTabHref] = useState<string | null>(null);
  const [pressedTabHref, setPressedTabHref] = useState<string | null>(null);

  const resolvedActiveTabHref = useMemo(
    () => tabs.find((tab) => isProjectsTabActive(pathname, tab.href))?.href ?? '/projects',
    [pathname]
  );
  const optimisticTabHref =
    pendingTabHref && pathname !== pendingTabHref ? pendingTabHref : null;
  const activeTabHref = pressedTabHref ?? optimisticTabHref ?? resolvedActiveTabHref;

  useEffect(() => {
    const prefersInstantScroll =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    tabRefs.current[resolvedActiveTabHref]?.scrollIntoView({
      behavior: prefersInstantScroll ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [resolvedActiveTabHref]);

  useEffect(() => {
    const prefetchRoutes = () => {
      tabs.forEach((tab) => {
        if (prefetchedHrefsRef.current.has(tab.href)) {
          return;
        }

        prefetchedHrefsRef.current.add(tab.href);
        router.prefetch(tab.href);
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 180);
    return () => globalThis.clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-1.5 backdrop-blur-xl shadow-2xl shadow-slate-950/30">
      <nav
        className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Project sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === activeTabHref;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              data-speculate="prefetch"
              ref={(node) => {
                tabRefs.current[tab.href] = node;
              }}
              onPointerDown={() => setPressedTabHref(tab.href)}
              onPointerCancel={() => setPressedTabHref((currentValue) => (currentValue === tab.href ? null : currentValue))}
              onPointerLeave={() => setPressedTabHref((currentValue) => (currentValue === tab.href ? null : currentValue))}
              onClick={() => {
                setPendingTabHref(tab.href);
                setPressedTabHref(null);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex min-w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-white/70 to-cyan-200 transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
