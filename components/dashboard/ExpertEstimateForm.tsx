import { FiLoader, FiClock, FiBarChart2, FiFileText } from 'react-icons/fi';
import { ExpertEstimateFormData, ExpertTimeEstimate } from '@/types/expert-estimate';
import CustomSelect from '@/components/ui/CustomSelect';

interface ExpertEstimateFormProps {
  formData: ExpertEstimateFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
  workItems?: Array<{ id: string; title: string }>;
  experts?: Array<{ id: string; name: string }>;
}

export default function ExpertEstimateForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
  workItems = [],
  experts = [],
}: ExpertEstimateFormProps) {
  const isThreePoint = formData.estimation_method === 'three_point';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      {/* Expert Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Expert <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          name="expert_id"
          value={formData.expert_id}
          onChange={onChange}
          required
          options={experts.map(expert => ({
            value: expert.id,
            label: expert.name,
          }))}
        />
      </div>

      {/* Estimation Method */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Estimation Method <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          name="estimation_method"
          value={formData.estimation_method}
          onChange={onChange}
          required
          options={[
            { value: 'expert_judgment', label: 'Expert Judgment', icon: <FiBarChart2 className="w-4 h-4" /> },
            { value: 'planning_poker', label: 'Planning Poker', icon: <FiBarChart2 className="w-4 h-4" /> },
            { value: 'three_point', label: 'Three-Point Estimation', icon: <FiClock className="w-4 h-4" /> },
            { value: 'delphi', label: 'Delphi Method', icon: <FiFileText className="w-4 h-4" /> },
          ]}
        />
      </div>

      {/* Hours Input */}
      {!isThreePoint ? (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estimated Hours <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="estimated_hours"
            value={formData.estimated_hours}
            onChange={onChange}
            required
            step="0.5"
            min="0"
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter estimated hours"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Optimistic Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Optimistic Hours <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="optimistic_hours"
                value={formData.optimistic_hours}
                onChange={onChange}
                required
                step="0.5"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Best case"
              />
            </div>

            {/* Most Likely Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Most Likely Hours <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="most_likely_hours"
                value={formData.most_likely_hours}
                onChange={onChange}
                required
                step="0.5"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Most likely"
              />
            </div>

            {/* Pessimistic Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pessimistic Hours <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="pessimistic_hours"
                value={formData.pessimistic_hours}
                onChange={onChange}
                required
                step="0.5"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Worst case"
              />
            </div>
          </div>

          {/* Calculated Hours Display */}
          {formData.optimistic_hours && formData.most_likely_hours && formData.pessimistic_hours && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400">
                <strong>Calculated Estimate:</strong>{' '}
                {(
                  (parseFloat(formData.optimistic_hours) +
                    4 * parseFloat(formData.most_likely_hours) +
                    parseFloat(formData.pessimistic_hours)) /
                  6
                ).toFixed(2)}{' '}
                hours
                <span className="text-xs ml-2">(O + 4M + P) / 6</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confidence Level */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Confidence Level
        </label>
        <CustomSelect
          name="confidence_level"
          value={formData.confidence_level}
          onChange={onChange}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Add any notes or assumptions about this estimate"
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
            <span>{isEditing ? 'Update Estimate' : 'Create Estimate'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
