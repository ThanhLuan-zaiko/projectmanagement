// Custom hook for expert estimate actions (delete, restore)
'use client';

import { useState } from 'react';
import { ExpertTimeEstimate } from '@/types/expert-estimate';
import { apiFetch } from '@/utils/api-client';

export function useExpertEstimateActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExpertTimeEstimate | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isRestoringItem, setIsRestoringItem] = useState(false);

  const handleDelete = (item: ExpertTimeEstimate) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (permanent = false) => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    try {
      const url = permanent 
        ? `/api/expert-estimates/${itemToDelete.estimate_id}?permanent=true`
        : `/api/expert-estimates/${itemToDelete.estimate_id}`;
        
      const response = await apiFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: itemToDelete.project_id,
          work_item_id: itemToDelete.work_item_id,
          expert_id: itemToDelete.expert_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to delete expert estimate:', error);
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleting(null);
    }
  };

  const handleRestore = async (item: ExpertTimeEstimate) => {
    setIsRestoringItem(true);
    try {
      const response = await apiFetch(`/api/expert-estimates/${item.estimate_id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: item.project_id,
          work_item_id: item.work_item_id,
          expert_id: item.expert_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to restore expert estimate:', error);
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
