'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getActiveDashboardNavItem, getProjectDashboardNavItems } from './dashboardNavigation';

export default function DashboardTabs() {
  const pathname = usePathname();
  const params = useParams();
  const projectCode = typeof params?.projectCode === 'string' ? params.projectCode : undefined;
  const tabs = getProjectDashboardNavItems(projectCode);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const resolvedActiveTabId = getActiveDashboardNavItem(pathname, tabs)?.id ?? null;
  const [pendingTab, setPendingTab] = useState<{ href: string; id: string } | null>(null);
  const [pressedTabId, setPressedTabId] = useState<string | null>(null);
  const optimisticTabId = pendingTab && pathname !== pendingTab.href ? pendingTab.id : null;
  const activeTabId = pressedTabId ?? optimisticTabId ?? resolvedActiveTabId;

  const handleTabPreview = (id: string, href: string) => {
    const nextTab = { id, href };
    setPendingTab(nextTab);
    setPressedTabId(null);
    window.dispatchEvent(new CustomEvent('dashboard-nav-preview', { detail: nextTab }));
  };

  useEffect(() => {
    if (!resolvedActiveTabId) {
      return;
    }

    const prefersInstantScroll =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    tabRefs.current[resolvedActiveTabId]?.scrollIntoView({
      behavior: prefersInstantScroll ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [resolvedActiveTabId]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-1.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <nav
        className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              id={`${tab.id}-tab`}
              href={tab.href}
              prefetch={true}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              onPointerDown={() => setPressedTabId(tab.id)}
              onPointerCancel={() => setPressedTabId((currentValue) => (currentValue === tab.id ? null : currentValue))}
              onPointerLeave={() => setPressedTabId((currentValue) => (currentValue === tab.id ? null : currentValue))}
              onClick={() => handleTabPreview(tab.id, tab.href)}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out ${
                isActive
                  ? 'border-blue-500/40 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-violet-600/20 text-white shadow-lg shadow-blue-950/25'
                  : 'border-transparent bg-transparent text-slate-400 hover:border-slate-700/80 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
              title={tab.label}
            >
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-sky-300' : 'text-slate-500 group-hover:text-slate-200'}`} />
              <span>{tab.tabLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
