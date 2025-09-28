import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/utils/api';

// Project-related query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  detailBySlug: (slug: string) => [...projectKeys.details(), 'slug', slug] as const,
  formConfig: () => [...projectKeys.all, 'formConfig'] as const,
};

// Project API functions
const projectApiFunctions = {
  async getProjects(params: Record<string, string> = {}) {
    // Convert frontend parameter names to backend parameter names
    const backendParams = { ...params };
    if (backendParams.ordering) {
      backendParams.sort_by = backendParams.ordering;
      delete backendParams.ordering;
    }
    
    const response = await projectApi.list(backendParams);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async getProject(slug: string) {
    const response = await projectApi.get(slug);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  async getProjectBySlug(slug: string) {
    const response = await fetch(`/api/v1/projects/${slug}/`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  async getFormConfig() {
    const response = await projectApi.getFormConfig();
    if (!response.ok) {
      throw new Error('Failed to fetch form configuration');
    }
    return response.json();
  },

  async createProject(data: Record<string, string | number | boolean>) {
    const response = await projectApi.create(data);
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData.errors) {
        throw new Error(
          Object.values(errorData.errors).flat().join(', ')
        );
      }
      throw new Error(errorData.message || 'Failed to create project');
    }
    return response.json();
  },

  async updateProject(slug: string, data: Record<string, string | number | boolean | File | File[]>) {
    const response = await projectApi.update(slug, data);
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData.errors) {
        throw new Error(
          Object.values(errorData.errors).flat().join(', ')
        );
      }
      throw new Error(errorData.message || 'Failed to update project');
    }
    return response.json();
  },

  async deleteProject(slug: string) {
    const response = await projectApi.delete(slug);
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    return response.json();
  },
};

// Queries
export const useProjects = (filters: Record<string, string> = {}) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectApiFunctions.getProjects(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProject = (slug: string) => {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => projectApiFunctions.getProject(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug, // Only run query if slug is provided
  });
};

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: projectKeys.detailBySlug(slug),
    queryFn: () => projectApiFunctions.getProjectBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug, // Only run query if slug is provided
  });
};

export const useProjectFormConfig = () => {
  return useQuery({
    queryKey: projectKeys.formConfig(),
    queryFn: projectApiFunctions.getFormConfig,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApiFunctions.createProject,
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Record<string, string | number | boolean | File | File[]> }) =>
      projectApiFunctions.updateProject(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate specific project and projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectApiFunctions.deleteProject,
    onSuccess: (_data, id) => {
      // Remove specific project from cache and invalidate lists
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
