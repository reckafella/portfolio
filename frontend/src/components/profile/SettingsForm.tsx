import React, { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useProfile";

/**
 * SettingsForm component for managing notification settings
 * Replicates: authentication/templates/auth/profile/partials/settings.html
 */
export const SettingsForm: React.FC = () => {
    const { data: settings, isLoading } = useSettings();
    const updateSettingsMutation = useUpdateSettings();

    const [formData, setFormData] = useState({
        changes_notifications: false,
        new_products_notifications: false,
        marketing_notifications: false,
        security_notifications: false,
    });

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Update form when settings load
    useEffect(() => {
        if (settings) {
            setFormData({
                changes_notifications: settings.changes_notifications ?? false,
                new_products_notifications:
                    settings.new_products_notifications ?? false,
                marketing_notifications:
                    settings.marketing_notifications ?? false,
                security_notifications:
                    settings.security_notifications ?? false,
            });
        }
    }, [settings]);

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const response = await updateSettingsMutation.mutateAsync(formData);
            setSuccessMessage(
                response.message || "Settings updated successfully!",
            );

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return (
            <div
                className="tab-pane fade show active pt-3"
                id="profile-settings"
            >
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "200px" }}
                >
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">
                            Loading settings...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane fade show active pt-3" id="profile-settings">
            {successMessage && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccessMessage("")}
                    ></button>
                </div>
            )}

            {errorMessage && (
                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errorMessage}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setErrorMessage("")}
                    ></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <label className="col-md-4 col-lg-3 col-form-label fw-bold">
                        Email Notifications
                    </label>
                    <div className="col-md-8 col-lg-9">
                        <div className="form-switch form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                id="changes_notifications"
                                name="changes_notifications"
                                checked={formData.changes_notifications}
                                onChange={handleToggleChange}
                            />
                            <label
                                htmlFor="changes_notifications"
                                className="form-check-label"
                            >
                                Changes Notifications
                            </label>
                            <div className="form-text">
                                Receive notifications when changes are made to
                                your account
                            </div>
                        </div>

                        <div className="form-switch form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                id="new_products_notifications"
                                name="new_products_notifications"
                                checked={formData.new_products_notifications}
                                onChange={handleToggleChange}
                            />
                            <label
                                htmlFor="new_products_notifications"
                                className="form-check-label"
                            >
                                New Products Notifications
                            </label>
                            <div className="form-text">
                                Get notified about new products and features
                            </div>
                        </div>

                        <div className="form-switch form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                id="marketing_notifications"
                                name="marketing_notifications"
                                checked={formData.marketing_notifications}
                                onChange={handleToggleChange}
                            />
                            <label
                                htmlFor="marketing_notifications"
                                className="form-check-label"
                            >
                                Marketing Notifications
                            </label>
                            <div className="form-text">
                                Receive marketing emails and promotional content
                            </div>
                        </div>

                        <div className="form-switch form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                role="switch"
                                disabled={true}
                                id="security_notifications"
                                name="security_notifications"
                                checked={formData.security_notifications}
                                onChange={handleToggleChange}
                            />
                            <label
                                htmlFor="security_notifications"
                                className="form-check-label"
                            >
                                Security Notifications
                            </label>
                            <div className="form-text">
                                Important security alerts and updates
                                (recommended)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateSettingsMutation.isPending}
                    >
                        {updateSettingsMutation.isPending ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
