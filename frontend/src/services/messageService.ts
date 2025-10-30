/**
 * Message API Service
 * Centralized service for all message-related API calls
 */

import { apiRequest } from "../utils/api";
import type {
    Message,
    MessageListResponse,
    MessageDetailResponse,
    MessageStatsResponse,
    BulkActionRequest,
    BulkActionResponse,
    MessageFilters,
} from "../types/message";

const BASE_URL = "/api/v1/messages";

export const messageService = {
    /**
     * Get list of messages with filters
     */
    async getMessages(
        filters: Partial<MessageFilters>,
    ): Promise<MessageListResponse> {
        const params = new URLSearchParams();

        if (filters.filter) params.append("filter", filters.filter);
        if (filters.search) params.append("search", filters.search);
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.page_size)
            params.append("page_size", filters.page_size.toString());

        const response = await apiRequest(`${BASE_URL}/?${params.toString()}`);
        return response.json();
    },

    /**
     * Get message detail
     */
    async getMessage(messageId: number): Promise<MessageDetailResponse> {
        const response = await apiRequest(`${BASE_URL}/${messageId}/`);
        return response.json();
    },

    /**
     * Get inbox statistics
     */
    async getStats(): Promise<MessageStatsResponse> {
        const response = await apiRequest(`${BASE_URL}/stats/`);
        return response.json();
    },

    /**
     * Mark message as read
     */
    async markAsRead(
        messageId: number,
    ): Promise<{ success: boolean; message: string; is_read: boolean }> {
        const response = await apiRequest(
            `${BASE_URL}/${messageId}/mark-read/`,
            {
                method: "POST",
            },
        );
        return response.json();
    },

    /**
     * Mark message as unread
     */
    async markAsUnread(
        messageId: number,
    ): Promise<{ success: boolean; message: string; is_read: boolean }> {
        const response = await apiRequest(
            `${BASE_URL}/${messageId}/mark-unread/`,
            {
                method: "POST",
            },
        );
        return response.json();
    },

    /**
     * Delete message
     */
    async deleteMessage(
        messageId: number,
    ): Promise<{ success: boolean; message: string }> {
        const response = await apiRequest(`${BASE_URL}/${messageId}/delete/`, {
            method: "DELETE",
        });
        return response.json();
    },

    /**
     * Perform bulk actions on messages
     */
    async bulkAction(data: BulkActionRequest): Promise<BulkActionResponse> {
        const response = await apiRequest(`${BASE_URL}/bulk-actions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
};
