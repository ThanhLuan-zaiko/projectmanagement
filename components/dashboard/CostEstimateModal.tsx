import { CostEstimateFormData, CostEstimate } from '@/types/cost-estimate';
import { Modal } from '@/components/ui';
import CostEstimateForm from '@/components/dashboard/CostEstimateForm';

interface CostEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CostEstimate | null;
  formData: CostEstimateFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
  workItems?: Array<{ id: string; title: string }>;
}

export default function CostEstimateModal({
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
}: CostEstimateModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Cost Estimate' : 'Create New Cost Estimate'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <CostEstimateForm
        formData={formData}
        isEditing={!!editingItem}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={handleClose}
        workItems={workItems}
        validationErrors={validationErrors}
      />
    </Modal>
  );
}
