import { FiCalendar, FiClock, FiTrendingUp, FiUser } from 'react-icons/fi';
import { ProjectSchedule } from '@/types/project-schedule';
import Modal from '@/components/ui/Modal';

interface ProjectScheduleViewModalProps {
  schedule: ProjectSchedule | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function ProjectScheduleViewModal({
  schedule,
  isOpen,
  onClose,
}: ProjectScheduleViewModalProps) {
  if (!schedule) return null;

  const scheduleTypeColor = scheduleTypeColors[schedule.schedule_type];
  const statusColor = statusColors[schedule.status];
  const scheduleTypeLabel = scheduleTypeLabels[schedule.schedule_type];

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
    <Modal isOpen={isOpen} onClose={onClose} title="Project Schedule Details" size="lg">
      <div className="space-y-6">
        {/* Schedule Name */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Schedule Name</p>
          <p className="text-white font-medium text-lg">{schedule.schedule_name}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Schedule Type</p>
            <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${scheduleTypeColor}`}>
              {scheduleTypeLabel.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${statusColor}`}>
              {schedule.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Start Date</p>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(schedule.start_date)}</p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="w-4 h-4 text-pink-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">End Date</p>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(schedule.end_date)}</p>
          </div>
        </div>

        {/* Duration */}
        {schedule.planned_duration_days && (
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="w-5 h-5 text-blue-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Duration</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {schedule.planned_duration_days} {schedule.planned_duration_days === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Progress</p>
            </div>
            <p className="text-lg font-bold text-white">{schedule.progress_percentage || 0}%</p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(schedule.progress_percentage)}`}
              style={{ width: `${schedule.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Parent Schedule */}
        {schedule.parent_schedule_name && (
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Parent Schedule</p>
            <p className="text-white font-medium">{schedule.parent_schedule_name}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-slate-700 space-y-2">
          {schedule.created_by_name && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FiUser className="w-4 h-4" />
              <span>Created by: {schedule.created_by_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FiCalendar className="w-4 h-4" />
            <span>Created: {new Date(schedule.created_at).toLocaleString()}</span>
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
