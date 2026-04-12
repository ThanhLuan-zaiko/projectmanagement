'use client';

import { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusFlowProps {
  data: Array<{
    date: string;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  }>;
}

export default function StatusFlowChart({ data }: StatusFlowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Task Status Flow</h3>
        <p className="text-slate-500 mt-8 text-center">No data available</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Task Status Flow</h3>
        <p className="text-slate-400 mt-1 text-sm">Active tasks by status over time</p>
        <div className="mt-6 h-80 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Task Status Flow</h3>
      <p className="text-slate-400 mt-1 text-sm">Active tasks by status over time</p>
      <div className="mt-6 h-80" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ComposedChart data={data}>
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
            <Legend 
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
            <Bar dataKey="todo" name="To Do" fill="#64748b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="review" name="Review" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Line 
              type="monotone" 
              dataKey="done" 
              name="Done" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ fill: '#10b981', r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
