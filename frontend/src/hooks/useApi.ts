import { useState, useEffect, useMemo, useCallback } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  isOnlineError: string | null;
  isServerOnlineError: string | null;
  isOnline: boolean;
  isServerOnline: Promise<boolean>;
  retryCount: number;
}

export interface UseApiOptions {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  enableRefresh?: boolean;
}

/** Checks if the server is online */
export async function checkServerOnline() {
  const response = await fetch("http://127.0.0.1:8000/app-running");
  if (!response.ok) return false;
  return true;
}

/**
 * Enhanced API hook with error handling, retry logic, and offline detection
 */
export function useApi<T>(
  apiFunction: () => Promise<Response>,
  options: UseApiOptions = {}
) {
  const {
    retryAttempts = 2,
    retryDelay = 1000,
    timeout = 10000,
    enableRefresh = true
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    isOnlineError: null,
    isServerOnlineError: null,
    isOnline: false,
    isServerOnline: checkServerOnline(),
    retryCount: 0
  });

  // Check if server online
  const updateServerOnlineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isServerOnline: checkServerOnline() }));
  }, []);

  useEffect(() => {
    window.addEventListener('online', updateServerOnlineStatus);
    window.addEventListener('offline', updateServerOnlineStatus);
    return () => {
      window.removeEventListener('online', updateServerOnlineStatus);
      window.removeEventListener('offline', updateServerOnlineStatus);
    };
  }, [updateServerOnlineStatus]);

  // Check if server online
  const updateUserOnlineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
  }, []);

  useEffect(() => {
    window.addEventListener('online', updateUserOnlineStatus);
    window.addEventListener('offline', updateUserOnlineStatus);
    return () => {
      window.removeEventListener('online', updateUserOnlineStatus);
      window.removeEventListener('offline', updateUserOnlineStatus);
    };
  }, [updateUserOnlineStatus]);

  // Fetch data with timeout and retry logic
  const fetchData = useCallback(async (retryCount = 0): Promise<void> => {
    if (!checkServerOnline()) {
      setState(prev => ({
        ...prev,
        loading: false,
        isServerOnlineError: 'No Server connection.',
        isServerOnline: checkServerOnline()
      }));
      return;
    }
    if (!navigator.onLine) {
      setState(prev => ({
        ...prev,
        loading: false,
        isOnlineError: 'No internet connection.',
        isOnline: false
      }));
      return;
    }

    setState(prev => ({
      ...prev, loading: true,
      isOnlineError: null,
      isServerOnlineError: null,
      retryCount
    }));

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race between API call and timeout
      const response = await Promise.race([
        apiFunction(),
        timeoutPromise
      ]);

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Server is temporarily unavailable. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        } else if (response.status === 401) {
          throw new Error('Please log in to access this resource.');
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        isOnlineError: null,
        isServerOnlineError: null,
        isServerOnline: checkServerOnline(),
        isOnline: navigator.onLine,
        retryCount: 0
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Retry logic for network errors and server errors
      if (retryCount < retryAttempts && 
          (errorMessage.includes('timeout') || 
           errorMessage.includes('Server is temporarily unavailable') ||
           errorMessage.includes('fetch'))) {
        
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        
        setState(prev => ({
          ...prev,
          loading: true,
          isServerOnlineError: `Retrying... (${retryCount + 1}/${retryAttempts})`,
          retryCount: retryCount + 1
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          isServerOnlineError: errorMessage,
          retryCount
        }));
      }
    }
  }, [apiFunction, retryAttempts, retryDelay, timeout]);

  // Memoized refresh function
  const refresh = useCallback(() => {
    fetchData(0);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    ...state,
    refresh: enableRefresh ? refresh : undefined
  }), [state, refresh, enableRefresh]);
}

/**
 * Hook for deferred data loading - only loads when component is visible
 */
export function useDeferredApi<T>(
  apiFunction: () => Promise<Response>,
  options: UseApiOptions & { defer?: boolean } = {}
) {
  const { defer = false, ...apiOptions } = options;
  const [shouldLoad, setShouldLoad] = useState(!defer);

  const result = useApi<T>(
    shouldLoad ? apiFunction : () => Promise.resolve(new Response('{}', { status: 200 })),
    apiOptions
  );

  const load = useCallback(() => {
    setShouldLoad(true);
  }, []);

  return useMemo(() => ({
    ...result,
    load: defer ? load : undefined,
    deferred: defer && !shouldLoad
  }), [result, load, defer, shouldLoad]);
}
