// Users API functions
import { User, CreateUserInput, UpdateUserInput } from '@/modules/users/types';

export async function getUsers(): Promise<User[]> {
  // TODO: Implement get users API
  throw new Error('Not implemented');
}

export async function getUser(id: string): Promise<User> {
  // TODO: Implement get user by ID API
  throw new Error('Not implemented');
}

export async function createUser(input: CreateUserInput): Promise<User> {
  // TODO: Implement create user API
  throw new Error('Not implemented');
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  // TODO: Implement update user API
  throw new Error('Not implemented');
}

export async function deleteUser(id: string): Promise<void> {
  // TODO: Implement delete user API
  throw new Error('Not implemented');
}
