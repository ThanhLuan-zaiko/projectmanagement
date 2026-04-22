// Work Item types for dashboard

export interface WorkItem {
  work_item_id: string;
  project_id: string;
  title: string;
  description: string;
  work_type: 'task' | 'subtask' | 'milestone' | 'bug';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  parent_work_item_id?: string | null;
  tags: string[];
}

export interface WorkItemFormData {
  title: string;
  description: string;
  work_type: WorkItem['work_type'];
  status: WorkItem['status'];
  priority: WorkItem['priority'];
  assigned_to: string;
  due_date: string;
  estimated_hours: string;
  tags: string;
  project_id: string;
}

export type FilterType = 'all' | string;

export interface TaskFilters {
  searchQuery: string;
  filterStatus: FilterType;
  filterPriority: FilterType;
  filterType: FilterType;
}
