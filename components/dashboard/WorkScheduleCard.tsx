import { FiCalendar, FiClock, FiEye, FiEdit2, FiTrash2, FiLoader, FiRotateCcw, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { WorkItemSchedule } from '@/types/work-schedule';

interface WorkScheduleCardProps {
  schedule: WorkItemSchedule;
  onView: (schedule: WorkItemSchedule) => void;
  onEdit?: (schedule: WorkItemSchedule) => void;
  onDelete: (schedule: WorkItemSchedule) => void;
  onRestore?: (schedule: WorkItemSchedule) => void;
  deletingId: string | null;
  isRestoringId?: string | null;
}

const statusColors = {
  not_started: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  delayed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  delayed: 'Delayed',
  blocked: 'Blocked',
};

export default function WorkScheduleCard({
  schedule,
  onView,
  onEdit,
  onDelete,
  onRestore,
  deletingId,
  isRestoringId,
}: WorkScheduleCardProps) {
  const isDeleting = deletingId === schedule.work_item_id;
  const isRestoring = isRestoringId === schedule.work_item_id;
  const statusColor = statusColors[schedule.status];
  const statusLabel = statusLabels[schedule.status];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const getProgressColor = (progress: number | null) => {
    if (!progress) return 'bg-slate-500';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-slate-700/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex-1 min-w-0 truncate">
              {schedule.work_item_title || `Work Item #${schedule.work_item_id.substring(0, 8)}`}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-md border ${statusColor}`}>
                {statusLabel.toUpperCase()}
              </span>
              {schedule.is_critical_path && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-md border border-orange-500/30 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  Critical
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(schedule.planned_start_date)} → {formatDate(schedule.planned_end_date)}</span>
            </div>
            {schedule.planned_hours && (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-4 h-4" />
                <span>{schedule.planned_hours}h planned</span>
              </div>
            )}
            {schedule.actual_hours && (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-4 h-4" />
                <span>{schedule.actual_hours}h actual</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiTrendingUp className="w-3 h-3" />
                <span>Completion</span>
              </div>
              <span className="font-medium">{schedule.completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(schedule.completion_percentage)}`}
                style={{ width: `${schedule.completion_percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Dependencies indicator */}
          {schedule.dependencies && schedule.dependencies.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              Dependencies: {schedule.dependencies.length} item{schedule.dependencies.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onView(schedule)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
            title="View"
          >
            <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {onEdit && !schedule.is_deleted && (
            <button
              onClick={() => onEdit(schedule)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {onRestore && schedule.is_deleted ? (
            <button
              onClick={() => onRestore(schedule)}
              disabled={isRestoring}
              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-slate-400 hover:text-green-400 disabled:opacity-50"
              title="Restore"
            >
              {isRestoring ? (
                <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <FiRotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          ) : null}
          <button
            onClick={() => onDelete(schedule)}
            disabled={isDeleting}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
            title={schedule.is_deleted ? "Delete Permanently" : "Delete"}
          >
            {isDeleting ? (
              <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
