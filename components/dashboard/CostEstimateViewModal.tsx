import { FiDollarSign, FiCalendar, FiClock, FiPackage, FiFileText } from 'react-icons/fi';
import { CostEstimate } from '@/types/cost-estimate';
import Modal from '@/components/ui/Modal';

interface CostEstimateViewModalProps {
  estimate: CostEstimate | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function CostEstimateViewModal({
  estimate,
  isOpen,
  onClose,
}: CostEstimateViewModalProps) {
  if (!estimate) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Cost Estimate Details" size="lg">
      <div className="space-y-6">
        {/* Work Item */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Work Item</p>
          <p className="text-white font-medium">
            {estimate.work_item_title || `Work Item #${estimate.work_item_id.substring(0, 8)}`}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimate Type</p>
            <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${estimateTypeColor}`}>
              {estimateTypeLabel.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-block px-3 py-1.5 text-sm rounded-md border ${statusColor}`}>
              {estimate.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-slate-700/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="w-5 h-5 text-green-400" />
            <p className="text-xs text-slate-400 uppercase tracking-wider">Estimated Cost</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(estimate.estimated_cost, estimate.currency)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Currency: {estimate.currency}</p>
        </div>

        {/* Labor Details */}
        {estimate.estimate_type === 'labor' && estimate.hourly_rate && estimate.hours && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-blue-400 mb-1">Hourly Rate</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(estimate.hourly_rate, estimate.currency)}/h
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-purple-400 mb-1">Hours</p>
              </div>
              <p className="text-xl font-bold text-white">{estimate.hours}h</p>
            </div>
          </div>
        )}

        {/* Material Details */}
        {estimate.estimate_type === 'material' && estimate.quantity && estimate.unit_cost && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 mb-1">Quantity</p>
              </div>
              <p className="text-xl font-bold text-white">{estimate.quantity} units</p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-4 h-4 text-yellow-400" />
                <p className="text-sm text-yellow-400 mb-1">Unit Cost</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(estimate.unit_cost, estimate.currency)}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {estimate.notes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiFileText className="w-5 h-5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Notes</p>
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
          {estimate.approved_at && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
              <FiCalendar className="w-4 h-4" />
              <span>Approved: {new Date(estimate.approved_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
