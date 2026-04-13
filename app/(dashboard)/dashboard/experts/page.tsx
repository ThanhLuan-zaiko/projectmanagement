'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useExperts } from '@/hooks/useExperts';
import { FiLoader, FiUsers } from 'react-icons/fi';
import { Expert, ExpertFormData } from '@/types/expert';
import {
  ExpertList,
  ExpertModal,
  ExpertViewModal,
  DeleteConfirmationModal,
  DashboardTabs,
  TableFilters,
  TablePagination,
} from '@/components/dashboard';
import { DashboardLayout, DashboardHeader } from '@/components/layout';

function ExpertSkeleton() {
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

const initialFormData: ExpertFormData = {
  name: '',
  email: '',
  specialization: '',
  experience_years: '',
  hourly_rate: '',
  currency: 'USD',
  availability_status: 'available',
  is_active: true,
};

function ExpertsContent() {
  const { user, loading: authLoading } = useAuth();
  const [viewingExpert, setViewingExpert] = useState<Expert | null>(null);
  const [editingItem, setEditingItem] = useState<Expert | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpertFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<Expert | null>(null);

  // URL-based filters and pagination
  const urlFilters = useUrlFilters({
    defaultPage: 1,
    defaultLimit: 10,
    alwaysShowPagination: true,
  });

  // Fetch experts with filters
  const {
    experts,
    loading: expertsLoading,
    pagination,
    createExpert,
    updateExpert,
    deleteExpert,
    refresh,
  } = useExperts({
    search: urlFilters.search || undefined,
    isActive: urlFilters.filters.is_active === 'true' ? true : urlFilters.filters.is_active === 'false' ? false : undefined,
    availabilityStatus: urlFilters.filters.availability_status && urlFilters.filters.availability_status !== 'all'
      ? urlFilters.filters.availability_status
      : undefined,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder,
    page: urlFilters.page,
    limit: urlFilters.limit,
  });

  // Handlers
  const handleCreate = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.name.trim()) {
      errors.push('Name is required');
    }
    if (!formData.specialization.trim()) {
      errors.push('Specialization is required');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let success = false;
      if (editingItem) {
        success = await updateExpert(editingItem.expert_id, formData);
      } else {
        success = await createExpert(formData);
      }

      if (success) {
        setShowCreateModal(false);
        resetForm();
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to save expert:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingItem(null);
    setValidationErrors([]);
  };

  const handleEdit = (expert: Expert) => {
    setEditingItem(expert);
    setFormData({
      name: expert.name,
      email: expert.email || '',
      specialization: Array.isArray(expert.specialization) ? expert.specialization.join(', ') : (expert.specialization || ''),
      experience_years: expert.experience_years?.toString() || '',
      hourly_rate: expert.hourly_rate?.toString() || '',
      currency: expert.currency || 'USD',
      availability_status: expert.availability_status || 'available',
      is_active: expert.is_active !== false,
    });
    setShowCreateModal(true);
  };

  const handleRestore = async (expert: Expert) => {
    setDeletingId(expert.expert_id);
    try {
      const success = await updateExpert(expert.expert_id, {
        ...formData,
        name: expert.name,
        email: expert.email || '',
        specialization: Array.isArray(expert.specialization) ? expert.specialization.join(', ') : (expert.specialization || ''),
        experience_years: expert.experience_years?.toString() || '',
        hourly_rate: expert.hourly_rate?.toString() || '',
        currency: expert.currency || 'USD',
        availability_status: expert.availability_status || 'available',
        is_active: true,
      });
      if (success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to restore expert:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = async (expert: Expert) => {
    setDeletingId(expert.expert_id);
    try {
      // Soft delete (deactivate)
      const success = await updateExpert(expert.expert_id, {
        ...formData,
        name: expert.name,
        email: expert.email || '',
        specialization: Array.isArray(expert.specialization) ? expert.specialization.join(', ') : (expert.specialization || ''),
        experience_years: expert.experience_years?.toString() || '',
        hourly_rate: expert.hourly_rate?.toString() || '',
        currency: expert.currency || 'USD',
        availability_status: expert.availability_status || 'available',
        is_active: false,
      });
      if (success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to deactivate expert:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleHardDelete = async (expert: Expert) => {
    setDeletingId(expert.expert_id);
    try {
      const response = await fetch(`/api/experts/${expert.expert_id}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to delete expert:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (expert: Expert) => {
    setItemToDelete(expert);
    setShowDeleteModal(true);
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hasActiveFilters = Boolean(
    urlFilters.search ||
    (urlFilters.filters.availability_status && urlFilters.filters.availability_status !== 'all') ||
    (urlFilters.filters.is_active && urlFilters.filters.is_active !== 'all')
  );

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Expert Management"
          subtitle="Manage your team of experts and their specializations"
          actionLabel="Add Expert"
          onAction={handleCreate}
        />
      }
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <DashboardTabs />

        {/* Experts Content */}
        <div id="experts-panel" role="tabpanel" aria-labelledby="experts-tab">
          {/* Filters & Controls */}
          <TableFilters
            search={urlFilters.search}
            onSearchChange={urlFilters.setSearch}
            searchPlaceholder="Search experts..."
            filters={[
              {
                key: 'availability_status',
                value: urlFilters.filters.availability_status || 'all',
                onChange: (value) => urlFilters.setFilter('availability_status', value),
                placeholder: 'Availability',
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'available', label: 'Available' },
                  { value: 'busy', label: 'Busy' },
                  { value: 'unavailable', label: 'Unavailable' },
                ],
              },
              {
                key: 'is_active',
                value: urlFilters.filters.is_active || 'all',
                onChange: (value) => urlFilters.setFilter('is_active', value),
                placeholder: 'Status',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ],
              },
            ]}
            sortBy={urlFilters.sortBy}
            sortOrder={urlFilters.sortOrder}
            sortOptions={[
              { value: 'created_at', label: 'Created Date' },
              { value: 'name', label: 'Name' },
              { value: 'experience_years', label: 'Experience' },
              { value: 'hourly_rate', label: 'Hourly Rate' },
            ]}
            onSortChange={() => urlFilters.toggleSort(urlFilters.sortBy)}
            limit={urlFilters.limit}
            onLimitChange={urlFilters.setLimit}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
            onClearFilters={urlFilters.clearFilters}
          />

          {/* Experts List */}
          {expertsLoading ? (
            <ExpertSkeleton />
          ) : (
            <>
              <ExpertList
                experts={experts}
                loading={false}
                deletingId={deletingId}
                hasFilters={hasActiveFilters}
                onCreateExpert={handleCreate}
                onView={(expert) => setViewingExpert(expert)}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                onRestore={handleRestore}
              />

              {/* Pagination */}
              <div className="mt-6">
                <TablePagination
                  currentPage={pagination.page}
                  totalPages={Math.max(pagination.totalPages, 1)}
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
      <ExpertViewModal
        expert={viewingExpert}
        isOpen={!!viewingExpert}
        onClose={() => setViewingExpert(null)}
      />

      <ExpertModal
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        item={itemToDelete}
        isDeleting={!!deletingId}
        onSoftDelete={() => itemToDelete && handleDelete(itemToDelete)}
        onHardDelete={() => itemToDelete && handleHardDelete(itemToDelete)}
      />
    </DashboardLayout>
  );
}

export default function ExpertsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <ExpertsContent />
    </Suspense>
  );
}
