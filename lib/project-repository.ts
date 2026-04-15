// Project Repository
import { BaseRepository } from './repository';
import { db, insert, type QueryOptions } from '@/config';

export interface Project extends Record<string, unknown> {
  project_id: string;
  project_code: string;
  project_name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  project_leader_id: string | null;
  start_date: Date | null;
  target_end_date: Date | null;
  actual_end_date: Date | null;
  budget: number | null;
  currency: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  is_deleted: boolean;
  deleted_at: Date | null;
  deleted_by: string | null;
}

export interface ProjectTeamMember extends Record<string, unknown> {
  project_id: string;
  member_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  joined_at: Date;
  left_at: Date | null;
  is_active: boolean;
  added_by: string;
}

interface ProjectQueryOptions {
  includeDeleted?: boolean;
  deletedOnly?: boolean;
}

type ProjectFindOptions = QueryOptions & ProjectQueryOptions;

export class ProjectRepository extends BaseRepository<Project> {
  protected tableName = 'projects';
  protected primaryKey = 'project_id';

  private normalizeProject(project: Project): Project {
    return {
      ...project,
      is_deleted: Boolean(project.is_deleted),
      deleted_at: project.deleted_at ?? null,
      deleted_by: project.deleted_by ?? null,
    };
  }

  private filterDeletedProjects(projects: Project[], options?: ProjectQueryOptions): Project[] {
    const normalizedProjects = projects.map((project) => this.normalizeProject(project));

    if (options?.deletedOnly) {
      return normalizedProjects.filter((project) => project.is_deleted);
    }

    if (options?.includeDeleted) {
      return normalizedProjects;
    }

    return normalizedProjects.filter((project) => !project.is_deleted);
  }

  // Generate unique project code
  generateProjectCode(): string {
    const prefix = 'PROJ';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  }

  // Find project by code
  async findByCode(projectCode: string, options?: ProjectFindOptions): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE project_code = ?';
    const result = await db.execute<Project>(query, { params: [projectCode] });
    const project = result.rows[0];

    if (!project) {
      return null;
    }

    return this.filterDeletedProjects([project], options)[0] || null;
  }

  async findById(id: string, options?: ProjectFindOptions): Promise<Project | null> {
    const project = await super.findById(id, options);

    if (!project) {
      return null;
    }

    return this.filterDeletedProjects([project], options)[0] || null;
  }

  // Create project with auto-generated code
  async createProject(data: Partial<Project>): Promise<Project> {
    const projectCode = data.project_code || this.generateProjectCode();
    const now = new Date();

    const projectData = {
      project_id: data.project_id || crypto.randomUUID(),
      project_code: projectCode,
      project_name: data.project_name || '',
      description: data.description || '',
      status: data.status || 'planning',
      project_leader_id: data.project_leader_id || null,
      start_date: data.start_date || now,
      target_end_date: data.target_end_date || null,
      actual_end_date: data.actual_end_date || null,
      budget: data.budget || null,
      currency: data.currency || 'USD',
      owner_id: data.owner_id,
      created_by: data.created_by || data.owner_id,
      created_at: now,
      updated_at: now,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
    };

    const { query, params } = insert(this.tableName, projectData as Record<string, unknown>);
    await db.execute(query, { params });

    return projectData as Project;
  }

  // Get projects by owner
  async findByOwnerId(ownerId: string, options?: ProjectFindOptions): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE owner_id = ?';
    const result = await db.execute<Project>(query, { params: [ownerId] });
    return this.filterDeletedProjects(result.rows, options);
  }

  // Get projects by project leader
  async findByProjectLeader(leaderId: string, options?: ProjectFindOptions): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE project_leader_id = ?';
    const result = await db.execute<Project>(query, { params: [leaderId] });
    return this.filterDeletedProjects(result.rows, options);
  }

  // Get projects user is involved in
  async findUserProjects(userId: string, options?: ProjectFindOptions): Promise<Project[]> {
    const memberships = await projectTeamRepository.getUserProjects(userId);
    const projects = await Promise.all(
      memberships.map((membership) => this.findById(membership.project_id, options))
    );

    return projects.filter((project): project is Project => project !== null);
  }

  // Update project
  async updateProject(projectId: string, data: Partial<Project>): Promise<Project | null> {
    await this.update(projectId, {
      ...data,
      updated_at: new Date(),
    });

    return this.findById(projectId, { includeDeleted: true });
  }

  async softDeleteProject(projectId: string, deletedBy: string): Promise<boolean> {
    const now = new Date();
    const query = 'UPDATE projects SET is_deleted = true, deleted_at = ?, deleted_by = ?, updated_at = ? WHERE project_id = ?';
    await db.execute(query, { params: [now, deletedBy, now, projectId] });
    return true;
  }

  async restoreProject(projectId: string): Promise<boolean> {
    const now = new Date();
    const query = 'UPDATE projects SET is_deleted = false, deleted_at = ?, deleted_by = ?, updated_at = ? WHERE project_id = ?';
    await db.execute(query, { params: [null, null, now, projectId] });
    return true;
  }

  // Delete project
  async deleteProject(projectId: string): Promise<boolean> {
    return this.delete(projectId);
  }
}

export class ProjectTeamRepository extends BaseRepository<ProjectTeamMember> {
  protected tableName = 'project_team';
  protected primaryKey = 'member_id';

  // Add team member
  async addMember(
    projectId: string,
    memberId: string,
    role: ProjectTeamMember['role'],
    addedBy: string,
    permissions: string[] = []
  ): Promise<ProjectTeamMember> {
    const now = new Date();
    const memberData = {
      project_id: projectId,
      member_id: memberId,
      role,
      permissions,
      joined_at: now,
      left_at: null,
      is_active: true,
      added_by: addedBy,
    };

    const { query, params } = insert(this.tableName, memberData as Record<string, unknown>);
    await db.execute(query, { params });

    return memberData as ProjectTeamMember;
  }

  // Get team members for a project
  async getProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
    const query = 'SELECT * FROM project_team WHERE project_id = ?';
    const result = await db.execute<ProjectTeamMember>(query, { params: [projectId] });
    return result.rows.filter((member) => member.is_active);
  }

  // Get user's role in a project
  async getMemberRole(projectId: string, memberId: string): Promise<ProjectTeamMember | null> {
    const query = 'SELECT * FROM project_team WHERE project_id = ? AND member_id = ?';
    const result = await db.execute<ProjectTeamMember>(query, { params: [projectId, memberId] });
    return result.rows[0] || null;
  }

  // Remove team member (soft delete)
  async removeMember(projectId: string, memberId: string): Promise<boolean> {
    const query = 'UPDATE project_team SET is_active = false, left_at = ? WHERE project_id = ? AND member_id = ?';
    await db.execute(query, { params: [new Date(), projectId, memberId] });
    return true;
  }

  // Update team member role
  async updateMemberRole(
    projectId: string,
    memberId: string,
    role: ProjectTeamMember['role']
  ): Promise<ProjectTeamMember | null> {
    const query = 'UPDATE project_team SET role = ? WHERE project_id = ? AND member_id = ?';
    await db.execute(query, { params: [role, projectId, memberId] });
    return this.getMemberRole(projectId, memberId);
  }

  // Get projects for a user
  async getUserProjects(userId: string): Promise<ProjectTeamMember[]> {
    const query = 'SELECT * FROM project_team WHERE member_id = ?';
    const result = await db.execute<ProjectTeamMember>(query, { params: [userId] });
    return result.rows.filter((membership) => membership.is_active);
  }

  // Check if user is team member
  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.getMemberRole(projectId, userId);
    return member !== null && member.is_active;
  }
}

export const projectRepository = new ProjectRepository();
export const projectTeamRepository = new ProjectTeamRepository();
