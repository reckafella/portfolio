/**
 * Error handling utilities for redirecting to appropriate error pages
 */

export const ErrorCodes = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Redirects to the appropriate error page based on status code
 * @param statusCode - HTTP status code
 * @param navigate - React Router navigate function
 * @param replace - Whether to replace current history entry (default: true)
 */
export const redirectToErrorPage = (
    statusCode: number,
    navigate: (_path: string, _options?: { replace?: boolean }) => void,
    replace: boolean = true,
) => {
    const errorPath = getErrorPagePath(statusCode);
    navigate(errorPath, { replace });
};

/**
 * Gets the error page path for a given status code
 * @param statusCode - HTTP status code
 * @returns Error page path
 */
export const getErrorPagePath = (statusCode: number): string => {
    switch (statusCode) {
        case ErrorCodes.BAD_REQUEST:
            return "/error/400";
        case ErrorCodes.UNAUTHORIZED:
            return "/error/401";
        case ErrorCodes.FORBIDDEN:
            return "/error/403";
        case ErrorCodes.NOT_FOUND:
            return "/error/404";
        case ErrorCodes.INTERNAL_SERVER_ERROR:
            return "/error/500";
        default:
            // For any other error, show 500 page
            return "/error/500";
    }
};

/**
 * Checks if a status code represents an error
 * @param statusCode - HTTP status code
 * @returns True if status code is an error (>= 400)
 */
export const isErrorStatus = (statusCode: number): boolean => {
    return statusCode >= 400;
};

/**
 * Gets error message for status code
 * @param statusCode - HTTP status code
 * @returns Human readable error message
 */
export const getErrorMessage = (statusCode: number): string => {
    switch (statusCode) {
        case ErrorCodes.BAD_REQUEST:
            return "Bad Request - The request could not be understood by the server";
        case ErrorCodes.UNAUTHORIZED:
            return "Unauthorized - Authentication is required";
        case ErrorCodes.FORBIDDEN:
            return "Forbidden - You do not have permission to access this resource";
        case ErrorCodes.NOT_FOUND:
            return "Not Found - The requested resource could not be found";
        case ErrorCodes.INTERNAL_SERVER_ERROR:
            return "Internal Server Error - Something went wrong on our end";
        default:
            return "An unexpected error occurred";
    }
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        public _statusCode: number,
        public _statusText: string,
        public _message?: string,
    ) {
        super(_message || getErrorMessage(_statusCode));
        this.name = "ApiError";
    }
}

/**
 * Handles API response errors and throws appropriate ApiError
 * @param response - Fetch Response object
 * @throws ApiError
 */
export const handleApiError = async (response: Response): Promise<void> => {
    if (!response.ok) {
        let errorMessage: string;

        try {
            const errorData = await response.json();
            errorMessage =
                errorData.message ||
                errorData.detail ||
                getErrorMessage(response.status);
        } catch {
            // If response is not JSON, use default message
            errorMessage = getErrorMessage(response.status);
        }

        throw new ApiError(response.status, response.statusText, errorMessage);
    }
};

/**
 * React hook for handling errors with navigation
 */
export const useErrorHandler = () => {
    const handleError = (
        error: Error | ApiError,
        navigate: (_path: string, _options?: { replace?: boolean }) => void,
    ) => {
        //throw new Error('Error occurred: ' + error);

        if (error instanceof ApiError) {
            redirectToErrorPage(error._statusCode, navigate);
        } else {
            // For non-API errors, show generic error page
            redirectToErrorPage(ErrorCodes.INTERNAL_SERVER_ERROR, navigate);
        }
    };

    return { handleError };
};
