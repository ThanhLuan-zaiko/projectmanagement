'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { getActiveDashboardNavItem, getProjectDashboardNavItems } from './dashboardNavigation';
import TargetCursor from '@/components/ui/TargetCursor';

export default function DashboardTabs() {
  const pathname = usePathname();
  const params = useParams();
  const { theme } = useTheme();
  const projectCode = typeof params?.projectCode === 'string' ? params.projectCode : undefined;
  const tabs = getProjectDashboardNavItems(projectCode);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const resolvedActiveTabId = getActiveDashboardNavItem(pathname, tabs)?.id ?? null;
  const [pendingTab, setPendingTab] = useState<{ href: string; id: string } | null>(null);
  const [pressedTabId, setPressedTabId] = useState<string | null>(null);
  const optimisticTabId = pendingTab && pathname !== pendingTab.href ? pendingTab.id : null;
  const activeTabId = pressedTabId ?? optimisticTabId ?? resolvedActiveTabId;
  const isLight = theme === 'light';

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
    <div className={`theme-projects-tabs-shell relative mb-6 rounded-2xl p-1.5 backdrop-blur-xl ${
      isLight
        ? 'shadow-[0_20px_42px_-32px_rgba(148,163,184,0.34)]'
        : 'shadow-[0_18px_40px_-28px_rgba(15,23,42,0.9)]'
    }`}>
      <TargetCursor
        targetSelector=".dashboard-tab-target"
        spinDuration={2}
        hideDefaultCursor={false}
        parallaxOn
        hoverDuration={0.2}
        color={isLight ? '#8b5cf6' : '#c4b5fd'}
        dotColor={isLight ? '#7c3aed' : '#f5f3ff'}
        glowColor={isLight ? 'rgba(139, 92, 246, 0.22)' : 'rgba(196, 181, 253, 0.3)'}
      />
      <nav
        className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Dashboard sections"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = tab.icon;
          const labelClassName = isActive
            ? isLight
              ? 'text-slate-100'
              : 'text-white'
            : isLight
            ? 'text-slate-300 group-hover:text-slate-100'
            : 'text-slate-400 group-hover:text-slate-100';

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
              className={`dashboard-tab-target group relative flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out ${
                isActive
                  ? isLight
                    ? 'border-blue-300/70 bg-white/88 text-slate-100 shadow-[0_16px_32px_-24px_rgba(59,130,246,0.28)]'
                    : 'border-blue-400/35 bg-gradient-to-r from-blue-500/18 via-blue-400/8 to-violet-500/18 text-white shadow-[0_16px_36px_-24px_rgba(59,130,246,0.42)]'
                  : isLight
                  ? 'border-transparent bg-transparent text-slate-400 hover:border-slate-200/80 hover:bg-white/72 hover:text-slate-100'
                  : 'border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-slate-100'
              }`}
              title={tab.label}
            >
              <span
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                  isActive
                    ? isLight
                      ? 'text-blue-600'
                      : 'text-sky-300'
                    : isLight
                    ? 'text-slate-400 group-hover:text-slate-200'
                    : 'text-slate-500 group-hover:text-slate-200'
                }`}
              />
              <span className={`transition-colors duration-200 ${labelClassName}`}>
                {tab.tabLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
