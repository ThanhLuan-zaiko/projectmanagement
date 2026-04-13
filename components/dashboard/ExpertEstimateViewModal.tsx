import { FiClock, FiUser, FiCalendar, FiBarChart2, FiFileText } from 'react-icons/fi';
import { ExpertTimeEstimate } from '@/types/expert-estimate';
import Modal from '@/components/ui/Modal';

interface ExpertEstimateViewModalProps {
  estimate: ExpertTimeEstimate | null;
  isOpen: boolean;
  onClose: () => void;
}

const confidenceColors = {
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const methodLabels = {
  expert_judgment: 'Expert Judgment',
  planning_poker: 'Planning Poker',
  three_point: 'Three-Point Estimation',
  delphi: 'Delphi Method',
};

export default function ExpertEstimateViewModal({
  estimate,
  isOpen,
  onClose,
}: ExpertEstimateViewModalProps) {
  if (!estimate) return null;

  const confidenceColor = confidenceColors[estimate.confidence_level || 'medium'];
  const methodLabel = methodLabels[estimate.estimation_method || 'expert_judgment'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Expert Estimate Details" size="lg">
      <div className="space-y-6">
        {/* Work Item & Expert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Work Item</p>
            <p className="text-white font-medium">
              {estimate.work_item_title || `Work Item #${estimate.work_item_id.substring(0, 8)}`}
            </p>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-xl">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Expert</p>
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-slate-400" />
              <p className="text-white font-medium">{estimate.expert_name || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Confidence Level</p>
            <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${confidenceColor}`}>
              {estimate.confidence_level?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimation Method</p>
            <span className="inline-block px-3 py-1.5 text-sm rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {methodLabel}
            </span>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="w-5 h-5 text-blue-400" />
            <p className="text-xs text-slate-400 uppercase tracking-wider">Estimated Hours</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {estimate.estimated_hours || 0}h
          </p>
        </div>

        {/* Three-Point Details */}
        {estimate.estimation_method === 'three_point' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-sm text-green-400 mb-1">Optimistic</p>
              <p className="text-xl font-bold text-white">{estimate.optimistic_hours || 0}h</p>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400 mb-1">Most Likely</p>
              <p className="text-xl font-bold text-white">{estimate.most_likely_hours || 0}h</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 mb-1">Pessimistic</p>
              <p className="text-xl font-bold text-white">{estimate.pessimistic_hours || 0}h</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {estimate.notes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiFileText className="w-5 h-5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Notes & Assumptions</p>
            </div>
            <p className="text-slate-300 bg-slate-700/30 p-4 rounded-xl whitespace-pre-wrap">{estimate.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FiCalendar className="w-4 h-4" />
            <span>Created: {new Date(estimate.estimated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
