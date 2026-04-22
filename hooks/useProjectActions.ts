'use client';

import { useState } from 'react';
import type { Project } from '@/types/project';
import { apiFetch } from '@/utils/api-client';
import { invalidateProjectsCache } from './useProjects';
import { invalidateProjectSummaryCache } from './useProjectSummary';

interface UseProjectActionsOptions {
  onSuccess?: () => void | Promise<void>;
  onOptimisticRemove?: (project: Project) => (() => void) | void;
}

export function useProjectActions(options?: UseProjectActionsOptions | (() => void | Promise<void>)) {
  const resolvedOptions: UseProjectActionsOptions =
    typeof options === 'function' ? { onSuccess: options } : options ?? {};

  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'delete' | 'restore' | 'permanent' | null>(null);

  const withRefresh = async () => {
    invalidateProjectsCache();
    invalidateProjectSummaryCache();

    if (resolvedOptions.onSuccess) {
      await resolvedOptions.onSuccess();
    }
  };

  const withOptimisticRemoval = async (
    project: Project,
    action: 'delete' | 'restore' | 'permanent',
    executeRequest: () => Promise<Response>
  ) => {
    setBusyProjectId(project.project_id);
    setBusyAction(action);

    const rollback = resolvedOptions.onOptimisticRemove?.(project);

    try {
      const response = await executeRequest();
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Project action failed');
      }

      await withRefresh();
      return true;
    } catch (error) {
      rollback?.();
      console.error(`Project ${action} action failed:`, error);
      return false;
    } finally {
      setBusyProjectId(null);
      setBusyAction(null);
    }
  };

  const moveToTrash = async (project: Project) =>
    withOptimisticRemoval(project, 'delete', () =>
      apiFetch(`/api/projects/${project.project_id}`, {
        method: 'DELETE',
      })
    );

  const restoreProject = async (project: Project) =>
    withOptimisticRemoval(project, 'restore', () =>
      apiFetch(`/api/projects/${project.project_id}/restore`, {
        method: 'POST',
      })
    );

  const permanentlyDeleteProject = async (project: Project) =>
    withOptimisticRemoval(project, 'permanent', () =>
      apiFetch(`/api/projects/${project.project_id}?permanent=true`, {
        method: 'DELETE',
      })
    );

  return {
    busyProjectId,
    busyAction,
    moveToTrash,
    restoreProject,
    permanentlyDeleteProject,
  };
}
