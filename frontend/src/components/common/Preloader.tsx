import React, { useEffect, useState } from "react";
import { useLoading } from "@/hooks/useLoading";
import SVGComponent from "../Logo";

interface PreloaderProps {
    showInitial?: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ showInitial = true }) => {
    const [isVisible, setIsVisible] = useState(showInitial);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const { isLoading, isRouteLoading } = useLoading();

    // Handle initial app load
    useEffect(() => {
        if (showInitial && !initialLoadComplete) {
            // Hide preloader after initial load
            const timer = setTimeout(() => {
                setIsVisible(false);
                setInitialLoadComplete(true);
            }, 800); // Show for 800ms to ensure smooth transition
            return () => clearTimeout(timer);
        }
    }, [showInitial, initialLoadComplete]);

    // Show if any loading state is active, but only after initial load is complete
    const shouldShowFullPreloader =
        (!initialLoadComplete && isVisible) ||
        (initialLoadComplete && isLoading);
    const shouldShowRouteLoader =
        initialLoadComplete && isRouteLoading && !isLoading;

    return (
        <>
            {/* Full page preloader for initial load and manual loading states */}
            {shouldShowFullPreloader && (
                <div
                    id="preloader"
                    className="gap-2 d-flex align-items-center justify-content-center"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        overflow: "hidden",
                        backgroundColor:
                            "var(--preloader-background-color, #fff)",
                        transition: "all 0.6s ease-out",
                        width: "100%",
                        height: "100vh",
                    }}
                >
                    <div
                        className="position-relative"
                        style={{ width: "120px", height: "120px" }}
                    >
                        <div
                            className="spinner-border text-light w-100 h-100"
                            role="status"
                        ></div>
                        <span className="position-absolute text-light top-50 start-50 translate-middle fw-bold">
                            <SVGComponent />
                        </span>
                    </div>
                </div>
            )}

            {/* Minimal loading bar for route transitions */}
            {shouldShowRouteLoader && (
                <div key={Date.now()} className="route-loading"></div>
            )}
        </>
    );
};

export default Preloader;
