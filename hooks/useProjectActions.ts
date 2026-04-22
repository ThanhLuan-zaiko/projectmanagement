'use client';

import { useState } from 'react';
import type { Project } from '@/types/project';
import { apiFetch } from '@/utils/api-client';

export function useProjectActions(onSuccess?: () => void | Promise<void>) {
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'delete' | 'restore' | 'permanent' | null>(null);

  const withRefresh = async () => {
    if (onSuccess) {
      await onSuccess();
    }
  };

  const moveToTrash = async (project: Project) => {
    setBusyProjectId(project.project_id);
    setBusyAction('delete');

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to move project to trash');
      }

      await withRefresh();
    } finally {
      setBusyProjectId(null);
      setBusyAction(null);
    }
  };

  const restoreProject = async (project: Project) => {
    setBusyProjectId(project.project_id);
    setBusyAction('restore');

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}/restore`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to restore project');
      }

      await withRefresh();
    } finally {
      setBusyProjectId(null);
      setBusyAction(null);
    }
  };

  const permanentlyDeleteProject = async (project: Project) => {
    setBusyProjectId(project.project_id);
    setBusyAction('permanent');

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to permanently delete project');
      }

      await withRefresh();
    } finally {
      setBusyProjectId(null);
      setBusyAction(null);
    }
  };

  return {
    busyProjectId,
    busyAction,
    moveToTrash,
    restoreProject,
    permanentlyDeleteProject,
  };
}
