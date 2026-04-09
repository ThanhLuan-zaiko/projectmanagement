// Tasks API functions
import { Task, CreateTaskInput, UpdateTaskInput } from '@/modules/tasks/types';

export async function getTasks(projectId?: string): Promise<Task[]> {
  // TODO: Implement get tasks API
  throw new Error('Not implemented');
}

export async function getTask(id: string): Promise<Task> {
  // TODO: Implement get task by ID API
  throw new Error('Not implemented');
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  // TODO: Implement create task API
  throw new Error('Not implemented');
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  // TODO: Implement update task API
  throw new Error('Not implemented');
}

export async function deleteTask(id: string): Promise<void> {
  // TODO: Implement delete task API
  throw new Error('Not implemented');
}
