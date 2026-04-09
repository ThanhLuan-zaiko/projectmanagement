// Session management utilities

import crypto from 'crypto';
import { db } from '@/config';
import { generateUUIDv7 } from './uuid';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_TOKEN_DURATION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

interface SessionData {
  session_id: string;
  user_id: string;
  token_hash: string;
  refresh_token_hash: string;
  device_info: string;
  ip_address: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  is_revoked: boolean;
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a random token
 */
function generateToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Get device info from user agent
 */
function getDeviceInfo(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  const isEdge = /Edge/i.test(userAgent);
  
  let browser = 'Unknown';
  if (isEdge) browser = 'Edge';
  else if (isChrome) browser = 'Chrome';
  else if (isFirefox) browser = 'Firefox';
  else if (isSafari) browser = 'Safari';
  
  return `${isMobile ? 'Mobile' : 'Desktop'} ${browser}`;
}

/**
 * Create a new session for a user
 */
export async function createSession(input: {
  userId: string;
  userAgent: string;
  ipAddress: string;
}): Promise<{ sessionToken: string; refreshToken: string; expiresAt: Date }> {
  const sessionId = generateUUIDv7();
  const sessionToken = generateToken();
  const refreshToken = generateToken();
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const refreshTokenExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_DURATION_MS);
  
  const tokenHash = hashToken(sessionToken);
  const refreshTokenHash = hashToken(refreshToken);
  
  const deviceInfo = getDeviceInfo(input.userAgent);
  
  // Store session in database
  await db.execute(
    `INSERT INTO user_sessions (
      session_id, user_id, token_hash, refresh_token_hash,
      device_info, ip_address, expires_at, created_at,
      last_activity, is_revoked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      params: [
        sessionId,
        input.userId,
        tokenHash,
        refreshTokenHash,
        deviceInfo,
        input.ipAddress,
        expiresAt,
        now,
        now,
        false,
      ],
    }
  );
  
  // Also store in sessions_by_token for quick lookup
  await db.execute(
    `INSERT INTO sessions_by_token (
      token_hash, session_id, user_id, expires_at, is_revoked
    ) VALUES (?, ?, ?, ?, ?)`,
    {
      params: [
        tokenHash,
        sessionId,
        input.userId,
        expiresAt,
        false,
      ],
    }
  );
  
  // Also store in sessions_by_refresh_token for quick refresh lookup
  await db.execute(
    `INSERT INTO sessions_by_refresh_token (
      refresh_token_hash, session_id, user_id, expires_at, is_revoked
    ) VALUES (?, ?, ?, ?, ?)`,
    {
      params: [
        refreshTokenHash,
        sessionId,
        input.userId,
        refreshTokenExpiresAt,
        false,
      ],
    }
  );
  
  return {
    sessionToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Validate a session token and return user ID if valid
 */
export async function validateSession(sessionToken: string): Promise<string | null> {
  const tokenHash = hashToken(sessionToken);
  
  // Lookup by token hash
  const result = await db.execute<SessionData>(
    'SELECT * FROM sessions_by_token WHERE token_hash = ?',
    { params: [tokenHash] }
  );
  
  const session = result.rows[0];
  
  if (!session || session.is_revoked) {
    return null;
  }
  
  // Check if session has expired
  if (new Date() > session.expires_at) {
    return null;
  }
  
  // Double-check revoked status and update last activity on main table
  const mainResult = await db.execute<SessionData>(
    'SELECT is_revoked FROM user_sessions WHERE user_id = ? AND session_id = ?',
    { params: [session.user_id, session.session_id] }
  );
  
  const mainSession = mainResult.rows[0];
  if (!mainSession || mainSession.is_revoked) {
    return null;
  }
  
  await db.execute(
    'UPDATE user_sessions SET last_activity = ? WHERE user_id = ? AND session_id = ?',
    { params: [new Date(), session.user_id, session.session_id] }
  );
  
  return session.user_id;
}

/**
 * Refresh a session using a refresh token
 */
export async function refreshSession(refreshToken: string): Promise<{
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
} | null> {
  const refreshTokenHash = hashToken(refreshToken);
  
  // Find session by refresh token (indexed lookup)
  const result = await db.execute<SessionData>(
    'SELECT * FROM sessions_by_refresh_token WHERE refresh_token_hash = ?',
    { params: [refreshTokenHash] }
  );
  
  const session = result.rows[0];
  
  if (!session || session.is_revoked) {
    return null;
  }
  
  // Check refresh token expiry
  const refreshTokenExpiry = new Date(session.created_at.getTime() + REFRESH_TOKEN_DURATION_MS);
  if (new Date() > refreshTokenExpiry) {
    // Revoke the session
    await revokeSessionByUserId(session.user_id, session.session_id);
    return null;
  }
  
  // Double-check revoked status on main table
  const mainResult = await db.execute<SessionData>(
    'SELECT is_revoked FROM user_sessions WHERE user_id = ? AND session_id = ?',
    { params: [session.user_id, session.session_id] }
  );
  
  const mainSession = mainResult.rows[0];
  if (!mainSession || mainSession.is_revoked) {
    return null;
  }
  
  // Revoke old session
  await revokeSessionByUserId(session.user_id, session.session_id);
  
  // Create new session for the same user
  return createSession({
    userId: session.user_id,
    userAgent: session.device_info || '',
    ipAddress: session.ip_address || '',
  });
}

/**
 * Revoke a single session
 */
export async function revokeSessionByUserId(userId: string, sessionId: string): Promise<void> {
  // Update main table with full PRIMARY KEY
  await db.execute(
    'UPDATE user_sessions SET is_revoked = true WHERE user_id = ? AND session_id = ?',
    { params: [userId, sessionId] }
  );
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const result = await db.execute<SessionData>(
    'SELECT session_id FROM user_sessions WHERE user_id = ? ALLOW FILTERING',
    { params: [userId] }
  );

  for (const session of result.rows) {
    await revokeSessionByUserId(userId, session.session_id);
  }
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(userId: string): Promise<Partial<SessionData>[]> {
  const result = await db.execute<SessionData>(
    'SELECT session_id, device_info, ip_address, created_at, last_activity, expires_at FROM user_sessions WHERE user_id = ? ALLOW FILTERING',
    { params: [userId] }
  );
  
  return result.rows.filter(s => !s.is_revoked && new Date() < s.expires_at);
}

/**
 * Get session cookie configuration
 */
export function getSessionCookieOptions(): {
  name: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
    maxAge: number;
  };
} {
  return {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds
    },
  };
}

/**
 * Get refresh token cookie configuration
 */
export function getRefreshTokenCookieOptions(): {
  name: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
    maxAge: number;
  };
} {
  return {
    name: 'refresh_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_DURATION_MS / 1000,
    },
  };
}
