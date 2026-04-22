// Custom hook for project schedule form state management
'use client';

import { useEffect, useState } from 'react';
import { ProjectSchedule, ProjectScheduleFormData } from '@/types/project-schedule';
import { apiFetch } from '@/utils/api-client';

interface UseProjectScheduleFormOptions {
  projectId?: string;
  onSuccess?: () => void | Promise<void>;
}

const getInitialFormData = (projectId?: string): ProjectScheduleFormData => ({
  project_id: projectId || '',
  schedule_name: '',
  schedule_type: 'phase',
  start_date: '',
  end_date: '',
  status: 'planned',
  progress_percentage: '0',
  parent_schedule_id: '',
});

export function useProjectScheduleForm(options: UseProjectScheduleFormOptions = {}) {
  const { projectId, onSuccess } = options;
  const [formData, setFormData] = useState<ProjectScheduleFormData>(getInitialFormData(projectId));
  const [editingItem, setEditingItem] = useState<ProjectSchedule | null>(null);
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
    if (!formData.schedule_name.trim()) {
      errors.push('Schedule name is required');
    }
    if (!formData.schedule_type) {
      errors.push('Schedule type is required');
    }
    if (!formData.start_date) {
      errors.push('Start date is required');
    }
    if (!formData.end_date) {
      errors.push('End date is required');
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
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
        ? `/api/project-schedules/${editingItem.schedule_id}`
        : '/api/project-schedules';

      const method = editingItem ? 'PUT' : 'POST';

      const requestBody: Record<string, string | number | null> = {
        project_id: formData.project_id,
        schedule_name: formData.schedule_name,
        schedule_type: formData.schedule_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        progress_percentage: parseFloat(formData.progress_percentage),
        parent_schedule_id: formData.parent_schedule_id || null,
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
      console.error('Failed to save project schedule:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item: ProjectSchedule) => {
    setEditingItem(item);
    setFormData({
      project_id: item.project_id,
      schedule_name: item.schedule_name,
      schedule_type: item.schedule_type,
      start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
      end_date: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '',
      status: item.status,
      progress_percentage: item.progress_percentage?.toString() || '0',
      parent_schedule_id: item.parent_schedule_id || '',
    });
  };

  // Calculate duration in days
  const calculateDuration = (): number | null => {
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
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
    calculateDuration,
  };
}
