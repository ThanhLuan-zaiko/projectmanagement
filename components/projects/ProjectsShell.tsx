'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/layout/UserMenu';
import ProjectsTabs from './ProjectsTabs';

interface ProjectsShellProps {
  children: React.ReactNode;
}

export default function ProjectsShell({ children }: ProjectsShellProps) {
  const { user } = useAuth();

  return (
    <div className="theme-projects-shell relative min-h-screen">
      <div className="theme-projects-grid pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl min-w-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="theme-projects-header relative z-20 mb-6 overflow-visible rounded-[28px] border border-white/10 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 overflow-visible lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-lg shadow-cyan-500/25">
                <FiBriefcase className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Project Workspace</p>
                <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Manage, measure and recover projects.</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Split project operations into focused screens for overview, creation, analytics and trash recovery.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 overflow-visible sm:flex-row sm:items-center">
              <Link
                href="/projects/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <span>Create or join</span>
                <FiArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="self-end sm:self-auto">
                <UserMenu user={user} />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ProjectsTabs />
          </div>
        </header>

        <main className="relative min-w-0 flex-1 pb-20 sm:pb-24">{children}</main>
      </div>
    </div>
  );
}
