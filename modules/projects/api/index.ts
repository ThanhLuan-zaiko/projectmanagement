// Projects API functions
import { Project, CreateProjectInput, UpdateProjectInput } from '@/modules/projects/types';

export async function getProjects(): Promise<Project[]> {
  // TODO: Implement get projects API
  throw new Error('Not implemented');
}

export async function getProject(id: string): Promise<Project> {
  // TODO: Implement get project by ID API
  throw new Error('Not implemented');
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  // TODO: Implement create project API
  throw new Error('Not implemented');
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  // TODO: Implement update project API
  throw new Error('Not implemented');
}

export async function deleteProject(id: string): Promise<void> {
  // TODO: Implement delete project API
  throw new Error('Not implemented');
}
