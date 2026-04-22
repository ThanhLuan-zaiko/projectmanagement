// Custom hook for expert estimate form state management
'use client';

import { useEffect, useState } from 'react';
import { ExpertTimeEstimate, ExpertEstimateFormData } from '@/types/expert-estimate';
import { apiFetch } from '@/utils/api-client';

interface UseExpertEstimateFormOptions {
  projectId?: string;
  onSuccess?: () => void | Promise<void>;
}

const getInitialFormData = (projectId?: string): ExpertEstimateFormData => ({
  project_id: projectId || '',
  work_item_id: '',
  expert_id: '',
  estimated_hours: '',
  confidence_level: 'medium',
  estimation_method: 'expert_judgment',
  optimistic_hours: '',
  most_likely_hours: '',
  pessimistic_hours: '',
  notes: '',
});

export function useExpertEstimateForm(options: UseExpertEstimateFormOptions = {}) {
  const { projectId, onSuccess } = options;
  const [formData, setFormData] = useState<ExpertEstimateFormData>(getInitialFormData(projectId));
  const [editingItem, setEditingItem] = useState<ExpertTimeEstimate | null>(null);
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
    if (!formData.expert_id) {
      errors.push('Expert is required');
    }
    if (formData.estimation_method === 'three_point') {
      if (!formData.optimistic_hours) {
        errors.push('Optimistic hours is required for three-point estimation');
      }
      if (!formData.most_likely_hours) {
        errors.push('Most likely hours is required for three-point estimation');
      }
      if (!formData.pessimistic_hours) {
        errors.push('Pessimistic hours is required for three-point estimation');
      }
    } else if (!formData.estimated_hours) {
      errors.push('Estimated hours is required');
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
        ? `/api/expert-estimates/${editingItem.estimate_id}`
        : '/api/expert-estimates';

      const method = editingItem ? 'PUT' : 'POST';

      const requestBody: Record<string, string | number | null> = {
        project_id: formData.project_id,
        work_item_id: formData.work_item_id,
        expert_id: formData.expert_id,
        confidence_level: formData.confidence_level,
        estimation_method: formData.estimation_method,
        notes: formData.notes,
      };

      // Add hours based on method
      if (formData.estimation_method === 'three_point') {
        requestBody.optimistic_hours = parseFloat(formData.optimistic_hours);
        requestBody.most_likely_hours = parseFloat(formData.most_likely_hours);
        requestBody.pessimistic_hours = parseFloat(formData.pessimistic_hours);
      } else {
        requestBody.estimated_hours = formData.estimated_hours ? parseFloat(formData.estimated_hours) : null;
      }

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
      console.error('Failed to save expert estimate:', error);
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

  const handleEdit = (item: ExpertTimeEstimate) => {
    setEditingItem(item);
    setFormData({
      project_id: item.project_id,
      work_item_id: item.work_item_id,
      expert_id: item.expert_id,
      estimated_hours: item.estimated_hours?.toString() || '',
      confidence_level: item.confidence_level || 'medium',
      estimation_method: item.estimation_method || 'expert_judgment',
      optimistic_hours: item.optimistic_hours?.toString() || '',
      most_likely_hours: item.most_likely_hours?.toString() || '',
      pessimistic_hours: item.pessimistic_hours?.toString() || '',
      notes: item.notes || '',
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
