'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiBriefcase } from 'react-icons/fi';
import ShapeGrid from '@/components/ui/ShapeGrid';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/layout/UserMenu';
import ProjectsTabs from './ProjectsTabs';

interface ProjectsShellProps {
  children: React.ReactNode;
}

export default function ProjectsShell({ children }: ProjectsShellProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const shellHighlights = [
    { label: 'Routes', value: '5 focused views' },
    { label: 'Flow', value: 'Create to recovery' },
    { label: 'Mode', value: 'Bento workspace' },
  ];

  return (
    <div className="theme-projects-shell relative min-h-screen">
      <div className="absolute inset-0">
        <ShapeGrid
          speed={isLight ? 0.32 : 0.38}
          squareSize={isLight ? 48 : 44}
          direction="diagonal"
          borderColor={isLight ? 'rgba(111, 126, 145, 0.24)' : 'rgba(104, 92, 136, 0.52)'}
          hoverFillColor={isLight ? 'rgba(176, 188, 203, 0.26)' : 'rgba(52, 42, 68, 0.56)'}
          fadeColor={isLight ? 'rgba(199, 210, 221, 0.94)' : 'rgba(9, 7, 14, 0.68)'}
          shape="square"
          hoverTrailAmount={0}
        />
        <div className="theme-projects-grid-overlay pointer-events-none absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl min-w-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="theme-projects-header projects-bento-panel relative z-20 mb-6 overflow-visible rounded-[30px] p-5 backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />
          <div className="relative grid gap-5 overflow-visible xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-lg shadow-cyan-500/25">
                  <FiBriefcase className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Project Workspace</p>
                  <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Manage, measure and recover projects.</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Split project operations into focused screens for overview, creation, analytics and trash recovery.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {shellHighlights.map((highlight) => (
                  <div key={highlight.label} className="projects-bento-chip rounded-full px-3 py-2">
                    <p className="projects-bento-muted text-[10px] uppercase tracking-[0.24em]">{highlight.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{highlight.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 overflow-visible">
              <div className="projects-bento-subpanel rounded-[24px] p-4">
                <p className="projects-bento-kicker text-xs uppercase tracking-[0.24em]">Utility rail</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="projects-bento-chip rounded-[18px] px-3 py-3">
                    <p className="projects-bento-muted text-[10px] uppercase tracking-[0.22em]">Overview first</p>
                    <p className="mt-2 text-sm text-white">Jump from portfolio health to active work without changing modules.</p>
                  </div>
                  <div className="projects-bento-chip rounded-[18px] px-3 py-3">
                    <p className="projects-bento-muted text-[10px] uppercase tracking-[0.22em]">Analytics nearby</p>
                    <p className="mt-2 text-sm text-white">Charts stay close to the workspace instead of living in a separate reporting silo.</p>
                  </div>
                  <div className="projects-bento-chip rounded-[18px] px-3 py-3">
                    <p className="projects-bento-muted text-[10px] uppercase tracking-[0.22em]">Recovery aware</p>
                    <p className="mt-2 text-sm text-white">Delete flows remain reversible until you decide the workspace is truly done.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Link
                  href="/projects/create"
                  className="projects-bento-subpanel inline-flex items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-400/25"
                >
                  <span>Create or join</span>
                  <FiArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="projects-bento-subpanel flex items-center justify-center rounded-[22px] p-2">
                  <div className="self-end sm:self-auto">
                    <UserMenu
                      user={user}
                      dropdownMode="fixed"
                      fixedDesktopTop={132}
                      fixedDesktopRight={32}
                      fixedMobileTop={88}
                      fixedMobileInset={16}
                      dropdownWidth={288}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="theme-projects-tabs-shell relative mt-5 rounded-[24px] p-3 sm:p-4">
            <ProjectsTabs />
          </div>
        </header>

        <main className="relative min-w-0 flex-1 pb-20 sm:pb-24">{children}</main>
      </div>
    </div>
  );
}
