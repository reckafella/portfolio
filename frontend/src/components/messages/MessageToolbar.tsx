/**
 * MessageToolbar Component
 * Toolbar with search and bulk action buttons
 */

import React from "react";
import type { Message } from "@/types/message";

interface MessageToolbarProps {
    messages: Message[];
    selectedIds: number[];
    searchQuery: string;
    onSearchChange: (_query: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkMarkAsRead: () => void;
    onBulkMarkAsUnread: () => void;
    onBulkDelete: () => void;
    processing: boolean;
}

export const MessageToolbar: React.FC<MessageToolbarProps> = ({
    messages,
    selectedIds,
    searchQuery,
    onSearchChange,
    onSelectAll,
    onDeselectAll,
    onBulkMarkAsRead,
    onBulkMarkAsUnread,
    onBulkDelete,
    processing,
}) => {
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is handled by onSearchChange
    };

    const isAllSelected =
        messages.length > 0 && selectedIds.length === messages.length;
    const hasSelection = selectedIds.length > 0;

    return (
        <div className="inbox-toolbar">
            <div className="card">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            {/* Search */}
                            <div className="search-container">
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="d-flex"
                                >
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control flex-grow-1"
                                            placeholder="Search messages..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                onSearchChange(e.target.value)
                                            }
                                        />
                                        <button
                                            className="btn btn-secondary flex-shrink-1"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <i className="bi bi-search flex-shrink-1"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-6">
                            {/* Bulk Actions */}
                            <div className="bulk-actions d-flex justify-content-end">
                                <div className="btn-group" role="group">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={
                                            isAllSelected
                                                ? onDeselectAll
                                                : onSelectAll
                                        }
                                        disabled={
                                            processing || messages.length === 0
                                        }
                                    >
                                        <i
                                            className={`bi ${isAllSelected ? "bi-check-square" : "bi-square"}`}
                                        ></i>
                                        {isAllSelected
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={onBulkMarkAsRead}
                                        disabled={!hasSelection || processing}
                                    >
                                        <i className="bi bi-envelope-open"></i>
                                        Mark Read
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-warning"
                                        onClick={onBulkMarkAsUnread}
                                        disabled={!hasSelection || processing}
                                    >
                                        <i className="bi bi-envelope"></i>
                                        Mark Unread
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={onBulkDelete}
                                        disabled={!hasSelection || processing}
                                    >
                                        <i className="bi bi-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {hasSelection && (
                        <div className="mt-2">
                            <small className="text-muted">
                                {selectedIds.length} message
                                {selectedIds.length !== 1 ? "s" : ""} selected
                            </small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
