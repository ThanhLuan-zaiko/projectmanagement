// CSRF protection utilities

import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

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
 * Read the CSRF token that was echoed by the client in a request header.
 */
export function getCsrfHeaderToken(request: NextRequest): string | null {
  return request.headers.get(CSRF_HEADER_NAME) || request.headers.get('X-CSRF-Token');
}

/**
 * Verify the request carries a matching CSRF cookie/header pair.
 */
export function verifyCsrfRequest(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value || '';
  const headerToken = getCsrfHeaderToken(request) || '';

  if (!verifyCsrfToken(cookieToken) || !verifyCsrfToken(headerToken)) {
    return false;
  }

  return cookieToken === headerToken;
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
    name: CSRF_COOKIE_NAME,
    options: {
      httpOnly: false, // Needs to be accessible by JavaScript for form submissions
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    },
  };
}
