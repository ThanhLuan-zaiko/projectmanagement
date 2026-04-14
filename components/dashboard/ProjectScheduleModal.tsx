import { ProjectScheduleFormData, ProjectSchedule } from '@/types/project-schedule';
import { Modal } from '@/components/ui';
import ProjectScheduleForm from '@/components/dashboard/ProjectScheduleForm';

interface ProjectScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ProjectSchedule | null;
  formData: ProjectScheduleFormData;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  validationErrors?: string[];
  parentSchedules?: Array<{ id: string; name: string }>;
  duration?: number | null;
}

export default function ProjectScheduleModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  isSubmitting,
  onSubmit,
  onChange,
  onReset,
  validationErrors = [],
  parentSchedules = [],
  duration,
}: ProjectScheduleModalProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingItem ? 'Edit Project Schedule' : 'Create New Project Schedule'}
      validationErrors={validationErrors}
      showValidation={validationErrors.length > 0}
    >
      <ProjectScheduleForm
        formData={formData}
        isEditing={!!editingItem}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={handleClose}
        parentSchedules={parentSchedules}
        validationErrors={validationErrors}
        duration={duration}
      />
    </Modal>
  );
}
