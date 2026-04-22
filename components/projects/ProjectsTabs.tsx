'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBarChart2, FiFolderPlus, FiGrid, FiLayers, FiTrash2 } from 'react-icons/fi';

const tabs = [
  { href: '/projects', label: 'Overview', icon: FiGrid },
  { href: '/projects/workspace', label: 'Workspace', icon: FiLayers },
  { href: '/projects/create', label: 'Create & Join', icon: FiFolderPlus },
  { href: '/projects/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/projects/trash', label: 'Trash', icon: FiTrash2 },
];

export default function ProjectsTabs() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-2 backdrop-blur-xl shadow-2xl shadow-slate-950/30">
      <nav className="flex gap-2 overflow-x-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/projects'
              ? pathname === '/projects'
              : tab.href === '/projects/workspace' && pathname.startsWith('/projects/') && pathname.endsWith('/edit')
                ? true
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              data-speculate="prerender"
              className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
