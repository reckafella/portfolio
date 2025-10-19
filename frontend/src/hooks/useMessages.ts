/**
 * Custom hook for managing messages
 */

import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import type {
  Message,
  MessageStats,
  MessageFilters,
  FilterType
} from '../types/message';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total_messages: 0,
    unread_count: 0,
    read_count: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  });

  const [filters, setFilters] = useState<MessageFilters>({
    filter: 'all' as FilterType,
    search: '',
    page: 1,
    page_size: 20
  });

  /**
   * Fetch messages based on current filters
   */
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await messageService.getMessages(filters);

      if (response.success) {
        setMessages(response.messages);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch inbox statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await messageService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  /**
   * Update filter
   */
  const setFilter = useCallback((filter: FilterType) => {
    setFilters(prev => ({ ...prev, filter, page: 1 }));
  }, []);

  /**
   * Update search query
   */
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchMessages();
    fetchStats();
  }, [fetchMessages, fetchStats]);

  // Fetch messages when filters change
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    messages,
    stats,
    loading,
    error,
    pagination,
    filters,
    setFilter,
    setSearch,
    goToPage,
    refresh
  };
};
