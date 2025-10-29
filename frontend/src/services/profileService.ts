import { handleApiError } from '@/utils/errorUtils';

export interface ProfileData {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        date_joined: string;
        is_staff: boolean;
    };
    title: string;
    bio: string;
    country: string;
    city: string;
    experience: string;
    cloudinary_image_url: string | null;
    optimized_image_url: string | null;
    social_links: {
        twitter_x?: string;
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        github?: string;
        youtube?: string;
        tiktok?: string;
        whatsapp?: string;
        website?: string;
    };
    settings: {
        changes_notifications: boolean;
        new_products_notifications: boolean;
        marketing_notifications: boolean;
        security_notifications: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface ProfileUpdateData {
    title?: string;
    bio?: string;
    country?: string;
    city?: string;
    experience?: string;
    first_name?: string;
    last_name?: string;
    social_links?: {
        twitter_x?: string;
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        github?: string;
        youtube?: string;
        tiktok?: string;
        whatsapp?: string;
        website?: string;
    };
}

export interface PasswordChangeData {
    old_password: string;
    new_password1: string;
    new_password2: string;
}

export interface SettingsData {
    changes_notifications?: boolean;
    new_products_notifications?: boolean;
    marketing_notifications?: boolean;
    security_notifications?: boolean;
}

export class ProfileService {
    /**
     * Get CSRF token from Django
     */
    private static async getCSRFToken(): Promise<string> {
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

    /**
     * Get headers with CSRF token
     */
    private static async getHeaders(): Promise<Record<string, string>> {
        const csrfToken = await this.getCSRFToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }

        return headers;
    }

    /**
     * Get current user's profile
     */
    static async getProfile(): Promise<ProfileData> {
        const response = await fetch('/api/v1/auth/profile/', {
            method: 'GET',
            headers: await this.getHeaders(),
            credentials: 'include',
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Update current user's profile
     */
    static async updateProfile(data: ProfileUpdateData): Promise<{ message: string; profile: ProfileData }> {
        const response = await fetch('/api/v1/auth/profile/', {
            method: 'PATCH',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Change user password
     */
    static async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
        const response = await fetch('/api/v1/auth/profile/password/', {
            method: 'POST',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Get user settings
     */
    static async getSettings(): Promise<SettingsData> {
        const response = await fetch('/api/v1/auth/profile/settings/', {
            method: 'GET',
            headers: await this.getHeaders(),
            credentials: 'include',
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Update user settings
     */
    static async updateSettings(data: SettingsData): Promise<{ message: string; settings: SettingsData }> {
        const response = await fetch('/api/v1/auth/profile/settings/', {
            method: 'PATCH',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Upload profile image
     */
    static async uploadProfileImage(file: File): Promise<{ message: string; image_url: string }> {
        const formData = new FormData();
        formData.append('profile_pic', file);

        const response = await fetch('/api/v1/auth/profile/', {
            method: 'PATCH',
            credentials: 'include',
            body: formData,
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Delete profile image
     */
    static async deleteProfileImage(): Promise<{ message: string }> {
        const response = await fetch('/api/v1/auth/profile/', {
            method: 'PATCH',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ cloudinary_image_id: null }),
        });

        await handleApiError(response);
        return response.json();
    }
}

export default ProfileService;
