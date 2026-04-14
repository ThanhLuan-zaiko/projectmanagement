import { FiLoader, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { WorkItemScheduleFormData, WorkItemSchedule } from '@/types/work-schedule';
import CustomSelect from '@/components/ui/CustomSelect';

interface WorkScheduleFormProps {
  formData: WorkItemScheduleFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
  workItems?: Array<{ id: string; title: string }>;
  validationErrors?: string[];
  duration?: number | null;
}

export default function WorkScheduleForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
  workItems = [],
  validationErrors = [],
  duration,
}: WorkScheduleFormProps) {
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

      {/* Work Item Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Work Item <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          name="work_item_id"
          value={formData.work_item_id}
          onChange={onChange}
          required
          options={workItems.map(item => ({
            value: item.id,
            label: item.title,
          }))}
        />
      </div>

      {/* Planned Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Planned Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="planned_start_date"
            value={formData.planned_start_date}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Planned End Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="planned_end_date"
            value={formData.planned_end_date}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Duration Display */}
      {duration !== null && duration !== undefined && duration >= 0 && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-cyan-400" />
            <p className="text-sm text-cyan-400">
              <strong>Duration:</strong> {duration} {duration === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      )}

      {/* Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Planned Hours
          </label>
          <input
            type="number"
            name="planned_hours"
            value={formData.planned_hours}
            onChange={onChange}
            min="0"
            step="0.5"
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Actual Hours
          </label>
          <input
            type="number"
            name="actual_hours"
            value={formData.actual_hours}
            onChange={onChange}
            min="0"
            step="0.5"
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>
      </div>

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
            { value: 'not_started', label: 'Not Started' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'delayed', label: 'Delayed' },
            { value: 'blocked', label: 'Blocked' },
          ]}
        />
      </div>

      {/* Completion Percentage */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Completion (%)
        </label>
        <input
          type="number"
          name="completion_percentage"
          value={formData.completion_percentage}
          onChange={onChange}
          min="0"
          max="100"
          step="1"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          placeholder="0"
        />
      </div>

      {/* Critical Path Checkbox */}
      <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
        <input
          type="checkbox"
          name="is_critical_path"
          checked={formData.is_critical_path}
          onChange={(e) => {
            const checkboxEvent = {
              target: { name: 'is_critical_path', value: e.target.checked.toString() },
            } as any;
            onChange(checkboxEvent);
          }}
          className="w-5 h-5 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500"
        />
        <div className="flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 text-orange-400" />
          <label className="text-sm font-medium text-slate-300">
            Critical Path Item
          </label>
        </div>
      </div>

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
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
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
