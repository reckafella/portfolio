/**
 * About page API utility functions following the same pattern as projectApi
 */

import { apiRequest } from './api';

export interface ProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone?: string;
  summary: string;
}

export interface EducationEntry {
  id?: number;
  degree: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  period: string;
  institution: string;
  description: string;
  order?: number;
  is_active?: boolean;
}

export interface ExperienceEntry {
  id?: number;
  title: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  period: string;
  company: string;
  icon_type: string;
  responsibilities: string[];
  order?: number;
  is_active?: boolean;
}

export interface SkillEntry {
  id?: number;
  name: string;
  category?: string;
  proficiency_level?: number;
  order?: number;
  is_active?: boolean;
}

/**
 * About page API functions using the same pattern as projectApi
 */
export const aboutApi = {
  /**
   * Get about page data
   */
  get: async (): Promise<Response> => {
    return apiRequest('/api/v1/about/');
  },

  /**
   * Update profile information
   */
  updateProfile: async (profileData: ProfileData): Promise<Response> => {
    return apiRequest('/api/v1/about/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Partially update profile information
   */
  patchProfile: async (profileData: Partial<ProfileData>): Promise<Response> => {
    return apiRequest('/api/v1/about/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Education API functions
   */
  education: {
    list: async (): Promise<Response> => {
      return apiRequest('/api/v1/about/education/');
    },

    create: async (educationData: Omit<EducationEntry, 'id'>): Promise<Response> => {
      return apiRequest('/api/v1/about/education/', {
        method: 'POST',
        body: JSON.stringify(educationData),
      });
    },

    get: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/education/${id}/`);
    },

    update: async (id: number, educationData: Partial<EducationEntry>): Promise<Response> => {
      return apiRequest(`/api/v1/about/education/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(educationData),
      });
    },

    delete: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/education/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  /**
   * Experience API functions
   */
  experience: {
    list: async (): Promise<Response> => {
      return apiRequest('/api/v1/about/experience/');
    },

    create: async (experienceData: Omit<ExperienceEntry, 'id'>): Promise<Response> => {
      return apiRequest('/api/v1/about/experience/', {
        method: 'POST',
        body: JSON.stringify(experienceData),
      });
    },

    get: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/experience/${id}/`);
    },

    update: async (id: number, experienceData: Partial<ExperienceEntry>): Promise<Response> => {
      return apiRequest(`/api/v1/about/experience/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(experienceData),
      });
    },

    delete: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/experience/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  /**
   * Skills API functions
   */
  skills: {
    list: async (): Promise<Response> => {
      return apiRequest('/api/v1/about/skills/');
    },

    create: async (skillData: Omit<SkillEntry, 'id'>): Promise<Response> => {
      return apiRequest('/api/v1/about/skills/', {
        method: 'POST',
        body: JSON.stringify(skillData),
      });
    },

    bulkCreate: async (skillsData: {
      skills: string[];
      category?: string;
      proficiency_level?: number;
    }): Promise<Response> => {
      return apiRequest('/api/v1/about/skills/bulk/', {
        method: 'POST',
        body: JSON.stringify(skillsData),
      });
    },

    get: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/skills/${id}/`);
    },

    update: async (id: number, skillData: Partial<SkillEntry>): Promise<Response> => {
      return apiRequest(`/api/v1/about/skills/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(skillData),
      });
    },

    delete: async (id: number): Promise<Response> => {
      return apiRequest(`/api/v1/about/skills/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  /**
   * Reorder items
   */
  reorder: async (type: string, items: Array<{id: number, order: number}>): Promise<Response> => {
    return apiRequest('/api/v1/about/reorder/', {
      method: 'POST',
      body: JSON.stringify({ type, items }),
    });
  },

  /**
   * Download resume PDF
   */
  downloadResume: async (): Promise<Response> => {
    return apiRequest('/api/v1/resume-pdf/', {
      method: 'GET',
    });
  },
};
