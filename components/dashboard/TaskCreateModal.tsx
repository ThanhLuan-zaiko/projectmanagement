import { WorkItemFormData, WorkItem } from '@/types/work-item';
import { Modal } from '@/components/ui';
import TaskForm from '@/components/dashboard/TaskForm';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: WorkItem | null;
  formData: WorkItemFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
}

export default function TaskCreateModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  isSubmitting,
  onSubmit,
  onChange,
  onReset,
  validationErrors = [],
}: TaskCreateModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Task' : 'Create New Task'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <TaskForm
        formData={formData}
        isEditing={!!editingItem}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={handleClose}
      />
    </Modal>
  );
}
