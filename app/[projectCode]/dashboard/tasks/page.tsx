'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/app/[projectCode]/layout';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useWorkItems } from '@/hooks/useWorkItems';
import { useTaskForm } from '@/hooks/useTaskForm';
import { useTaskActions } from '@/hooks/useTaskActions';
import { FiLoader, FiClipboard } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';
import { TaskList, TaskCreateModal, TaskViewModal, DeleteConfirmationModal, DashboardTabs, TableFilters, TablePagination } from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';

function TaskSkeleton() {
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

function TasksContent() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [viewingItem, setViewingItem] = useState<WorkItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // URL-based filters and pagination
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 10,
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
    alwaysShowPagination: true, // Always show pagination even with few items
  });

  // Fetch work items with URL params
  const {
    workItems,
    loading: itemsLoading,
    pagination,
    refresh: refreshItems,
  } = useWorkItems({
    projectId: project?.project_id || '',
    search: urlFilters.search,
    status: urlFilters.filters.status || 'all',
    priority: urlFilters.filters.priority || 'all',
    workType: urlFilters.filters.work_type || 'all',
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
    page: urlFilters.page,
    limit: urlFilters.limit,
    alwaysShowPagination: true,
  });

  // Handlers
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await refreshItems();
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
  } = useTaskForm({ projectId: project?.project_id, onSuccess: refreshData });

  const {
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useTaskActions(refreshData);

  const handleEditWithModal = (item: WorkItem) => {
    handleEdit(item);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await handleFormSubmit(e);
    if (success) {
      setShowCreateModal(false);
    }
  };

  const handleSoftDelete = () => confirmDelete(false);
  const handleHardDelete = () => confirmDelete(true);

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiClipboard className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.status && urlFilters.filters.status !== 'all') ||
    (urlFilters.filters.priority && urlFilters.filters.priority !== 'all') ||
    (urlFilters.filters.work_type && urlFilters.filters.work_type !== 'all')
  );

  return (
    <>
      <DashboardHeader
        title="Task Management"
        subtitle="Manage and track your project tasks"
        actionLabel="Create Task"
        onAction={handleCreate}
      />
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <DashboardTabs />

        {/* Task Management Content */}
        <div id="tasks-panel" role="tabpanel" aria-labelledby="tasks-tab">
          {/* Filters & Controls */}
          <TableFilters
            search={urlFilters.search}
            onSearchChange={urlFilters.setSearch}
            searchPlaceholder="Search tasks..."
            filters={[
              {
                key: 'status',
                value: urlFilters.filters.status || 'all',
                onChange: (value) => urlFilters.setFilter('status', value),
                placeholder: 'Status',
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'review', label: 'Review' },
                  { value: 'done', label: 'Done' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              {
                key: 'priority',
                value: urlFilters.filters.priority || 'all',
                onChange: (value) => urlFilters.setFilter('priority', value),
                placeholder: 'Priority',
                options: [
                  { value: 'all', label: 'All Priority' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ],
              },
              {
                key: 'work_type',
                value: urlFilters.filters.work_type || 'all',
                onChange: (value) => urlFilters.setFilter('work_type', value),
                placeholder: 'Type',
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'task', label: 'Task' },
                  { value: 'subtask', label: 'Subtask' },
                  { value: 'milestone', label: 'Milestone' },
                  { value: 'bug', label: 'Bug' },
                ],
              },
            ]}
            sortBy={urlFilters.sortBy}
            sortOrder={urlFilters.sortOrder}
            sortOptions={[
              { value: 'created_at', label: 'Created Date' },
              { value: 'updated_at', label: 'Updated Date' },
              { value: 'title', label: 'Title' },
              { value: 'priority', label: 'Priority' },
              { value: 'status', label: 'Status' },
              { value: 'due_date', label: 'Due Date' },
            ]}
            onSortChange={(sortBy) => urlFilters.setSort(sortBy, sortBy === urlFilters.sortBy ? urlFilters.sortOrder : 'desc')}
            onSortOrderToggle={() => urlFilters.toggleSort(urlFilters.sortBy)}
            limit={urlFilters.limit}
            onLimitChange={urlFilters.setLimit}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
            onClearFilters={urlFilters.clearFilters}
          />

          {/* Task List */}
          {itemsLoading ? (
            <TaskSkeleton />
          ) : (
            <>
              <TaskList
                tasks={workItems}
                loading={false}
                deletingId={null}
                hasFilters={hasActiveFilters}
                onCreateTask={handleCreate}
                onView={(item) => setViewingItem(item)}
                onEdit={handleEditWithModal}
                onDelete={handleDelete}
                onRestore={handleRestore}
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
      <TaskCreateModal
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
      />

      <TaskViewModal item={viewingItem} onClose={() => setViewingItem(null)} />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        item={itemToDelete}
        isDeleting={isDeletingItem}
        onSoftDelete={handleSoftDelete}
        onHardDelete={handleHardDelete}
      />
    </>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiClipboard className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
