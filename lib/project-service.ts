import type { ProjectRole } from '@/types/project';
import { projectRepository, projectTeamRepository, type Project } from './project-repository';

export interface ProjectListItem extends Project {
  membership_role?: ProjectRole;
  access_type: 'owned' | 'member';
  team_size: number;
}

export interface ProjectPortfolioOptions {
  scope?: 'owned' | 'member' | 'all';
  search?: string;
  status?: string;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProjectPortfolioResult {
  items: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function matchesSearch(project: Project, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [project.project_name, project.project_code, project.description]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedSearch));
}

function compareProjects(a: ProjectListItem, b: ProjectListItem, sortBy: string, sortOrder: 'asc' | 'desc') {
  const direction = sortOrder === 'asc' ? 1 : -1;

  const getSortableValue = (project: ProjectListItem) => {
    switch (sortBy) {
      case 'project_name':
        return project.project_name.toLowerCase();
      case 'budget':
        return Number(project.budget || 0);
      case 'target_end_date':
        return project.target_end_date ? new Date(project.target_end_date).getTime() : 0;
      case 'status':
        return project.status;
      case 'team_size':
        return project.team_size;
      case 'updated_at':
        return new Date(project.updated_at).getTime();
      case 'created_at':
      default:
        return new Date(project.created_at).getTime();
    }
  };

  const aValue = getSortableValue(a);
  const bValue = getSortableValue(b);

  if (aValue < bValue) {
    return -1 * direction;
  }

  if (aValue > bValue) {
    return 1 * direction;
  }

  return 0;
}

function filterProjects(projects: ProjectListItem[], options: ProjectPortfolioOptions) {
  return projects.filter((project) => {
    const matchesDeleted =
      options.deletedOnly
        ? project.is_deleted
        : options.includeDeleted
          ? true
          : !project.is_deleted;

    const matchesStatus =
      !options.status || options.status === 'all'
        ? true
        : project.status === options.status;

    return matchesDeleted && matchesStatus && matchesSearch(project, options.search || '');
  });
}

async function toProjectListItem(
  project: Project,
  accessType: 'owned' | 'member',
  membershipRole?: ProjectRole
): Promise<ProjectListItem> {
  const teamSize = (await projectTeamRepository.getProjectTeam(project.project_id)).length;

  return {
    ...project,
    access_type: accessType,
    membership_role: membershipRole,
    team_size: teamSize,
  };
}

export async function getOwnedProjectItems(userId: string, options: ProjectPortfolioOptions = {}) {
  const projects = await projectRepository.findByOwnerId(userId, { includeDeleted: true });
  const items = await Promise.all(
    projects.map((project) => toProjectListItem(project, 'owned', 'owner'))
  );

  return filterProjects(items, options);
}

export async function getMemberProjectItems(userId: string, options: ProjectPortfolioOptions = {}) {
  const memberships = await projectTeamRepository.getUserProjects(userId);
  const items = await Promise.all(
    memberships.map(async (membership) => {
      const project = await projectRepository.findById(membership.project_id, { includeDeleted: true });

      if (!project || project.owner_id === userId) {
        return null;
      }

      return toProjectListItem(project, 'member', membership.role);
    })
  );

  return filterProjects(
    items.filter((item): item is ProjectListItem => item !== null),
    options
  );
}

export async function getProjectPortfolio(
  userId: string,
  options: ProjectPortfolioOptions = {}
): Promise<ProjectPortfolioResult> {
  const scope = options.scope || 'all';
  const page = Math.max(options.page || 1, 1);
  const limit = Math.max(options.limit || 6, 1);
  const sortBy = options.sortBy || 'updated_at';
  const sortOrder = options.sortOrder || 'desc';

  const [ownedItems, memberItems] = await Promise.all([
    scope === 'member' ? Promise.resolve([]) : getOwnedProjectItems(userId, options),
    scope === 'owned' ? Promise.resolve([]) : getMemberProjectItems(userId, options),
  ]);

  const allItems =
    scope === 'owned'
      ? ownedItems
      : scope === 'member'
        ? memberItems
        : [...ownedItems, ...memberItems];

  const sortedItems = [...allItems].sort((a, b) => compareProjects(a, b, sortBy, sortOrder));
  const total = sortedItems.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const offset = (page - 1) * limit;

  return {
    items: sortedItems.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
