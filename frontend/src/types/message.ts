/**
 * Message types for inbox functionality
 */

export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    message_preview?: string;
    created_at: string;
    is_read: boolean;
}

export interface MessageStats {
    total_messages: number;
    unread_count: number;
    read_count: number;
}

export interface MessageListResponse {
    success: boolean;
    messages: Message[];
    pagination: {
        page: number;
        page_size: number;
        total_count: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface MessageDetailResponse {
    success: boolean;
    message: Message;
}

export interface MessageStatsResponse {
    success: boolean;
    stats: MessageStats;
}

export interface BulkActionRequest {
    action: "mark_read" | "mark_unread" | "delete";
    message_ids: number[];
}

export interface BulkActionResponse {
    success: boolean;
    message: string;
}

export type FilterType = "all" | "unread" | "read";

export interface MessageFilters {
    filter: FilterType;
    search: string;
    page: number;
    page_size: number;
}
