'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiBarChart2, FiClipboard } from 'react-icons/fi';

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
];

export default function DashboardTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find((tab) => tab.href === pathname)?.id || 'overview';

  return (
    <div className="border-b border-slate-700 mb-6">
      <nav className="flex gap-1" role="tablist">
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
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
