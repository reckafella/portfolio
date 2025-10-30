/**
 * InboxSidebar Component
 * Sidebar with filters, stats, and navigation
 */

import React, { useState } from "react";
import type { MessageStats, FilterType } from "@/types/message";

interface InboxSidebarProps {
    stats: MessageStats;
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const InboxSidebar: React.FC<InboxSidebarProps> = ({
    stats,
    currentFilter,
    onFilterChange,
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth >= 992) {
            setIsMinimized(!isMinimized);
        } else {
            setIsMobileCollapsed(!isMobileCollapsed);
        }
    };

    return (
        <div
            className={`inbox-sidebar ${isMinimized ? "sidebar-minimized" : ""}`}
        >
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0">
                            <i className="bi bi-inbox-fill me-2"></i>
                            {!isMinimized && <span>Message Inbox</span>}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={toggleSidebar}
                            title={
                                isMinimized
                                    ? "Expand sidebar"
                                    : "Minimize sidebar"
                            }
                        >
                            <i
                                className={`bi ${isMinimized ? "bi-chevron-right" : "bi-chevron-left"}`}
                            ></i>
                        </button>
                    </div>

                    <div
                        className={`sidebar-content ${isMobileCollapsed ? "d-none" : ""}`}
                    >
                        {/* Compose button (future feature) */}
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary" disabled>
                                <i className="bi bi-plus-circle me-2"></i>
                                {!isMinimized && <span>Compose</span>}
                            </button>
                        </div>

                        {/* Folder Navigation */}
                        <div className="inbox-folders">
                            <ul className="list-unstyled">
                                <li className="folder-item">
                                    <button
                                        onClick={() => onFilterChange("all")}
                                        className={`folder-link w-100 ${currentFilter === "all" ? "active" : ""}`}
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-inbox me-3"></i>
                                            {!isMinimized && (
                                                <span>All Messages</span>
                                            )}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-info">
                                                {stats.total_messages}
                                            </span>
                                        )}
                                    </button>
                                </li>
                                <li className="folder-item">
                                    <button
                                        onClick={() => onFilterChange("unread")}
                                        className={`folder-link w-100 ${currentFilter === "unread" ? "active" : ""}`}
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-envelope me-3"></i>
                                            {!isMinimized && (
                                                <span>Unread</span>
                                            )}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-warning">
                                                {stats.unread_count}
                                            </span>
                                        )}
                                    </button>
                                </li>
                                <li className="folder-item">
                                    <button
                                        onClick={() => onFilterChange("read")}
                                        className={`folder-link w-100 ${currentFilter === "read" ? "active" : ""}`}
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-envelope-open me-3"></i>
                                            {!isMinimized && <span>Read</span>}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-success">
                                                {stats.read_count}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Quick Stats */}
                        {!isMinimized && (
                            <div className="inbox-stats mt-4">
                                <h6 className="text-muted">Quick Stats</h6>
                                <div className="stat-item">
                                    <small className="text-muted">
                                        Total Messages:
                                    </small>
                                    <strong className="float-end">
                                        {stats.total_messages}
                                    </strong>
                                </div>
                                <div className="stat-item">
                                    <small className="text-muted">
                                        Unread:
                                    </small>
                                    <strong className="float-end text-warning">
                                        {stats.unread_count}
                                    </strong>
                                </div>
                                <div className="stat-item">
                                    <small className="text-muted">Read:</small>
                                    <strong className="float-end text-success">
                                        {stats.read_count}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
