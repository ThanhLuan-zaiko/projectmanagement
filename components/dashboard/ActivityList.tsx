'use client';

import DashboardShapeCard from '@/components/dashboard/DashboardShapeCard';

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  updated_at: Date;
  assigned_to: string | null;
}

interface ActivityListProps {
  activities: ActivityItem[];
}

const statusColors: Record<string, string> = {
  todo: 'bg-slate-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-blue-500',
  done: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function ActivityList({ activities }: ActivityListProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
        <p className="text-slate-500 mt-8 text-center">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
      <p className="text-slate-400 mt-1 text-sm">Latest task updates</p>
      <div className="mt-6 space-y-3">
        {activities.map((activity) => (
          <DashboardShapeCard
            key={activity.id}
            compact
            className="bg-slate-900/70"
            contentClassName="p-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  statusColors[activity.status] || 'bg-slate-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500 text-xs">
                    {activity.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      priorityColors[activity.priority] || 'text-slate-400'
                    }`}
                  >
                    • {activity.priority}
                  </span>
                  <span className="text-slate-500 text-xs">
                    • {new Date(activity.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </DashboardShapeCard>
        ))}
      </div>
    </div>
  );
}
