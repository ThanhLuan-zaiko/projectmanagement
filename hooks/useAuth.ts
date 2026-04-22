// Client-side hook to check authentication status
'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/utils/api-client';

interface User {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  avatar_url?: string;
  created_at: Date;
}

// Request deduplication cache
let pendingRequest: Promise<User | null> | null = null;
let cachedUser: User | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function clearAuthCache() {
  pendingRequest = null;
  cachedUser = null;
  cacheTime = 0;
}

async function fetchUser(): Promise<User | null> {
  // Return cached result if still valid
  if (cachedUser && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedUser;
  }

  // Return pending request if already in flight
  if (pendingRequest) {
    return pendingRequest;
  }

  // Create new request
  pendingRequest = (async () => {
    try {
      const response = await apiFetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        clearAuthCache();
        return null;
      }

      const data = await response.json();
      cachedUser = data.user;
      cacheTime = Date.now();
      return data.user;
    } catch {
      clearAuthCache();
      return null;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => cachedUser);
  const [loading, setLoading] = useState(() => !cachedUser);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches in React strict mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const hasCachedUser = cachedUser !== null;
    const isCacheFresh = hasCachedUser && Date.now() - cacheTime < CACHE_DURATION;

    async function getUser(background = false) {
      try {
        if (!background) {
          setLoading(true);
        }

        const userData = await fetchUser();
        setUser(userData);
        setError(null);
      } catch {
        setError('Failed to fetch user info');
        setUser(null);
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    }

    if (hasCachedUser) {
      setUser(cachedUser);
      setLoading(false);

      if (!isCacheFresh) {
        void getUser(true);
      }

      return;
    }

    void getUser();
  }, []);

  return { user, loading, error };
}

export async function logoutUser(redirectTo = '/auth/login') {
  const response = await apiFetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 401) {
    throw new Error('Logout failed');
  }

  clearAuthCache();
  window.location.href = redirectTo;
}
