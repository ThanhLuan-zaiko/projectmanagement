'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiActivity, FiArrowRight, FiBarChart2, FiFolderPlus, FiTrash2 } from 'react-icons/fi';
import { useProjectSummary } from '@/hooks/useProjectSummary';
import ProjectCharts from './ProjectCharts';
import ProjectList from './ProjectList';
import { ProjectsBentoCard, ProjectsBentoGrid } from './ProjectsBento';
import ProjectsPageHeader from './ProjectsPageHeader';
import ProjectStatGrid from './ProjectStatGrid';

export default function ProjectsOverviewClient() {
  const router = useRouter();
  const { summary, loading, isRefreshing, error } = useProjectSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-44 animate-pulse rounded-[32px] bg-white/5" />
        {/* KPI skeleton */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        {/* Quick links skeleton */}
        <div className="grid gap-6 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-[28px] bg-white/5" />
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-[28px] bg-white/5" />
          ))}
        </div>
        {/* Project lists skeleton */}
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="space-y-4">
              <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
              {[1, 2, 3].map((card) => (
                <div key={card} className="h-32 animate-pulse rounded-[26px] bg-white/5" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary || error) {
    return (
      <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
        Failed to load the project overview.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Overview"
        title="Operate your full project portfolio from one place."
        description="Track delivery health, open the right workspace quickly, and keep project hygiene under control with restore-aware project management."
        icon={FiActivity}
        isRefreshing={isRefreshing}
        highlights={[
          { label: 'Portfolio', value: `${summary.kpis.total_projects} visible` },
          { label: 'In Flight', value: `${summary.kpis.active_projects} active` },
          { label: 'Budget', value: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(summary.kpis.total_budget) },
        ]}
        action={
          <Link
            href="/projects/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110"
          >
            <FiFolderPlus className="h-4 w-4" />
            <span>New project</span>
          </Link>
        }
      />

      <ProjectStatGrid kpis={summary.kpis} />

      <ProjectsBentoGrid gridClassName="grid-cols-1 xl:grid-cols-6">
        <ProjectsBentoCard className="xl:col-span-2 min-h-[220px]">
          <Link href="/projects/workspace" aria-label="Open workspace" className="absolute inset-0 z-20 rounded-[28px]" />
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="projects-bento-kicker text-xs uppercase tracking-[0.22em]">Workspace</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Review active projects</h3>
            </div>
            <div>
              <p className="text-sm leading-6 text-slate-300">
                Filter owned and collaborative work, open dashboards and keep project metadata current.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                Open workspace
                <FiArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </ProjectsBentoCard>

        <ProjectsBentoCard className="xl:col-span-2 min-h-[220px]">
          <Link href="/projects/analytics" aria-label="View analytics" className="absolute inset-0 z-20 rounded-[28px]" />
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="projects-bento-kicker text-xs uppercase tracking-[0.22em]">Analytics</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Inspect portfolio trends</h3>
            </div>
            <div>
              <p className="text-sm leading-6 text-slate-300">
                Compare status distribution, budget concentration and recent delivery rhythm with dedicated charts.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-300">
                View analytics
                <FiBarChart2 className="h-4 w-4" />
              </span>
            </div>
          </div>
        </ProjectsBentoCard>

        <ProjectsBentoCard className="xl:col-span-2 min-h-[220px]">
          <Link href="/projects/trash" aria-label="Open trash" className="absolute inset-0 z-20 rounded-[28px]" />
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-rose-300">Recovery</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Restore deleted projects</h3>
            </div>
            <div>
              <p className="text-sm leading-6 text-slate-300">
                Review everything in trash before you permanently remove a project and lose the workspace forever.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rose-300">
                Open trash
                <FiTrash2 className="h-4 w-4" />
              </span>
            </div>
          </div>
        </ProjectsBentoCard>
      </ProjectsBentoGrid>

      <ProjectCharts summary={summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectList
          title="Recent workspaces"
          description="Jump back into projects that were updated most recently."
          projects={summary.recent_projects}
          variant="managed"
          cardLayout="compact"
          emptyTitle="No recent projects"
          emptyDescription="Create or join a project to start building a recent-activity trail."
          onOpen={(project) => router.push(`/${project.project_code}/dashboard`)}
        />

        <ProjectList
          title="Recently deleted"
          description="Deleted projects are kept here until you decide to restore or permanently remove them."
          projects={summary.recent_deleted_projects}
          variant="trash"
          cardLayout="compact"
          openLabel="Review trash"
          emptyTitle="Trash is clean"
          emptyDescription="Nothing has been moved to trash yet."
          onOpen={() => router.push('/projects/trash')}
        />
      </div>
    </div>
  );
}
