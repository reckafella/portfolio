import React, { useState } from "react";
import { useChangePassword } from "@/hooks/useProfile";
import { PasswordInput } from "@/components/forms/PasswordInput";

/**
 * PasswordChangeForm component for changing user password
 * Replicates: authentication/templates/auth/profile/partials/change-password.html
 * Uses the PasswordInput component with strength meter
 */
export const PasswordChangeForm: React.FC = () => {
    const changePasswordMutation = useChangePassword();

    const [formData, setFormData] = useState({
        old_password: "",
        new_password1: "",
        new_password2: "",
    });

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleInputChange = (fieldName: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        // Client-side validation
        if (formData.new_password1 !== formData.new_password2) {
            setErrorMessage("New passwords do not match");
            return;
        }

        if (formData.new_password1.length < 8) {
            setErrorMessage("New password must be at least 8 characters long");
            return;
        }

        if (formData.old_password === formData.new_password1) {
            setErrorMessage(
                "New password must be different from current password",
            );
            return;
        }

        try {
            const response = await changePasswordMutation.mutateAsync(formData);
            setSuccessMessage(
                response.message || "Password changed successfully!",
            );

            // Clear form
            setFormData({
                old_password: "",
                new_password1: "",
                new_password2: "",
            });

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error: any) {
            // Handle specific error messages from backend
            if (error.response?.data) {
                const errors = error.response.data;
                if (errors.old_password) {
                    setErrorMessage(
                        errors.old_password[0] ||
                            "Current password is incorrect",
                    );
                } else if (errors.new_password1) {
                    setErrorMessage(
                        errors.new_password1[0] || "Invalid new password",
                    );
                } else if (errors.new_password2) {
                    setErrorMessage(
                        errors.new_password2[0] || "Passwords do not match",
                    );
                } else {
                    setErrorMessage(
                        error.message || "Failed to change password",
                    );
                }
            } else {
                setErrorMessage(error.message || "Failed to change password");
            }
        }
    };

    return (
        <div
            className="tab-pane fade show active pt-3"
            id="profile-change-password"
        >
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
                <div className="form-group mb-3">
                    <label htmlFor="old_password" className="form-label">
                        Current Password <span className="text-danger">*</span>
                    </label>
                    <PasswordInput
                        fieldName="old_password"
                        value={formData.old_password}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your current password"
                        showStrengthMeter={false}
                        showRequirements={false}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="new_password1" className="form-label">
                        New Password <span className="text-danger">*</span>
                    </label>
                    <PasswordInput
                        fieldName="new_password1"
                        value={formData.new_password1}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        placeholder="Enter your new password"
                        showStrengthMeter={true}
                        showRequirements={true}
                        confirmPasswordValue={formData.new_password2}
                        oldPasswordValue={formData.old_password}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="new_password2" className="form-label">
                        Confirm New Password{" "}
                        <span className="text-danger">*</span>
                    </label>
                    <PasswordInput
                        fieldName="new_password2"
                        value={formData.new_password2}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        placeholder="Confirm your new password"
                        showStrengthMeter={false}
                        showRequirements={false}
                        confirmPasswordValue={formData.new_password1}
                        isConfirmField={true}
                    />
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={changePasswordMutation.isPending}
                    >
                        {changePasswordMutation.isPending ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Changing Password...
                            </>
                        ) : (
                            "Change Password"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
