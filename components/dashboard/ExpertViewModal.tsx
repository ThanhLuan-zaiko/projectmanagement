import { FiUser, FiMail, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import { Expert } from '@/types/expert';
import { Modal } from '@/components/ui';

interface ExpertViewModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
}

const availabilityColors = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  busy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unavailable: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ExpertViewModal({
  expert,
  isOpen,
  onClose,
}: ExpertViewModalProps) {
  if (!expert) return null;

  const availabilityColor = availabilityColors[expert.availability_status || 'available'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expert Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Name & Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{expert.name}</h3>
              <p className={`text-sm ${expert.is_active === false ? 'text-slate-500' : 'text-slate-400'}`}>
                {expert.is_active === false ? 'Inactive' : 'Active'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1.5 text-sm rounded-md border ${availabilityColor}`}>
            {expert.availability_status?.toUpperCase() || 'AVAILABLE'}
          </span>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {expert.email && (
            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl">
              <FiMail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-white text-sm">{expert.email}</p>
              </div>
            </div>
          )}
          {expert.experience_years && (
            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl">
              <FiClock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Experience</p>
                <p className="text-white text-sm">{expert.experience_years} years</p>
              </div>
            </div>
          )}
          {expert.hourly_rate && (
            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl">
              <FiDollarSign className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Hourly Rate</p>
                <p className="text-white text-sm">${expert.hourly_rate} / hour</p>
              </div>
            </div>
          )}
          {expert.rating && (
            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl">
              <FiTag className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Rating</p>
                <p className="text-white text-sm">{expert.rating} / 5</p>
              </div>
            </div>
          )}
        </div>

        {/* Specialization */}
        {expert.specialization && expert.specialization.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-3">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {expert.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg border border-blue-500/30"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-slate-700 text-sm text-slate-500">
          <p>Created: {expert.created_at ? new Date(expert.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </Modal>
  );
}
