// CSRF protection utilities

import crypto from 'crypto';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('base64url');
  return token;
}

/**
 * Verify a CSRF token matches the expected format
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic validation - should be base64url encoded
  const csrfRegex = /^[A-Za-z0-9_-]+$/;
  return csrfRegex.test(token) && token.length > 0;
}

/**
 * Get CSRF token cookie configuration
 */
export function getCsrfCookieOptions(): {
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
    name: 'csrf_token',
    options: {
      httpOnly: false, // Needs to be accessible by JavaScript for form submissions
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    },
  };
}
