import { handleApiError } from '@/utils/errorUtils';
import { tabSyncService } from './tabSyncService';

// API Configuration
// const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; // || 'http://127.0.0.1:8001/api/v1';

/**
 * SECURITY NOTE: Token Storage
 * 
 * This implementation uses httpOnly cookies for token storage, which are immune to XSS attacks.
 * The auth token is automatically sent with each request via cookies.
 * 
 * Security features:
 * ✓ httpOnly cookies (cannot be accessed by JavaScript)
 * ✓ Secure flag in production (HTTPS only)
 * ✓ SameSite=Lax (CSRF protection)
 * ✓ Django session authentication as primary method
 * ✓ Token authentication as secondary method via cookie
 * 
 * User data is still stored in localStorage for UI state management only.
 * The actual authentication token is never exposed to JavaScript.
 */

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
}

export interface AuthResponse {
    user: User;
    message: string;
}

export class AuthService {
    private static getAuthHeaders() {
        // No need to manually add token - it's sent automatically via httpOnly cookie
        return {
            'Content-Type': 'application/json'
        };
    }

    // Get CSRF token
    static async getCSRFToken(): Promise<string> {
        try {
            const response = await fetch('/api/v1/auth/csrf-token/', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                return data.csrfToken;
            }
        } catch {
            // Silently fail - we'll continue without CSRF token
        }
        return '';
    }

    // Get headers with CSRF token
    private static async getAuthHeadersWithCSRF() {
        const csrfToken = await this.getCSRFToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // No need to manually add token - it's sent automatically via httpOnly cookie
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        return headers;
    }

    // Test API connection
    static async testApi(): Promise<{ message: string }> {
        const response = await fetch(`/api/v1/auth/test/`);
        await handleApiError(response);
        return response.json();
    }

    // Login user
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const headers = await this.getAuthHeadersWithCSRF();
        const response = await fetch(`/api/v1/auth/login/`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(credentials)
        });
        
        await handleApiError(response);

        const data: AuthResponse = await response.json();
        // Token is now stored in httpOnly cookie by the server
        // Only store user data in localStorage for UI state
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Broadcast login event to other tabs
        tabSyncService.broadcastLogin(data.user);
        
        return data;
    }

    // Signup user
    static async signup(userData: RegisterData): Promise<AuthResponse> {
        const headers = await this.getAuthHeadersWithCSRF();
        const response = await fetch(`/api/v1/auth/signup/`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        await handleApiError(response);
        
        const data: AuthResponse = await response.json();
        // Token is now stored in httpOnly cookie by the server
        // Only store user data in localStorage for UI state
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Broadcast signup event to other tabs
        tabSyncService.broadcastSignup(data.user);
        
        return data;
    }

    // Logout user
    static async logout(): Promise<void> {
        try {
            const headers = await this.getAuthHeadersWithCSRF();
            await fetch(`/api/v1/auth/logout/`, {
                method: 'POST',
                headers,
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
            // Continue with cleanup even if request fails
        } finally {
            // Clear user data from localStorage
            // Token cookie is deleted by the server
            localStorage.removeItem('user');
            
            // Broadcast logout event to other tabs
            tabSyncService.broadcastLogout();
        }
    }

    // Get current user from localStorage
    static getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        // Check if user data exists in localStorage
        // The actual auth token is in httpOnly cookie (not accessible to JS)
        return !!localStorage.getItem('user');
    }

    // Get user profile
    static async getUserProfile(): Promise<{}> {
        const response = await fetch(`/api/v1/auth/profile/`, {
            headers: this.getAuthHeaders(),
            credentials: 'include'
        });
        
        await handleApiError(response);
        return response.json();
    }

    // Update user profile
    static async updateProfile(profileData: Record<string, unknown>): Promise<{}> {
        const headers = await this.getAuthHeadersWithCSRF();
        const response = await fetch(`/api/v1/auth/profile/update/`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        await handleApiError(response);
        return response.json();
    }
}
export default AuthService;
