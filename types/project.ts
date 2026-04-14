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
