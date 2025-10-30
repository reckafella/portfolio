import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { SettingsForm } from "@/components/profile/SettingsForm";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

/**
 * ProfilePage component - Main profile management page
 * Replicates: authentication/templates/auth/profile/profile_details.html
 */
const ProfilePage: React.FC = () => {
    usePageTitle("Profile");
    const { data: profile, isLoading, isError, error, refetch } = useProfile();
    const [activeTab, setActiveTab] = useState<string>("overview");

    const handleImageUploadSuccess = () => {
        // Refetch profile to get updated image
        refetch();
    };

    // Loading state
    if (isLoading) {
        return <LoadingSpinner size="lg" text="Loading Profile..." />;
    }

    // Error state
    if (isError || !profile) {
        return (
            <div className="container mt-5">
                <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                        <strong>Error loading profile</strong>
                        <p className="mb-0">
                            {error?.message ||
                                "Failed to load profile. Please try again later."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <>
            {/* Breadcrumbs */}
            <div className="page-title">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/">Home</a>
                            </li>
                            <li
                                className="breadcrumb-item active"
                                aria-current="page"
                            >
                                Profile
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Profile Content */}
            <section className="section profile">
                <div className="container">
                    <div className="row justify-content-around align-items-stretch">
                        {/* Profile Card - Left Side */}
                        <div className="col-xl-4 mb-4">
                            <div className="card">
                                <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                                    {/* Profile Photo with Upload/Delete */}
                                    <ProfileImageUpload
                                        currentImageUrl={
                                            profile.optimized_image_url
                                        }
                                        onUploadSuccess={
                                            handleImageUploadSuccess
                                        }
                                    />

                                    {/* User Info */}
                                    <h2 className="mb-1">
                                        {profile.user.first_name &&
                                        profile.user.last_name
                                            ? `${profile.user.first_name} ${profile.user.last_name}`
                                            : profile.user.username}
                                    </h2>
                                    <h3 className="text-muted">
                                        {profile.title || "Software Developer"}
                                    </h3>

                                    {/* Social Links */}
                                    <div className="social-links mt-3">
                                        {profile.social_links?.twitter_x && (
                                            <a
                                                href={
                                                    profile.social_links
                                                        .twitter_x
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="twitter"
                                            >
                                                <i className="bi bi-twitter"></i>
                                            </a>
                                        )}
                                        {profile.social_links?.facebook && (
                                            <a
                                                href={
                                                    profile.social_links
                                                        .facebook
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="facebook"
                                            >
                                                <i className="bi bi-facebook"></i>
                                            </a>
                                        )}
                                        {profile.social_links?.instagram && (
                                            <a
                                                href={
                                                    profile.social_links
                                                        .instagram
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="instagram"
                                            >
                                                <i className="bi bi-instagram"></i>
                                            </a>
                                        )}
                                        {profile.social_links?.linkedin && (
                                            <a
                                                href={
                                                    profile.social_links
                                                        .linkedin
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="linkedin"
                                            >
                                                <i className="bi bi-linkedin"></i>
                                            </a>
                                        )}
                                        {profile.social_links?.github && (
                                            <a
                                                href={
                                                    profile.social_links.github
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="github"
                                            >
                                                <i className="bi bi-github"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Tabs - Right Side */}
                        <div className="col-xl-7">
                            <div className="card">
                                <div className="card-body pt-3">
                                    {/* Tab Navigation */}
                                    <ul
                                        className="nav nav-tabs nav-tabs-bordered"
                                        role="tablist"
                                    >
                                        <li
                                            className="nav-item"
                                            role="presentation"
                                        >
                                            <button
                                                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                                                onClick={() =>
                                                    handleTabClick("overview")
                                                }
                                                type="button"
                                                role="tab"
                                            >
                                                <i className="bi bi-person-circle"></i>
                                                <span className="d-none d-md-inline ms-1">
                                                    Overview
                                                </span>
                                            </button>
                                        </li>
                                        <li
                                            className="nav-item"
                                            role="presentation"
                                        >
                                            <button
                                                className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
                                                onClick={() =>
                                                    handleTabClick("edit")
                                                }
                                                type="button"
                                                role="tab"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                                <span className="d-none d-md-inline ms-1">
                                                    Edit Profile
                                                </span>
                                            </button>
                                        </li>
                                        <li
                                            className="nav-item"
                                            role="presentation"
                                        >
                                            <button
                                                className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
                                                onClick={() =>
                                                    handleTabClick("settings")
                                                }
                                                type="button"
                                                role="tab"
                                            >
                                                <i className="bi bi-gear"></i>
                                                <span className="d-none d-md-inline ms-1">
                                                    Settings
                                                </span>
                                            </button>
                                        </li>
                                        <li
                                            className="nav-item"
                                            role="presentation"
                                        >
                                            <button
                                                className={`nav-link ${activeTab === "password" ? "active" : ""}`}
                                                onClick={() =>
                                                    handleTabClick("password")
                                                }
                                                type="button"
                                                role="tab"
                                            >
                                                <i className="bi bi-shield-lock"></i>
                                                <span className="d-none d-md-inline ms-1">
                                                    Change Password
                                                </span>
                                            </button>
                                        </li>
                                    </ul>

                                    {/* Tab Content */}
                                    <div className="tab-content pt-2">
                                        {activeTab === "overview" && (
                                            <ProfileOverview
                                                profile={profile}
                                            />
                                        )}
                                        {activeTab === "edit" && (
                                            <ProfileEditForm
                                                profile={profile}
                                            />
                                        )}
                                        {activeTab === "settings" && (
                                            <SettingsForm />
                                        )}
                                        {activeTab === "password" && (
                                            <PasswordChangeForm />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProfilePage;
