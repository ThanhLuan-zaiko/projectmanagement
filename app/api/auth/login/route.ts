import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/modules/auth/api';
import { createSession, getSessionCookieOptions, getRefreshTokenCookieOptions } from '@/utils/session';
import { checkRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { generateCsrfToken, getCsrfCookieOptions } from '@/utils/csrf';
import { db } from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `login:${ip}`;

    // Check rate limit (async - DB-backed)
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.login);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetAt);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: resetTime.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const result = await login({ email, password });

    if (!result.success) {
      // Track failed login attempt
      await trackFailedLogin(email);
      
      return NextResponse.json(result, { status: 401 });
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(email);

    // Create session
    const userAgent = request.headers.get('user-agent') || '';
    const sessionData = await createSession({
      userId: result.user!.user_id,
      userAgent,
      ipAddress: ip,
    });

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Build response
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Login successful',
    });

    // Set session cookie
    const sessionCookie = getSessionCookieOptions();
    response.cookies.set(
      sessionCookie.name,
      sessionData.sessionToken,
      sessionCookie.options
    );

    // Set refresh token cookie
    const refreshTokenCookie = getRefreshTokenCookieOptions();
    response.cookies.set(
      refreshTokenCookie.name,
      sessionData.refreshToken,
      refreshTokenCookie.options
    );

    // Set CSRF token cookie
    const csrfCookie = getCsrfCookieOptions();
    response.cookies.set(
      csrfCookie.name,
      csrfToken,
      csrfCookie.options
    );

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Track failed login attempts and lock account if too many failures
 */
async function trackFailedLogin(email: string): Promise<void> {
  try {
    const userResult = await db.execute(
      'SELECT user_id, login_attempts, locked_until FROM users WHERE email = ? ALLOW FILTERING',
      { params: [email] }
    );

    const user = userResult.rows[0];
    if (!user) return;

    const now = new Date();
    const currentAttempts = (user.login_attempts as number) || 0;
    const lockedUntil = user.locked_until as Date | undefined;

    // If account is already locked, check if lock has expired
    if (lockedUntil && lockedUntil > now) {
      return; // Still locked
    }

    // Increment attempts
    const newAttempts = currentAttempts + 1;

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      const lockedUntilTime = new Date(now.getTime() + lockDuration);

      await db.execute(
        'UPDATE users SET login_attempts = ?, locked_until = ? WHERE user_id = ?',
        { params: [newAttempts, lockedUntilTime, user.user_id] }
      );
    } else {
      await db.execute(
        'UPDATE users SET login_attempts = ? WHERE user_id = ?',
        { params: [newAttempts, user.user_id] }
      );
    }
  } catch (error) {
    console.error('Failed to track login attempt:', error);
  }
}

/**
 * Reset login attempts after successful login
 */
async function resetLoginAttempts(email: string): Promise<void> {
  try {
    await db.execute(
      'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = ? ALLOW FILTERING',
      { params: [email] }
    );
  } catch (error) {
    console.error('Failed to reset login attempts:', error);
  }
}
