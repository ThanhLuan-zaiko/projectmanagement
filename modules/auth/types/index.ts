// Auth Module Types

export type UserRole = 'admin' | 'manager' | 'expert' | 'member';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  last_login?: Date;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  token_hash: string;
  refresh_token_hash: string;
  device_info?: string;
  ip_address?: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  is_revoked: boolean;
}
