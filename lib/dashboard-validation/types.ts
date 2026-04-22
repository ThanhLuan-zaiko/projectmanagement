import type { CostEstimate } from '@/lib/cost-estimate-repository';
import type { ExpertTimeEstimate } from '@/lib/expert-estimate-repository';
import type { ProjectSchedule } from '@/lib/project-schedule-repository';
import type { ProjectTeamMember } from '@/lib/project-repository';
import type { WorkItem } from '@/lib/work-item-repository';
import type { WorkItemSchedule } from '@/lib/work-schedule-repository';

export type FieldErrors = Record<string, string>;

export interface ValidationResult<T> {
  sanitizedData: T | null;
  fieldErrors: FieldErrors;
}

export type ValidationMode = 'create' | 'update';

export type WorkItemPayload = {
  project_id: string;
  title?: string;
  description?: string;
  work_type?: WorkItem['work_type'];
  status?: WorkItem['status'];
  priority?: WorkItem['priority'];
  assigned_to?: string | null;
  due_date?: Date | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  parent_work_item_id?: string | null;
  tags?: string[];
  attachments?: string[];
};

export type ExpertPayload = {
  project_id: string;
  user_id?: string | null;
  name?: string;
  email?: string | null;
  specialization?: string[];
  experience_years?: number | null;
  hourly_rate?: number | null;
  currency?: string;
  availability_status?: 'available' | 'busy' | 'unavailable';
  rating?: number | null;
  is_active?: boolean;
};

export type CostEstimatePayload = {
  project_id: string;
  work_item_id: string;
  estimate_type?: CostEstimate['estimate_type'];
  estimated_cost?: number | null;
  currency?: string;
  hourly_rate?: number | null;
  hours?: number | null;
  quantity?: number | null;
  unit_cost?: number | null;
  notes?: string | null;
  status?: CostEstimate['status'];
};

export type ExpertEstimatePayload = {
  project_id: string;
  work_item_id: string;
  expert_id: string;
  estimated_hours?: number | null;
  confidence_level?: ExpertTimeEstimate['confidence_level'];
  estimation_method?: ExpertTimeEstimate['estimation_method'];
  optimistic_hours?: number | null;
  most_likely_hours?: number | null;
  pessimistic_hours?: number | null;
  notes?: string | null;
};

export type ProjectSchedulePayload = {
  project_id: string;
  schedule_name?: string;
  schedule_type?: ProjectSchedule['schedule_type'];
  start_date?: Date | null;
  end_date?: Date | null;
  status?: ProjectSchedule['status'];
  progress_percentage?: number | null;
  parent_schedule_id?: string | null;
};

export type WorkSchedulePayload = {
  project_id: string;
  work_item_id?: string | null;
  schedule_id?: string | null;
  planned_start_date?: Date | null;
  planned_end_date?: Date | null;
  actual_start_date?: Date | null;
  actual_end_date?: Date | null;
  planned_hours?: number | null;
  actual_hours?: number | null;
  status?: WorkItemSchedule['status'];
  completion_percentage?: number | null;
  is_critical_path?: boolean;
  dependencies?: string[];
};

export type TeamMemberPayload = {
  member_id: string;
  role?: ProjectTeamMember['role'];
  permissions?: string[];
};

export type TeamMemberValidationMode = 'create' | 'updateRole';
