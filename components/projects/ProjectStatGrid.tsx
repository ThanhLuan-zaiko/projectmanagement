import { FiArchive, FiCheckCircle, FiClock, FiLayers, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import DashboardKPI from '@/components/dashboard/DashboardKPI';
import type { ProjectSummaryKpis } from '@/types/project';

interface ProjectStatGridProps {
  kpis: ProjectSummaryKpis;
}

export default function ProjectStatGrid({ kpis }: ProjectStatGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DashboardKPI
        title="Visible Projects"
        value={kpis.total_projects}
        subtitle="Owned + collaborative workspaces"
        icon={FiLayers}
        color="blue"
      />
      <DashboardKPI
        title="Owned Projects"
        value={kpis.owned_projects}
        subtitle="Projects under your control"
        icon={FiPieChart}
        color="green"
      />
      <DashboardKPI
        title="Active Projects"
        value={kpis.active_projects}
        subtitle="Currently moving forward"
        icon={FiTrendingUp}
        color="yellow"
      />
      <DashboardKPI
        title="Completed"
        value={kpis.completed_projects}
        subtitle="Delivered successfully"
        icon={FiCheckCircle}
        color="purple"
      />
      <DashboardKPI
        title="On Hold"
        value={kpis.on_hold_projects}
        subtitle="Needs attention or decisions"
        icon={FiClock}
        color="red"
      />
      <DashboardKPI
        title="In Trash"
        value={kpis.deleted_projects}
        subtitle="Can still be restored"
        icon={FiArchive}
        color="red"
      />
    </div>
  );
}
