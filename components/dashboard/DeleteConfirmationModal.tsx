'use client';

import { FiLoader, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';
import Modal from '@/components/ui/Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkItem | null;
  isDeleting: boolean;
  onSoftDelete: () => void;
  onHardDelete: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  item,
  isDeleting,
  onSoftDelete,
  onHardDelete,
}: DeleteConfirmationModalProps) {
  if (!item) return null;

  const isCancelled = item.status === 'cancelled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCancelled ? 'Permanently Delete Task' : 'Delete Task'}
      subtitle="Choose how you want to handle this task"
      size="sm"
    >
      <div className="space-y-4">
        {isCancelled ? (
          <>
            {/* Hard Delete Warning for already cancelled tasks */}
            <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-300 mb-1">Permanent Deletion</h3>
                <p className="text-sm text-red-300/80">
                  This task has already been soft-deleted. Permanently deleting will remove it from the database forever.
                </p>
              </div>
            </div>

            {/* Action Buttons for Hard Delete */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onHardDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 disabled:shadow-none flex items-center justify-center gap-2 transition-all duration-200"
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-5 h-5" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Soft Delete Option */}
            <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-2">Soft Delete (Recommended)</h3>
              <p className="text-xs text-slate-400 mb-3">
                Moves the task to cancelled status. You can restore it later if needed.
              </p>
              <button
                onClick={onSoftDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2 transition-all duration-200"
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>Soft Delete</span>
                  </>
                )}
              </button>
            </div>

            {/* Hard Delete Option */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <FiAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-300 mb-1">Permanent Deletion</h3>
                  <p className="text-xs text-red-300/80">
                    Completely removes the task from the database. This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={onHardDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/30 disabled:shadow-none flex items-center justify-center gap-2 transition-all duration-200"
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>Hard Delete</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
