import { CaptchaData } from "@/types/unifiedForms";
import { useEffect, useRef, useCallback } from "react";

export const CaptchaInput: React.FC<{
    fieldName: string;
    textBaseProps: Record<string, unknown>;
    captchaData: CaptchaData | null;
    onRefresh: () => void;
    isRefreshing: boolean;
    isSubmitting: boolean;
}> = ({
    fieldName,
    textBaseProps,
    captchaData,
    onRefresh,
    isRefreshing,
    isSubmitting,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);

    // Generate cache-busted image URL
    const getImageSrc = useCallback(() => {
        if (!captchaData?.image) return '';
        
        // For base64 data URLs, don't add query params (they're not supported)
        if (captchaData.image.startsWith('data:')) {
            return captchaData.image;
        }
        
        // For regular URLs, add timestamp as cache-buster
        const separator = captchaData.image.includes('?') ? '&' : '?';
        return `${captchaData.image}${separator}t=${captchaData.timestamp}`;
    }, [captchaData?.image, captchaData?.timestamp]);

    useEffect(() => {
        console.log('CaptchaInput received new captchaData:', {
            key: captchaData?.key,
            timestamp: captchaData?.timestamp,
            hasImage: !!captchaData?.image,
        });
    }, [captchaData]);

    // Force image reload when captcha data changes
    useEffect(() => {
        if (imgRef.current && captchaData?.image) {
            const newSrc = getImageSrc();
            // Force reload by temporarily clearing src then setting new one
            imgRef.current.src = '';
            setTimeout(() => {
                if (imgRef.current) {
                    imgRef.current.src = newSrc;
                }
            }, 0);
        }
    }, [captchaData?.timestamp, captchaData?.key, captchaData?.image, getImageSrc]);

    return (
        <div id={fieldName} className="d-flex justify-content-center align-items-center gap-1">
            <input
                type="text"
                {...textBaseProps}
                placeholder="Enter the characters shown above"
                autoComplete="off"
            />
            {captchaData ? (
                <div className="captcha-container mb-0">
                    <div className="d-flex align-items-center gap-2 mb-0">
                        <img
                            ref={imgRef}
                            key={captchaData.timestamp || captchaData.key}
                            id="captcha-image"
                            src={getImageSrc()}
                            alt="CAPTCHA"
                            className="border rounded"
                            style={{
                                height: "40px",
                                opacity: isRefreshing ? 0.5 : 1,
                                transition: "opacity 0.3s ease",
                            }}
                            onError={onRefresh}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={onRefresh}
                            disabled={isSubmitting || isRefreshing}
                            title="Refresh CAPTCHA"
                        >
                            <i
                                className={`bi bi-arrow-repeat ${isRefreshing ? "captcha-refresh-spin" : ""}`}
                            ></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning mb-0">
                    <small>
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        CAPTCHA failed to load.
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0 ms-1"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? "Loading..." : "Try again"}
                        </button>
                    </small>
                </div>
            )}
        </div>
    );
};
