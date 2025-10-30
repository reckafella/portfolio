import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ApiError,
    redirectToErrorPage,
    useErrorHandler,
} from "@/utils/errorUtils";

interface ApiErrorHandlerProps {
    children: React.ReactNode;
}

/**
 * Higher-order component that provides error handling for API calls
 */
export const withErrorHandler = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentType<P> => {
    const WithErrorHandlerComponent = (props: P) => {
        const navigate = useNavigate();
        const { handleError } = useErrorHandler();

        // Inject error handler into props
        const enhancedProps = {
            ...props,
            onError: (_error: Error | ApiError) =>
                handleError(_error, navigate),
        } as P;

        return <WrappedComponent {...enhancedProps} />;
    };

    WithErrorHandlerComponent.displayName = `withErrorHandler(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithErrorHandlerComponent;
};

/**
 * Context for error handling
 */
interface ErrorContextType {
    handleError: (_error: Error | ApiError) => void;
    redirectToError: (_statusCode: number) => void;
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(
    undefined,
);

/**
 * Provider component for error handling context
 */
export const ErrorProvider: React.FC<ApiErrorHandlerProps> = ({ children }) => {
    const navigate = useNavigate();
    const { handleError: baseHandleError } = useErrorHandler();

    const handleError = React.useCallback(
        (error: Error | ApiError) => {
            baseHandleError(error, navigate);
        },
        [baseHandleError, navigate],
    );

    const redirectToError = React.useCallback(
        (statusCode: number) => {
            redirectToErrorPage(statusCode, navigate);
        },
        [navigate],
    );

    const value = React.useMemo(
        () => ({
            handleError,
            redirectToError,
        }),
        [handleError, redirectToError],
    );

    return (
        <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
    );
};

/**
 * Hook to use error handling context
 */
export const useError = (): ErrorContextType => {
    const context = React.useContext(ErrorContext);
    if (context === undefined) {
        throw new Error("useError must be used within an ErrorProvider");
    }
    return context;
};

/**
 * Custom hook for API calls with automatic error handling
 */
export const useApiCall = () => {
    const { handleError } = useError();

    const apiCall = React.useCallback(
        async <T,>(
            apiFunction: () => Promise<T>,
            onSuccess?: (_data: T) => void,
            onError?: (_error: Error | ApiError) => void,
        ): Promise<T | void> => {
            try {
                const result = await apiFunction();
                onSuccess?.(result);
                return result;
            } catch (error) {
                const errorToHandle =
                    error instanceof Error ? error : new Error("Unknown error");
                onError?.(errorToHandle);
                handleError(errorToHandle);
            }
        },
        [handleError],
    );

    return { apiCall };
};

export default ErrorProvider;
