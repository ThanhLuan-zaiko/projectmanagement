// Custom hook for cost estimate form state management
'use client';

import { useState } from 'react';
import { CostEstimate, CostEstimateFormData } from '@/types/cost-estimate';

const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

const initialFormData: CostEstimateFormData = {
  project_id: DEFAULT_PROJECT_ID,
  work_item_id: '',
  estimate_type: 'labor',
  estimated_cost: '',
  currency: 'USD',
  hourly_rate: '',
  hours: '',
  quantity: '',
  unit_cost: '',
  notes: '',
  status: 'draft',
};

export function useCostEstimateForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<CostEstimateFormData>(initialFormData);
  const [editingItem, setEditingItem] = useState<CostEstimate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const resetForm = () => {
    setFormData(initialFormData);
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
    if (!formData.estimate_type) {
      errors.push('Estimate type is required');
    }

    // Validate based on estimate type
    if (formData.estimate_type === 'labor') {
      if (!formData.hourly_rate) {
        errors.push('Hourly rate is required for labor estimates');
      }
      if (!formData.hours) {
        errors.push('Hours is required for labor estimates');
      }
    } else if (formData.estimate_type === 'material') {
      if (!formData.quantity) {
        errors.push('Quantity is required for material estimates');
      }
      if (!formData.unit_cost) {
        errors.push('Unit cost is required for material estimates');
      }
    } else {
      // For service, overhead, license - require estimated_cost directly
      if (!formData.estimated_cost) {
        errors.push('Estimated cost is required');
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
        ? `/api/cost-estimates/${editingItem.estimate_id}`
        : '/api/cost-estimates';

      const method = editingItem ? 'PUT' : 'POST';

      const requestBody: any = {
        project_id: formData.project_id,
        work_item_id: formData.work_item_id,
        estimate_type: formData.estimate_type,
        currency: formData.currency,
        notes: formData.notes,
        status: formData.status,
      };

      // Add fields based on type
      if (formData.estimate_type === 'labor') {
        requestBody.hourly_rate = parseFloat(formData.hourly_rate);
        requestBody.hours = parseFloat(formData.hours);
      } else if (formData.estimate_type === 'material') {
        requestBody.quantity = parseInt(formData.quantity);
        requestBody.unit_cost = parseFloat(formData.unit_cost);
      } else {
        requestBody.estimated_cost = formData.estimated_cost ? parseFloat(formData.estimated_cost) : null;
      }

      const response = await fetch(url, {
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
      console.error('Failed to save cost estimate:', error);
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

  const handleEdit = (item: CostEstimate) => {
    setEditingItem(item);
    setFormData({
      project_id: item.project_id,
      work_item_id: item.work_item_id,
      estimate_type: item.estimate_type,
      estimated_cost: item.estimated_cost?.toString() || '',
      currency: item.currency || 'USD',
      hourly_rate: item.hourly_rate?.toString() || '',
      hours: item.hours?.toString() || '',
      quantity: item.quantity?.toString() || '',
      unit_cost: item.unit_cost?.toString() || '',
      notes: item.notes || '',
      status: item.status,
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
