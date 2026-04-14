// Custom hook for fetching and managing experts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expert, ExpertFormData } from '@/types/expert';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseExpertsOptions {
  projectId?: string;
  isActive?: boolean;
  availabilityStatus?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UseExpertsResult {
  experts: Expert[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchExperts: () => Promise<void>;
  refresh: () => Promise<void>;
  createExpert: (data: ExpertFormData) => Promise<boolean>;
  updateExpert: (id: string, data: ExpertFormData) => Promise<boolean>;
  deleteExpert: (id: string) => Promise<boolean>;
}

export function useExperts(options: UseExpertsOptions): UseExpertsResult {
  const {
    projectId,
    isActive,
    availabilityStatus,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = options;

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (projectId) params.set('project_id', projectId);
      if (isActive !== undefined) params.set('is_active', isActive.toString());
      if (availabilityStatus) params.set('availability_status', availabilityStatus);
      if (search) params.set('search', search);

      const response = await fetch(`/api/experts?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success) {
        setExperts(data.data || []);
        setPagination(data.pagination ? {
          ...data.pagination,
          totalPages: Math.max(data.pagination.totalPages, 1),
        } : {
          page,
          limit,
          total: data.data?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setError(data.error || 'Failed to fetch experts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId, isActive, availabilityStatus, search, sortBy, sortOrder, page, limit]);

  const refresh = useCallback(async () => {
    await fetchExperts();
  }, [fetchExperts]);

  // Create expert
  const createExpert = useCallback(async (data: ExpertFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          specialization: data.specialization,
          experience_years: data.experience_years || null,
          hourly_rate: data.hourly_rate || null,
          currency: data.currency || 'USD',
          availability_status: data.availability_status || 'available',
          is_active: data.is_active !== undefined ? data.is_active : true,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Failed to create expert:', err);
      return false;
    }
  }, []);

  // Update expert
  const updateExpert = useCallback(async (id: string, data: ExpertFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/experts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          specialization: data.specialization,
          experience_years: data.experience_years || null,
          hourly_rate: data.hourly_rate || null,
          currency: data.currency || 'USD',
          availability_status: data.availability_status || 'available',
          is_active: data.is_active !== undefined ? data.is_active : true,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Failed to update expert:', err);
      return false;
    }
  }, []);

  // Delete expert (soft delete - sets is_active to false)
  const deleteExpert = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/experts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Failed to delete expert:', err);
      return false;
    }
  }, []);

  // Fetch when options change
  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  return {
    experts,
    loading,
    error,
    pagination,
    fetchExperts,
    refresh,
    createExpert,
    updateExpert,
    deleteExpert,
  };
}

