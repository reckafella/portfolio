/**
 * Application route constants for consistent URL management
 */

// Main navigation routes
export const ROUTES = {
    // Core pages
    ABOUT: "/about",
    SERVICES: "/services",
    CONTACT: "/contact",
    SEARCH: "/search",
    SITEMAP: "/sitemap",

    // About page management routes
    ABOUT_MANAGE: {
        OVERVIEW: "/about/edit",
        PROFILE: "/about/edit/profile",
        EDUCATION: "/about/edit/education",
        EXPERIENCE: "/about/edit/experience",
        SKILLS: "/about/edit/skills",
    },

    // Blog routes
    BLOG: {
        LIST: "/blog",
        DETAIL: (slug: string) => `/blog/article/${slug}`,
        ADD: "/blog/new",
        EDIT: (slug: string) => `/blog/article/${slug}/edit`,
        TAG: (tag: string) => `/blog?tag=${encodeURIComponent(tag)}`,
    },

    // Project routes
    PROJECTS: {
        LIST: "/projects",
        DETAIL: (slug: string) => `/projects/${slug}`,
        ADD: "/projects/new",
        EDIT: (slug: string) => `/projects/${slug}/edit`,
    },

    // Authentication routes
    AUTH: {
        LOGIN: "/login",
        SIGNUP: "/signup",
        LOGOUT: "/logout",
        PROFILE: "/profile",
    },

    // Message routes
    MESSAGES: {
        INBOX: "/messages/inbox",
    },

    // Error routes
    ERROR: {
        BAD_REQUEST: "/error/400",
        UNAUTHORIZED: "/error/401",
        FORBIDDEN: "/error/403",
        NOT_FOUND: "/error/404",
        SERVER_ERROR: "/error/500",
    },
    DJANGO_ADMIN: {
        ROUTES: "/admin/",
    },
    WAGTAIL: {
        ROUTES: "/wagtail/admin/",
    },

    // Legacy authentication redirects (for backward compatibility)
    LEGACY_AUTH: {
        LOGIN: "/login",
        SIGNIN: "/signin",
        SIGNUP: "/signup",
        REGISTER: "/register",
        LOGOUT: "/logout",
        SIGNOUT: "/signout",
    },
} as const;

// Navigation items for the main navigation component
export const NAV_ITEMS = [
    { path: ROUTES.ABOUT, icon: 'bi bi-person', label: "About" },
    { path: ROUTES.SERVICES, icon: 'bi bi-briefcase', label: "Services" },
    { path: ROUTES.BLOG.LIST, icon: 'bi bi-book', label: "Blog" },
    { path: ROUTES.PROJECTS.LIST, icon: 'bi bi-briefcase', label: "Projects" },
    { path: ROUTES.CONTACT, icon: 'bi bi-envelope', label: "Contact" },
] as const;

export const ADMIN_NAV_ITEMS = [
    { path: ROUTES.DJANGO_ADMIN.ROUTES, icon: 'bi bi-gear', label: "Admin Panel" },
    { path: ROUTES.WAGTAIL.ROUTES, icon: 'bi bi-gear-fill', label: "Wagtail Admin" },
] as const;

// Staff navigation items
export const STAFF_NAV_ITEMS = [
    { path: ROUTES.PROJECTS.ADD, icon: 'bi bi-plus', label: "Add Project" },
    { path: ROUTES.BLOG.ADD, icon: 'bi bi-plus', label: "Add Blog Post" },
] as const;

// About management navigation items
export const ABOUT_MANAGE_NAV_ITEMS = [
    {
        path: ROUTES.ABOUT_MANAGE.OVERVIEW,
        label: "Edit Overview",
        icon: "bi-pencil-square",
    },
    {
        path: ROUTES.ABOUT_MANAGE.PROFILE,
        label: "Edit Profile",
        icon: "bi-person-gear",
    },
    {
        path: ROUTES.ABOUT_MANAGE.EDUCATION,
        label: "Manage Education",
        icon: "bi-mortarboard",
    },
    {
        path: ROUTES.ABOUT_MANAGE.EXPERIENCE,
        label: "Manage Experience",
        icon: "bi-briefcase",
    },
    {
        path: ROUTES.ABOUT_MANAGE.SKILLS,
        label: "Manage Skills",
        icon: "bi-gear-wide-connected",
    },
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
export const buildUrl = (
    baseUrl: string,
    params?: Record<string, string | number | undefined>,
): string => {
    if (!params) return baseUrl;

    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value.toString());
        }
    });

    return url.pathname + url.search;
};
