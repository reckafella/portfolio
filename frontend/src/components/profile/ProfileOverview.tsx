import React from "react";
import { ProfileData } from "@/services/profileService";

interface ProfileOverviewProps {
    profile: ProfileData;
}

/**
 * ProfileOverview component displays user profile information
 * Replicates: authentication/templates/auth/profile/partials/overview.html
 */
export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
    profile,
}) => {
    const { user, bio, title, country, city } = profile;

    return (
        <div
            className="tab-pane fade show active profile-overview"
            id="profile-overview"
        >
            <h5 className="card-title">About</h5>
            <p className="small fst-italic">{bio || "Bio empty"}</p>

            <h5 className="card-title">Profile Details</h5>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">Full Name</div>
                <div className="col-lg-9 col-md-8">
                    {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : "Not provided"}
                </div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">Username</div>
                <div className="col-lg-9 col-md-8">{user.username}</div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">Title</div>
                <div className="col-lg-9 col-md-8">
                    {title || "Not provided"}
                </div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">Country</div>
                <div className="col-lg-9 col-md-8">
                    {country || "Not provided"}
                </div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">City</div>
                <div className="col-lg-9 col-md-8">
                    {city || "Not provided"}
                </div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">Email</div>
                <div className="col-lg-9 col-md-8">{user.email}</div>
            </div>

            <div className="row mb-2">
                <div className="col-lg-3 col-md-4 label fw-bold">
                    Member Since
                </div>
                <div className="col-lg-9 col-md-8">
                    {new Date(user.date_joined).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>
        </div>
    );
};
