import { FiLoader, FiUser, FiMail, FiDollarSign, FiClock } from 'react-icons/fi';
import { Expert, ExpertFormData } from '@/types/expert';
import CustomSelect from '@/components/ui/CustomSelect';
import Switch from '@/components/ui/Switch';

interface ExpertFormProps {
  formData: ExpertFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
}

export default function ExpertForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: ExpertFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Full Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter expert's full name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="expert@example.com"
          />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Specialization <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="specialization"
          value={formData.specialization}
          onChange={onChange}
          required
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="e.g., React, Python, DevOps (comma separated)"
        />
        <p className="text-xs text-slate-500 mt-1">Separate multiple specializations with commas</p>
      </div>

      {/* Experience & Hourly Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Experience (Years)
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={onChange}
              min="0"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Years of experience"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Hourly Rate ($)
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={onChange}
              min="0"
              step="0.01"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Rate per hour"
            />
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Availability Status
        </label>
        <CustomSelect
          name="availability_status"
          value={formData.availability_status}
          onChange={onChange}
          options={[
            { value: 'available', label: 'Available' },
            { value: 'busy', label: 'Busy' },
            { value: 'unavailable', label: 'Unavailable' },
          ]}
        />
      </div>

      {/* Active Status */}
      <div className="p-4 bg-slate-700/30 rounded-xl">
        <Switch
          checked={formData.is_active}
          onChange={(checked) => {
            onChange({
              target: { name: 'is_active', value: checked.toString() } as any,
            } as any);
          }}
          label="Active (experts can be assigned to projects)"
        />
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
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditing ? 'Update Expert' : 'Add Expert'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
