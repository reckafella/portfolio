import { CaptchaData } from "@/types/unifiedForms";

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
    return (
        <div id={fieldName} className="d-flex justify-content-center align-items-center gap-1">
            <input
                type="text"
                {...textBaseProps}
                placeholder="Enter the characters shown above"
                autoComplete="off"
            />
            {captchaData ? (
                <div className="captcha-container mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <img
                            src={captchaData.image}
                            alt="CAPTCHA"
                            className="border rounded"
                            style={{
                                height: "35px",
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
                <div className="alert alert-warning mb-3">
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
