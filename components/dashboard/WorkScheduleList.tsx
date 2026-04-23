import { FiAlertCircle, FiLoader, FiPlus } from 'react-icons/fi';
import { WorkItemSchedule } from '@/types/work-schedule';
import WorkScheduleCard from '@/components/dashboard/WorkScheduleCard';

interface WorkScheduleListProps {
  schedules: WorkItemSchedule[];
  loading: boolean;
  deletingId: string | null;
  hasFilters: boolean;
  onCreateSchedule?: () => void;
  onView: (schedule: WorkItemSchedule) => void;
  onEdit?: (schedule: WorkItemSchedule) => void;
  onDelete: (schedule: WorkItemSchedule) => void;
  onRestore?: (schedule: WorkItemSchedule) => void;
  isRestoringId?: string | null;
}

export default function WorkScheduleList({
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
}: WorkScheduleListProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No work schedules found</h3>
          <p className="text-slate-400 mb-6">
            {hasFilters ? 'Try adjusting your filters' : 'Get started by creating your first work schedule'}
          </p>
          {!hasFilters && (
            <button
              onClick={onCreateSchedule}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-sm sm:text-base text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all duration-200"
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
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <WorkScheduleCard
          key={schedule.work_item_id}
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
  );
}
