// Database cleanup utilities

import { db } from '@/config';

/**
 * Clean up expired sessions from database
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const now = new Date();

    // Find all expired sessions
    const result = await db.execute(
      'SELECT user_id, session_id FROM user_sessions WHERE expires_at < ? ALLOW FILTERING',
      { params: [now] }
    );

    // Delete each expired session from all tables
    let deletedCount = 0;
    for (const session of result.rows) {
      await db.execute(
        'DELETE FROM user_sessions WHERE user_id = ? AND session_id = ?',
        { params: [session.user_id, session.session_id] }
      );
      
      await db.execute(
        'DELETE FROM sessions_by_token WHERE session_id = ? ALLOW FILTERING',
        { params: [session.session_id] }
      );
      
      await db.execute(
        'DELETE FROM sessions_by_refresh_token WHERE session_id = ? ALLOW FILTERING',
        { params: [session.session_id] }
      );
      
      deletedCount++;
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredResetTokens(): Promise<number> {
  try {
    const now = new Date();

    const result = await db.execute(
      'SELECT email, reset_token FROM password_resets WHERE expires_at < ? ALLOW FILTERING',
      { params: [now] }
    );

    let deletedCount = 0;
    for (const token of result.rows) {
      await db.execute(
        'DELETE FROM password_resets WHERE email = ? AND reset_token = ?',
        { params: [token.email, token.reset_token] }
      );
      deletedCount++;
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup expired reset tokens:', error);
    return 0;
  }
}

/**
 * Clean up expired rate limit records
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    await db.execute(
      'DELETE FROM rate_limits WHERE window_start < ?',
      { params: [cutoffTime] }
    );

    return 1;
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
    return 0;
  }
}

/**
 * Run all cleanup tasks
 */
export async function runCleanupTasks(): Promise<{
  sessions: number;
  resetTokens: number;
  rateLimits: number;
}> {
  const [sessions, resetTokens, rateLimits] = await Promise.all([
    cleanupExpiredSessions(),
    cleanupExpiredResetTokens(),
    cleanupExpiredRateLimits(),
  ]);

  return { sessions, resetTokens, rateLimits };
}
