'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProjectSummaryResponse } from '@/types/project';
import ChartWrapper from '@/components/dashboard/ChartWrapper';

interface ProjectChartsProps {
  summary: ProjectSummaryResponse;
}

const pieColors = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#fb7185'];

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function ProjectCharts({ summary }: ProjectChartsProps) {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <ChartCard
        title="Status mix"
        description="Track the balance between planning, active, on-hold and completed work."
      >
        <ChartWrapper className="min-w-0">
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <PieChart>
              <Pie
                data={summary.status_distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={108}
                paddingAngle={4}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartCard>

      <ChartCard
        title="Budget concentration"
        description="Compare where the largest owned-project budgets are currently allocated."
      >
        <ChartWrapper className="min-w-0">
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <BarChart data={summary.budget_distribution} margin={{ top: 8, right: 20, left: 0, bottom: 32 }}>
              <CartesianGrid stroke="var(--theme-chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--theme-chart-tick-strong)', fontSize: 12 }} angle={-16} textAnchor="end" height={56} />
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
              <Bar dataKey="budget" radius={[10, 10, 0, 0]} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </ChartCard>

      <div className="xl:col-span-2">
        <ChartCard
          title="Delivery rhythm"
          description="See how project creation and project completion have moved over the last six months."
        >
          <ChartWrapper className="min-w-0">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
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
                <Area type="monotone" dataKey="created" stroke="#38bdf8" fill="url(#createdArea)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#completedArea)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>
      </div>
    </div>
  );
}
