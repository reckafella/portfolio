import { useState, useEffect, useCallback } from "react";

interface PopularSearch {
    text: string;
    count: number;
    last_searched: string;
}

interface UsePopularSearchesReturn {
    popularSearches: PopularSearch[];
    recentSearches: string[];
    loading: boolean;
    error: string | null;
    addRecentSearch: (query: string) => void;
    removeRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
}

const RECENT_SEARCHES_KEY = "portfolio_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export const usePopularSearches = (): UsePopularSearchesReturn => {
    const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load recent searches from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
                }
            }
        } catch (err) {
            console.warn(
                "Failed to load recent searches from localStorage:",
                err,
            );
        }
    }, []);

    // Fetch popular searches from API
    const fetchPopularSearches = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/v1/search/popular/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Too many requests. Please wait a moment.");
                }
                throw new Error(
                    `Failed to fetch popular searches: ${response.status}`,
                );
            }

            const data = await response.json();

            if (data.popular_searches && Array.isArray(data.popular_searches)) {
                setPopularSearches(data.popular_searches);
            } else {
                setPopularSearches([]);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to fetch popular searches";
            setError(errorMessage);
            setPopularSearches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch popular searches on mount
    useEffect(() => {
        fetchPopularSearches();
    }, [fetchPopularSearches]);

    // Add a search to recent searches
    const addRecentSearch = useCallback((query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        setRecentSearches((prev) => {
            // Remove if already exists and add to beginning
            const filtered = prev.filter(
                (search) => search.toLowerCase() !== trimmedQuery.toLowerCase(),
            );
            const updated = [trimmedQuery, ...filtered].slice(
                0,
                MAX_RECENT_SEARCHES,
            );

            // Save to localStorage
            try {
                localStorage.setItem(
                    RECENT_SEARCHES_KEY,
                    JSON.stringify(updated),
                );
            } catch (err) {
                console.warn(
                    "Failed to save recent searches to localStorage:",
                    err,
                );
            }

            return updated;
        });
    }, []);

    // Remove a single recent search
    const removeRecentSearch = useCallback((query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        setRecentSearches((prev) => {
            const updated = prev.filter(
                (search) => search.toLowerCase() !== trimmedQuery.toLowerCase(),
            );

            // Save to localStorage
            try {
                localStorage.setItem(
                    RECENT_SEARCHES_KEY,
                    JSON.stringify(updated),
                );
            } catch (err) {
                console.warn(
                    "Failed to save recent searches to localStorage:",
                    err,
                );
            }

            return updated;
        });
    }, []);

    // Clear recent searches
    const clearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (err) {
            console.warn(
                "Failed to clear recent searches from localStorage:",
                err,
            );
        }
    }, []);

    return {
        popularSearches,
        recentSearches,
        loading,
        error,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
    };
};
