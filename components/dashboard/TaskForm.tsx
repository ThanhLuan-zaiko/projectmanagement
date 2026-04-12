import { FiLoader, FiCheckCircle, FiClipboard, FiList, FiFlag, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { WorkItemFormData, WorkItem } from '@/types/work-item';
import CustomSelect from '@/components/ui/CustomSelect';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/ui/Badges';

interface TaskFormProps {
  formData: WorkItemFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
}

export default function TaskForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: TaskFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Enter task title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Enter task description"
        />
      </div>

      {/* Work Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type <span className="text-red-400">*</span>
          </label>
          <CustomSelect
            name="work_type"
            value={formData.work_type}
            onChange={onChange}
            required
            options={[
              { value: 'task', label: 'Task', icon: <FiClipboard className="w-4 h-4" /> },
              { value: 'subtask', label: 'Subtask', icon: <FiList className="w-4 h-4" /> },
              { value: 'milestone', label: 'Milestone', icon: <FiFlag className="w-4 h-4" /> },
              { value: 'bug', label: 'Bug', icon: <FiAlertCircle className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status <span className="text-red-400">*</span>
          </label>
          <CustomSelect
            name="status"
            value={formData.status}
            onChange={onChange}
            required
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'review', label: 'Review' },
              { value: 'done', label: 'Done' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Priority & Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Priority <span className="text-red-400">*</span>
          </label>
          <CustomSelect
            name="priority"
            value={formData.priority}
            onChange={onChange}
            required
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent', icon: <FiAlertTriangle className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Estimated Hours & Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estimated Hours
          </label>
          <input
            type="number"
            name="estimated_hours"
            value={formData.estimated_hours}
            onChange={onChange}
            min="0"
            step="0.5"
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="frontend, urgent, bug"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiCheckCircle className="w-5 h-5" />
              <span>{isEditing ? 'Update' : 'Create'} Task</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
