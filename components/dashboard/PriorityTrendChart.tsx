'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriorityTrendProps {
  data: Array<{
    date: string;
    low: number;
    medium: number;
    high: number;
    urgent: number;
  }>;
}

export default function PriorityTrendChart({ data }: PriorityTrendProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Priority Trend</h3>
        <p className="text-slate-500 mt-8 text-center">No data available</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Priority Trend</h3>
        <p className="text-slate-400 mt-1 text-sm">Task priority distribution over time</p>
        <div className="mt-6 h-80 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Priority Trend</h3>
      <p className="text-slate-400 mt-1 text-sm">Task priority distribution over time</p>
      <div className="mt-6" style={{ width: '100%', minHeight: 320 }}>
        <ResponsiveContainer width="100%" height={320} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
              tickLine={{ stroke: '#475569', opacity: 0.3 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
              tickLine={{ stroke: '#475569', opacity: 0.3 }}
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
            <Area
              type="monotone"
              dataKey="low"
              name="Low"
              stackId="1"
              stroke="#64748b"
              fill="url(#colorLow)"
            />
            <Area
              type="monotone"
              dataKey="medium"
              name="Medium"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#colorMedium)"
            />
            <Area
              type="monotone"
              dataKey="high"
              name="High"
              stackId="1"
              stroke="#f59e0b"
              fill="url(#colorHigh)"
            />
            <Area
              type="monotone"
              dataKey="urgent"
              name="Urgent"
              stackId="1"
              stroke="#f43f5e"
              fill="url(#colorUrgent)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
