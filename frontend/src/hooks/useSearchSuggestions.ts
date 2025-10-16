import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchSuggestion {
  text: string;
  type: 'blog_post' | 'project' | 'tag';
  category: 'posts' | 'projects';
}

interface UseSearchSuggestionsReturn {
  suggestions: SearchSuggestion[];
  loading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

export const useSearchSuggestions = (debounceMs: number = 500): UseSearchSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, SearchSuggestion[]>>(new Map());
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear previous abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't fetch for very short queries
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (cache.has(cacheKey)) {
      setSuggestions(cache.get(cacheKey)!);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce the API call
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/v1/search/suggestions/?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment before searching again.');
          }
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          // Cache the results
          setCache(prev => new Map(prev).set(cacheKey, data.suggestions));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, don't update state
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
        setError(errorMessage);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, cache]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setLoading(false);
    setError(null);
    
    // Clear timeout and abort controller
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
};
