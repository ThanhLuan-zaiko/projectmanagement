// Client-side hook to check authentication status
'use client';

import { useEffect, useState, useRef } from 'react';

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
const CACHE_DURATION = 5000; // 5 seconds cache

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
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        cachedUser = null;
        return null;
      }

      const data = await response.json();
      cachedUser = data.user;
      cacheTime = Date.now();
      return data.user;
    } catch (err) {
      cachedUser = null;
      return null;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches in React strict mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function getUser() {
      try {
        const userData = await fetchUser();
        setUser(userData);
      } catch (err) {
        setError('Failed to fetch user info');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  return { user, loading, error };
}
