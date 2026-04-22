'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiActivity, FiArrowRight, FiBarChart2, FiFolderPlus, FiTrash2 } from 'react-icons/fi';
import { useProjectSummary } from '@/hooks/useProjectSummary';
import ProjectCharts from './ProjectCharts';
import ProjectList from './ProjectList';
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
        <Link
          href="/projects/workspace"
          className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-slate-950/70"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Workspace</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Review active projects</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Filter owned and collaborative work, open dashboards and keep project metadata current.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
            Open workspace
            <FiArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/projects/analytics"
          className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-slate-950/70"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Analytics</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Inspect portfolio trends</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Compare status distribution, budget concentration and recent delivery rhythm with dedicated charts.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
            View analytics
            <FiBarChart2 className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/projects/trash"
          className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl transition hover:border-rose-400/20 hover:bg-slate-950/70"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-rose-200/70">Recovery</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Restore deleted projects</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Review everything in trash before you permanently remove a project and lose the workspace forever.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rose-300">
            Open trash
            <FiTrash2 className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <ProjectCharts summary={summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectList
          title="Recent workspaces"
          description="Jump back into projects that were updated most recently."
          projects={summary.recent_projects}
          variant="managed"
          emptyTitle="No recent projects"
          emptyDescription="Create or join a project to start building a recent-activity trail."
          onOpen={(project) => router.push(`/${project.project_code}/dashboard`)}
        />

        <ProjectList
          title="Recently deleted"
          description="Deleted projects are kept here until you decide to restore or permanently remove them."
          projects={summary.recent_deleted_projects}
          variant="trash"
          openLabel="Review trash"
          emptyTitle="Trash is clean"
          emptyDescription="Nothing has been moved to trash yet."
          onOpen={() => router.push('/projects/trash')}
        />
      </div>
    </div>
  );
}
