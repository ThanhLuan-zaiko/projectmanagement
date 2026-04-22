// Auto-refresh session hook
'use client';

import { useCallback, useEffect } from 'react';
import { apiFetch } from '@/utils/api-client';

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

export function useAutoRefreshSession() {
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const attemptRefresh = async (retryCount: number): Promise<boolean> => {
      try {
        const response = await apiFetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/auth/login';
          }
          return false;
        }

        return true;
      } catch {
        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, REFRESH_RETRY_DELAY));
          return attemptRefresh(retryCount + 1);
        }
        return false;
      }
    };

    return attemptRefresh(0);
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
