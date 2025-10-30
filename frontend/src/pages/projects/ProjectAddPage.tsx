import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectEditorPage } from "./ProjectEditorPage";
import { useCreateProject } from "@/hooks/queries/projectQueries";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { ForbiddenPage } from "@/pages/errors";
import { ProjectFormData } from "./types";
import { createDataForSubmission } from "./utils";

export const ProjectAddPage: React.FC = () => {
    const navigate = useNavigate();
    const { canCreateProjects } = useStaffPermissions();
    const { user } = useAuth();
    const createProjectMutation = useCreateProject();
    const [submitError, setSubmitError] = useState<string>();

    usePageTitle("New Project");

    if (!canCreateProjects) {
        return <ForbiddenPage />;
    }

    const handleSubmit = async (data: ProjectFormData) => {
        setSubmitError(undefined);
        try {
            const result = await createProjectMutation.mutateAsync(
                createDataForSubmission(data),
            );

            // Only navigate if we have a slug
            if (result?.slug) {
                navigate(`/projects/${result.slug}`);
            } else {
                setSubmitError(
                    "Project created but slug not returned. Please check the projects list.",
                );
            }

            return result;
        } catch (error) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : "Failed to create project";
            setSubmitError(errorMsg);
            throw error;
        }
    };

    const handleNavigateBack = () => {
        navigate("/projects");
    };

    return (
        <ProjectEditorPage
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={createProjectMutation.isPending}
            submitError={submitError}
            user={user || undefined}
            onNavigateBack={handleNavigateBack}
        />
    );
};
