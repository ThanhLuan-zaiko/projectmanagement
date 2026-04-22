'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { FiBarChart2, FiClipboard, FiUsers, FiDollarSign, FiCalendar, FiList } from 'react-icons/fi';

export default function DashboardTabs() {
  const pathname = usePathname();
  const params = useParams();
  const projectCode = params?.projectCode as string;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/${projectCode}/dashboard`,
      icon: FiBarChart2,
    },
    {
      id: 'tasks',
      label: 'Task Management',
      href: `/${projectCode}/dashboard/tasks`,
      icon: FiClipboard,
    },
    {
      id: 'experts',
      label: 'Expert Management',
      href: `/${projectCode}/dashboard/experts`,
      icon: FiUsers,
    },
    {
      id: 'expert-estimates',
      label: 'Expert Estimation',
      href: `/${projectCode}/dashboard/expert-estimation`,
      icon: FiUsers,
    },
    {
      id: 'cost-estimates',
      label: 'Cost Estimation',
      href: `/${projectCode}/dashboard/cost-estimation`,
      icon: FiDollarSign,
    },
    {
      id: 'project-schedule',
      label: 'Project Schedule',
      href: `/${projectCode}/dashboard/project-schedule`,
      icon: FiCalendar,
    },
    {
      id: 'work-schedule',
      label: 'Work Schedule',
      href: `/${projectCode}/dashboard/work-schedule`,
      icon: FiList,
    },
  ];

  const activeTab = tabs
    .filter((tab) => pathname?.startsWith(tab.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.id || 'overview';

  return (
    <div className="border-b border-slate-700 mb-6">
      <nav 
        className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" 
        role="tablist"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={true}
              data-speculate="prerender"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
