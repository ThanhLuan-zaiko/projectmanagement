import { FiLoader, FiDollarSign, FiClock, FiPackage } from 'react-icons/fi';
import { CostEstimateFormData, CostEstimate } from '@/types/cost-estimate';
import CustomSelect from '@/components/ui/CustomSelect';

interface CostEstimateFormProps {
  formData: CostEstimateFormData;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
  workItems?: Array<{ id: string; title: string }>;
  validationErrors?: string[];
}

export default function CostEstimateForm({
  formData,
  isEditing,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
  workItems = [],
  validationErrors = [],
}: CostEstimateFormProps) {
  const isLabor = formData.estimate_type === 'labor';
  const isMaterial = formData.estimate_type === 'material';

  const calculateEstimatedCost = () => {
    if (isLabor && formData.hourly_rate && formData.hours) {
      return parseFloat(formData.hourly_rate) * parseFloat(formData.hours);
    }
    if (isMaterial && formData.quantity && formData.unit_cost) {
      return parseInt(formData.quantity) * parseFloat(formData.unit_cost);
    }
    return null;
  };

  const calculatedCost = calculateEstimatedCost();

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

      {/* Estimate Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Estimate Type <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          name="estimate_type"
          value={formData.estimate_type}
          onChange={onChange}
          required
          options={[
            { value: 'labor', label: 'Labor', icon: <FiClock className="w-4 h-4" /> },
            { value: 'material', label: 'Material', icon: <FiPackage className="w-4 h-4" /> },
            { value: 'service', label: 'Service', icon: <FiDollarSign className="w-4 h-4" /> },
            { value: 'overhead', label: 'Overhead', icon: <FiDollarSign className="w-4 h-4" /> },
            { value: 'license', label: 'License', icon: <FiDollarSign className="w-4 h-4" /> },
          ]}
        />
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
            { value: 'draft', label: 'Draft' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Currency
        </label>
        <CustomSelect
          name="currency"
          value={formData.currency}
          onChange={onChange}
          options={[
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'GBP', label: 'GBP - British Pound' },
            { value: 'JPY', label: 'JPY - Japanese Yen' },
            { value: 'VND', label: 'VND - Vietnamese Dong' },
          ]}
        />
      </div>

      {/* Labor Fields */}
      {isLabor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hourly Rate <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={onChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hours <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={onChange}
              required
              step="0.5"
              min="0"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>
      )}

      {/* Material Fields */}
      {isMaterial && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={onChange}
              required
              step="1"
              min="0"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Unit Cost <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="unit_cost"
              value={formData.unit_cost}
              onChange={onChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
      )}

      {/* Direct Cost Fields (for service, overhead, license) */}
      {!isLabor && !isMaterial && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estimated Cost <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="estimated_cost"
            value={formData.estimated_cost}
            onChange={onChange}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Calculated Cost Display */}
      {calculatedCost !== null && (calculatedCost > 0) && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-sm text-green-400">
            <strong>Calculated Cost:</strong>{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: formData.currency || 'USD',
              minimumFractionDigits: 2,
            }).format(calculatedCost)}
            {isLabor && (
              <span className="text-xs ml-2">
                ({formData.hourly_rate}/h × {formData.hours}h)
              </span>
            )}
            {isMaterial && (
              <span className="text-xs ml-2">
                ({formData.quantity} units × {formData.unit_cost}/unit)
              </span>
            )}
          </p>
        </div>
      )}

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
          placeholder="Add any notes or details about this cost estimate"
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
          className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
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
