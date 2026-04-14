// Project Schedule types for project schedule management

export interface ProjectSchedule {
  schedule_id: string;
  project_id: string;
  schedule_name: string;
  schedule_type: 'phase' | 'milestone' | 'sprint' | 'release';
  start_date: string;
  end_date: string;
  planned_duration_days: number | null;
  actual_duration_days: number | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  progress_percentage: number | null;
  parent_schedule_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  // Enriched fields from API
  parent_schedule_name?: string | null;
  created_by_name?: string | null;
}

export interface ProjectScheduleFormData {
  project_id: string;
  schedule_name: string;
  schedule_type: ProjectSchedule['schedule_type'];
  start_date: string;
  end_date: string;
  status: ProjectSchedule['status'];
  progress_percentage: string;
  parent_schedule_id: string;
}

export type ProjectScheduleFilterType = 'all' | string;

export interface ProjectScheduleFilters {
  searchQuery: string;
  scheduleType: ProjectScheduleFilterType;
  status: ProjectScheduleFilterType;
}

export interface ProjectSchedulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
