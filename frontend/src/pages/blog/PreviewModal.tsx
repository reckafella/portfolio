import React, { useState, useMemo, useEffect } from "react";
import { BlogPreviewContent } from "@/components/blog/BlogPreviewContent";
import "@/styles/device-preview.css";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DevicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    coverImage?: string | null;
    tags?: string[];
    published?: boolean;
    author?: string;
    readingTime?: string;
    viewCount?: number;
    publishedAt?: string;
}

interface DeviceConfig {
    name: string;
    width: number;
    height: number;
    icon: string;
    frameClass: string;
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
    mobile: {
        name: "Mobile",
        width: 375,
        height: 667,
        icon: "bi-phone",
        frameClass: "device-mobile",
    },
    tablet: {
        name: "Tablet",
        width: 768,
        height: 1024,
        icon: "bi-tablet",
        frameClass: "device-tablet",
    },
    desktop: {
        name: "Desktop",
        width: 1200,
        height: 800,
        icon: "bi-laptop",
        frameClass: "device-desktop",
    },
};

export const DevicePreviewModal: React.FC<DevicePreviewModalProps> = ({
    isOpen,
    onClose,
    title,
    content,
    coverImage,
    tags = [],
    published = false,
    author = "Ethan Wanyoike",
    readingTime = "5 min read",
    viewCount = 0,
    publishedAt,
}) => {
    const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const deviceConfig = DEVICE_CONFIGS[selectedDevice];

    // Handle escape key and body scroll lock
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isFullscreen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isFullscreen, onClose]);

    const previewData = useMemo(
        () => ({
            title,
            content,
            coverImage,
            tags,
            published,
            author,
            readingTime,
            viewCount,
            publishedAt: publishedAt || new Date().toISOString(),
            excerpt: content.replace(/<[^>]*>/g, "").substring(0, 160) + "...",
        }),
        [
            title,
            content,
            coverImage,
            tags,
            published,
            author,
            readingTime,
            viewCount,
            publishedAt,
        ],
    );

    if (!isOpen) return null;

    const handleDeviceChange = (device: DeviceType) => {
        setSelectedDevice(device);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const getPreviewStyle = () => {
        if (isFullscreen) {
            return {
                width: "100vw",
                height: "100vh",
                maxWidth: "none",
                maxHeight: "none",
            };
        }

        return {
            width: `${deviceConfig.width}px`,
            height: `${deviceConfig.height}px`,
            maxWidth: "90vw",
            maxHeight: "90vh",
        };
    };

    // Handle backdrop click only (not modal content clicks)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="devicePreviewModalLabel"
            aria-modal="true"
            onClick={handleBackdropClick}
            
        >
            <div className="modal-backdrop fade show"></div>
            <div
                className={`modal-dialog ${isFullscreen ? "modal-fullscreen" : "modal-xl"} modal-dialog-centered`}
                role="document"
            >
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className="d-flex align-items-center">
                            <h5 className="modal-title me-3" id="devicePreviewModalLabel">
                                <i className="bi bi-eye me-2"></i>
                                Preview: {title || "Untitled"}
                            </h5>
                            {!published && (
                                <span className="badge bg-warning">
                                    <i className="bi bi-eye-slash me-1"></i>
                                    Draft
                                </span>
                            )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {/* Device Selection */}
                            <div className="btn-group" role="group" aria-label="Device selection">
                                {Object.entries(DEVICE_CONFIGS).map(
                                    ([device, config]) => (
                                        <button
                                            key={device}
                                            type="button"
                                            className={`btn btn-outline-secondary btn-sm ${selectedDevice === device
                                                    ? "active"
                                                    : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeviceChange(device as DeviceType);
                                            }}
                                            title={`Preview on ${config.name}`}
                                            aria-label={`Preview on ${config.name}`}
                                        >
                                            <i
                                                className={`bi ${config.icon} me-1`}
                                            ></i>
                                            {config.name}
                                        </button>
                                    ),
                                )}
                            </div>

                            {/* Fullscreen Toggle */}
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullscreen();
                                }}
                                title={
                                    isFullscreen
                                        ? "Exit Fullscreen"
                                        : "Enter Fullscreen"
                                }
                                aria-label={
                                    isFullscreen
                                        ? "Exit Fullscreen"
                                        : "Enter Fullscreen"
                                }
                            >
                                <i
                                    className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}
                                ></i>
                            </button>

                            {/* Close Button */}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                aria-label="Close"
                            ></button>
                        </div>
                    </div>

                    <div className="modal-body p-0">
                        <div className="device-preview-container">
                            <div
                                className={`device-frame ${deviceConfig.frameClass} ${isFullscreen ? "fullscreen" : ""}`}
                                style={getPreviewStyle()}
                            >
                                <div className="device-screen">
                                    <div className="preview-content-wrapper">
                                        <BlogPreviewContent {...previewData} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="text-muted small">
                                <i
                                    className={`bi ${deviceConfig.icon} me-1`}
                                ></i>
                                {deviceConfig.name} ({deviceConfig.width}×
                                {deviceConfig.height})
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open("#", "_blank");
                                    }}
                                    disabled
                                    title="Live preview will be available after publishing"
                                >
                                    <i className="bi bi-box-arrow-up-right me-1"></i>
                                    View Live
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                    }}
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
