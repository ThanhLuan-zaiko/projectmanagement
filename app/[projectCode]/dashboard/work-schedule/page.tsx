'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useWorkSchedules } from '@/hooks/useWorkSchedules';
import { useWorkScheduleForm } from '@/hooks/useWorkScheduleForm';
import { useWorkScheduleActions } from '@/hooks/useWorkScheduleActions';
import { useAllWorkItems } from '@/hooks/useAllWorkItems';
import { useProject } from '@/app/[projectCode]/layout';
import { FiLoader, FiList } from 'react-icons/fi';
import { WorkItemSchedule } from '@/types/work-schedule';
import {
  WorkScheduleList,
  WorkScheduleModal,
  WorkScheduleViewModal,
  DeleteConfirmationModal,
  DashboardTabs,
  TableFilters,
  TablePagination,
} from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';

function WorkScheduleSkeleton() {
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

function WorkSchedulesContent() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [viewingSchedule, setViewingSchedule] = useState<WorkItemSchedule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'trash'>('schedules');

  // URL-based filters and pagination
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 10,
    defaultSortBy: 'scheduled_at',
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
  } = useWorkSchedules({
    projectId: urlFilters.filters.project_id || project?.project_id || '',
    search: urlFilters.search,
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
    calculatePlannedDuration,
  } = useWorkScheduleForm({ projectId: project?.project_id });

  const {
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    isRestoringItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useWorkScheduleActions(refreshData);

  const handleEditWithModal = (schedule: WorkItemSchedule) => {
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

  // Fetch work items for dropdowns
  const { workItems } = useAllWorkItems({ projectId: project?.project_id || '' });

  // Format data for dropdowns
  const workItemOptions = workItems.map(item => ({
    id: item.work_item_id,
    title: item.title,
  }));

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mx-auto mb-4 animate-pulse">
            <FiList className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.status && urlFilters.filters.status !== 'all')
  );

  return (
    <>
      <DashboardHeader
        title={activeTab === 'trash' ? 'Work Schedule Trash' : 'Work Schedule Management'}
        subtitle={activeTab === 'trash' ? 'View and restore deleted work schedules' : 'Schedule and track work items with dates, hours, and dependencies'}
        actionLabel={activeTab === 'trash' ? undefined : 'Create Schedule'}
        onAction={activeTab === 'trash' ? undefined : handleCreate}
      />
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
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
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

        {/* Work Schedule Content */}
        <div id="work-schedules-panel" role="tabpanel" aria-labelledby="work-schedules-tab">
          {activeTab === 'schedules' && (
            <>
              {/* Filters & Controls */}
              <TableFilters
                search={urlFilters.search}
                onSearchChange={urlFilters.setSearch}
                searchPlaceholder="Search work schedules..."
                filters={[
                  {
                    key: 'status',
                    value: urlFilters.filters.status || 'all',
                    onChange: (value) => urlFilters.setFilter('status', value),
                    placeholder: 'Status',
                    options: [
                      { value: 'all', label: 'All Statuses' },
                      { value: 'not_started', label: 'Not Started' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'delayed', label: 'Delayed' },
                      { value: 'blocked', label: 'Blocked' },
                    ],
                  },
                ]}
                sortBy={urlFilters.sortBy}
                sortOrder={urlFilters.sortOrder}
                sortOptions={[
                  { value: 'scheduled_at', label: 'Scheduled Date' },
                  { value: 'planned_start_date', label: 'Start Date' },
                  { value: 'planned_end_date', label: 'End Date' },
                  { value: 'completion_percentage', label: 'Completion' },
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
            <WorkScheduleSkeleton />
          ) : (
            <>
              <WorkScheduleList
                schedules={schedules}
                loading={false}
                deletingId={null}
                hasFilters={hasActiveFilters}
                onCreateSchedule={activeTab === 'trash' ? undefined : handleCreate}
                onView={(schedule) => setViewingSchedule(schedule)}
                onEdit={activeTab === 'trash' ? undefined : handleEditWithModal}
                onDelete={handleDelete}
                onRestore={activeTab === 'trash' ? handleRestore : undefined}
                isRestoringId={isRestoringItem ? itemToDelete?.work_item_id || null : null}
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
      <WorkScheduleModal
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
        workItems={workItemOptions}
        duration={calculatePlannedDuration()}
      />

      <WorkScheduleViewModal
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

export default function WorkSchedulesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mx-auto mb-4 animate-pulse">
            <FiList className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <WorkSchedulesContent />
    </Suspense>
  );
}
