// Custom hook for cost estimate actions (delete, restore)
'use client';

import { useState } from 'react';
import { CostEstimate } from '@/types/cost-estimate';
import { apiFetch } from '@/utils/api-client';

export function useCostEstimateActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CostEstimate | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isRestoringItem, setIsRestoringItem] = useState(false);

  const handleDelete = (item: CostEstimate) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (permanent = false) => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    try {
      const url = permanent
        ? `/api/cost-estimates/${itemToDelete.estimate_id}?permanent=true`
        : `/api/cost-estimates/${itemToDelete.estimate_id}`;

      const response = await apiFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: itemToDelete.project_id,
          work_item_id: itemToDelete.work_item_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to delete cost estimate:', error);
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleting(null);
    }
  };

  const handleRestore = async (item: CostEstimate) => {
    setIsRestoringItem(true);
    try {
      const response = await apiFetch(`/api/cost-estimates/${item.estimate_id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: item.project_id,
          work_item_id: item.work_item_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to restore cost estimate:', error);
    } finally {
      setIsRestoringItem(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return {
    deleting,
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    isRestoringItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
    setShowDeleteModal,
    setItemToDelete,
  };
}
