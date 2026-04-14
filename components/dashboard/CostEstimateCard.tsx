import { FiCalendar, FiDollarSign, FiEye, FiEdit2, FiTrash2, FiLoader, FiRotateCcw } from 'react-icons/fi';
import { CostEstimate } from '@/types/cost-estimate';

interface CostEstimateCardProps {
  estimate: CostEstimate;
  onView: (estimate: CostEstimate) => void;
  onEdit?: (estimate: CostEstimate) => void;
  onDelete: (estimate: CostEstimate) => void;
  onRestore?: (estimate: CostEstimate) => void;
  deletingId: string | null;
  isRestoringId?: string | null;
}

const estimateTypeColors = {
  labor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  material: 'bg-green-500/20 text-green-400 border-green-500/30',
  service: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  overhead: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  license: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

const statusColors = {
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const estimateTypeLabels = {
  labor: 'Labor',
  material: 'Material',
  service: 'Service',
  overhead: 'Overhead',
  license: 'License',
};

export default function CostEstimateCard({
  estimate,
  onView,
  onEdit,
  onDelete,
  onRestore,
  deletingId,
  isRestoringId,
}: CostEstimateCardProps) {
  const isDeleting = deletingId === estimate.estimate_id;
  const isRestoring = isRestoringId === estimate.estimate_id;
  const estimateTypeColor = estimateTypeColors[estimate.estimate_type];
  const statusColor = statusColors[estimate.status];
  const estimateTypeLabel = estimateTypeLabels[estimate.estimate_type];

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-slate-700/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex-1 min-w-0 truncate">
              {estimate.work_item_title || `Work Item #${estimate.work_item_id.substring(0, 8)}`}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-md border ${estimateTypeColor}`}>
                {estimateTypeLabel.toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs rounded-md border ${statusColor}`}>
                {estimate.status.toUpperCase()}
              </span>
            </div>
          </div>

          {estimate.notes && (
            <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3 line-clamp-2">
              {estimate.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <FiDollarSign className="w-4 h-4" />
              <span>{formatCurrency(estimate.estimated_cost, estimate.currency)}</span>
            </div>
            {estimate.estimate_type === 'labor' && estimate.hourly_rate && estimate.hours && (
              <span className="text-xs text-slate-400">
                ({formatCurrency(estimate.hourly_rate, estimate.currency)}/h × {estimate.hours}h)
              </span>
            )}
            {estimate.estimate_type === 'material' && estimate.quantity && estimate.unit_cost && (
              <span className="text-xs text-slate-400">
                ({estimate.quantity} units × {formatCurrency(estimate.unit_cost, estimate.currency)})
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(estimate.estimated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onView(estimate)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
            title="View"
          >
            <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {onEdit && !estimate.is_deleted && (
            <button
              onClick={() => onEdit(estimate)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {onRestore && estimate.is_deleted ? (
            <button
              onClick={() => onRestore(estimate)}
              disabled={isRestoring}
              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-slate-400 hover:text-green-400 disabled:opacity-50"
              title="Restore"
            >
              {isRestoring ? (
                <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <FiRotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          ) : null}
          <button
            onClick={() => onDelete(estimate)}
            disabled={isDeleting}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
            title={estimate.is_deleted ? "Delete Permanently" : "Delete"}
          >
            {isDeleting ? (
              <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
