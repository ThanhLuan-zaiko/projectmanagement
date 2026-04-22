'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useExpertEstimates } from '@/hooks/useExpertEstimates';
import { useExpertEstimateForm } from '@/hooks/useExpertEstimateForm';
import { useExpertEstimateActions } from '@/hooks/useExpertEstimateActions';
import { useExperts } from '@/hooks/useExperts';
import { useAllWorkItems } from '@/hooks/useAllWorkItems';
import { useProject } from '@/app/[projectCode]/layout';
import { FiLoader, FiBarChart2 } from 'react-icons/fi';
import { ExpertTimeEstimate } from '@/types/expert-estimate';
import {
  ExpertEstimateList,
  ExpertEstimateModal,
  ExpertEstimateViewModal,
  DeleteConfirmationModal,
  DashboardTabs,
  TableFilters,
  TablePagination,
} from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';

function ExpertEstimateSkeleton() {
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

function ExpertEstimatesContent() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [viewingEstimate, setViewingEstimate] = useState<ExpertTimeEstimate | null>(null);
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
  } = useExpertEstimates({
    projectId: urlFilters.filters.project_id || project?.project_id || '',
    search: urlFilters.search,
    workItemId: urlFilters.filters.work_item_id || '',
    expertId: urlFilters.filters.expert_id || '',
    confidence: urlFilters.filters.confidence || 'all',
    method: urlFilters.filters.method || 'all',
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
  } = useExpertEstimateForm({ projectId: project?.project_id });

  const {
    showDeleteModal,
    itemToDelete,
    isDeletingItem,
    isRestoringItem,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  } = useExpertEstimateActions(refreshData);

  const handleEditWithModal = (estimate: ExpertTimeEstimate) => {
    handleEdit(estimate);
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

  // Fetch real data from APIs
  const { experts } = useExperts({
    projectId: project?.project_id || '',
    isActive: true,
  });
  const { workItems } = useAllWorkItems({ projectId: project?.project_id || '' });

  // Format data for dropdowns
  const workItemOptions = workItems.map(item => ({
    id: item.work_item_id,
    title: item.title,
  }));

  const expertOptions = experts.map(expert => ({
    id: expert.expert_id,
    name: expert.name,
  }));

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiBarChart2 className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.confidence && urlFilters.filters.confidence !== 'all') ||
    (urlFilters.filters.method && urlFilters.filters.method !== 'all')
  );

  return (
    <>
      <DashboardHeader
        title={activeTab === 'trash' ? 'Expert Estimate Trash' : 'Expert Time Estimation'}
        subtitle={activeTab === 'trash' ? 'View and restore deleted expert estimates' : 'Expert-based time estimates for project work items'}
        actionLabel={activeTab === 'trash' ? undefined : 'Create Estimate'}
        onAction={activeTab === 'trash' ? undefined : handleCreate}
      />
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
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
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

        {/* Expert Estimation Content */}
        <div id="expert-estimates-panel" role="tabpanel" aria-labelledby="expert-estimates-tab">
          {activeTab === 'estimates' && (
            <>
              {/* Filters & Controls */}
              <TableFilters
                search={urlFilters.search}
                onSearchChange={urlFilters.setSearch}
                searchPlaceholder="Search estimates..."
                filters={[
                  {
                    key: 'confidence',
                    value: urlFilters.filters.confidence || 'all',
                    onChange: (value) => urlFilters.setFilter('confidence', value),
                    placeholder: 'Confidence Level',
                    options: [
                      { value: 'all', label: 'All Levels' },
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ],
                  },
                  {
                    key: 'method',
                    value: urlFilters.filters.method || 'all',
                    onChange: (value) => urlFilters.setFilter('method', value),
                    placeholder: 'Estimation Method',
                    options: [
                      { value: 'all', label: 'All Methods' },
                      { value: 'expert_judgment', label: 'Expert Judgment' },
                      { value: 'planning_poker', label: 'Planning Poker' },
                      { value: 'three_point', label: 'Three-Point' },
                      { value: 'delphi', label: 'Delphi' },
                    ],
                  },
                ]}
                sortBy={urlFilters.sortBy}
                sortOrder={urlFilters.sortOrder}
                sortOptions={[
                  { value: 'estimated_at', label: 'Estimation Date' },
                  { value: 'estimated_hours', label: 'Estimated Hours' },
                  { value: 'confidence_level', label: 'Confidence Level' },
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

          {/* Estimates List */}
          {estimatesLoading ? (
            <ExpertEstimateSkeleton />
          ) : (
            <>
              <ExpertEstimateList
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
      <ExpertEstimateModal
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
        experts={expertOptions}
      />

      <ExpertEstimateViewModal
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
    </>
  );
}

export default function ExpertEstimatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiBarChart2 className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <ExpertEstimatesContent />
    </Suspense>
  );
}
