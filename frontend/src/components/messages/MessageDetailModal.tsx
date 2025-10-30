/**
 * MessageDetailModal Component
 * Modal showing full message details with actions
 */

import React from "react";
import { format } from "date-fns";
import type { Message } from "@/types/message";

interface MessageDetailModalProps {
    message: Message | null;
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: (_messageId: number) => void;
    onMarkAsUnread: (_messageId: number) => void;
    onDelete: (_messageId: number) => void;
    processing: boolean;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
    message,
    isOpen,
    onClose,
    onMarkAsRead,
    onMarkAsUnread,
    onDelete,
    processing,
}) => {
    if (!isOpen || !message) return null;

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            onDelete(message.id);
            onClose();
        }
    };

    const handleMarkReadUnread = () => {
        if (message.is_read) {
            onMarkAsUnread(message.id);
        } else {
            onMarkAsRead(message.id);
        }
    };

    return (
        <div
            className="modal fade show d-block"
            style={{
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div
                className="modal-dialog modal-xl"
                style={{ maxWidth: "800px", margin: "20px auto" }}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fw-bold fs-4">
                            <i className="bi bi-envelope me-2"></i>
                            Message Details
                        </h1>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={processing}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <div className="message-detail">
                            {/* Subject */}
                            <div className="message-subject d-flex gap-1 mb-3">
                                <h2 className="fw-bold fs-4">Subject:</h2>
                                <p className="text-muted fs-5">
                                    {message.subject || "(No Subject)"}
                                </p>
                            </div>

                            {/* Sender Info */}
                            <div className="message-meta mb-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>From:</strong> {message.name}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Email:</strong>
                                        <a
                                            href={`mailto:${message.email}`}
                                            className="ms-1"
                                        >
                                            {message.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-md-6">
                                        <strong>Date:</strong>{" "}
                                        {format(
                                            new Date(message.created_at),
                                            "PPP p",
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Status:</strong>
                                        <span
                                            className={`ms-1 badge ${message.is_read ? "bg-success" : "bg-warning"}`}
                                        >
                                            {message.is_read
                                                ? "Read"
                                                : "Unread"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="message-content">
                                <h2 className="fw-bold fs-4">Message:</h2>
                                <p
                                    className="message-body p-3 rounded"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        minHeight: "100px",
                                    }}
                                >
                                    {message.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="d-flex justify-content-between w-100">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onClose}
                                disabled={processing}
                            >
                                Close
                            </button>

                            <div>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={handleDelete}
                                    disabled={processing}
                                >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary ms-2"
                                    onClick={handleMarkReadUnread}
                                    disabled={processing}
                                >
                                    <i
                                        className={`bi ${message.is_read ? "bi-envelope" : "bi-envelope-open"} me-2`}
                                    ></i>
                                    Mark as{" "}
                                    {message.is_read ? "Unread" : "Read"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
