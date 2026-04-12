'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface WorkloadByAssigneeProps {
  data: Array<{
    name: string;
    taskCount: number;
    estimatedHours: number;
  }>;
}

export default function WorkloadByAssigneeChart({ data }: WorkloadByAssigneeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Workload by Assignee</h3>
        <p className="text-slate-500 mt-8 text-center">No data available</p>
      </div>
    );
  }

  const chartData = data
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 8)
    .map((item) => ({
      name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
      fullName: item.name,
      tasks: item.taskCount,
      hours: item.estimatedHours,
    }));

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Workload by Assignee</h3>
        <p className="text-slate-400 mt-1 text-sm">Top 8 team members by task count</p>
        <div className="mt-6 h-80 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Workload by Assignee</h3>
      <p className="text-slate-400 mt-1 text-sm">Top 8 team members by task count</p>
      <div className="mt-6 h-80" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
              tickLine={{ stroke: '#475569', opacity: 0.3 }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
              tickLine={{ stroke: '#475569', opacity: 0.3 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => {
                if (name === 'tasks') return [`${value} tasks`, 'Task Count'];
                return [`${value}h`, 'Est. Hours'];
              }}
            />
            <Bar dataKey="tasks" name="tasks" radius={[0, 4, 4, 0]} fill="#3b82f6">
              <LabelList dataKey="tasks" position="right" fill="#94a3b8" fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
