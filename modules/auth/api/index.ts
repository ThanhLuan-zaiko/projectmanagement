// Auth API functions
import { LoginCredentials, RegisterCredentials, AuthSession } from '@/modules/auth/types';

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  // TODO: Implement login API
  throw new Error('Not implemented');
}

export async function register(credentials: RegisterCredentials): Promise<AuthSession> {
  // TODO: Implement register API
  throw new Error('Not implemented');
}

export async function logout(): Promise<void> {
  // TODO: Implement logout API
  throw new Error('Not implemented');
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  // TODO: Implement get current user API
  throw new Error('Not implemented');
}
