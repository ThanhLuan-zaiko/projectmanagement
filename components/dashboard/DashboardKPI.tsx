'use client';

import { IconType } from 'react-icons';

interface DashboardKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: IconType;
  color?: string;
}

export default function DashboardKPI({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: DashboardKPIProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400',
    red: 'from-red-500/20 to-red-600/10 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl hover:bg-slate-800/70 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 font-medium text-sm">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-slate-500 mt-1 text-xs">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
