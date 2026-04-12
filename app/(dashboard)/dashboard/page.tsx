'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkItems } from '@/hooks/useWorkItems';
import { useTaskForm } from '@/hooks/useTaskForm';
import { useTaskActions } from '@/hooks/useTaskActions';
import { FiLoader, FiAlertCircle, FiClipboard } from 'react-icons/fi';
import { WorkItem } from '@/types/work-item';
import { TaskFilters, TaskList, TaskCreateModal, TaskViewModal, DeleteConfirmationModal } from '@/components/dashboard';
import { DashboardLayout, DashboardHeader } from '@/components/layout';

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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewingItem, setViewingItem] = useState<WorkItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Custom hooks - fetch in parallel, don't block on auth
  const {
    filteredItems,
    loading: itemsLoading,
    hasActiveFilters,
    fetchWorkItems,
    updateFilter,
  } = useWorkItems();

  // Create a force refresh callback
  const refreshData = () => fetchWorkItems(true);

  const {
    formData,
    editingItem,
    submitting,
    validationErrors,
    setValidationErrors,
    resetForm,
    handleSubmit: handleFormSubmit,
    handleChange,
    handleEdit,
  } = useTaskForm(refreshData);

  const {
    deleting,
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useTaskActions(refreshData);

  // Handlers
  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

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

  // Show minimal loading on initial mount (very fast)
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

  // Not authenticated - redirect handled by AuthProvider
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Task Management"
          subtitle="Manage and track your project tasks"
          actionLabel="Create Task"
          onAction={handleCreate}
        />
      }
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Filters */}
        <TaskFilters
          filters={{
            searchQuery: '',
            filterStatus: 'all',
            filterPriority: 'all',
            filterType: 'all',
          }}
          onSearchChange={(value) => updateFilter('searchQuery', value)}
          onStatusChange={(value) => updateFilter('filterStatus', value)}
          onPriorityChange={(value) => updateFilter('filterPriority', value)}
          onTypeChange={(value) => updateFilter('filterType', value)}
        />

        {/* Task List with Skeleton Loading */}
        {itemsLoading ? (
          <TaskSkeleton />
        ) : (
          <TaskList
            tasks={filteredItems}
            loading={false}
            deletingId={deleting}
            hasFilters={hasActiveFilters}
            onCreateTask={handleCreate}
            onView={(item) => setViewingItem(item)}
            onEdit={handleEditWithModal}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}

        {/* Results count */}
        {!itemsLoading && filteredItems.length > 0 && (
          <div className="mt-4 sm:mt-6 text-center text-slate-400 text-xs sm:text-sm">
            Showing {filteredItems.length} task{filteredItems.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
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

      {/* View Modal */}
      <TaskViewModal
        item={viewingItem}
        onClose={() => setViewingItem(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        item={itemToDelete}
        isDeleting={isDeletingItem}
        onSoftDelete={handleSoftDelete}
        onHardDelete={handleHardDelete}
      />
    </DashboardLayout>
  );
}
