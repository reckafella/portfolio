import React, { useState, useEffect } from "react";
import { ProfileData, ProfileUpdateData } from "@/services/profileService";
import { useUpdateProfile } from "@/hooks/useProfile";

interface ProfileEditFormProps {
    profile: ProfileData;
}

/**
 * ProfileEditForm component for editing user profile
 * Replicates: authentication/templates/auth/profile/partials/edit-profile.html
 */
export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    profile,
}) => {
    const updateProfileMutation = useUpdateProfile();

    const [formData, setFormData] = useState<ProfileUpdateData>({
        first_name: profile.user.first_name || "",
        last_name: profile.user.last_name || "",
        title: profile.title || "",
        bio: profile.bio || "",
        country: profile.country || "",
        city: profile.city || "",
        experience: profile.experience || "",
        social_links: {
            twitter_x: profile.social_links?.twitter_x || "",
            facebook: profile.social_links?.facebook || "",
            instagram: profile.social_links?.instagram || "",
            linkedin: profile.social_links?.linkedin || "",
            github: profile.social_links?.github || "",
            youtube: profile.social_links?.youtube || "",
            tiktok: profile.social_links?.tiktok || "",
            whatsapp: profile.social_links?.whatsapp || "",
            website: profile.social_links?.website || "",
        },
    });

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Update form when profile changes
    useEffect(() => {
        setFormData({
            first_name: profile.user.first_name || "",
            last_name: profile.user.last_name || "",
            title: profile.title || "",
            bio: profile.bio || "",
            country: profile.country || "",
            city: profile.city || "",
            experience: profile.experience || "",
            social_links: {
                twitter_x: profile.social_links?.twitter_x || "",
                facebook: profile.social_links?.facebook || "",
                instagram: profile.social_links?.instagram || "",
                linkedin: profile.social_links?.linkedin || "",
                github: profile.social_links?.github || "",
                youtube: profile.social_links?.youtube || "",
                tiktok: profile.social_links?.tiktok || "",
                whatsapp: profile.social_links?.whatsapp || "",
                website: profile.social_links?.website || "",
            },
        });
    }, [profile]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        if (name.startsWith("social_")) {
            const socialField = name.replace("social_", "");
            setFormData((prev) => ({
                ...prev,
                social_links: {
                    ...prev.social_links,
                    [socialField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const response = await updateProfileMutation.mutateAsync(formData);
            setSuccessMessage(
                response.message || "Profile updated successfully!",
            );

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update profile");
        }
    };

    return (
        <div
            className="tab-pane fade show active profile-edit pt-3"
            id="profile-edit"
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
                <h3 className="mb-3 card-title">Profile</h3>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="first_name" className="form-label">
                            First Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            maxLength={50}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="last_name" className="form-label">
                            Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            maxLength={50}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                        Title
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Developer"
                        maxLength={100}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="bio" className="form-label">
                        Bio
                    </label>
                    <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        maxLength={500}
                        placeholder="Tell us about yourself..."
                    />
                    <small className="text-muted">
                        {formData.bio?.length || 0}/500 characters
                    </small>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="country" className="form-label">
                            Country
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            maxLength={100}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="city" className="form-label">
                            City
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            maxLength={100}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="experience" className="form-label">
                        Experience
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 years"
                        maxLength={50}
                    />
                </div>

                <h3 className="card-title mb-3 mt-4">Social Links</h3>

                <div className="mb-3">
                    <label htmlFor="social_linkedin" className="form-label">
                        <i className="bi bi-linkedin me-2"></i>LinkedIn
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_linkedin"
                        name="social_linkedin"
                        value={formData.social_links?.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="social_github" className="form-label">
                        <i className="bi bi-github me-2"></i>GitHub
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_github"
                        name="social_github"
                        value={formData.social_links?.github}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="social_twitter_x" className="form-label">
                        <i className="bi bi-twitter me-2"></i>Twitter / X
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_twitter_x"
                        name="social_twitter_x"
                        value={formData.social_links?.twitter_x}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/username"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="social_facebook" className="form-label">
                        <i className="bi bi-facebook me-2"></i>Facebook
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_facebook"
                        name="social_facebook"
                        value={formData.social_links?.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/username"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="social_instagram" className="form-label">
                        <i className="bi bi-instagram me-2"></i>Instagram
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_instagram"
                        name="social_instagram"
                        value={formData.social_links?.instagram}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/username"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="social_website" className="form-label">
                        <i className="bi bi-globe me-2"></i>Website
                    </label>
                    <input
                        type="url"
                        className="form-control"
                        id="social_website"
                        name="social_website"
                        value={formData.social_links?.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                    />
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? (
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
