// Auto-refresh session hook
'use client';

import { useCallback, useEffect } from 'react';

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

export function useAutoRefreshSession() {
  const refreshSession = useCallback(async (retryCount = 0): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Session expired or invalid
        if (response.status === 401) {
          window.location.href = '/auth/login';
        }
        return false;
      }

      return true;
    } catch (error) {
      // Network error - retry
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, REFRESH_RETRY_DELAY));
        return refreshSession(retryCount + 1);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [refreshSession]);

  return refreshSession;
}
