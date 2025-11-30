/**
 * TypeScript type definitions for Goals feature
 */

// Using string literals instead of enums for better API compatibility
export type GoalType = 'BUILD_HABIT' | 'QUIT_BEHAVIOR';

export type Category = 'HEALTH' | 'PRODUCTIVITY' | 'SOCIAL' | 'PERSONAL_DEVELOPMENT' | 'OTHER';

export type Frequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export type CheckInStatus = 'SUCCESS' | 'FAILURE' | 'SKIPPED';

export interface Goal {
    id: number;
    user: string;
    title: string;
    description?: string;
    goal_type: GoalType;
    category: Category;
    target_frequency: Frequency;
    start_date: string; // ISO date string
    target_date?: string; // ISO date string
    is_active: boolean;
    is_private: boolean;
    current_streak: number;
    longest_streak: number;
    checkin_count: number;
    success_rate: number;
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
}

export interface GoalListItem {
    id: number;
    title: string;
    goal_type: GoalType;
    category: Category;
    target_frequency: Frequency;
    start_date: string;
    target_date?: string;
    is_active: boolean;
    current_streak: number;
    checkin_count: number;
}

export interface CheckIn {
    id: number;
    goal: number;
    goal_title: string;
    date: string; // ISO date string
    status: CheckInStatus;
    notes?: string;
    created_at: string; // ISO datetime string
}

export interface CheckInHistory {
    date: string;
    status: CheckInStatus | null;
    notes?: string | null;
    id?: number | null;
}

export interface WeeklySummary {
    week_start: string;
    week_end: string;
    total_checkins: number;
    successes: number;
    failures: number;
    skipped: number;
}

export interface MonthlySummary {
    month_start: string;
    month_end: string;
    total_checkins: number;
    successes: number;
    failures: number;
    skipped: number;
}

export interface GoalAnalytics {
    current_streak: number;
    longest_streak: number;
    success_rate_overall: number;
    success_rate_week: number;
    success_rate_month: number;
    total_checkins: number;
    weekly_summary: WeeklySummary;
    monthly_summary: MonthlySummary;
}

export interface GoalAnalyticsResponse {
    analytics: GoalAnalytics;
    checkin_history: CheckInHistory[];
}

export interface GoalFilters {
    is_active?: boolean;
    category?: Category;
    goal_type?: GoalType;
    target_frequency?: Frequency;
    search?: string;
}

export interface GoalStats {
    total_active_goals: number;
    goals_needing_checkin: number;
    average_streak: number;
    overall_success_rate: number;
}

export interface GoalFormData {
    title: string;
    description?: string;
    goal_type: GoalType;
    category: Category;
    target_frequency: Frequency;
    start_date: string;
    target_date?: string;
    is_private: boolean;
}

export interface CheckInFormData {
    goal: number;
    date: string;
    status: CheckInStatus;
    notes?: string;
}

export interface RemindersResponse {
    count: number;
    goals: GoalListItem[];
}
