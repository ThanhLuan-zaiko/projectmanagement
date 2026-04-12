'use client';

import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyWorkloadProps {
  data: Array<{
    day: string;
    tasks: number;
    hours: number;
  }>;
}

export default function WeeklyWorkloadChart({ data }: WeeklyWorkloadProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Weekly Workload Pattern</h3>
        <p className="text-slate-500 mt-8 text-center">No data available</p>
      </div>
    );
  }

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
    const dayData = data.find((d) => d.day === day);
    return {
      day,
      tasks: dayData?.tasks || 0,
      hours: dayData?.hours || 0,
    };
  });

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Weekly Workload Pattern</h3>
        <p className="text-slate-400 mt-1 text-sm">Task distribution by day of week</p>
        <div className="mt-6 h-80 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Weekly Workload Pattern</h3>
      <p className="text-slate-400 mt-1 text-sm">Task distribution by day of week</p>
      <div className="mt-6 h-80" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#475569" opacity={0.3} />
            <PolarAngleAxis 
              dataKey="day" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
            />
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
            <Radar
              name="Tasks"
              dataKey="tasks"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.6}
            />
            <Radar
              name="Hours"
              dataKey="hours"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
