/**
 * Authentication utility functions
 */

/**
 * Generate login URL with next parameter pointing to current page
 * @param currentPath - The current path to redirect back to after login (optional, defaults to current location)
 * @returns Login URL with next parameter
 */
export const getLoginUrlWithNext = (currentPath?: string): string => {
  const nextPath = currentPath || window.location.pathname + window.location.search;
  const encodedNext = encodeURIComponent(nextPath);
  return `/auth/login?next=${encodedNext}`;
};

/**
 * Generate signup URL with next parameter pointing to current page
 * @param currentPath - The current path to redirect back to after signup (optional, defaults to current location)
 * @returns Signup URL with next parameter
 */
export const getSignupUrlWithNext = (currentPath?: string): string => {
  const nextPath = currentPath || window.location.pathname + window.location.search;
  const encodedNext = encodeURIComponent(nextPath);
  return `/auth/signup?next=${encodedNext}`;
};

/**
 * Redirect to login page with current page as next parameter
 * @param currentPath - The current path to redirect back to after login (optional, defaults to current location)
 */
export const redirectToLogin = (currentPath?: string): void => {
  window.location.href = getLoginUrlWithNext(currentPath);
};

/**
 * Redirect to signup page with current page as next parameter
 * @param currentPath - The current path to redirect back to after signup (optional, defaults to current location)
 */
export const redirectToSignup = (currentPath?: string): void => {
  window.location.href = getSignupUrlWithNext(currentPath);
};

/**
 * Get the next parameter from URL search params
 * @param searchParams - URLSearchParams object
 * @returns The next URL or null if not present
 */
export const getNextUrlFromParams = (searchParams: URLSearchParams): string | null => {
  return searchParams.get('next');
};

/**
 * Validate that the next URL is safe (same origin)
 * @param nextUrl - The URL to validate
 * @returns True if safe, false otherwise
 */
export const isSafeNextUrl = (nextUrl: string): boolean => {
  try {
    // Allow relative URLs starting with /
    if (nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
      return true;
    }
    
    // For absolute URLs, check if they're same origin
    const url = new URL(nextUrl, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Get a safe next URL, defaulting to home page if unsafe
 * @param nextUrl - The URL to validate
 * @param defaultUrl - Default URL if nextUrl is unsafe (defaults to '/')
 * @returns Safe URL
 */
export const getSafeNextUrl = (nextUrl: string | null, defaultUrl: string = '/'): string => {
  if (!nextUrl) return defaultUrl;
  return isSafeNextUrl(nextUrl) ? nextUrl : defaultUrl;
};
