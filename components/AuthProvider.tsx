'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAutoRefreshSession } from '@/hooks/useAutoRefresh';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth'];

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading, error } = useAuth();
  useAutoRefreshSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  useEffect(() => {
    // If still loading, do nothing
    if (loading) return;

    // If authenticated and on auth routes (login/register), redirect to dashboard
    // This prevents logged-in users from visiting login/register pages
    if (user && isPublicRoute) {
      router.push('/dashboard');
      return;
    }

    // If not authenticated and on protected route, redirect to login
    if (!user && !isPublicRoute) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }
  }, [user, loading, pathname, router, isPublicRoute]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated on protected route
  if (!isPublicRoute && (!user || error)) {
    return null;
  }

  return <>{children}</>;
}
