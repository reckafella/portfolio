import { handleApiError } from "@/utils/errorUtils";
import type {
    Goal,
    GoalListItem,
    CheckIn,
    GoalAnalyticsResponse,
    GoalFormData,
    CheckInFormData,
    GoalFilters,
    RemindersResponse,
} from "@/types/goals";

/**
 * Goals API Service
 * Handles all API calls related to goals and check-ins
 */
export class GoalsService {
    private static getAuthHeaders() {
        return {
            "Content-Type": "application/json",
        };
    }

    private static async getAuthHeadersWithCSRF() {
        // Get CSRF token from cookie
        const csrfToken = await this.getCSRFToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (csrfToken) {
            headers["X-CSRFToken"] = csrfToken;
        }

        return headers;
    }

    private static async getCSRFToken(): Promise<string> {
        try {
            const response = await fetch("/api/v1/auth/csrf-token/", {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                return data.csrfToken;
            }
        } catch {
            // Silently fail
        }
        return "";
    }

    // ============ GOAL ENDPOINTS ============

    /**
     * Get all goals for the current user with optional filters
     */
    static async getGoals(filters?: GoalFilters): Promise<GoalListItem[]> {
        const params = new URLSearchParams();

        if (filters?.is_active !== undefined) {
            params.append("is_active", String(filters.is_active));
        }
        if (filters?.category) {
            params.append("category", filters.category);
        }
        if (filters?.goal_type) {
            params.append("goal_type", filters.goal_type);
        }
        if (filters?.target_frequency) {
            params.append("target_frequency", filters.target_frequency);
        }
        if (filters?.search) {
            params.append("search", filters.search);
        }

        const queryString = params.toString();
        const url = `/api/v1/goals/goals/${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Get a single goal by ID with full details
     */
    static async getGoal(id: number): Promise<Goal> {
        const response = await fetch(`/api/v1/goals/goals/${id}/`, {
            headers: this.getAuthHeaders(),
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Create a new goal
     */
    static async createGoal(data: GoalFormData): Promise<Goal> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch("/api/v1/goals/goals/", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Update an existing goal
     */
    static async updateGoal(
        id: number,
        data: Partial<GoalFormData>
    ): Promise<Goal> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch(`/api/v1/goals/goals/${id}/`, {
            method: "PATCH",
            headers,
            credentials: "include",
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Soft delete a goal (set is_active to false)
     */
    static async deleteGoal(id: number): Promise<{ message: string }> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch(`/api/v1/goals/goals/${id}/`, {
            method: "DELETE",
            headers,
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Get detailed analytics for a goal
     */
    static async getGoalAnalytics(id: number): Promise<GoalAnalyticsResponse> {
        const response = await fetch(`/api/v1/goals/goals/${id}/analytics/`, {
            headers: this.getAuthHeaders(),
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }

    // ============ CHECK-IN ENDPOINTS ============

    /**
     * Get check-ins for a specific goal
     */
    static async getCheckIns(
        goalId: number,
        filters?: { status?: string; date?: string }
    ): Promise<CheckIn[]> {
        const params = new URLSearchParams();

        if (filters?.status) {
            params.append("status", filters.status);
        }
        if (filters?.date) {
            params.append("date", filters.date);
        }

        const queryString = params.toString();
        const url = `/api/v1/goals/goals/${goalId}/checkins/${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Create a new check-in
     */
    static async createCheckIn(data: CheckInFormData): Promise<CheckIn> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch(`/api/v1/goals/goals/${data.goal}/checkins/`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Update an existing check-in
     */
    static async updateCheckIn(
        id: number,
        data: Partial<CheckInFormData>
    ): Promise<CheckIn> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch(`/api/v1/goals/checkins/${id}/`, {
            method: "PATCH",
            headers,
            credentials: "include",
            body: JSON.stringify(data),
        });

        await handleApiError(response);
        return response.json();
    }

    /**
     * Delete a check-in
     */
    static async deleteCheckIn(id: number): Promise<void> {
        const headers = await this.getAuthHeadersWithCSRF();

        const response = await fetch(`/api/v1/goals/checkins/${id}/`, {
            method: "DELETE",
            headers,
            credentials: "include",
        });

        await handleApiError(response);
    }

    // ============ UTILITY ENDPOINTS ============

    /**
     * Get goals that need check-ins today
     */
    static async getReminders(): Promise<RemindersResponse> {
        const response = await fetch("/api/v1/goals/reminders/", {
            headers: this.getAuthHeaders(),
            credentials: "include",
        });

        await handleApiError(response);
        return response.json();
    }
}

export default GoalsService;
