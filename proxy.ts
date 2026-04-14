import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/utils/rate-limit';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/projects'];

// Dynamic project routes that also require auth
const projectRoutes = ['/[']; // Matches /[projectCode]/...

// Routes that should redirect to projects if already authenticated
const authRoutes = ['/auth'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static files and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rate limiting for page requests (anti-F5 spam)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `page:${ip}`;
  
  try {
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.page);
    
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetAt);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please slow down.',
          retryAfter: resetTime.toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  } catch (error) {
    // If rate limiting fails, allow the request
    console.warn('Rate limit check failed:', error);
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get('session_id')?.value;

  // Check if user has a session token (we'll validate it server-side)
  const hasSession = !!sessionToken;

  // If trying to access auth pages while having a session, redirect to projects
  // This prevents logged-in users from visiting login/register pages
  if (hasSession && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  // If trying to access protected routes without session, redirect to login
  if (!hasSession && (protectedRoutes.some(route => pathname.startsWith(route)) || projectRoutes.some(route => pathname.startsWith(route)))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|$).*)',
  ],
};
