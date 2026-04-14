import { FiCalendar, FiClock, FiTrendingUp, FiUser, FiAlertCircle } from 'react-icons/fi';
import { WorkItemSchedule } from '@/types/work-schedule';
import Modal from '@/components/ui/Modal';

interface WorkScheduleViewModalProps {
  schedule: WorkItemSchedule | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function WorkScheduleViewModal({
  schedule,
  isOpen,
  onClose,
}: WorkScheduleViewModalProps) {
  if (!schedule) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Work Schedule Details" size="lg">
      <div className="space-y-6">
        {/* Work Item Name */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Work Item</p>
          <p className="text-white font-medium text-lg">
            {schedule.work_item_title || `Work Item #${schedule.work_item_id.substring(0, 8)}`}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
          <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${statusColor}`}>
            {statusLabel.toUpperCase()}
          </span>
          {schedule.is_critical_path && (
            <span className="ml-3 inline-block px-3 py-1.5 text-sm rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <FiAlertCircle className="w-3 h-3 inline mr-1" />
              CRITICAL PATH
            </span>
          )}
        </div>

        {/* Planned Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Planned Start</p>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(schedule.planned_start_date)}</p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Planned End</p>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(schedule.planned_end_date)}</p>
          </div>
        </div>

        {/* Actual Dates (if available) */}
        {schedule.actual_start_date && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="w-4 h-4 text-green-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">Actual Start</p>
              </div>
              <p className="text-lg font-semibold text-white">{formatDate(schedule.actual_start_date)}</p>
            </div>
            <div className="bg-slate-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">Actual End</p>
              </div>
              <p className="text-lg font-semibold text-white">{schedule.actual_end_date ? formatDate(schedule.actual_end_date) : 'In Progress'}</p>
            </div>
          </div>
        )}

        {/* Hours */}
        {(schedule.planned_hours || schedule.actual_hours) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schedule.planned_hours && (
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Planned Hours</p>
                </div>
                <p className="text-2xl font-bold text-white">{schedule.planned_hours}h</p>
              </div>
            )}
            {schedule.actual_hours && (
              <div className="bg-slate-700/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Actual Hours</p>
                </div>
                <p className="text-2xl font-bold text-white">{schedule.actual_hours}h</p>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Completion</p>
            </div>
            <p className="text-lg font-bold text-white">{schedule.completion_percentage || 0}%</p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(schedule.completion_percentage)}`}
              style={{ width: `${schedule.completion_percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Dependencies */}
        {schedule.dependencies && schedule.dependencies.length > 0 && (
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Dependencies</p>
            <p className="text-white">{schedule.dependencies.length} dependent work item(s)</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-slate-700 space-y-2">
          {schedule.scheduled_by_name && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FiUser className="w-4 h-4" />
              <span>Scheduled by: {schedule.scheduled_by_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FiCalendar className="w-4 h-4" />
            <span>Scheduled at: {new Date(schedule.scheduled_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FiCalendar className="w-4 h-4" />
            <span>Updated: {new Date(schedule.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
