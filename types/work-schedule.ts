// Work Schedule types for work item schedule management

export interface WorkItemSchedule {
  work_item_id: string;
  project_id: string;
  schedule_id: string | null;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  planned_hours: number | null;
  actual_hours: number | null;
  dependencies: string[];
  is_critical_path: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  completion_percentage: number | null;
  scheduled_by: string | null;
  scheduled_at: string;
  updated_at: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  // Enriched fields from API
  work_item_title?: string | null;
  schedule_name?: string | null;
  scheduled_by_name?: string | null;
}

export interface WorkItemScheduleFormData {
  project_id: string;
  work_item_id: string;
  schedule_id: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  planned_hours: string;
  actual_hours: string;
  status: WorkItemSchedule['status'];
  completion_percentage: string;
  is_critical_path: boolean;
  dependencies: string[];
}

export interface ScheduleAssignment {
  schedule_id: string;
  project_id: string;
  work_item_id: string;
  assigned_to: string;
  assignment_id: string;
  role: string | null;
  allocated_hours: number | null;
  assigned_at: string;
  assigned_by: string | null;
  // Enriched fields
  assigned_to_name?: string | null;
}

export type WorkItemScheduleFilterType = 'all' | string;

export interface WorkItemScheduleFilters {
  searchQuery: string;
  status: WorkItemScheduleFilterType;
}

export interface WorkItemSchedulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
