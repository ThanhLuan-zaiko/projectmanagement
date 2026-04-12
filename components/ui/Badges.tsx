import { FiAlertCircle, FiClock, FiEye, FiCheckCircle, FiX, FiFlag } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';

// Status Badge Component
export function StatusBadge({ status }: { status: WorkItem['status'] }) {
  const statusConfig = {
    todo: { bg: 'bg-slate-600/20', text: 'text-slate-300', label: 'To Do', icon: FiAlertCircle },
    in_progress: { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'In Progress', icon: FiClock },
    review: { bg: 'bg-yellow-600/20', text: 'text-yellow-300', label: 'Review', icon: FiEye },
    done: { bg: 'bg-green-600/20', text: 'text-green-300', label: 'Done', icon: FiCheckCircle },
    cancelled: { bg: 'bg-red-600/20', text: 'text-red-300', label: 'Cancelled', icon: FiX },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Priority Badge Component
export function PriorityBadge({ priority }: { priority: WorkItem['priority'] }) {
  const priorityConfig = {
    low: { bg: 'bg-slate-600/20', text: 'text-slate-300', label: 'Low', icon: FiFlag },
    medium: { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'Medium', icon: FiFlag },
    high: { bg: 'bg-orange-600/20', text: 'text-orange-300', label: 'High', icon: FiFlag },
    urgent: { bg: 'bg-red-600/20', text: 'text-red-300', label: 'Urgent', icon: FiFlag },
  };

  const config = priorityConfig[priority];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Type Badge Component
export function TypeBadge({ type }: { type: WorkItem['work_type'] }) {
  const typeConfig = {
    task: { bg: 'bg-purple-600/20', text: 'text-purple-300', label: 'Task' },
    subtask: { bg: 'bg-indigo-600/20', text: 'text-indigo-300', label: 'Subtask' },
    milestone: { bg: 'bg-cyan-600/20', text: 'text-cyan-300', label: 'Milestone' },
    bug: { bg: 'bg-rose-600/20', text: 'text-rose-300', label: 'Bug' },
  };

  const config = typeConfig[type];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
