import { NextRequest, NextResponse } from 'next/server';
import { validateSession, revokeSessionByUserId } from '@/utils/session';
import { db } from '@/config';
import { handleRouteError, requireCsrf } from '@/lib/api-route';

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_id')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session and get user ID
    const userId = await validateSession(sessionToken);

    if (!userId) {
      // Session is invalid or expired, clear cookies anyway
      return clearAuthCookies();
    }

    // Get session from DB to find session_id
    const sessionResult = await db.execute(
      'SELECT session_id FROM user_sessions WHERE user_id = ? ALLOW FILTERING',
      { params: [userId] }
    );

    // Revoke all sessions for this user
    for (const session of sessionResult.rows) {
      await revokeSessionByUserId(userId, session.session_id as string);
    }

    // Clear auth cookies
    return clearAuthCookies();
  } catch (error) {
    return handleRouteError(error, 'Internal server error');
  }
}

/**
 * Clear all authentication cookies
 */
function clearAuthCookies(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear session cookie
  response.cookies.set('session_id', '', { maxAge: 0, path: '/' });
  
  // Clear refresh token cookie
  response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
  
  // Clear CSRF token cookie
  response.cookies.set('csrf_token', '', { maxAge: 0, path: '/' });

  return response;
}
