'use client';

import {
  FiArchive,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiPieChart,
  FiTrendingUp,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { ProjectSummaryKpis } from '@/types/project';
import { ProjectsBentoCard, ProjectsBentoGrid } from './ProjectsBento';

interface ProjectStatGridProps {
  kpis: ProjectSummaryKpis;
}

interface StatItem {
  title: string;
  label: string;
  value: string | number;
  description: string;
  icon: IconType;
  accentClassName: string;
  valueClassName: string;
  spanClassName: string;
}

const statItems = (kpis: ProjectSummaryKpis): StatItem[] => [
  {
    title: 'Visible Projects',
    label: 'Portfolio',
    value: kpis.total_projects,
    description: 'Owned and collaborative workspaces moving through the portfolio.',
    icon: FiLayers,
    accentClassName: 'border-cyan-400/20 bg-cyan-400/12 text-cyan-300',
    valueClassName: 'text-cyan-300',
    spanClassName: 'xl:col-span-2',
  },
  {
    title: 'Owned Projects',
    label: 'Control',
    value: kpis.owned_projects,
    description: 'Workspaces you can update directly without waiting on other owners.',
    icon: FiPieChart,
    accentClassName: 'border-emerald-400/20 bg-emerald-400/12 text-emerald-300',
    valueClassName: 'text-emerald-300',
    spanClassName: 'xl:col-span-2',
  },
  {
    title: 'Active Projects',
    label: 'Delivery',
    value: kpis.active_projects,
    description: 'Initiatives currently underway and consuming real execution bandwidth.',
    icon: FiTrendingUp,
    accentClassName: 'border-violet-400/20 bg-violet-400/12 text-violet-300',
    valueClassName: 'text-violet-300',
    spanClassName: 'xl:col-span-2',
  },
  {
    title: 'Completed',
    label: 'Wins',
    value: kpis.completed_projects,
    description: 'Projects that have crossed the line and can feed portfolio learnings.',
    icon: FiCheckCircle,
    accentClassName: 'border-sky-400/20 bg-sky-400/12 text-sky-300',
    valueClassName: 'text-sky-300',
    spanClassName: 'xl:col-span-3',
  },
  {
    title: 'On Hold',
    label: 'Attention',
    value: kpis.on_hold_projects,
    description: 'Blocked or paused work that needs decisions before it can move again.',
    icon: FiClock,
    accentClassName: 'border-amber-400/20 bg-amber-400/12 text-amber-300',
    valueClassName: 'text-amber-300',
    spanClassName: 'xl:col-span-1',
  },
  {
    title: 'In Trash',
    label: 'Recovery',
    value: kpis.deleted_projects,
    description: 'Deleted workspaces still recoverable before permanent removal.',
    icon: FiArchive,
    accentClassName: 'border-rose-400/20 bg-rose-400/12 text-rose-300',
    valueClassName: 'text-rose-300',
    spanClassName: 'xl:col-span-2',
  },
];

export default function ProjectStatGrid({ kpis }: ProjectStatGridProps) {
  return (
    <ProjectsBentoGrid gridClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-6">
      {statItems(kpis).map((item) => {
        const Icon = item.icon;

        return (
          <ProjectsBentoCard
            key={item.title}
            className={`${item.spanClassName} min-h-[184px]`}
          >
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="projects-bento-kicker text-[11px] uppercase tracking-[0.28em]">{item.label}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${item.accentClassName}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <p className={`text-4xl font-semibold tracking-tight ${item.valueClassName}`}>{item.value}</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            </div>
          </ProjectsBentoCard>
        );
      })}
    </ProjectsBentoGrid>
  );
}
