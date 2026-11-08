import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const LogoutPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const { logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const logoutStarted = useRef(false);

    usePageTitle("Logout");

    useEffect(() => {
        if (isAuthLoading || logoutStarted.current) return;
        logoutStarted.current = true;

        const handleLogout = async () => {
            if (isAuthenticated) {
                try {
                    await logout();
                    window.location.replace("/");
                } catch (err: unknown) {
                    const errorMessage =
                        err instanceof Error ? err.message : "Logout failed";
                    setError(errorMessage);
                    setIsLoading(false);
                }
            } else {
                window.location.replace("/");
            }
        };

        handleLogout();
    }, [logout, isAuthenticated, isAuthLoading]);

    const handleManualRedirect = () => {
        window.location.replace("/");
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    <h1 className="alert-heading">
                                        Logout Error
                                    </h1>
                                    <p>{error}</p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleManualRedirect}
                                >
                                    Go to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body text-center">
                            <div className="mb-4">
                                {isLoading ? (
                                    <>
                                        <h1 className="fw-bold">Log out</h1>
                                        <p className="text-muted">
                                            Please wait while we sign you out
                                            securely.
                                        </p>
                                        <LoadingSpinner
                                            size="md"
                                            text="Logging you out..."
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="fw-bold">
                                            Successfully logged out!
                                        </h1>
                                        <div className="text-success mb-3">
                                            <i
                                                className="bi bi-check-circle"
                                                style={{ fontSize: "3rem" }}
                                            ></i>
                                        </div>
                                        <p className="text-muted">
                                            You have been signed out.
                                            Redirecting to home page...
                                        </p>
                                    </>
                                )}
                            </div>

                            <button
                                className="btn btn-outline-primary"
                                onClick={handleManualRedirect}
                                disabled={isLoading}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutPage;
