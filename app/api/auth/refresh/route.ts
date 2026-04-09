import { NextRequest, NextResponse } from 'next/server';
import { refreshSession, getSessionCookieOptions, getRefreshTokenCookieOptions } from '@/utils/session';
import { generateCsrfToken, getCsrfCookieOptions } from '@/utils/csrf';
import { checkRateLimit, RATE_LIMITS } from '@/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `refresh:${ip}`;

    // Check rate limit (async - DB-backed)
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.refresh);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetAt);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many refresh attempts. Please try again later.',
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

    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // Attempt to refresh session
    const sessionData = await refreshSession(refreshToken);

    if (!sessionData) {
      // Refresh failed - clear cookies
      const response = NextResponse.json(
        { success: false, error: 'Session expired. Please login again.' },
        { status: 401 }
      );
      response.cookies.set('session_id', '', { maxAge: 0, path: '/' });
      response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
      response.cookies.set('csrf_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    // Generate new CSRF token
    const csrfToken = generateCsrfToken();

    // Build response
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed',
    });

    // Set new session cookie
    const sessionCookie = getSessionCookieOptions();
    response.cookies.set(
      sessionCookie.name,
      sessionData.sessionToken,
      sessionCookie.options
    );

    // Set new refresh token cookie
    const refreshTokenCookie = getRefreshTokenCookieOptions();
    response.cookies.set(
      refreshTokenCookie.name,
      sessionData.refreshToken,
      refreshTokenCookie.options
    );

    // Set new CSRF token cookie
    const csrfCookie = getCsrfCookieOptions();
    response.cookies.set(
      csrfCookie.name,
      csrfToken,
      csrfCookie.options
    );

    return response;
  } catch (error) {
    console.error('Refresh session API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
