import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/utils/session';
import { db } from '@/config';

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_id')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session in DB
    const userId = await validateSession(sessionToken);

    if (!userId) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
      // Clear invalid cookies
      response.cookies.set('session_id', '', { maxAge: 0, path: '/' });
      response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    // Fetch user from database
    const result = await db.execute(
      'SELECT user_id, email, username, full_name, role, status, email_verified, avatar_url, created_at FROM users WHERE user_id = ?',
      { params: [userId] }
    );

    const user = result.rows[0];

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=5, no-store',
      },
    });
  } catch (error) {
    console.error('Get current user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
