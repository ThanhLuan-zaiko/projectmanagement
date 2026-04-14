import { FiAlertCircle, FiLoader, FiPlus } from 'react-icons/fi';
import { ProjectSchedule } from '@/types/project-schedule';
import ProjectScheduleCard from '@/components/dashboard/ProjectScheduleCard';

interface ProjectScheduleListProps {
  schedules: ProjectSchedule[];
  loading: boolean;
  deletingId: string | null;
  hasFilters: boolean;
  onCreateSchedule?: () => void;
  onView: (schedule: ProjectSchedule) => void;
  onEdit?: (schedule: ProjectSchedule) => void;
  onDelete: (schedule: ProjectSchedule) => void;
  onRestore?: (schedule: ProjectSchedule) => void;
  isRestoringId?: string | null;
}

export default function ProjectScheduleList({
  schedules,
  loading,
  deletingId,
  hasFilters,
  onCreateSchedule,
  onView,
  onEdit,
  onDelete,
  onRestore,
  isRestoringId,
}: ProjectScheduleListProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No schedules found</h3>
          <p className="text-slate-400 mb-6">
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project schedule'}
          </p>
          {!hasFilters && (
            <button
              onClick={onCreateSchedule}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Schedule</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="divide-y divide-slate-700">
        {schedules.map((schedule) => (
          <ProjectScheduleCard
            key={schedule.schedule_id}
            schedule={schedule}
            onView={onView}
            onEdit={onEdit}
            onDelete={() => onDelete(schedule)}
            onRestore={onRestore ? () => onRestore(schedule) : undefined}
            deletingId={deletingId}
            isRestoringId={isRestoringId}
          />
        ))}
      </div>
    </div>
  );
}
