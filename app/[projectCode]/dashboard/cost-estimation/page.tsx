'use client';

import { useState, Suspense, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useCostEstimates } from '@/hooks/useCostEstimates';
import { useCostEstimateForm } from '@/hooks/useCostEstimateForm';
import { useCostEstimateActions } from '@/hooks/useCostEstimateActions';
import { useAllWorkItems } from '@/hooks/useAllWorkItems';
import { useProject } from '@/app/[projectCode]/layout';
import { FiLoader, FiDollarSign } from 'react-icons/fi';
import { CostEstimate } from '@/types/cost-estimate';
import {
  CostEstimateList,
  CostEstimateModal,
  CostEstimateViewModal,
  DeleteConfirmationModal,
  DashboardTabs,
  TableFilters,
  TablePagination,
} from '@/components/dashboard';
import { DashboardLayout, DashboardHeader } from '@/components/layout';

function CostEstimateSkeleton() {
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

function CostEstimatesContent() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [viewingEstimate, setViewingEstimate] = useState<CostEstimate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'estimates' | 'trash'>('estimates');

  // URL-based filters and pagination
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 10,
    defaultSortBy: 'estimated_at',
    defaultSortOrder: 'desc',
    alwaysShowPagination: true,
  });

  // Fetch estimates with URL params
  const isTrashTab = activeTab === 'trash';

  const {
    estimates,
    loading: estimatesLoading,
    pagination,
    refresh: refreshEstimates,
  } = useCostEstimates({
    projectId: urlFilters.filters.project_id || project?.project_id || '',
    workItemId: urlFilters.filters.work_item_id || '',
    estimateType: urlFilters.filters.estimate_type || 'all',
    status: urlFilters.filters.status || 'all',
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
    await refreshEstimates();
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
    setFormData,
  } = useCostEstimateForm(refreshData);

  // Sync project_id from context to form
  useEffect(() => {
    if (project?.project_id) {
      setFormData(prev => ({ ...prev, project_id: project.project_id }));
    }
  }, [project?.project_id, setFormData]);

  const {
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    isRestoringItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useCostEstimateActions(refreshData);

  const handleEditWithModal = (estimate: CostEstimate) => {
    handleEdit(estimate);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await handleFormSubmit(e);
    if (success) {
      setShowCreateModal(false);
    }
  };

  // Fetch work items for dropdowns
  const { workItems, loading: workItemsLoading } = useAllWorkItems({ projectId: project?.project_id || '' });

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
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mx-auto mb-4 animate-pulse">
            <FiDollarSign className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-yellow-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.estimate_type && urlFilters.filters.estimate_type !== 'all') ||
    (urlFilters.filters.status && urlFilters.filters.status !== 'all')
  );

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title={activeTab === 'trash' ? 'Cost Estimate Trash' : 'Project Cost Estimation'}
          subtitle={activeTab === 'trash' ? 'View and restore deleted cost estimates' : 'Estimate and manage costs for project work items'}
          actionLabel={activeTab === 'trash' ? undefined : 'Create Estimate'}
          onAction={activeTab === 'trash' ? undefined : handleCreate}
        />
      }
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <DashboardTabs />

        {/* Custom sub-tabs for Estimates and Trash */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('estimates')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'estimates'
                  ? 'bg-slate-800 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Estimates
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

        {/* Cost Estimation Content */}
        <div id="cost-estimates-panel" role="tabpanel" aria-labelledby="cost-estimates-tab">
          {activeTab === 'estimates' && (
            <>
              {/* Filters & Controls */}
              <TableFilters
                search={urlFilters.search}
                onSearchChange={urlFilters.setSearch}
                searchPlaceholder="Search cost estimates..."
                filters={[
                  {
                    key: 'estimate_type',
                    value: urlFilters.filters.estimate_type || 'all',
                    onChange: (value) => urlFilters.setFilter('estimate_type', value),
                    placeholder: 'Estimate Type',
                    options: [
                      { value: 'all', label: 'All Types' },
                      { value: 'labor', label: 'Labor' },
                      { value: 'material', label: 'Material' },
                      { value: 'service', label: 'Service' },
                      { value: 'overhead', label: 'Overhead' },
                      { value: 'license', label: 'License' },
                    ],
                  },
                  {
                    key: 'status',
                    value: urlFilters.filters.status || 'all',
                    onChange: (value) => urlFilters.setFilter('status', value),
                    placeholder: 'Status',
                    options: [
                      { value: 'all', label: 'All Statuses' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' },
                    ],
                  },
                ]}
                sortBy={urlFilters.sortBy}
                sortOrder={urlFilters.sortOrder}
                sortOptions={[
                  { value: 'estimated_at', label: 'Estimation Date' },
                  { value: 'estimated_cost', label: 'Estimated Cost' },
                  { value: 'estimate_type', label: 'Estimate Type' },
                ]}
                onSortChange={() => urlFilters.toggleSort(urlFilters.sortBy)}
                limit={urlFilters.limit}
                onLimitChange={urlFilters.setLimit}
                onRefresh={refreshData}
                isRefreshing={isRefreshing}
                onClearFilters={urlFilters.clearFilters}
              />
            </>
          )}

          {/* Estimates List - FORCE RENDER */}
          <CostEstimateList
            key={JSON.stringify(estimates)}
            estimates={estimates}
            loading={false}
            deletingId={null}
            hasFilters={hasActiveFilters}
            onCreateEstimate={activeTab === 'trash' ? undefined : handleCreate}
            onView={(estimate) => setViewingEstimate(estimate)}
            onEdit={activeTab === 'trash' ? undefined : handleEditWithModal}
            onDelete={handleDelete}
            onRestore={activeTab === 'trash' ? handleRestore : undefined}
            isRestoringId={isRestoringItem ? itemToDelete?.estimate_id || null : null}
          />
        </div>
      </div>

      {/* Modals */}
      <CostEstimateModal
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
      />

      <CostEstimateViewModal
        estimate={viewingEstimate}
        isOpen={!!viewingEstimate}
        onClose={() => setViewingEstimate(null)}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        item={itemToDelete}
        isDeleting={isDeletingItem}
        onSoftDelete={() => confirmDelete(false)}
        onHardDelete={() => confirmDelete(true)}
      />
    </DashboardLayout>
  );
}

export default function CostEstimatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mx-auto mb-4 animate-pulse">
            <FiDollarSign className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-yellow-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <CostEstimatesContent />
    </Suspense>
  );
}
