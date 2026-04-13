import { FiAlertCircle, FiLoader, FiPlus } from 'react-icons/fi';
import { ExpertTimeEstimate } from '@/types/expert-estimate';
import ExpertEstimateCard from '@/components/dashboard/ExpertEstimateCard';

interface ExpertEstimateListProps {
  estimates: ExpertTimeEstimate[];
  loading: boolean;
  deletingId: string | null;
  hasFilters: boolean;
  onCreateEstimate?: () => void;
  onView: (estimate: ExpertTimeEstimate) => void;
  onEdit?: (estimate: ExpertTimeEstimate) => void;
  onDelete: (estimate: ExpertTimeEstimate) => void;
  onRestore?: (estimate: ExpertTimeEstimate) => void;
  isRestoringId?: string | null;
}

export default function ExpertEstimateList({
  estimates,
  loading,
  deletingId,
  hasFilters,
  onCreateEstimate,
  onView,
  onEdit,
  onDelete,
  onRestore,
  isRestoringId,
}: ExpertEstimateListProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No estimates found</h3>
          <p className="text-slate-400 mb-6">
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Get started by creating your first expert estimate'}
          </p>
          {!hasFilters && (
            <button
              onClick={onCreateEstimate}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Estimate</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="divide-y divide-slate-700">
        {estimates.map((estimate) => (
          <ExpertEstimateCard
            key={estimate.estimate_id}
            estimate={estimate}
            onView={onView}
            onEdit={onEdit}
            onDelete={() => onDelete(estimate)}
            onRestore={onRestore ? () => onRestore(estimate) : undefined}
            deletingId={deletingId}
            isRestoringId={isRestoringId}
          />
        ))}
      </div>
    </div>
  );
}
