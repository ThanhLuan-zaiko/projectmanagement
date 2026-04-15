'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiFolderPlus, FiLayers } from 'react-icons/fi';
import { useProjectActions } from '@/hooks/useProjectActions';
import { useProjects } from '@/hooks/useProjects';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import type { Project } from '@/types/project';
import Modal from '@/components/ui/Modal';
import ProjectFilters from './ProjectFilters';
import ProjectList from './ProjectList';
import ProjectsPageHeader from './ProjectsPageHeader';

export default function ProjectsWorkspaceClient() {
  const router = useRouter();
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 12,
    defaultSortBy: 'updated_at',
    defaultSortOrder: 'desc',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trashModalProject, setTrashModalProject] = useState<Project | null>(null);

  const ownedProjectsState = useProjects({
    scope: 'owned',
    search: urlFilters.search,
    status: urlFilters.filters.status || 'all',
    page: urlFilters.page,
    limit: urlFilters.limit,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
  });

  const memberProjectsState = useProjects({
    scope: 'member',
    search: urlFilters.search,
    status: urlFilters.filters.status || 'all',
    page: 1,
    limit: 6,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
  });

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([ownedProjectsState.refresh(), memberProjectsState.refresh()]);
    setIsRefreshing(false);
  };

  const { busyProjectId, busyAction, moveToTrash } = useProjectActions(refreshAll);

  const handleMoveToTrash = async (project: Project) => {
    setTrashModalProject(project);
  };

  const handleConfirmTrash = async () => {
    if (!trashModalProject) return;
    await moveToTrash(trashModalProject);
    setTrashModalProject(null);
  };

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Workspace"
        title="Run active project operations without the single-file bottleneck."
        description="Filter portfolio items, open dashboards, edit project metadata and move stale work into trash with a recoverable delete flow."
        icon={FiLayers}
        highlights={[
          { label: 'Owned', value: ownedProjectsState.pagination.total },
          { label: 'Collaborating', value: memberProjectsState.pagination.total },
          { label: 'Sort', value: urlFilters.sortBy.replace('_', ' ') },
        ]}
        action={
          <Link
            href="/projects/create"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110"
          >
            <FiFolderPlus className="h-4 w-4" />
            <span>Create project</span>
          </Link>
        }
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
        onRefresh={refreshAll}
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Operating posture</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Keep live projects moving and stale ones recoverable.</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This workspace is optimized for day-to-day portfolio operations: search quickly, edit clean metadata, and move inactive work to trash without losing recovery options.
          </p>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Current filter state</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
              Search: {urlFilters.search || 'Any'}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
              Status: {urlFilters.filters.status || 'all'}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
              Order: {urlFilters.sortOrder}
            </span>
          </div>
        </section>
      </div>

      <ProjectList
        title="Owned projects"
        description="Projects you can update, archive and restore."
        projects={ownedProjectsState.projects}
        variant="managed"
        emptyTitle="No owned projects"
        emptyDescription="Create a project to start managing a dedicated workspace here."
        busyProjectId={busyProjectId}
        busyAction={busyAction}
        loading={ownedProjectsState.loading}
        pagination={ownedProjectsState.pagination}
        onPageChange={(page) => urlFilters.setPage(page)}
        onLimitChange={(limit) => urlFilters.setLimit(limit)}
        onOpen={(project) => router.push(`/${project.project_code}/dashboard`)}
        onEdit={(project) => router.push(`/projects/${project.project_id}/edit`)}
        onTrash={handleMoveToTrash}
      />

      <ProjectList
        title="Collaborating on"
        description="Projects you joined as a manager, member or viewer."
        projects={memberProjectsState.projects}
        variant="member"
        emptyTitle="No joined projects"
        emptyDescription="Use a project code from the Create & Join tab to attach yourself to an existing workspace."
        loading={memberProjectsState.loading}
        onOpen={(project) => router.push(`/${project.project_code}/dashboard`)}
      />

      {/* Move to Trash Confirmation Modal */}
      <Modal
        isOpen={!!trashModalProject}
        onClose={() => setTrashModalProject(null)}
        title="Move to trash"
        subtitle="This action can be undone from the trash page."
        size="sm"
      >
        {trashModalProject && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Are you sure you want to move <span className="font-semibold text-white">{trashModalProject.project_name}</span> to trash?
              The project will be recoverable from the trash page.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTrashModalProject(null)}
                className="flex-1 rounded-2xl border border-white/10 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTrash}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 font-medium text-white transition hover:from-rose-600 hover:to-rose-700 disabled:opacity-70"
              >
                Move to trash
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
