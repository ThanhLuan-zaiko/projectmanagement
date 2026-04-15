'use client';

import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useProjectActions } from '@/hooks/useProjectActions';
import { useProjects } from '@/hooks/useProjects';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import type { Project } from '@/types/project';
import ProjectFilters from './ProjectFilters';
import ProjectList from './ProjectList';
import ProjectsPageHeader from './ProjectsPageHeader';

export default function ProjectsTrashClient() {
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 12,
    defaultSortBy: 'updated_at',
    defaultSortOrder: 'desc',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const trashState = useProjects({
    scope: 'owned',
    search: urlFilters.search,
    status: urlFilters.filters.status || 'all',
    page: urlFilters.page,
    limit: urlFilters.limit,
    deletedOnly: true,
    includeDeleted: true,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
  });

  const refreshTrash = async () => {
    setIsRefreshing(true);
    await trashState.refresh();
    setIsRefreshing(false);
  };

  const { busyProjectId, busyAction, restoreProject, permanentlyDeleteProject } = useProjectActions(refreshTrash);

  const handleRestore = async (project: Project) => {
    const confirmed = window.confirm(`Restore "${project.project_name}" back to the workspace?`);

    if (!confirmed) {
      return;
    }

    await restoreProject(project);
  };

  const handlePermanentDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Permanently delete "${project.project_name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    await permanentlyDeleteProject(project);
  };

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Trash"
        title="Restore safely before permanent deletion."
        description="Deleted projects stay recoverable here until you choose to remove them permanently."
        icon={FiTrash2}
        highlights={[
          { label: 'Deleted', value: trashState.pagination.total },
          { label: 'Filter', value: urlFilters.filters.status || 'all' },
          { label: 'Sort', value: urlFilters.sortOrder },
        ]}
      />

      <ProjectFilters
        search={urlFilters.search}
        status={urlFilters.filters.status || 'all'}
        sortBy={urlFilters.sortBy}
        sortOrder={urlFilters.sortOrder}
        isRefreshing={isRefreshing}
        onSearchChange={urlFilters.setSearch}
        onStatusChange={(value) => urlFilters.setFilter('status', value)}
        onSortByChange={(value) => urlFilters.setSort(value, urlFilters.sortOrder)}
        onSortOrderChange={(value) => urlFilters.setSort(urlFilters.sortBy, value)}
        onRefresh={refreshTrash}
      />

      <section className="rounded-[28px] border border-rose-400/15 bg-rose-500/[0.05] p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-200/70">Recovery rules</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-200">
            Restore returns the project to the main workspace immediately.
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-200">
            Permanent delete is irreversible and removes the project record completely.
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-200">
            Only owned projects appear here, so recovery remains under owner control.
          </div>
        </div>
      </section>

      <ProjectList
        title="Deleted projects"
        description="Restore projects that were archived by mistake, or permanently delete them when the workspace is no longer needed."
        projects={trashState.projects}
        variant="trash"
        emptyTitle="Trash is empty"
        emptyDescription="No deleted projects are waiting for recovery."
        busyProjectId={busyProjectId}
        busyAction={busyAction}
        loading={trashState.loading}
        pagination={trashState.pagination}
        onPageChange={(page) => urlFilters.setPage(page)}
        onLimitChange={(limit) => urlFilters.setLimit(limit)}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
      />
    </div>
  );
}
