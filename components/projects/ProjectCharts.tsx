'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import type { ProjectSummaryResponse } from '@/types/project';
import ChartWrapper from '@/components/dashboard/ChartWrapper';

interface ProjectChartsProps {
  summary: ProjectSummaryResponse;
}

const pieColors = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#fb7185'];

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="projects-bento-chip rounded-full px-3 py-2">
      <p className="projects-bento-muted text-[10px] uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ChartCard({
  eyebrow,
  title,
  description,
  children,
  className = '',
  metrics = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  metrics?: Array<{ label: string; value: string }>;
}) {
  return (
    <section className={`projects-bento-panel min-w-0 rounded-[28px] p-6 backdrop-blur-xl ${className}`.trim()}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="projects-bento-kicker text-xs uppercase tracking-[0.24em]">{eyebrow}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {metrics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <ChartMetric key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="projects-bento-subpanel min-w-0 rounded-[24px] p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default function ProjectCharts({ summary }: ProjectChartsProps) {
  const leadingStatus =
    summary.status_distribution.reduce<{ name: string; value: number } | null>(
      (leader, entry) => (leader === null || entry.value > leader.value ? entry : leader),
      null
    ) ?? summary.status_distribution[0];

  const sortedBudgets = [...summary.budget_distribution].sort((left, right) => right.budget - left.budget);
  const topBudgetProject = sortedBudgets[0];
  const budgetTotal = sortedBudgets.reduce((sum, item) => sum + item.budget, 0);
  const createdTotal = summary.timeline.reduce((sum, item) => sum + item.created, 0);
  const completedTotal = summary.timeline.reduce((sum, item) => sum + item.completed, 0);
  const latestTimeline = summary.timeline[summary.timeline.length - 1];

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-6">
      <ChartCard
        eyebrow="Mix"
        className="xl:col-span-2"
        title="Status mix"
        description="Track the balance between planning, active, on-hold and completed work."
        metrics={[
          { label: 'Lead status', value: leadingStatus ? `${leadingStatus.name} ${leadingStatus.value}` : 'No data' },
          { label: 'Tracked buckets', value: String(summary.status_distribution.length) },
        ]}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <ChartWrapper className="min-w-0">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <PieChart>
                <Pie
                  data={summary.status_distribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={4}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={2}
                >
                  {summary.status_distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--theme-chart-tooltip-bg)',
                    border: '1px solid var(--theme-chart-tooltip-border)',
                    borderRadius: 16,
                    color: 'var(--theme-chart-tooltip-text)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <div className="grid gap-2 self-center">
            {summary.status_distribution.map((entry, index) => (
              <div key={entry.name} className="projects-bento-chip flex items-center justify-between rounded-[18px] px-3 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="text-sm capitalize text-slate-200">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <ChartCard
        eyebrow="Budget"
        className="xl:col-span-4"
        title="Budget concentration"
        description="Compare where the largest owned-project budgets are currently allocated."
        metrics={[
          { label: 'Tracked budget', value: formatCurrency(budgetTotal) },
          { label: 'Largest project', value: topBudgetProject ? formatCompactNumber(topBudgetProject.budget) : 'No data' },
        ]}
      >
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            {sortedBudgets.slice(0, 3).map((item, index) => (
              <div key={`${item.name}-${index}`} className="projects-bento-chip rounded-[18px] px-4 py-3">
                <p className="projects-bento-muted text-[10px] uppercase tracking-[0.22em]">
                  {index === 0 ? 'Largest allocation' : `Top ${index + 1}`}
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-sm text-cyan-300">{formatCurrency(item.budget)}</p>
              </div>
            ))}
          </div>

          <ChartWrapper className="min-w-0">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <BarChart data={summary.budget_distribution} margin={{ top: 8, right: 20, left: 0, bottom: 32 }}>
                <CartesianGrid stroke="var(--theme-chart-grid)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--theme-chart-tick-strong)', fontSize: 12 }}
                  angle={-16}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fill: 'var(--theme-chart-tick)', fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => new Intl.NumberFormat('en-US').format(Number(value || 0))}
                  contentStyle={{
                    background: 'var(--theme-chart-tooltip-bg)',
                    border: '1px solid var(--theme-chart-tooltip-border)',
                    borderRadius: 16,
                    color: 'var(--theme-chart-tooltip-text)',
                  }}
              />
                <Bar dataKey="budget" radius={[12, 12, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </ChartCard>

      <div className="xl:col-span-6">
        <ChartCard
          eyebrow="Rhythm"
          title="Delivery rhythm"
          description="See how project creation and project completion have moved over the last six months."
          metrics={[
            { label: 'Created', value: String(createdTotal) },
            { label: 'Completed', value: String(completedTotal) },
            { label: 'Latest month', value: latestTimeline?.label || 'No data' },
          ]}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-200">
                <FiTrendingUp className="h-4 w-4 text-cyan-300" />
                <span>Created flow</span>
              </div>
              <div className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-200">
                <FiPieChart className="h-4 w-4 text-emerald-300" />
                <span>Completed flow</span>
              </div>
              <div className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-200">
                <FiBarChart2 className="h-4 w-4 text-violet-300" />
                <span>{latestTimeline ? `${latestTimeline.created} created / ${latestTimeline.completed} completed in ${latestTimeline.label}` : 'No recent movement'}</span>
              </div>
            </div>

            <ChartWrapper className="min-w-0">
              <ResponsiveContainer width="100%" height={340} minWidth={0}>
                <AreaChart data={summary.timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="createdArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--theme-chart-grid)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'var(--theme-chart-tick-strong)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--theme-chart-tick)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--theme-chart-tooltip-bg)',
                      border: '1px solid var(--theme-chart-tooltip-border)',
                      borderRadius: 16,
                      color: 'var(--theme-chart-tooltip-text)',
                    }}
                  />
                  <Area type="monotone" dataKey="created" stroke="#38bdf8" fill="url(#createdArea)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#completedArea)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
