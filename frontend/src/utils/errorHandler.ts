/**
 * Error handler utilities for API error responses
 * Parses backend error responses and displays appropriate toast notifications
 */

export interface ApiErrorResponse {
    success: false;
    error: {
        type: "validation" | "server" | "cloudinary" | "auth" | string;
        message: string;
        code?: string;
        details?: Record<string, any>;
    };
}

export interface ApiError {
    response?: {
        data?: ApiErrorResponse | any;
        status?: number;
    };
    message?: string;
}

/**
 * Check if error response matches our standardized format
 */
function isStandardizedError(data: any): data is ApiErrorResponse {
    return (
        data &&
        typeof data === "object" &&
        data.success === false &&
        data.error &&
        typeof data.error === "object" &&
        typeof data.error.message === "string"
    );
}

/**
 * Handle API errors and display appropriate toast notifications
 *
 * @param error - The error object from axios or fetch
 * @param fallbackMessage - Optional fallback message if error can't be parsed
 * @returns Formatted error message
 */
export function handleApiError(
    error: ApiError,
    fallbackMessage: string = "An unexpected error occurred. Please try again.",
): string {
    // Check if we have a response with data
    if (error.response?.data) {
        const data = error.response.data;

        // Check if it's our standardized error format
        if (isStandardizedError(data)) {
            return data.error.message;
        }

        // Handle Django REST framework validation errors
        if (typeof data === "object") {
            // Check for field-specific errors
            const fieldErrors: string[] = [];
            for (const [field, messages] of Object.entries(data)) {
                if (Array.isArray(messages)) {
                    fieldErrors.push(`${field}: ${messages.join(", ")}`);
                } else if (typeof messages === "string") {
                    fieldErrors.push(`${field}: ${messages}`);
                }
            }

            if (fieldErrors.length > 0) {
                return fieldErrors.join("\n");
            }

            // Check for error or detail field
            if (data.error && typeof data.error === "string") {
                return data.error;
            }
            if (data.detail && typeof data.detail === "string") {
                return data.detail;
            }
            if (data.message && typeof data.message === "string") {
                return data.message;
            }
        }

        // If data is a string, return it
        if (typeof data === "string") {
            return data;
        }
    }

    // Network errors or errors without response
    if (error.message) {
        return error.message;
    }

    // Fallback message
    return fallbackMessage;
}

/**
 * Get error type from standardized error response
 *
 * @param error - The error object
 * @returns Error type string
 */
export function getErrorType(error: ApiError): string {
    if (error.response?.data && isStandardizedError(error.response.data)) {
        return error.response.data.error.type;
    }
    return "unknown";
}

/**
 * Get error code from standardized error response
 *
 * @param error - The error object
 * @returns Error code or undefined
 */
export function getErrorCode(error: ApiError): string | undefined {
    if (error.response?.data && isStandardizedError(error.response.data)) {
        return error.response.data.error.code;
    }
    return undefined;
}

/**
 * Check if error is a Cloudinary-related error
 *
 * @param error - The error object
 * @returns True if it's a Cloudinary error
 */
export function isCloudinaryError(error: ApiError): boolean {
    const errorType = getErrorType(error);
    return errorType === "cloudinary";
}

/**
 * Check if error is a validation error
 *
 * @param error - The error object
 * @returns True if it's a validation error
 */
export function isValidationError(error: ApiError): boolean {
    const errorType = getErrorType(error);
    return errorType === "validation";
}

/**
 * Format error for display with toast notification
 * Returns appropriate toast variant based on error type
 *
 * @param error - The error object
 * @returns Object with message and variant for toast
 */
export function formatErrorForToast(error: ApiError): {
    message: string;
    variant: "error" | "warning" | "info";
} {
    const message = handleApiError(error);
    const errorType = getErrorType(error);

    // Determine toast variant based on error type
    let variant: "error" | "warning" | "info" = "error";

    if (errorType === "validation") {
        variant = "warning";
    } else if (errorType === "cloudinary") {
        variant = "error";
    } else if (errorType === "auth") {
        variant = "warning";
    }

    return { message, variant };
}
