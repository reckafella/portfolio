import { useCallback } from "react";
import { useLoading } from "./useLoading";

interface UsePreloaderReturn {
    showLoader: () => void;
    hideLoader: () => void;
    showRouteLoader: () => void;
    hideRouteLoader: () => void;
    isLoading: boolean;
    isRouteLoading: boolean;
}

export const usePreloader = (): UsePreloaderReturn => {
    const { isLoading, setLoading, isRouteLoading, setRouteLoading } =
        useLoading();

    const showLoader = useCallback(() => {
        setLoading(true);
    }, [setLoading]);

    const hideLoader = useCallback(() => {
        setLoading(false);
    }, [setLoading]);

    const showRouteLoader = useCallback(() => {
        setRouteLoading(true);
    }, [setRouteLoading]);

    const hideRouteLoader = useCallback(() => {
        setRouteLoading(false);
    }, [setRouteLoading]);

    return {
        showLoader,
        hideLoader,
        showRouteLoader,
        hideRouteLoader,
        isLoading,
        isRouteLoading,
    };
};

export default usePreloader;
