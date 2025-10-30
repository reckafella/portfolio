import React, { useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import "@/styles/share.css";

interface ShareButtonProps {
    url: string;
    title: string;
    imageUrl?: string;
    description?: string;
    className?: string;
    size?: "sm" | "lg" | undefined;
    variant?: "icon" | "text" | "both";
    position?: "inline" | "floating";
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    url,
    title,
    imageUrl,
    description,
    className = "",
    size = "sm",
    variant = "icon",
    position = "inline",
}) => {
    const [showModal, setShowModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document?.execCommand("copy");
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    }, [url]);

    const getShareUrls = () => {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        return {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        };
    };

    const shareUrls = getShareUrls();

    const getButtonClasses = () => {
        const baseClasses = "share-link";
        const variantClasses = {
            icon: "btn-outline-secondary",
            text: "btn-outline-secondary",
            both: "btn-outline-secondary",
        };
        const positionClasses = position === "floating" ? "position-fixed" : "";

        return `${baseClasses} ${variantClasses[variant]} ${positionClasses} ${className}`;
    };

    const getButtonContent = () => {
        switch (variant) {
            case "icon":
                return <i className="bi bi-share-fill"></i>;
            case "text":
                return "Share";
            case "both":
                return (
                    <>
                        <i className="bi bi-share-fill me-1"></i>
                        Share
                    </>
                );
            default:
                return <i className="bi bi-share-fill"></i>;
        }
    };

    const getPositionStyles = () => {
        if (position === "floating") {
            return {
                top: "20px",
                right: "20px",
                zIndex: 1000,
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            };
        }
        return {};
    };

    return (
        <>
            {/* Share Button */}
            <Button
                size={size}
                className={getButtonClasses()}
                style={getPositionStyles()}
                onClick={handleShow}
                data-share-url={url}
                data-share-title={title}
                data-share-image={imageUrl}
                data-share-description={description}
                title={`Share: ${title}`}
            >
                {getButtonContent()}
            </Button>

            {/* React Bootstrap Modal */}
            <Modal show={showModal} onHide={handleClose} size={size}>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title>
                        <span className="fw-bold">Share</span> {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Image preview */}
                    {imageUrl && (
                        <div className="share-image-container mb-3 text-center">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="share-image-preview img-fluid rounded"
                                style={{
                                    maxHeight: "170px",
                                    objectFit: "cover",
                                }}
                                loading="lazy"
                            />
                        </div>
                    )}

                    <div className="d-grid gap-2">
                        {/* Copy Link */}
                        <Button
                            variant={
                                copySuccess ? "success" : "outline-secondary"
                            }
                            className="share-btn d-flex align-items-center gap-3 py-2"
                            onClick={handleCopyLink}
                        >
                            <i
                                className={`bi ${copySuccess ? "bi-check-circle" : "bi-copy"}`}
                            ></i>
                            <span>
                                {copySuccess ? "Link Copied!" : "Copy link"}
                            </span>
                        </Button>

                        {/* Facebook */}
                        <Button
                            as="a"
                            href={shareUrls.facebook}
                            variant="outline-primary"
                            className="share-btn d-flex align-items-center gap-3 py-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-facebook text-primary"></i>
                            <span>Share on Facebook</span>
                        </Button>

                        {/* Twitter/X */}
                        <Button
                            as="a"
                            href={shareUrls.twitter}
                            variant="outline-info"
                            className="share-btn d-flex align-items-center gap-3 py-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-twitter-x text-info"></i>
                            <span>Share on X</span>
                        </Button>

                        {/* WhatsApp */}
                        <Button
                            as="a"
                            href={shareUrls.whatsapp}
                            variant="outline-success"
                            className="share-btn d-flex align-items-center gap-3 py-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-whatsapp text-success"></i>
                            <span>Share on WhatsApp</span>
                        </Button>

                        {/* LinkedIn */}
                        <Button
                            as="a"
                            href={shareUrls.linkedin}
                            variant="outline-primary"
                            className="share-btn d-flex align-items-center gap-3 py-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-linkedin text-primary"></i>
                            <span>Share on LinkedIn</span>
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};
