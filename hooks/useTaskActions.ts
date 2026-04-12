// Custom hook for task actions (delete, restore)
'use client';

import { useState } from 'react';
import { WorkItem } from '@/types/work-item';

export function useTaskActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WorkItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const handleDelete = (item: WorkItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleRestore = async (id: string) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/work-items/${id}/restore`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to restore work item:', error);
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = async (hardDelete: boolean = false) => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    try {
      if (hardDelete) {
        // Hard delete - permanently remove from database
        const response = await fetch(`/api/work-items/${itemToDelete.work_item_id}/permanent`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // Force refresh to get latest data
          onSuccess?.();
        }
      } else {
        // Soft delete - set status to cancelled
        const response = await fetch(`/api/work-items/${itemToDelete.work_item_id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // Force refresh to get latest data
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error('Failed to delete work item:', error);
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleting(null);
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
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
    setShowDeleteModal,
    setItemToDelete,
  };
}
