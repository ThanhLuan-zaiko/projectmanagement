import { FiLoader, FiCalendar, FiClock } from 'react-icons/fi';
import { ProjectScheduleFormData, ProjectSchedule } from '@/types/project-schedule';
import CustomSelect from '@/components/ui/CustomSelect';

interface ProjectScheduleFormProps {
  formData: ProjectScheduleFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
  parentSchedules?: Array<{ id: string; name: string }>;
  validationErrors?: string[];
  duration?: number | null;
}

export default function ProjectScheduleForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
  parentSchedules = [],
  validationErrors = [],
  duration,
}: ProjectScheduleFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <ul className="list-disc list-inside text-sm text-red-400">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Schedule Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Schedule Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="schedule_name"
          value={formData.schedule_name}
          onChange={onChange}
          required
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Enter schedule name"
        />
      </div>

      {/* Schedule Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Schedule Type <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          name="schedule_type"
          value={formData.schedule_type}
          onChange={onChange}
          required
          options={[
            { value: 'phase', label: 'Phase' },
            { value: 'milestone', label: 'Milestone' },
            { value: 'sprint', label: 'Sprint' },
            { value: 'release', label: 'Release' },
          ]}
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            End Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Duration Display */}
      {duration !== null && duration !== undefined && duration >= 0 && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-purple-400">
              <strong>Duration:</strong> {duration} {duration === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Status
        </label>
        <CustomSelect
          name="status"
          value={formData.status}
          onChange={onChange}
          options={[
            { value: 'planned', label: 'Planned' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      {/* Progress Percentage */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Progress (%)
        </label>
        <input
          type="number"
          name="progress_percentage"
          value={formData.progress_percentage}
          onChange={onChange}
          min="0"
          max="100"
          step="1"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="0"
        />
      </div>

      {/* Parent Schedule (Optional) */}
      {parentSchedules.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Parent Schedule (Optional)
          </label>
          <CustomSelect
            name="parent_schedule_id"
            value={formData.parent_schedule_id}
            onChange={onChange}
            options={[
              { value: '', label: 'None (Top-level schedule)' },
              ...parentSchedules
                .filter(s => s.id !== formData.parent_schedule_id)
                .map(schedule => ({
                  value: schedule.id,
                  label: schedule.name,
                })),
            ]}
          />
          <p className="text-xs text-slate-400 mt-1">
            Leave empty for top-level schedules
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditing ? 'Update Schedule' : 'Create Schedule'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
