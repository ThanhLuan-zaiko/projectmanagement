// Custom hook for work schedule form state management
'use client';

import { useEffect, useState } from 'react';
import { WorkItemSchedule, WorkItemScheduleFormData } from '@/types/work-schedule';
import { apiFetch } from '@/utils/api-client';

interface UseWorkScheduleFormOptions {
  projectId?: string;
  onSuccess?: () => void | Promise<void>;
}

const getInitialFormData = (projectId?: string): WorkItemScheduleFormData => ({
  project_id: projectId || '',
  work_item_id: '',
  schedule_id: '',
  planned_start_date: '',
  planned_end_date: '',
  actual_start_date: '',
  actual_end_date: '',
  planned_hours: '',
  actual_hours: '',
  status: 'not_started',
  completion_percentage: '0',
  is_critical_path: false,
  dependencies: [],
});

export function useWorkScheduleForm(options: UseWorkScheduleFormOptions = {}) {
  const { projectId, onSuccess } = options;
  const [formData, setFormData] = useState<WorkItemScheduleFormData>(getInitialFormData(projectId));
  const [editingItem, setEditingItem] = useState<WorkItemSchedule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!editingItem) {
      setFormData((prev) => ({ ...prev, project_id: projectId || '' }));
    }
  }, [projectId, editingItem]);

  const resetForm = () => {
    setFormData(getInitialFormData(projectId));
    setEditingItem(null);
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.project_id) {
      errors.push('Project is required');
    }
    if (!formData.work_item_id) {
      errors.push('Work item is required');
    }
    if (!formData.planned_start_date) {
      errors.push('Planned start date is required');
    }
    if (!formData.planned_end_date) {
      errors.push('Planned end date is required');
    }

    // Validate date range
    if (formData.planned_start_date && formData.planned_end_date) {
      const startDate = new Date(formData.planned_start_date);
      const endDate = new Date(formData.planned_end_date);
      if (endDate < startDate) {
        errors.push('End date must be after start date');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

    if (!validateForm()) {
      return false;
    }

    setSubmitting(true);

    try {
      const url = editingItem
        ? `/api/work-schedules/${editingItem.work_item_id}`
        : '/api/work-schedules';

      const method = editingItem ? 'PUT' : 'POST';

      const requestBody: Record<string, string | number | boolean | string[] | null> = {
        project_id: formData.project_id,
        work_item_id: formData.work_item_id,
        schedule_id: formData.schedule_id || null,
        planned_start_date: formData.planned_start_date,
        planned_end_date: formData.planned_end_date,
        actual_start_date: formData.actual_start_date || null,
        actual_end_date: formData.actual_end_date || null,
        planned_hours: formData.planned_hours ? parseFloat(formData.planned_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        status: formData.status,
        completion_percentage: parseFloat(formData.completion_percentage),
        is_critical_path: formData.is_critical_path,
        dependencies: formData.dependencies,
      };

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        resetForm();
        onSuccess?.();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save work schedule:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (item: WorkItemSchedule) => {
    setEditingItem(item);
    setFormData({
      project_id: item.project_id,
      work_item_id: item.work_item_id,
      schedule_id: item.schedule_id || '',
      planned_start_date: item.planned_start_date ? new Date(item.planned_start_date).toISOString().split('T')[0] : '',
      planned_end_date: item.planned_end_date ? new Date(item.planned_end_date).toISOString().split('T')[0] : '',
      actual_start_date: item.actual_start_date ? new Date(item.actual_start_date).toISOString().split('T')[0] : '',
      actual_end_date: item.actual_end_date ? new Date(item.actual_end_date).toISOString().split('T')[0] : '',
      planned_hours: item.planned_hours?.toString() || '',
      actual_hours: item.actual_hours?.toString() || '',
      status: item.status,
      completion_percentage: item.completion_percentage?.toString() || '0',
      is_critical_path: item.is_critical_path,
      dependencies: item.dependencies || [],
    });
  };

  // Calculate planned duration in days
  const calculatePlannedDuration = (): number | null => {
    if (formData.planned_start_date && formData.planned_end_date) {
      const startDate = new Date(formData.planned_start_date);
      const endDate = new Date(formData.planned_end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  return {
    formData,
    editingItem,
    submitting,
    validationErrors,
    setValidationErrors,
    resetForm,
    handleSubmit,
    handleChange,
    handleEdit,
    setEditingItem,
    setFormData,
    calculatePlannedDuration,
  };
}
