/**
 * InboxSidebar Component
 * Sidebar with filters, stats, and navigation
 */

import React from "react";
import type { MessageStats, FilterType } from "@/types/message";

interface InboxSidebarProps {
    stats: MessageStats;
    currentFilter: FilterType;
    onFilterChange: (_filter: FilterType) => void;
    isMinimized: boolean;
    isMobileCollapsed: boolean;
    onToggle: () => void;
}

export const InboxSidebar: React.FC<InboxSidebarProps> = ({
    stats,
    currentFilter,
    onFilterChange,
    isMinimized,
    isMobileCollapsed,
    onToggle,
}) => {
    return (
        <div
            className={`inbox-sidebar ${isMinimized ? "sidebar-minimized" : ""} ${isMobileCollapsed ? "mobile-collapsed" : ""}`}
            id="inbox-sidebar"
        >
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0">
                            <i className="bi bi-inbox-fill me-2"></i>
                            {!isMinimized && (
                                <span className="sidebar-text">
                                    Message Inbox
                                </span>
                            )}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            id="sidebar-toggle-btn"
                            onClick={onToggle}
                            title={
                                isMinimized
                                    ? "Expand sidebar"
                                    : isMobileCollapsed
                                      ? "Show sidebar"
                                      : "Toggle sidebar"
                            }
                            aria-label={
                                isMinimized
                                    ? "Expand sidebar"
                                    : isMobileCollapsed
                                      ? "Show sidebar"
                                      : "Toggle sidebar"
                            }
                        >
                            <i
                                className={`bi ${isMinimized ? "bi-chevron-right" : "bi-chevron-left"} d-none d-lg-inline`}
                            ></i>
                            <i
                                className={`bi ${isMobileCollapsed ? "bi-chevron-down" : "bi-chevron-up"} d-lg-none`}
                            ></i>
                        </button>
                    </div>

                    <div className="sidebar-content" id="sidebar-content">
                        {/* Compose button (future feature) */}
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary" disabled>
                                <i className="bi bi-plus-circle me-2"></i>
                                {!isMinimized && (
                                    <span className="sidebar-text">
                                        Compose (Coming Soon)
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Folder Navigation */}
                        <div className="inbox-folders">
                            <ul className="list-unstyled">
                                <li className="folder-item">
                                    <button
                                        type="button"
                                        onClick={() => onFilterChange("all")}
                                        className={`folder-link w-100 ${currentFilter === "all" ? "active" : ""}`}
                                        aria-pressed={currentFilter === "all"}
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-inbox me-3"></i>
                                            {!isMinimized && (
                                                <span className="sidebar-text">
                                                    All Messages
                                                </span>
                                            )}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-info sidebar-text">
                                                {stats.total_messages}
                                            </span>
                                        )}
                                    </button>
                                </li>
                                <li className="folder-item">
                                    <button
                                        type="button"
                                        onClick={() => onFilterChange("unread")}
                                        className={`folder-link w-100 ${currentFilter === "unread" ? "active" : ""}`}
                                        aria-pressed={
                                            currentFilter === "unread"
                                        }
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-envelope me-3"></i>
                                            {!isMinimized && (
                                                <span className="sidebar-text">
                                                    Unread
                                                </span>
                                            )}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-info sidebar-text">
                                                {stats.unread_count}
                                            </span>
                                        )}
                                    </button>
                                </li>
                                <li className="folder-item">
                                    <button
                                        type="button"
                                        onClick={() => onFilterChange("read")}
                                        className={`folder-link w-100 ${currentFilter === "read" ? "active" : ""}`}
                                        aria-pressed={currentFilter === "read"}
                                    >
                                        <div className="folder-link-content">
                                            <i className="bi bi-envelope-open me-3"></i>
                                            {!isMinimized && (
                                                <span className="sidebar-text">
                                                    Read
                                                </span>
                                            )}
                                        </div>
                                        {!isMinimized && (
                                            <span className="badge bg-success sidebar-text">
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
                                <h6 className="text-muted sidebar-text">
                                    Quick Stats
                                </h6>
                                <div className="stat-item">
                                    <small className="text-muted sidebar-text">
                                        Total Messages:
                                    </small>
                                    <strong className="float-end sidebar-text">
                                        {stats.total_messages}
                                    </strong>
                                </div>
                                <div className="stat-item">
                                    <small className="text-muted sidebar-text">
                                        Unread:
                                    </small>
                                    <strong className="float-end text-warning sidebar-text">
                                        {stats.unread_count}
                                    </strong>
                                </div>
                                <div className="stat-item">
                                    <small className="text-muted sidebar-text">
                                        Read:
                                    </small>
                                    <strong className="float-end text-success sidebar-text">
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
