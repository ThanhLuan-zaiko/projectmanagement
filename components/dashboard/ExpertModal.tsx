import { Expert, ExpertFormData } from '@/types/expert';
import { Modal } from '@/components/ui';
import ExpertForm from '@/components/dashboard/ExpertForm';

interface ExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Expert | null;
  formData: ExpertFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
}

export default function ExpertModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  isSubmitting,
  onSubmit,
  onChange,
  onReset,
  validationErrors = [],
}: ExpertModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Expert' : 'Add New Expert'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <ExpertForm
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
