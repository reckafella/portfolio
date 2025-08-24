/**
 * API utility functions for making authenticated requests
 */

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const csrfToken = getCsrfToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  return headers;
};

/**
 * Get CSRF token from meta tag or cookie
 */
export const getCsrfToken = (): string => {
  // First try to get from meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (metaTag?.content) {
    return metaTag.content;
  }

  // Fallback to cookie
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  return cookieValue || '';
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async (url: string, options: RequestOptions = {}): Promise<Response> => {
  const defaultOptions: RequestOptions = {
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};

/**
 * Handle API errors and redirect if necessary
 */
export const handleApiError = (response: Response, error?: Error): void => {
  if (response.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (response.status === 403) {
    // Forbidden - redirect to forbidden page
    window.location.href = '/error/403';
  } else if (response.status >= 500) {
    // Server error - redirect to error page
    window.location.href = '/error/500';
  }
  
  if (error && process.env.NODE_ENV === 'development') {
    // Only log errors in development
    // eslint-disable-next-line no-console
    console.error('API Error:', error);
  }
};

/**
 * Project-specific API functions
 */
export const projectApi = {
    /**
     * get field parameters for create
     */
    getCreateFieldParams: async (): Promise<Response> => {
      return apiRequest('/api/v1/projects/create');
    },

    /**
     * Get field parameters for update
     */
    getUpdateFieldParams: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/projects/${id}/update`);
    },

  /**
   * Create a new project
   */
  create: async (projectData: Record<string, string | number | boolean>): Promise<Response> => {
    return apiRequest('/api/v1/projects/create', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Update an existing project
   */
  update: async (id: number, projectData: Record<string, string | number | boolean>): Promise<Response> => {
    return apiRequest(`/api/v1/projects/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Delete a project
   */
  delete: async (id: number): Promise<Response> => {
    return apiRequest(`/api/v1/projects/${id}/delete`, {
      method: 'DELETE',
    });
  },

  /**
   * Get project form configuration
   */
  getFormConfig: async (): Promise<Response> => {
    return apiRequest('/api/v1/projects/form-config');
  },

  /**
   * List projects with filters
   */
  list: async (params: Record<string, string> = {}): Promise<Response> => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/v1/projects/list${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url);
  },

  /**
   * Get project details
   */
  get: async (id: number): Promise<Response> => {
    return apiRequest(`/api/v1/projects/${id}`);
  },
};
