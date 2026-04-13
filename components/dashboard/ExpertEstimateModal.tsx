import { ExpertEstimateFormData, ExpertTimeEstimate } from '@/types/expert-estimate';
import { Modal } from '@/components/ui';
import ExpertEstimateForm from '@/components/dashboard/ExpertEstimateForm';

interface ExpertEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ExpertTimeEstimate | null;
  formData: ExpertEstimateFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
  workItems?: Array<{ id: string; title: string }>;
  experts?: Array<{ id: string; name: string }>;
}

export default function ExpertEstimateModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  isSubmitting,
  onSubmit,
  onChange,
  onReset,
  validationErrors = [],
  workItems = [],
  experts = [],
}: ExpertEstimateModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Expert Estimate' : 'Create New Expert Estimate'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <ExpertEstimateForm
        formData={formData}
        isEditing={!!editingItem}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={handleClose}
        workItems={workItems}
        experts={experts}
      />
    </Modal>
  );
}
