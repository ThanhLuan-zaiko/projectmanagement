'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaskPriorityChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];

export default function TaskPriorityChart({ data }: TaskPriorityChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Task Priority Breakdown</h3>
        <p className="text-slate-500 mt-8 text-center">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Task Priority Breakdown</h3>
        <p className="text-slate-400 mt-1 text-sm">Distribution by priority level</p>
        <div className="mt-6 h-64 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Task Priority Breakdown</h3>
      <p className="text-slate-400 mt-1 text-sm">Distribution by priority level</p>
      <div className="mt-6" style={{ width: '100%', minHeight: 256 }}>
        <ResponsiveContainer width="100%" height={256} minHeight={0}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
