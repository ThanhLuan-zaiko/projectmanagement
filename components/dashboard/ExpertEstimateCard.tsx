import { FiCalendar, FiClock, FiUser, FiEye, FiEdit2, FiTrash2, FiLoader, FiBarChart2, FiRotateCcw } from 'react-icons/fi';
import { ExpertTimeEstimate } from '@/types/expert-estimate';

interface ExpertEstimateCardProps {
  estimate: ExpertTimeEstimate;
  onView: (estimate: ExpertTimeEstimate) => void;
  onEdit?: (estimate: ExpertTimeEstimate) => void;
  onDelete: (estimate: ExpertTimeEstimate) => void;
  onRestore?: (estimate: ExpertTimeEstimate) => void;
  deletingId: string | null;
  isRestoringId?: string | null;
}

const confidenceColors = {
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const methodLabels = {
  expert_judgment: 'Expert Judgment',
  planning_poker: 'Planning Poker',
  three_point: 'Three-Point',
  delphi: 'Delphi',
};

export default function ExpertEstimateCard({
  estimate,
  onView,
  onEdit,
  onDelete,
  onRestore,
  deletingId,
  isRestoringId,
}: ExpertEstimateCardProps) {
  const isDeleting = deletingId === estimate.estimate_id;
  const isRestoring = isRestoringId === estimate.estimate_id;
  const confidenceColor = confidenceColors[estimate.confidence_level || 'medium'];
  const methodLabel = methodLabels[estimate.estimation_method || 'expert_judgment'];

  return (
    <div className="p-4 sm:p-6 hover:bg-slate-700/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex-1 min-w-0 truncate">
              {estimate.work_item_title || `Work Item #${estimate.work_item_id.substring(0, 8)}`}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-md border ${confidenceColor}`}>
                {estimate.confidence_level?.toUpperCase() || 'MEDIUM'}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md border border-blue-500/30">
                {methodLabel}
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
              <FiClock className="w-4 h-4" />
              <span>{estimate.estimated_hours || 0}h estimated</span>
            </div>
            {estimate.expert_name && (
              <div className="flex items-center gap-1.5">
                <FiUser className="w-4 h-4" />
                <span>{estimate.expert_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(estimate.estimated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {estimate.estimation_method === 'three_point' && (
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs">
              {estimate.optimistic_hours && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                  Optimistic: {estimate.optimistic_hours}h
                </span>
              )}
              {estimate.most_likely_hours && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                  Most Likely: {estimate.most_likely_hours}h
                </span>
              )}
              {estimate.pessimistic_hours && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md">
                  Pessimistic: {estimate.pessimistic_hours}h
                </span>
              )}
            </div>
          )}
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
