// Server-side session validation HOC
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

interface WithAuthOptions {
  redirectTo?: string;
}

/**
 * Server Component wrapper to require authentication
 * Usage: export const Page = withAuth(async function Page() { ... });
 */
export function withAuth<P extends {}>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/auth/login' } = options;

  return async function AuthenticatedComponent(props: P) {
    const user = await getCurrentUser();

    if (!user) {
      redirect(redirectTo);
    }

    return React.createElement(Component, props);
  };
}

/**
 * Server-side check for API routes or utilities
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
