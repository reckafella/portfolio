/**
 * Authentication configuration constants
 */

/**
 * Duration to show loader after successful authentication before redirect (in milliseconds)
 */
export const AUTH_SUCCESS_DELAY = 1000;

/**
 * Token Storage Implementation:
 * 
 * ✓ IMPLEMENTED: httpOnly cookies for auth token storage (immune to XSS)
 * ✓ IMPLEMENTED: CSRF protection via Django's CSRF middleware
 * ✓ IMPLEMENTED: SameSite=Lax cookie attribute (CSRF protection)
 * ✓ IMPLEMENTED: Secure flag in production (HTTPS only)
 * ✓ IMPLEMENTED: 8-hour token expiration matching session age
 * 
 * Security Features:
 * - Auth tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Tokens automatically sent with each request via cookies
 * - Django session authentication as primary method
 * - Token authentication as secondary method via cookie
 * - User data stored in localStorage for UI state only (not security-sensitive)
 * 
 * Additional Recommendations for Production:
 * - Implement token refresh mechanism for long-lived sessions
 * - Add rate limiting on authentication endpoints
 * - Monitor for suspicious authentication patterns
 * - Implement Content Security Policy (CSP) headers
 */
