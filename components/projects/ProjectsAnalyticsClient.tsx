'use client';

import { FiBarChart2 } from 'react-icons/fi';
import { useProjectSummary } from '@/hooks/useProjectSummary';
import ProjectCharts from './ProjectCharts';
import ProjectsPageHeader from './ProjectsPageHeader';
import ProjectStatGrid from './ProjectStatGrid';

export default function ProjectsAnalyticsClient() {
  const { summary, loading, isRefreshing, error } = useProjectSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-[28px] bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-[28px] bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary || error) {
    return (
      <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
        Failed to load project analytics.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Analytics"
        title="Translate the portfolio into signals you can act on."
        description="Focus this screen on charts and topline metrics so the management routes stay operational instead of analytical."
        icon={FiBarChart2}
        isRefreshing={isRefreshing}
        highlights={[
          { label: 'Statuses', value: `${summary.status_distribution.length} tracked` },
          { label: 'Completed', value: summary.kpis.completed_projects },
          { label: 'Trash', value: summary.kpis.deleted_projects },
        ]}
      />

      <ProjectStatGrid kpis={summary.kpis} />
      <ProjectCharts summary={summary} />
    </div>
  );
}
