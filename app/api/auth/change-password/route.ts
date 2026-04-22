import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/utils/session';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/utils/password';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';

export async function POST(request: NextRequest) {
  try {
    requireCsrf(request);
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_id')?.value;

    if (!sessionToken) {
      return errorResponse(401, 'Not authenticated');
    }

    // Validate session and get user ID
    const userId = await validateSession(sessionToken);

    if (!userId) {
      return errorResponse(401, 'Not authenticated');
    }

    // Parse request body
    const body = await parseJsonBody<{
      currentPassword?: unknown;
      newPassword?: unknown;
    }>(request);
    const { currentPassword, newPassword } = body;

    // Validate input
    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword ||
      !newPassword
    ) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Password too weak', errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Get user from database
    const userResult = await db.execute(
      'SELECT user_id, password_hash FROM users WHERE user_id = ?',
      { params: [userId] }
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const passwordHash = user.password_hash as string;

    // Verify current password
    const isPasswordValid = await verifyPassword(passwordHash, currentPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is the same as current password
    const isSamePassword = await verifyPassword(passwordHash, newPassword);

    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = toTimestamp(now()) WHERE user_id = ?',
      { params: [newPasswordHash, userId] }
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Internal server error');
  }
}
