import { FiUser, FiMail, FiClock, FiDollarSign, FiEye, FiEdit2, FiTrash2, FiLoader, FiRotateCcw } from 'react-icons/fi';
import { Expert } from '@/types/expert';

interface ExpertCardProps {
  expert: Expert;
  onView: (expert: Expert) => void;
  onEdit: (expert: Expert) => void;
  onDelete: (expert: Expert) => void;
  onRestore: (expert: Expert) => void;
  deletingId: string | null;
}

const availabilityColors = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  busy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unavailable: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ExpertCard({
  expert,
  onView,
  onEdit,
  onDelete,
  onRestore,
  deletingId,
}: ExpertCardProps) {
  const isDeleting = deletingId === expert.expert_id;
  const isInactive = expert.is_active === false;
  const availabilityColor = availabilityColors[expert.availability_status || 'available'];

  return (
    <div className={`p-4 sm:p-6 transition-colors ${isInactive ? 'bg-slate-800/30 opacity-60' : 'hover:bg-slate-700/30'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className={`text-base sm:text-lg font-semibold truncate flex-1 min-w-0 ${isInactive ? 'text-slate-400 line-through' : 'text-white'}`}>
              {expert.name}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-md border ${availabilityColor}`}>
                {expert.availability_status?.toUpperCase() || 'AVAILABLE'}
              </span>
              {expert.is_active === false && (
                <span className="px-2 py-1 text-xs rounded-md bg-slate-600/50 text-slate-400 border border-slate-500/30">
                  INACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
            {expert.email && (
              <div className="flex items-center gap-1.5">
                <FiMail className="w-4 h-4" />
                <span>{expert.email}</span>
              </div>
            )}
            {expert.experience_years && (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-4 h-4" />
                <span>{expert.experience_years} years exp.</span>
              </div>
            )}
            {expert.hourly_rate && (
              <div className="flex items-center gap-1.5">
                <FiDollarSign className="w-4 h-4" />
                <span>${expert.hourly_rate}/hr</span>
              </div>
            )}
          </div>

          {expert.specialization && expert.specialization.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {expert.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md border border-blue-500/30"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onView(expert)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
            title="View details"
          >
            <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => onEdit(expert)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {isInactive ? (
            // Restore button for inactive experts
            <button
              onClick={() => onRestore(expert)}
              disabled={isDeleting}
              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-slate-400 hover:text-green-400 disabled:opacity-50"
              title="Restore expert"
            >
              <FiRotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
          <button
            onClick={() => onDelete(expert)}
            disabled={isDeleting}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
            title={isInactive ? 'Permanently delete' : 'Deactivate'}
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
