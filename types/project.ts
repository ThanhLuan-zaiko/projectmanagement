// Project types for project management

export interface Project {
  project_id: string;
  project_code: string;
  project_name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  project_leader_id: string | null;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  budget: number | null;
  currency: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  membership_role?: ProjectRole;
  access_type?: 'owned' | 'member';
  team_size?: number;
}

export interface ProjectFormData {
  project_name: string;
  description: string;
  status: Project['status'];
  project_leader_id?: string;
  start_date?: string;
  target_end_date?: string;
  budget?: string;
  currency?: string;
}

export interface ProjectFormErrors {
  project_name?: string;
  description?: string;
  status?: string;
  project_code?: string;
  start_date?: string;
  target_end_date?: string;
  budget?: string;
  currency?: string;
  form?: string;
}

export interface ProjectTeamMember {
  project_id: string;
  member_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
  added_by: string;
  // Joined user info
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface ProjectWithTeam extends Project {
  team_members: ProjectTeamMember[];
}

export type ProjectRole = ProjectTeamMember['role'];

export interface ProjectSummaryKpis {
  total_projects: number;
  owned_projects: number;
  collaborating_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  deleted_projects: number;
  total_budget: number;
}

export interface ProjectStatusChartDatum {
  name: string;
  value: number;
}

export interface ProjectBudgetChartDatum {
  name: string;
  budget: number;
  status: Project['status'];
}

export interface ProjectTimelineChartDatum {
  label: string;
  created: number;
  completed: number;
}

export interface ProjectSummaryResponse {
  kpis: ProjectSummaryKpis;
  status_distribution: ProjectStatusChartDatum[];
  budget_distribution: ProjectBudgetChartDatum[];
  timeline: ProjectTimelineChartDatum[];
  recent_projects: Project[];
  recent_deleted_projects: Project[];
}
