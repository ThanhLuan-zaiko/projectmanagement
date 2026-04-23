'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiLayers } from 'react-icons/fi';
import BubbleMenu, { type BubbleMenuItem } from '@/components/ui/BubbleMenu';
import { useTheme } from '@/components/theme/ThemeProvider';

const tabs = [
  {
    href: '/projects',
    label: 'overview',
    ariaLabel: 'Project overview',
    rotation: -7,
    hoverStyles: { bgColor: '#0ea5e9', textColor: '#ffffff' },
  },
  {
    href: '/projects/workspace',
    label: 'workspace',
    ariaLabel: 'Project workspace',
    rotation: 6,
    hoverStyles: { bgColor: '#14b8a6', textColor: '#062c30' },
  },
  {
    href: '/projects/create',
    label: 'create',
    ariaLabel: 'Create or join a project',
    rotation: -5,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' },
  },
  {
    href: '/projects/analytics',
    label: 'analytics',
    ariaLabel: 'Project analytics',
    rotation: 7,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#111827' },
  },
  {
    href: '/projects/trash',
    label: 'trash',
    ariaLabel: 'Project trash',
    rotation: -6,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' },
  },
] as const;

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
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLight = theme === 'light';

  const activeHref = useMemo(
    () => tabs.find((tab) => isProjectsTabActive(pathname, tab.href))?.href ?? '/projects',
    [pathname]
  );

  const items = useMemo<BubbleMenuItem[]>(
    () =>
      tabs.map((tab) => ({
        ...tab,
        isActive: tab.href === activeHref,
      })),
    [activeHref]
  );

  const closedNavStyle = {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingLeft: 0,
    paddingRight: 0,
    transform: 'none',
  } as const;

  const openNavStyle = {
    position: 'fixed',
    top: '1.1rem',
    left: '50%',
    right: 'auto',
    width: 'min(calc(100vw - 2.5rem), 68rem)',
    paddingLeft: 0,
    paddingRight: 0,
    transform: 'translateX(-50%)',
  } as const;

  const overlayStyle = {
    overflow: 'visible',
    alignItems: 'flex-start',
    paddingTop: '7.4rem',
    paddingBottom: '0.5rem',
  } as const;

  return (
    <div className="relative min-h-14 overflow-visible">
      <BubbleMenu
        logo={
          <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.01em]">
            <FiLayers className="h-4 w-4" />
            <span>{activeHref === '/projects' ? 'Project nav' : 'Sections'}</span>
          </span>
        }
        items={items}
        activeHref={activeHref}
        menuAriaLabel="Toggle project navigation"
        menuBg="#ffffff"
        menuContentColor="#111111"
        controlBg={isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(9, 12, 22, 0.84)'}
        controlContentColor={isLight ? '#0f172a' : '#f8fafc'}
        useFixedPosition={false}
        overlayFixed
        onMenuClick={setIsMenuOpen}
        className="project-bubble-nav top-0"
        overlayClassName="project-bubble-overlay"
        overlayStyle={overlayStyle}
        contentMaxWidth="56rem"
        pillMinHeight="92px"
        pillPadding="clamp(0.65rem, 1.15vw, 1.5rem) 0"
        pillFontSize="clamp(1.05rem, 2vw, 2.45rem)"
        style={isMenuOpen ? openNavStyle : closedNavStyle}
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.12}
      />
    </div>
  );
}
