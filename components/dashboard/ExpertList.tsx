import { FiAlertCircle, FiLoader, FiPlus } from 'react-icons/fi';
import { Expert } from '@/types/expert';
import ExpertCard from '@/components/dashboard/ExpertCard';

interface ExpertListProps {
  experts: Expert[];
  loading: boolean;
  deletingId: string | null;
  hasFilters: boolean;
  onCreateExpert: () => void;
  onView: (expert: Expert) => void;
  onEdit: (expert: Expert) => void;
  onDelete: (expert: Expert) => void;
  onRestore: (expert: Expert) => void;
}

export default function ExpertList({
  experts,
  loading,
  deletingId,
  hasFilters,
  onCreateExpert,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: ExpertListProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No experts found</h3>
          <p className="text-slate-400 mb-6">
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Get started by adding your first expert'}
          </p>
          {!hasFilters && (
            <button
              onClick={onCreateExpert}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Expert</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experts.map((expert) => (
        <ExpertCard
          key={expert.expert_id}
          expert={expert}
          onView={() => onView(expert)}
          onEdit={onEdit}
          onDelete={() => onDelete(expert)}
          onRestore={() => onRestore(expert)}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}
