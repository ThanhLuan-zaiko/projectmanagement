import { FiCalendar, FiClock, FiUser, FiEye, FiEdit2, FiTrash2, FiLoader, FiRotateCcw } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/ui/Badges';

interface TaskCardProps {
  item: WorkItem;
  onView: (item: WorkItem) => void;
  onEdit: (item: WorkItem) => void;
  onDelete: (item: WorkItem) => void;
  onRestore: (item: WorkItem) => void;
  deletingId: string | null;
}

export default function TaskCard({ item, onView, onEdit, onDelete, onRestore, deletingId }: TaskCardProps) {
  const isDeleting = deletingId === item.work_item_id;
  const isCancelled = item.status === 'cancelled';

  return (
    <div className={`p-4 sm:p-6 transition-colors ${isCancelled ? 'bg-slate-800/30 opacity-60' : 'hover:bg-slate-700/30'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h3 className={`text-base sm:text-lg font-semibold truncate flex-1 min-w-0 ${isCancelled ? 'text-slate-400 line-through' : 'text-white'}`}>
              {item.title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
              <TypeBadge type={item.work_type} />
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
            </div>
          </div>

          {item.description && (
            <p className={`text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 ${isCancelled ? 'text-slate-500' : 'text-slate-400'}`}>
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
            {item.assigned_to && (
              <div className="flex items-center gap-1.5">
                <FiUser className="w-4 h-4" />
                <span>Assigned</span>
              </div>
            )}
            {item.due_date && (
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4" />
                <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {item.estimated_hours && (
              <div className="flex items-center gap-1.5">
                <FiClock className="w-4 h-4" />
                <span>{item.estimated_hours}h estimated</span>
              </div>
            )}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
          {isCancelled ? (
            // Restore button for cancelled tasks
            <button
              onClick={() => onRestore(item)}
              disabled={isDeleting}
              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-slate-400 hover:text-green-400 disabled:opacity-50"
              title="Restore task"
            >
              <FiRotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            // Normal action buttons for active tasks
            <>
              <button
                onClick={() => onView(item)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                title="View"
              >
                <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
                title="Edit"
              >
                <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
          
          <button
            onClick={() => onDelete(item)}
            disabled={isDeleting}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
            title={isCancelled ? 'Permanently delete' : 'Delete'}
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
