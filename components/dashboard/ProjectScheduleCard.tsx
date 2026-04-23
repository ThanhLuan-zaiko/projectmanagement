import { FiCalendar, FiClock, FiEye, FiEdit2, FiTrash2, FiLoader, FiRotateCcw, FiTrendingUp } from 'react-icons/fi';
import { ProjectSchedule } from '@/types/project-schedule';
import DashboardShapeCard from '@/components/dashboard/DashboardShapeCard';

interface ProjectScheduleCardProps {
  schedule: ProjectSchedule;
  onView: (schedule: ProjectSchedule) => void;
  onEdit?: (schedule: ProjectSchedule) => void;
  onDelete: (schedule: ProjectSchedule) => void;
  onRestore?: (schedule: ProjectSchedule) => void;
  deletingId: string | null;
  isRestoringId?: string | null;
}

const scheduleTypeColors = {
  phase: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  milestone: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sprint: 'bg-green-500/20 text-green-400 border-green-500/30',
  release: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const statusColors = {
  planned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const scheduleTypeLabels = {
  phase: 'Phase',
  milestone: 'Milestone',
  sprint: 'Sprint',
  release: 'Release',
};

export default function ProjectScheduleCard({
  schedule,
  onView,
  onEdit,
  onDelete,
  onRestore,
  deletingId,
  isRestoringId,
}: ProjectScheduleCardProps) {
  const isDeleting = deletingId === schedule.schedule_id;
  const isRestoring = isRestoringId === schedule.schedule_id;
  const scheduleTypeColor = scheduleTypeColors[schedule.schedule_type];
  const statusColor = statusColors[schedule.status];
  const scheduleTypeLabel = scheduleTypeLabels[schedule.schedule_type];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDuration = (days: number | null) => {
    if (!days) return 'N/A';
    return `${days} days`;
  };

  const getProgressColor = (progress: number | null) => {
    if (!progress) return 'bg-slate-500';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <DashboardShapeCard contentClassName="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex-1 min-w-0 truncate">
              {schedule.schedule_name}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-md border ${scheduleTypeColor}`}>
                {scheduleTypeLabel.toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs rounded-md border ${statusColor}`}>
                {schedule.status.toUpperCase()}
              </span>
            </div>
          </div>

          {schedule.parent_schedule_name && (
            <p className="text-xs text-slate-400 mb-2">
              Parent: {schedule.parent_schedule_name}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(schedule.start_date)} → {formatDate(schedule.end_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="w-4 h-4" />
              <span>{formatDuration(schedule.planned_duration_days)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiTrendingUp className="w-3 h-3" />
                <span>Progress</span>
              </div>
              <span className="font-medium">{schedule.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(schedule.progress_percentage)}`}
                style={{ width: `${schedule.progress_percentage || 0}%` }}
              />
            </div>
          </div>
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
    </DashboardShapeCard>
  );
}
