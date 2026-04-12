'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FiPlus, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { WorkItem, WorkItemFormData, TaskFilters as TaskFiltersType } from '@/types/work-item';
import { TaskFilters, TaskList, TaskCreateModal, TaskViewModal } from '@/components/dashboard';
import { DashboardLayout, DashboardHeader } from '@/components/layout';

const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFiltersType>({
    searchQuery: '',
    filterStatus: 'all',
    filterPriority: 'all',
    filterType: 'all',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [viewingItem, setViewingItem] = useState<WorkItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<WorkItemFormData>({
    title: '',
    description: '',
    work_type: 'task',
    status: 'todo',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
    tags: '',
    project_id: DEFAULT_PROJECT_ID,
  });

  // Fetch work items
  const fetchWorkItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/work-items');
      const data = await response.json();

      if (data.success) {
        setWorkItems(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchWorkItems();
    }
  }, [user, authLoading]);

  // Filter work items
  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesStatus = filters.filterStatus === 'all' || item.status === filters.filterStatus;
    const matchesPriority = filters.filterPriority === 'all' || item.priority === filters.filterPriority;
    const matchesType = filters.filterType === 'all' || item.work_type === filters.filterType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.filterStatus !== 'all' ||
    filters.filterPriority !== 'all' ||
    filters.filterType !== 'all'
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      work_type: 'task',
      status: 'todo',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      estimated_hours: '',
      tags: '',
      project_id: DEFAULT_PROJECT_ID,
    });
    setEditingItem(null);
  };

  // Open create modal
  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleEdit = (item: WorkItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      work_type: item.work_type,
      status: item.status,
      priority: item.priority,
      assigned_to: item.assigned_to || '',
      due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
      estimated_hours: item.estimated_hours?.toString() || '',
      tags: item.tags?.join(', ') || '',
      project_id: item.project_id,
    });
    setShowCreateModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingItem
        ? `/api/work-items/${editingItem.work_item_id}`
        : '/api/work-items';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          due_date: formData.due_date ? new Date(formData.due_date) : null,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        await fetchWorkItems();
      }
    } catch (error) {
      console.error('Failed to save work item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work item?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/work-items/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchWorkItems();
      }
    } catch (error) {
      console.error('Failed to delete work item:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update filter handlers
  const updateFilter = (key: keyof TaskFiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <FiLoader className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please login</h2>
          <p className="text-slate-400">You need to be logged in to view this page</p>
        </div>
      </div>
    );
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
          filters={filters}
          onSearchChange={(value) => updateFilter('searchQuery', value)}
          onStatusChange={(value) => updateFilter('filterStatus', value)}
          onPriorityChange={(value) => updateFilter('filterPriority', value)}
          onTypeChange={(value) => updateFilter('filterType', value)}
        />

        {/* Task List */}
        <TaskList
          tasks={filteredItems}
          loading={loading}
          deletingId={deleting}
          hasFilters={hasActiveFilters}
          onCreateTask={handleCreate}
          onView={(item) => setViewingItem(item)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Results count */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 sm:mt-6 text-center text-slate-400 text-xs sm:text-sm">
            Showing {filteredItems.length} of {workItems.length} task{workItems.length !== 1 ? 's' : ''}
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
      />

      {/* View Modal */}
      <TaskViewModal
        item={viewingItem}
        onClose={() => setViewingItem(null)}
      />
    </DashboardLayout>
  );
}
