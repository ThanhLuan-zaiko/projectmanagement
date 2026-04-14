'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiBarChart2, FiClipboard, FiUsers, FiDollarSign } from 'react-icons/fi';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard',
    icon: FiBarChart2,
  },
  {
    id: 'tasks',
    label: 'Task Management',
    href: '/dashboard/tasks',
    icon: FiClipboard,
  },
  {
    id: 'experts',
    label: 'Expert Management',
    href: '/dashboard/experts',
    icon: FiUsers,
  },
  {
    id: 'expert-estimates',
    label: 'Expert Estimation',
    href: '/dashboard/expert-estimation',
    icon: FiUsers,
  },
  {
    id: 'cost-estimates',
    label: 'Cost Estimation',
    href: '/dashboard/cost-estimation',
    icon: FiDollarSign,
  },
];

export default function DashboardTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find((tab) => tab.href === pathname)?.id || 'overview';

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
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => router.push(tab.href)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
