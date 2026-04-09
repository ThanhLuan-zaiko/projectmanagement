// Auth API functions

import { db, QueryBuilder } from '@/config';
import { generateUUIDv7 } from '@/utils/uuid';
import { hashPassword, verifyPassword } from '@/utils/password';
import type {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
  UserRole,
  UserStatus,
} from '@/modules/auth/types';

interface UserWithCredentials extends User {
  password_hash?: string;
  password_salt?: string;
}

async function getUserByEmail(email: string): Promise<UserWithCredentials | null> {
  const result = await db.execute<UserWithCredentials>(
    'SELECT * FROM users WHERE email = ? ALLOW FILTERING',
    { params: [email] }
  );
  return result.rows[0] || null;
}

async function getUserByUsername(username: string): Promise<UserWithCredentials | null> {
  const result = await db.execute<UserWithCredentials>(
    'SELECT * FROM users WHERE username = ? ALLOW FILTERING',
    { params: [username] }
  );
  return result.rows[0] || null;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  try {
    // Check if email already exists
    const existingEmail = await getUserByEmail(input.email);
    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(input.username);
    if (existingUsername) {
      return { success: false, error: 'Username already taken' };
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Generate UUID v7
    const userId = generateUUIDv7();
    const now = new Date();

    // Insert user
    await db.execute(
      `INSERT INTO users (
        user_id, email, username, password_hash, full_name, phone, 
        role, status, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        params: [
          userId,
          input.email,
          input.username,
          passwordHash,
          input.full_name,
          input.phone || null,
          'member' as UserRole,
          'active' as UserStatus,
          false,
          now,
          now,
        ],
      }
    );

    // Fetch created user
    const user = await getUserByEmail(input.email);
    if (!user) {
      return { success: false, error: 'Failed to create user' };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  try {
    // Find user by email
    const user = await getUserByEmail(input.email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.password_hash!, input.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user is active
    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active' };
    }

    // Update last login
    await db.execute(
      'UPDATE users SET last_login = ? WHERE user_id = ?',
      { params: [new Date(), user.user_id] }
    );

    // Remove sensitive data
    const { password_hash, password_salt, ...safeUser } = user;

    return {
      success: true,
      user: safeUser as User,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}
