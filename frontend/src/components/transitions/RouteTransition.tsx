import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/hooks/useLoading";

interface RouteTransitionProps {
    children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
    const location = useLocation();
    const { setRouteLoading } = useLoading();
    const previousPathRef = useRef<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const currentPath = location.pathname;

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Only trigger loading if the path actually changed and it's not the initial load
        if (
            previousPathRef.current !== "" &&
            previousPathRef.current !== currentPath
        ) {
            // Show loading when route changes
            setRouteLoading(true);

            // Hide loading after animation completes (800ms to match CSS animation)
            timeoutRef.current = setTimeout(() => {
                setRouteLoading(false);
                timeoutRef.current = null;
            }, 800);
        }

        // Update the previous path reference
        previousPathRef.current = currentPath;

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [location.pathname, setRouteLoading]);

    return <>{children}</>;
};

export default RouteTransition;
