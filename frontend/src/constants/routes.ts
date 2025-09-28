/**
 * Application route constants for consistent URL management
 */

// Main navigation routes
export const ROUTES = {
  // Core pages
  HOME: '/',
  SERVICES: '/services',
  CONTACT: '/contact',
  SEARCH: '/search',
  SITEMAP: '/sitemap',

  // Blog routes
  BLOG: {
    LIST: '/blog',
    DETAIL: (slug: string) => `/blog/article/${slug}`,
    ADD: '/blog/new',
    EDIT: (slug: string) => `/blog/edit/${slug}`,
    TAG: (tag: string) => `/blog?tag=${encodeURIComponent(tag)}`,
  },

  // Project routes
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (slug: string) => `/projects/${slug}`,
    ADD: '/projects/new',
    EDIT: (slug: string) => `/projects/edit/${slug}`,
  },

  // Authentication routes
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    LOGOUT: '/logout',
    PROFILE: '/profile',
  },

  // Error routes
  ERROR: {
    BAD_REQUEST: '/error/400',
    UNAUTHORIZED: '/error/401',
    FORBIDDEN: '/error/403',
    NOT_FOUND: '/error/404',
    SERVER_ERROR: '/error/500',
  },

  // Legacy authentication redirects (for backward compatibility)
  LEGACY_AUTH: {
    LOGIN: '/login',
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    REGISTER: '/register',
    LOGOUT: '/logout',
    SIGNOUT: '/signout',
  },
} as const;

// Navigation items for the main navigation component
export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Home' },
  { path: ROUTES.SERVICES, label: 'Services' },
  { path: ROUTES.PROJECTS.LIST, label: 'Projects' },
  { path: ROUTES.BLOG.LIST, label: 'Blog' },
  { path: ROUTES.CONTACT, label: 'Contact' },
] as const;

// Staff navigation items
export const STAFF_NAV_ITEMS = [
  { path: ROUTES.PROJECTS.ADD, label: 'Add Project' },
  { path: '/admin', label: 'Admin Panel' },
] as const;

/**
 * Type for route parameters
 */
export type RouteParams = {
  slug?: string;
  tag?: string;
};

/**
 * Helper function to build URLs with query parameters
 */
export const buildUrl = (baseUrl: string, params?: Record<string, string | number | undefined>): string => {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.pathname + url.search;
};
