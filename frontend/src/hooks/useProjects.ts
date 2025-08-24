import { useMemo, useCallback } from 'react';
import { useApi, useDeferredApi } from './useApi';
import { projectApi } from '../utils/api';

export interface Project {
  id: number;
  title: string;
  description: string;
  project_type: string;
  category: string;
  client?: string;
  project_url?: string;
  created_at: string;
  updated_at: string;
  slug: string;
  live: boolean;
  first_image?: {
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
  };
  images: Array<{
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
    live: boolean;
  }>;
}

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface ProjectFilters {
  search?: string;
  category?: string;
  project_type?: string;
  client?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Hook for fetching projects with filters
 */
export function useProjects(filters: ProjectFilters = {}) {
  const apiFunction = useCallback(() => {
    const params = {
      page: '1',
      page_size: '12',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      )
    };
    return projectApi.list(params);
  }, [filters]);

  return useApi<ProjectsResponse>(apiFunction, {
    retryAttempts: 2,
    enableRefresh: true
  });
}

/**
 * Hook for fetching a single project
 */
export function useProject(id: number, defer = false) {
  const apiFunction = useCallback(() => {
    return projectApi.get(id);
  }, [id]);

  return useDeferredApi<Project>(apiFunction, {
    defer,
    retryAttempts: 2
  });
}

export interface ProjectFormConfig {
  fields: Array<{
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    choices?: Array<[string, string]>;
    help_text?: string;
    max_length?: number;
    widget?: {
      type: string;
      attrs?: Record<string, string | number | boolean>;
    };
  }>;
  submit_text: string;
  form_title: string;
  form_description: string;
}

/**
 * Hook for fetching form configuration
 */
export function useProjectFormConfig(defer = false) {
  const apiFunction = useCallback(() => {
    return projectApi.getFormConfig();
  }, []);

  return useDeferredApi<ProjectFormConfig>(apiFunction, {
    defer,
    retryAttempts: 1
  });
}

/**
 * Hook with fallback data for offline scenarios
 */
export function useProjectsWithFallback(filters: ProjectFilters = {}) {
  const result = useProjects(filters);

  // Memoized fallback data for when API is unavailable
  const fallbackData = useMemo((): ProjectsResponse => ({
    count: 0,
    next: null,
    previous: null,
    results: []
  }), []);

  return useMemo(() => {
    if (!result.isServerOnline || result.isServerOnlineError) {
      return {
        ...result,
        data: result.data || fallbackData,
        isOfflineMode: true
      };
    }

    if (!result.isOnline || result.isOnlineError) {
      return {
        ...result,
        data: result.data || fallbackData,
        isOfflineMode: true
      };
    }

    return {
      ...result,
      isOfflineMode: false
    };
  }, [result, fallbackData]);
}
