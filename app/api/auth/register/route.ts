import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/modules/auth/api';
import { createSession, getSessionCookieOptions, getRefreshTokenCookieOptions } from '@/utils/session';
import { checkRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { generateCsrfToken, getCsrfCookieOptions } from '@/utils/csrf';
import { validatePasswordStrength } from '@/utils/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, full_name, phone } = body;

    if (!email || !username || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password does not meet requirements',
          passwordErrors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `register:${ip}`;

    // Check rate limit (async - DB-backed)
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.register);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetAt);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many registration attempts. Please try again later.',
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

    const result = await register({ email, username, password, full_name, phone });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Auto-login after successful registration
    const userAgent = request.headers.get('user-agent') || '';
    const sessionData = await createSession({
      userId: result.user!.user_id,
      userAgent,
      ipAddress: ip,
    });

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Build response
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: 'Registration successful',
      },
      { status: 201 }
    );

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
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
