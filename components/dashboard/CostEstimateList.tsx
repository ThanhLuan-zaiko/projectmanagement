import { FiAlertCircle, FiLoader, FiPlus } from 'react-icons/fi';
import { CostEstimate } from '@/types/cost-estimate';
import CostEstimateCard from '@/components/dashboard/CostEstimateCard';

interface CostEstimateListProps {
  estimates: CostEstimate[];
  loading: boolean;
  deletingId: string | null;
  hasFilters: boolean;
  onCreateEstimate?: () => void;
  onView: (estimate: CostEstimate) => void;
  onEdit?: (estimate: CostEstimate) => void;
  onDelete: (estimate: CostEstimate) => void;
  onRestore?: (estimate: CostEstimate) => void;
  isRestoringId?: string | null;
}

export default function CostEstimateList({
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
}: CostEstimateListProps) {
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
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No cost estimates found</h3>
          <p className="text-slate-400 mb-6">
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Get started by creating your first cost estimate'}
          </p>
          {!hasFilters && (
            <button
              onClick={onCreateEstimate}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-sm sm:text-base text-white font-semibold rounded-xl shadow-lg shadow-yellow-500/30 flex items-center gap-2 transition-all duration-200"
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
          <CostEstimateCard
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
