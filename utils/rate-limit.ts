// Rate limiting utilities with ScyllaDB persistence

import { db } from '@/config';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests within the window
  failOpen?: boolean;
}

interface RateLimitRecord {
  request_count: number;
  window_start: Date;
}

/**
 * Check if a request should be rate limited (DB-backed)
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();

  try {
    // Try to get existing rate limit record
    const result = await db.execute<RateLimitRecord>(
      'SELECT request_count, window_start FROM rate_limits WHERE rate_key = ?',
      { params: [key] }
    );

    const record = result.rows[0];

    if (!record) {
      // First request - create new record
      await db.execute(
        'INSERT INTO rate_limits (rate_key, window_start, request_count) VALUES (?, ?, ?)',
        { params: [key, new Date(now), 1] }
      );

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    const windowStart = new Date(record.window_start).getTime();

    // Check if window has expired
    if (now - windowStart > config.windowMs) {
      // Reset the window
      await db.execute(
        'UPDATE rate_limits SET window_start = ?, request_count = ? WHERE rate_key = ?',
        { params: [new Date(now), 1, key] }
      );

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Window still active
    if (record.request_count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowStart + config.windowMs,
      };
    }

    // Increment count
    await db.execute(
      'UPDATE rate_limits SET request_count = ? WHERE rate_key = ?',
      { params: [record.request_count + 1, key] }
    );

    return {
      allowed: true,
      remaining: config.maxRequests - (record.request_count + 1),
      resetAt: windowStart + config.windowMs,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    const allowed = config.failOpen ?? true;

    return {
      allowed,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }
}

/**
 * Clean up expired rate limit records from DB
 */
export async function cleanupRateLimits(): Promise<void> {
  try {
    const maxWindowMs = 60 * 60 * 1000; // 1 hour
    const cutoffTime = new Date(Date.now() - maxWindowMs);

    await db.execute(
      'DELETE FROM rate_limits WHERE window_start < ?',
      { params: [cutoffTime] }
    );
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Login attempts: 5 attempts per 15 minutes per IP
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    failOpen: false,
  },

  // Register attempts: 3 per hour per IP
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    failOpen: false,
  },

  // Password reset: 3 per hour per email
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    failOpen: false,
  },

  // Refresh attempts: 10 per hour per IP
  refresh: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    failOpen: false,
  },

  // General API (including /api/auth/me): 30 per minute per IP
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    failOpen: true,
  },

  // Page requests (F5 protection): 60 per minute per IP
  page: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    failOpen: true,
  },
} as const;
