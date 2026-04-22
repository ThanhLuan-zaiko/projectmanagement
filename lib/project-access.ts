import { projectRepository, projectTeamRepository, type Project, type ProjectTeamMember } from '@/lib/project-repository';
import { routeError } from './api-route';

export type ProjectAccessMode = 'read' | 'write' | 'manage' | 'owner';

export interface ProjectAccessContext {
  project: Project;
  membership: ProjectTeamMember | null;
  isOwner: boolean;
}

function isAllowedForMode(
  mode: ProjectAccessMode,
  input: { isOwner: boolean; membership: ProjectTeamMember | null }
) {
  if (input.isOwner) {
    return true;
  }

  const membership = input.membership;

  if (!membership || !membership.is_active) {
    return false;
  }

  switch (mode) {
    case 'owner':
      return false;
    case 'manage':
      return membership.role === 'manager';
    case 'write':
    case 'read':
    default:
      return true;
  }
}

export async function requireProjectAccess(
  projectId: string,
  userId: string,
  mode: ProjectAccessMode = 'read',
  options: { includeDeleted?: boolean } = {}
): Promise<ProjectAccessContext> {
  const project = await projectRepository.findById(projectId, { includeDeleted: true });

  if (!project) {
    throw routeError(404, 'Project not found');
  }

  const isOwner = String(project.owner_id) === String(userId);
  const membership = isOwner ? null : await projectTeamRepository.getMemberRole(projectId, userId);

  if (!isAllowedForMode(mode, { isOwner, membership })) {
    throw routeError(403, 'Forbidden');
  }

  if (project.is_deleted && !options.includeDeleted) {
    throw routeError(404, 'Project not found');
  }

  return {
    project,
    membership,
    isOwner,
  };
}

export async function requireProjectCodeAccess(
  projectCode: string,
  userId: string,
  options: { includeDeleted?: boolean } = {}
): Promise<ProjectAccessContext> {
  const project = await projectRepository.findByCode(projectCode, { includeDeleted: true });

  if (!project) {
    throw routeError(404, 'Project not found');
  }

  return requireProjectAccess(project.project_id, userId, 'read', options);
}
