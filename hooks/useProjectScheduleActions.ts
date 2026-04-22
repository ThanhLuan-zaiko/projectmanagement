// Custom hook for project schedule actions (delete, restore)
'use client';

import { useState } from 'react';
import { ProjectSchedule } from '@/types/project-schedule';
import { apiFetch } from '@/utils/api-client';

export function useProjectScheduleActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProjectSchedule | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isRestoringItem, setIsRestoringItem] = useState(false);

  const handleDelete = (item: ProjectSchedule) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (permanent = false) => {
    if (!itemToDelete) return;

    setIsDeletingItem(true);
    try {
      const url = permanent
        ? `/api/project-schedules/${itemToDelete.schedule_id}?permanent=true`
        : `/api/project-schedules/${itemToDelete.schedule_id}`;

      const response = await apiFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: itemToDelete.project_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to delete project schedule:', error);
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleting(null);
    }
  };

  const handleRestore = async (item: ProjectSchedule) => {
    setIsRestoringItem(true);
    try {
      const response = await apiFetch(`/api/project-schedules/${item.schedule_id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: item.project_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Force refresh to get latest data
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to restore project schedule:', error);
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
