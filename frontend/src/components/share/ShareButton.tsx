import React, { useState, useCallback } from 'react';
import '@/styles/share.css';

interface ShareButtonProps {
    url: string;
    title: string;
    imageUrl?: string;
    description?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'text' | 'both';
    position?: 'inline' | 'floating';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    url,
    title,
    imageUrl,
    description,
    className = '',
    size = 'sm',
    variant = 'icon',
    position = 'inline'
}) => {
    const [showModal, setShowModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document?.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    }, [url]);

    const getShareUrls = () => {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        // const encodedDescription = encodeURIComponent(description || '');

        return {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        };
    };

    const shareUrls = getShareUrls();

    const getButtonClasses = () => {
        const baseClasses = 'btn share-link';
        const sizeClasses = {
            sm: 'btn-sm',
            md: '',
            lg: 'btn-lg'
        };
        const variantClasses = {
            icon: 'btn-outline-secondary',
            text: 'btn-outline-secondary',
            both: 'btn-outline-secondary'
        };
        const positionClasses = position === 'floating' ? 'position-fixed' : '';
        
        return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${positionClasses} ${className}`;
    };

    const getButtonContent = () => {
        switch (variant) {
            case 'icon':
                return <i className="bi bi-share-fill"></i>;
            case 'text':
                return 'Share';
            case 'both':
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
        if (position === 'floating') {
            return {
                top: '20px',
                right: '20px',
                zIndex: 1000,
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            };
        }
        return {};
    };

    return (
        <>
            {/* Share Button */}
            <button
                type="button"
                className={getButtonClasses()}
                style={getPositionStyles()}
                onClick={() => setShowModal(true)}
                data-share-url={url}
                data-share-title={title}
                data-share-image={imageUrl}
                data-share-description={description}
                title={`Share: ${title}`}
            >
                {getButtonContent()}
            </button>

            {/* Share Modal */}
            {showModal && (
                <>
                    <div className="modal show d-block" tabIndex={-1} role="dialog">
                        <div className="modal-dialog modal-sm" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="modal-title">
                                        <span className="fw-bold">Share</span> {title}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    >
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* Image preview */}
                                    {imageUrl && (
                                        <div className="share-image-container mb-3 text-center">
                                            <img
                                                src={imageUrl}
                                                alt={title}
                                                className="share-image-preview img-fluid rounded"
                                                style={{ maxHeight: '150px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="d-grid gap-2">
                                        {/* Copy Link */}
                                        <button
                                            className={`btn share-btn d-flex align-items-center gap-3 py-2 ${
                                                copySuccess ? 'btn-success' : 'btn-outline-secondary'
                                            }`}
                                            onClick={handleCopyLink}
                                        >
                                            <i className={`bi ${copySuccess ? 'bi-check-circle' : 'bi-copy'}`}></i>
                                            <span>{copySuccess ? 'Link Copied!' : 'Copy link'}</span>
                                        </button>

                                        {/* Facebook */}
                                        <a
                                            href={shareUrls.facebook}
                                            className="btn share-btn d-flex align-items-center gap-3 py-2 btn-outline-primary"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="bi bi-facebook text-primary"></i>
                                            <span>Share on Facebook</span>
                                        </a>

                                        {/* Twitter/X */}
                                        <a
                                            href={shareUrls.twitter}
                                            className="btn share-btn d-flex align-items-center gap-3 py-2 btn-outline-info"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="bi bi-twitter-x text-info"></i>
                                            <span>Share on X</span>
                                        </a>

                                        {/* WhatsApp */}
                                        <a
                                            href={shareUrls.whatsapp}
                                            className="btn share-btn d-flex align-items-center gap-3 py-2 btn-outline-success"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="bi bi-whatsapp text-success"></i>
                                            <span>Share on WhatsApp</span>
                                        </a>

                                        {/* LinkedIn */}
                                        <a
                                            href={shareUrls.linkedin}
                                            className="btn share-btn d-flex align-items-center gap-3 py-2 btn-outline-primary"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="bi bi-linkedin text-primary"></i>
                                            <span>Share on LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                </>
            )}
        </>
    );
};
