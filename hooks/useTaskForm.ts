// Custom hook for task form state management
'use client';

import { useState, useEffect } from 'react';
import { WorkItem, WorkItemFormData } from '@/types/work-item';
import { apiFetch } from '@/utils/api-client';

interface UseTaskFormOptions {
  projectId?: string;
  onSuccess?: () => void;
}

const getInitialFormData = (projectId?: string): WorkItemFormData => ({
  title: '',
  description: '',
  work_type: 'task',
  status: 'todo',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
  estimated_hours: '',
  tags: '',
  project_id: projectId || '',
});

export function useTaskForm(options: UseTaskFormOptions = {}) {
  const { projectId, onSuccess } = options;
  const [formData, setFormData] = useState<WorkItemFormData>(getInitialFormData(projectId));
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!editingItem) {
      setFormData(prev => ({ ...prev, project_id: projectId || '' }));
    }
  }, [projectId, editingItem]);

  const resetForm = () => {
    setFormData(getInitialFormData(projectId));
    setEditingItem(null);
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.title || !formData.title.trim()) {
      errors.push('Task title is required');
    }
    if (!formData.work_type) {
      errors.push('Task type is required');
    }
    if (!formData.status) {
      errors.push('Status is required');
    }
    if (!formData.priority) {
      errors.push('Priority is required');
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
        ? `/api/work-items/${editingItem.work_item_id}`
        : '/api/work-items';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          due_date: formData.due_date ? new Date(formData.due_date) : null,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        resetForm();
        onSuccess?.();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save work item:', error);
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

  const handleEdit = (item: WorkItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      work_type: item.work_type,
      status: item.status,
      priority: item.priority,
      assigned_to: item.assigned_to || '',
      due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
      estimated_hours: item.estimated_hours?.toString() || '',
      tags: item.tags?.join(', ') || '',
      project_id: item.project_id,
    });
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
  };
}
