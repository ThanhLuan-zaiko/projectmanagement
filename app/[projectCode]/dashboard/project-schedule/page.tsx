'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useProjectSchedules } from '@/hooks/useProjectSchedules';
import { useProjectScheduleForm } from '@/hooks/useProjectScheduleForm';
import { useProjectScheduleActions } from '@/hooks/useProjectScheduleActions';
import { useProject } from '@/app/[projectCode]/layout';
import { FiLoader, FiCalendar } from 'react-icons/fi';
import { ProjectSchedule } from '@/types/project-schedule';
import {
  ProjectScheduleList,
  ProjectScheduleModal,
  ProjectScheduleViewModal,
  DeleteConfirmationModal,
  DashboardTabs,
  TableFilters,
  TablePagination,
  DashboardExportButton,
} from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';
import {
  buildDashboardCsvFilename,
  exportDashboardCsv,
  fetchAllPaginatedExportRows,
  projectScheduleCsvColumns,
} from '@/components/dashboard/dashboardCsv';

function ProjectScheduleSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 sm:p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-2" />
            <div className="flex gap-2">
              <div className="h-5 bg-slate-700/30 rounded w-16" />
              <div className="h-5 bg-slate-700/30 rounded w-20" />
              <div className="h-5 bg-slate-700/30 rounded w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectSchedulesContent() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [viewingSchedule, setViewingSchedule] = useState<ProjectSchedule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'trash'>('schedules');

  // URL-based filters and pagination
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 10,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    alwaysShowPagination: true,
  });

  // Fetch schedules with URL params
  const isTrashTab = activeTab === 'trash';

  const {
    schedules,
    loading: schedulesLoading,
    pagination,
    refresh: refreshSchedules,
  } = useProjectSchedules({
    projectId: urlFilters.filters.project_id || project?.project_id || '',
    search: urlFilters.search,
    scheduleType: urlFilters.filters.schedule_type || 'all',
    status: urlFilters.filters.status || 'all',
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
    page: urlFilters.page,
    limit: urlFilters.limit,
    includeDeleted: isTrashTab,
    deletedOnly: isTrashTab,
    alwaysShowPagination: true,
  });

  // Handlers
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleExport = async () => {
    if (!project?.project_id) {
      return;
    }

    const params = new URLSearchParams({
      project_id: project.project_id,
      sort_by: urlFilters.sortBy,
      sort_order: urlFilters.sortOrder,
      ...(activeTab === 'trash' ? { include_deleted: 'true', deleted_only: 'true' } : {}),
    });

    if (urlFilters.search) params.set('search', urlFilters.search);
    if (urlFilters.filters.schedule_type && urlFilters.filters.schedule_type !== 'all') {
      params.set('schedule_type', urlFilters.filters.schedule_type);
    }
    if (urlFilters.filters.status && urlFilters.filters.status !== 'all') {
      params.set('status', urlFilters.filters.status);
    }

    const rows = await fetchAllPaginatedExportRows<ProjectSchedule>('/api/project-schedules', params);

    exportDashboardCsv(
      buildDashboardCsvFilename(
        project.project_code,
        activeTab === 'trash' ? 'dashboard-project-schedules-trash' : 'dashboard-project-schedules'
      ),
      projectScheduleCsvColumns,
      rows,
      activeTab === 'trash' ? 'Project Schedule Trash' : 'Project Schedule Management'
    );
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await refreshSchedules();
    setIsRefreshing(false);
  };

  const {
    formData,
    editingItem,
    submitting,
    validationErrors,
    resetForm,
    handleSubmit: handleFormSubmit,
    handleChange,
    handleEdit,
    calculateDuration,
  } = useProjectScheduleForm({ projectId: project?.project_id });

  const {
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    isRestoringItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useProjectScheduleActions(refreshData);

  const handleEditWithModal = (schedule: ProjectSchedule) => {
    handleEdit(schedule);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const isCreating = !editingItem;
    const success = await handleFormSubmit(e);
    if (success) {
      setShowCreateModal(false);
      if (isCreating && urlFilters.page !== 1) {
        urlFilters.setPage(1);
      } else {
        await refreshData();
      }
    }
  };

  // Prepare parent schedules for dropdown
  const parentScheduleOptions = schedules
    .filter(s => !s.is_deleted)
    .map(schedule => ({
      id: schedule.schedule_id,
      name: schedule.schedule_name,
    }));

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-4 animate-pulse">
            <FiCalendar className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.schedule_type && urlFilters.filters.schedule_type !== 'all') ||
    (urlFilters.filters.status && urlFilters.filters.status !== 'all')
  );

  return (
    <>
      <DashboardHeader
        title={activeTab === 'trash' ? 'Schedule Trash' : 'Project Schedule Management'}
        subtitle={activeTab === 'trash' ? 'View and restore deleted schedules' : 'Plan and manage schedules for your project phases, milestones, sprints, and releases'}
        actionLabel={activeTab === 'trash' ? undefined : 'Create Schedule'}
        onAction={activeTab === 'trash' ? undefined : handleCreate}
      >
        <DashboardExportButton
          onExport={handleExport}
          disabled={schedulesLoading || !project?.project_id}
        />
      </DashboardHeader>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <DashboardTabs />

        {/* Custom sub-tabs for Schedules and Trash */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'schedules'
                  ? 'bg-slate-800 text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Schedules
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'trash'
                  ? 'bg-slate-800 text-red-400 border-b-2 border-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Trash
            </button>
          </div>
        </div>

        {/* Project Schedule Content */}
        <div id="project-schedules-panel" role="tabpanel" aria-labelledby="project-schedules-tab">
          {activeTab === 'schedules' && (
            <>
              {/* Filters & Controls */}
              <TableFilters
                search={urlFilters.search}
                onSearchChange={urlFilters.setSearch}
                searchPlaceholder="Search schedules..."
                filters={[
                  {
                    key: 'schedule_type',
                    value: urlFilters.filters.schedule_type || 'all',
                    onChange: (value) => urlFilters.setFilter('schedule_type', value),
                    placeholder: 'Schedule Type',
                    options: [
                      { value: 'all', label: 'All Types' },
                      { value: 'phase', label: 'Phase' },
                      { value: 'milestone', label: 'Milestone' },
                      { value: 'sprint', label: 'Sprint' },
                      { value: 'release', label: 'Release' },
                    ],
                  },
                  {
                    key: 'status',
                    value: urlFilters.filters.status || 'all',
                    onChange: (value) => urlFilters.setFilter('status', value),
                    placeholder: 'Status',
                    options: [
                      { value: 'all', label: 'All Statuses' },
                      { value: 'planned', label: 'Planned' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ],
                  },
                ]}
                sortBy={urlFilters.sortBy}
                sortOrder={urlFilters.sortOrder}
                sortOptions={[
                  { value: 'created_at', label: 'Created Date' },
                  { value: 'start_date', label: 'Start Date' },
                  { value: 'end_date', label: 'End Date' },
                  { value: 'progress_percentage', label: 'Progress' },
                ]}
                onSortChange={(sortBy) => urlFilters.setSort(sortBy, sortBy === urlFilters.sortBy ? urlFilters.sortOrder : 'desc')}
                onSortOrderToggle={() => urlFilters.toggleSort(urlFilters.sortBy)}
                limit={urlFilters.limit}
                onLimitChange={urlFilters.setLimit}
                onRefresh={refreshData}
                isRefreshing={isRefreshing}
                onClearFilters={urlFilters.clearFilters}
              />
            </>
          )}

          {/* Schedules List */}
          {schedulesLoading ? (
            <ProjectScheduleSkeleton />
          ) : (
            <>
              <ProjectScheduleList
                schedules={schedules}
                loading={false}
                deletingId={null}
                hasFilters={hasActiveFilters}
                onCreateSchedule={activeTab === 'trash' ? undefined : handleCreate}
                onView={(schedule) => setViewingSchedule(schedule)}
                onEdit={activeTab === 'trash' ? undefined : handleEditWithModal}
                onDelete={handleDelete}
                onRestore={activeTab === 'trash' ? handleRestore : undefined}
                isRestoringId={isRestoringItem ? itemToDelete?.schedule_id || null : null}
              />

              {/* Pagination */}
              <div className="mt-6">
                <TablePagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  limit={urlFilters.limit}
                  onPageChange={urlFilters.setPage}
                  alwaysShow={true}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectScheduleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        editingItem={editingItem}
        formData={formData}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onReset={resetForm}
        validationErrors={validationErrors}
        parentSchedules={parentScheduleOptions}
        duration={calculateDuration()}
      />

      <ProjectScheduleViewModal
        schedule={viewingSchedule}
        isOpen={!!viewingSchedule}
        onClose={() => setViewingSchedule(null)}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        item={itemToDelete}
        isDeleting={isDeletingItem}
        onSoftDelete={() => confirmDelete(false)}
        onHardDelete={() => confirmDelete(true)}
      />
    </>
  );
}

export default function ProjectSchedulesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-4 animate-pulse">
            <FiCalendar className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <ProjectSchedulesContent />
    </Suspense>
  );
}
