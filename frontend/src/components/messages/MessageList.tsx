/**
 * MessageList Component
 * Display list of messages with selection and click to view
 */

import React from "react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/types/message";

interface MessageListProps {
    messages: Message[];
    selectedIds: number[];
    loading: boolean;
    pagination: {
        page: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
    onPageChange: (_page: number) => void;
    onToggleSelect: (_messageId: number) => void;
    onViewMessage: (_message: Message) => void;
    onMarkAsRead: (_messageId: number) => void;
    onMarkAsUnread: (_messageId: number) => void;
    onDeleteMessage: (_messageId: number) => void;
    processing: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    selectedIds,
    loading,
    pagination,
    onPageChange,
    onToggleSelect,
    onViewMessage,
    onMarkAsRead,
    onMarkAsUnread,
    onDeleteMessage,
    processing,
}) => {
    if (loading) {
        return (
            <div className="inbox-content">
                <div className="messages-container">
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading messages...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="inbox-content">
                <div className="messages-container">
                    <div className="empty-state text-center py-5">
                        <div className="empty-icon mb-3">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                        </div>
                        <h4 className="text-muted">No messages found</h4>
                        <p className="text-muted">
                            When people contact you through the website, their
                            messages will appear here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="inbox-content">
            <div className="messages-container">
                {messages.map((message) => {
                    const isSelected = selectedIds.includes(message.id);

                    return (
                        <div
                            key={message.id}
                            className={`message-row ${!message.is_read ? "message-unread" : ""} ${isSelected ? "selected" : ""}`}
                            data-message-id={message.id}
                            data-is-read={message.is_read}
                        >
                            <div className="message-card p-1">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input message-checkbox"
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    onToggleSelect(message.id)
                                                }
                                                disabled={processing}
                                                aria-label={`Select message from ${message.name}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-auto">
                                        <i
                                            className="bi bi-star message-star"
                                            title="Star message"
                                            aria-hidden="true"
                                        ></i>
                                    </div>

                                    <div className="col-auto">
                                        <div className="message-actions">
                                            <div
                                                className="btn-group"
                                                role="group"
                                                aria-label={`Actions for message from ${message.name}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary view-message-btn"
                                                    onClick={() =>
                                                        onViewMessage(message)
                                                    }
                                                    disabled={processing}
                                                    title="View Message"
                                                    aria-label="View message"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                {!message.is_read ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success mark-read-btn"
                                                        onClick={() =>
                                                            onMarkAsRead(
                                                                message.id,
                                                            )
                                                        }
                                                        disabled={processing}
                                                        title="Mark as Read"
                                                        aria-label="Mark as read"
                                                    >
                                                        <i className="bi bi-envelope-open"></i>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-warning mark-unread-btn"
                                                        onClick={() =>
                                                            onMarkAsUnread(
                                                                message.id,
                                                            )
                                                        }
                                                        disabled={processing}
                                                        title="Mark as Unread"
                                                        aria-label="Mark as unread"
                                                    >
                                                        <i className="bi bi-envelope"></i>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger delete-message-btn"
                                                    onClick={() =>
                                                        onDeleteMessage(
                                                            message.id,
                                                        )
                                                    }
                                                    disabled={processing}
                                                    title="Delete Message"
                                                    aria-label="Delete message"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="message-sender">
                                            <strong className="sender-name">
                                                {message.name}
                                            </strong>
                                            <div className="sender-email text-muted">
                                                {message.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className="message-subject-preview">
                                            <div className="message-subject">
                                                {!message.is_read && (
                                                    <span className="unread-indicator"></span>
                                                )}
                                                <strong>
                                                    {message.subject ||
                                                        "(No Subject)"}
                                                </strong>
                                            </div>
                                            <div className="message-preview text-muted">
                                                {message.message_preview ||
                                                    message.message}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <div className="message-date text-muted">
                                            {formatDistanceToNow(
                                                new Date(message.created_at),
                                                { addSuffix: true },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {pagination.total_pages > 1 && (
                    <div className="pagination-container mt-4">
                        <nav aria-label="Message pagination">
                            <ul className="pagination justify-content-center">
                                {pagination.has_previous && (
                                    <>
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() => onPageChange(1)}
                                                aria-label="First"
                                            >
                                                <i className="bi bi-chevron-double-left"></i>
                                            </button>
                                        </li>
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() =>
                                                    onPageChange(
                                                        pagination.page - 1,
                                                    )
                                                }
                                                aria-label="Previous"
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                    </>
                                )}

                                {Array.from(
                                    { length: pagination.total_pages },
                                    (_, index) => index + 1,
                                )
                                    .filter(
                                        (page) =>
                                            page === pagination.page ||
                                            (page > pagination.page - 3 &&
                                                page < pagination.page + 3),
                                    )
                                    .map((page) => (
                                        <li
                                            key={page}
                                            className={`page-item ${pagination.page === page ? "active" : ""}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() =>
                                                    onPageChange(page)
                                                }
                                                aria-current={
                                                    pagination.page === page
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}

                                {pagination.has_next && (
                                    <>
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() =>
                                                    onPageChange(
                                                        pagination.page + 1,
                                                    )
                                                }
                                                aria-label="Next"
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                        <li className="page-item">
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() =>
                                                    onPageChange(
                                                        pagination.total_pages,
                                                    )
                                                }
                                                aria-label="Last"
                                            >
                                                <i className="bi bi-chevron-double-right"></i>
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};
