// Custom hook for work schedule actions (delete, restore)
'use client';

import { useState } from 'react';
import { WorkItemSchedule } from '@/types/work-schedule';
import { apiFetch } from '@/utils/api-client';

export function useWorkScheduleActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WorkItemSchedule | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isRestoringItem, setIsRestoringItem] = useState(false);

  const handleDelete = (item: WorkItemSchedule) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (permanent = false) => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    try {
      const url = permanent
        ? `/api/work-schedules/${itemToDelete.work_item_id}?permanent=true`
        : `/api/work-schedules/${itemToDelete.work_item_id}`;

      const response = await apiFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: itemToDelete.project_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to delete work schedule:', error);
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleting(null);
    }
  };

  const handleRestore = async (item: WorkItemSchedule) => {
    setIsRestoringItem(true);
    try {
      const response = await apiFetch(`/api/work-schedules/${item.work_item_id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: item.project_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to restore work schedule:', error);
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
