// Server-side helper to get current user from request
import { cookies } from 'next/headers';
import { validateSession } from '@/utils/session';
import { db } from '@/config';

export interface CurrentUser {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  status: string;
  email_verified: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_id')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const userId = await validateSession(sessionToken);
  
  if (!userId) {
    return null;
  }
  
  // Fetch user from database
  const result = await db.execute<CurrentUser>(
    'SELECT user_id, email, username, full_name, role, status, email_verified FROM users WHERE user_id = ?',
    { params: [userId] }
  );
  
  return result.rows[0] || null;
}
