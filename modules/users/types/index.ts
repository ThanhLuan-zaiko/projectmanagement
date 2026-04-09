export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}
