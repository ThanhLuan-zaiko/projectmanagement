import type { ElementType } from 'react';
import {
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiHome,
  FiList,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';

type DashboardNavMatch = 'exact' | 'prefix';

export interface DashboardNavDefinition {
  id: string;
  label: string;
  tabLabel: string;
  segment: string;
  icon: ElementType;
  match: DashboardNavMatch;
}

export interface DashboardNavItem extends DashboardNavDefinition {
  href: string;
}

export const dashboardNavItems: DashboardNavDefinition[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    tabLabel: 'Overview',
    segment: '',
    icon: FiHome,
    match: 'exact',
  },
  {
    id: 'tasks',
    label: 'Task Board',
    tabLabel: 'Tasks',
    segment: 'tasks',
    icon: FiClipboard,
    match: 'prefix',
  },
  {
    id: 'experts',
    label: 'Expert Management',
    tabLabel: 'Experts',
    segment: 'experts',
    icon: FiUsers,
    match: 'prefix',
  },
  {
    id: 'expert-estimates',
    label: 'Expert Time Estimation',
    tabLabel: 'Time Estimate',
    segment: 'expert-estimation',
    icon: FiUsers,
    match: 'prefix',
  },
  {
    id: 'cost-estimates',
    label: 'Project Cost Estimation',
    tabLabel: 'Cost Estimate',
    segment: 'cost-estimation',
    icon: FiDollarSign,
    match: 'prefix',
  },
  {
    id: 'project-schedules',
    label: 'Project Schedule',
    tabLabel: 'Project Plan',
    segment: 'project-schedule',
    icon: FiCalendar,
    match: 'prefix',
  },
  {
    id: 'work-schedules',
    label: 'Work Schedule',
    tabLabel: 'Work Plan',
    segment: 'work-schedule',
    icon: FiList,
    match: 'prefix',
  },
  {
    id: 'settings',
    label: 'Project Settings',
    tabLabel: 'Settings',
    segment: 'settings',
    icon: FiSettings,
    match: 'prefix',
  },
];

export function getProjectDashboardNavItems(projectCode?: string): DashboardNavItem[] {
  if (!projectCode) {
    return [];
  }

  const dashboardBasePath = `/${projectCode}/dashboard`;

  return dashboardNavItems.map((item) => ({
    ...item,
    href: item.segment ? `${dashboardBasePath}/${item.segment}` : dashboardBasePath,
  }));
}

export function isDashboardNavItemActive(
  pathname: string | null | undefined,
  item: Pick<DashboardNavItem, 'href' | 'match'>
) {
  if (!pathname) {
    return false;
  }

  if (item.match === 'exact') {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getActiveDashboardNavItem(
  pathname: string | null | undefined,
  items: DashboardNavItem[]
) {
  const activeItems = items.filter((item) => isDashboardNavItemActive(pathname, item));

  return activeItems.sort((firstItem, secondItem) => secondItem.href.length - firstItem.href.length)[0] ?? null;
}
