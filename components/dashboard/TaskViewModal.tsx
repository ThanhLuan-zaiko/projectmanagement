import { FiCalendar, FiClock, FiX } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';
import { StatusBadge, PriorityBadge, TypeBadge } from '@/components/ui/Badges';
import Modal from '@/components/ui/Modal';

interface TaskViewModalProps {
  item: WorkItem | null;
  onClose: () => void;
}

export default function TaskViewModal({ item, onClose }: TaskViewModalProps) {
  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose} title="Task Details">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <TypeBadge type={item.work_type} />
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </h4>
            <p className="text-slate-300 bg-slate-700/30 p-4 rounded-xl">
              {item.description}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FiCalendar className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Created</span>
            </div>
            <p className="text-white font-medium">
              {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FiClock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Updated</span>
            </div>
            <p className="text-white font-medium">
              {new Date(item.updated_at).toLocaleDateString()}
            </p>
          </div>

          {item.due_date && (
            <div className="bg-slate-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FiCalendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Due Date</span>
              </div>
              <p className="text-white font-medium">
                {new Date(item.due_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {item.estimated_hours && (
            <div className="bg-slate-700/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FiClock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Estimated Hours</span>
              </div>
              <p className="text-white font-medium">{item.estimated_hours}h</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-200"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
