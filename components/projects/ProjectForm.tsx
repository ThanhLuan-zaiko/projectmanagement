import { FiCalendar, FiDollarSign, FiFileText, FiFlag, FiHash, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import type { ProjectFormData, ProjectFormErrors } from '@/types/project';
import CustomSelect from '@/components/ui/CustomSelect';

interface ProjectFormProps {
  formData: ProjectFormData;
  validationErrors?: ProjectFormErrors;
  isSubmitting?: boolean;
  submitLabel: string;
  projectCode?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const statusSelectOptions = statusOptions.map((status) => ({
  value: status.value,
  label: status.label,
}));

export default function ProjectForm({
  formData,
  validationErrors,
  isSubmitting = false,
  submitLabel,
  projectCode,
  onChange,
  onBlur,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="theme-panel rounded-[32px] border border-white/10 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="mb-8 grid gap-4 rounded-[24px] border border-cyan-400/12 bg-cyan-400/[0.03] p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Naming</p>
          <p className="mt-2 text-sm text-slate-200">Use a clear 3-80 character name.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Dates</p>
          <p className="mt-2 text-sm text-slate-200">Start date cannot be in the past. End date must be on or after start date.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Budget</p>
          <p className="mt-2 text-sm text-slate-200">Currency must be a 3-letter code and budget cannot be negative.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiFlag className="h-4 w-4 text-cyan-300" />
            Project name
          </label>
          <input
            name="project_name"
            type="text"
            value={formData.project_name}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Launch platform migration"
            maxLength={80}
            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none transition placeholder:text-slate-500 ${
              validationErrors?.project_name
                ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
            }`}
            required
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={validationErrors?.project_name ? 'text-rose-200' : 'text-slate-500'}>
              {validationErrors?.project_name || 'Describe the initiative as the team would recognize it.'}
            </span>
            <span className="text-slate-500">{formData.project_name.length}/80</span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiFileText className="h-4 w-4 text-cyan-300" />
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Define the project goals, expected deliverables and team context."
            maxLength={500}
            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none transition placeholder:text-slate-500 ${
              validationErrors?.description
                ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
            }`}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={validationErrors?.description ? 'text-rose-200' : 'text-slate-500'}>
              {validationErrors?.description || 'Optional, but useful for portfolio context and analytics.'}
            </span>
            <span className="text-slate-500">{formData.description.length}/500</span>
          </div>
        </div>

        {projectCode && (
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
              <FiHash className="h-4 w-4 text-cyan-300" />
              Project code
            </label>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-cyan-200">
              {projectCode}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiFlag className="h-4 w-4 text-cyan-300" />
            Status
          </label>
          <CustomSelect
            name="status"
            value={formData.status}
            options={statusSelectOptions}
            onChange={onChange}
            usePortal
          />
          <p className={`mt-2 text-xs ${validationErrors?.status ? 'text-rose-200' : 'text-slate-500'}`}>
            {validationErrors?.status || 'Use status deliberately so the analytics screen stays accurate.'}
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiDollarSign className="h-4 w-4 text-cyan-300" />
            Budget
          </label>
          <div className="flex gap-3">
            <input
              name="budget"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget || ''}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="25000"
              className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-white outline-none transition placeholder:text-slate-500 ${
                validationErrors?.budget
                  ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                  : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
              }`}
            />
            <input
              name="currency"
              type="text"
              value={formData.currency || 'USD'}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="USD"
              maxLength={3}
              className={`w-24 rounded-2xl border px-4 py-3 uppercase text-white outline-none transition placeholder:text-slate-500 ${
                validationErrors?.currency
                  ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                  : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
              }`}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span className={validationErrors?.budget ? 'text-rose-200' : 'text-slate-500'}>
              {validationErrors?.budget || 'Leave blank if this project has no committed budget yet.'}
            </span>
            <span className={validationErrors?.currency ? 'text-rose-200' : 'text-slate-500'}>
              {validationErrors?.currency || 'Currency format: USD, EUR, THB.'}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiCalendar className="h-4 w-4 text-cyan-300" />
            Start date
          </label>
          <input
            name="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={onChange}
            onBlur={onBlur}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none transition ${
              validationErrors?.start_date
                ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
            }`}
          />
          <p className={`mt-2 text-xs ${validationErrors?.start_date ? 'text-rose-200' : 'text-slate-500'}`}>
            {validationErrors?.start_date || 'Optional, but recommended for portfolio planning.'}
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <FiCalendar className="h-4 w-4 text-cyan-300" />
            Target end date
          </label>
          <input
            name="target_end_date"
            type="date"
            value={formData.target_end_date || ''}
            onChange={onChange}
            onBlur={onBlur}
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none transition ${
              validationErrors?.target_end_date
                ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
                : 'border-white/10 bg-white/5 focus:border-cyan-400/60 focus:bg-white/7'
            }`}
          />
          {formData.start_date && formData.target_end_date && formData.target_end_date < formData.start_date ? (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-300">
              <FiAlertTriangle className="h-3 w-3" />
              End date is earlier than start date.
            </p>
          ) : (
            <p className={`mt-2 text-xs ${validationErrors?.target_end_date ? 'text-rose-200' : 'text-slate-500'}`}>
              {validationErrors?.target_end_date || 'Use this to drive expectations and overdue reporting.'}
            </p>
          )}
        </div>
      </div>

      {validationErrors?.form && (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {validationErrors.form}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <FiLoader className="h-4 w-4 animate-spin" />}
          <span>{submitLabel}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
