'use client';

import { FiCalendar, FiAlertTriangle } from 'react-icons/fi';

interface DeadlineItem {
  id: string;
  title: string;
  due_date: Date;
  status: string;
  priority: string;
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const daysUntil = (date: Date): number => {
  const now = new Date();
  const due = new Date(date);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-white font-semibold text-lg">Upcoming Deadlines</h3>
        <p className="text-slate-500 mt-8 text-center">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 backdrop-blur-xl">
      <h3 className="text-white font-semibold text-lg">Upcoming Deadlines</h3>
      <p className="text-slate-400 mt-1 text-sm">Tasks due in the next 7 days</p>
      <div className="mt-6 space-y-3">
        {deadlines.map((deadline) => {
          const days = daysUntil(deadline.due_date);
          const isOverdue = days < 0;
          const isUrgent = days <= 2;

          return (
            <div
              key={deadline.id}
              className={`p-3 rounded-lg border transition-colors ${
                isOverdue
                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                  : isUrgent
                  ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
                  : 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {isOverdue || isUrgent ? (
                    <FiAlertTriangle
                      className={`w-4 h-4 ${
                        isOverdue ? 'text-red-400' : 'text-orange-400'
                      }`}
                    />
                  ) : (
                    <FiCalendar className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">
                    {deadline.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-semibold ${
                        isOverdue
                          ? 'text-red-400'
                          : isUrgent
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(days)} days overdue`
                        : days === 0
                        ? 'Due today'
                        : days === 1
                        ? 'Due tomorrow'
                        : `${days} days left`}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        priorityColors[deadline.priority] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {deadline.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
