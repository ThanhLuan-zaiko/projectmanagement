'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HoursComparisonChartProps {
  estimated: number;
  actual: number;
}

export default function HoursComparisonChart({
  estimated,
  actual,
}: HoursComparisonChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    {
      name: 'Hours',
      Estimated: Math.round(estimated * 100) / 100,
      Actual: Math.round(actual * 100) / 100,
    },
  ];

  const difference = actual - estimated;
  const percentageDiff = estimated > 0 ? ((difference / estimated) * 100).toFixed(1) : '0';
  const isOverBudget = actual > estimated;

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Estimated vs Actual Hours</h3>
        <p className="text-slate-400 mt-1 text-sm">Calculating...</p>
        <div className="mt-6 h-64 animate-pulse bg-slate-700/30 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Estimated vs Actual Hours</h3>
      <p className="text-slate-400 mt-1 text-sm">
        {isOverBudget ? (
          <span className="text-rose-400">
            Over budget by {percentageDiff}% (+{difference.toFixed(1)}h)
          </span>
        ) : (
          <span className="text-emerald-400">
            Under budget by {Math.abs(parseFloat(percentageDiff))}% ({Math.abs(difference).toFixed(1)}h saved)
          </span>
        )}
      </p>
      <div className="mt-6 h-64" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569', opacity: 0.3 }}
              tickLine={{ stroke: '#475569', opacity: 0.3 }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
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
              formatter={(value) => [`${Number(value)}h`]}
            />
            <Legend 
              formatter={(value) => <span className="text-slate-300">{value}</span>}
            />
            <Bar 
              dataKey="Estimated" 
              fill="#06b6d4" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="Actual" 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
