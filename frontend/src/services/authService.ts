import { handleApiError } from '../utils/errorUtils';

// API Configuration
// const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; // || 'http://127.0.0.1:8001/api/v1';

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
    token: string;
    message: string;
}

export class AuthService {
    private static getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Token ${token}` })
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
        const token = localStorage.getItem('auth_token');
        const csrfToken = await this.getCSRFToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

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
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    }

    // Logout user
    static async logout(): Promise<void> {
        try {
            await fetch(`/api/v1/auth/logout/`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            throw new Error(`Logout request failed: ${error}`);
        } finally {
            // Always clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    // Get current user from localStorage
    static getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    // Get user profile
    static async getUserProfile(): Promise<{}> {
        const response = await fetch(`/api/v1/auth/profile/`, {
            headers: this.getAuthHeaders()
        });
        
        await handleApiError(response);
        return response.json();
    }

    // Update user profile
    static async updateProfile(profileData: Record<string, unknown>): Promise<{}> {
        const response = await fetch(`/api/v1/auth/profile/update/`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(profileData)
        });

        await handleApiError(response);
        return response.json();
    }
}
export default AuthService;
