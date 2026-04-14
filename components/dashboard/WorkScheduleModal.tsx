import { WorkItemScheduleFormData, WorkItemSchedule } from '@/types/work-schedule';
import { Modal } from '@/components/ui';
import WorkScheduleForm from '@/components/dashboard/WorkScheduleForm';

interface WorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: WorkItemSchedule | null;
  formData: WorkItemScheduleFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
  workItems?: Array<{ id: string; title: string }>;
  duration?: number | null;
}

export default function WorkScheduleModal({
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
  duration,
}: WorkScheduleModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Work Schedule' : 'Create New Work Schedule'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <WorkScheduleForm
        formData={formData}
        isEditing={!!editingItem}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={handleClose}
        workItems={workItems}
        validationErrors={validationErrors}
        duration={duration}
      />
    </Modal>
  );
}
