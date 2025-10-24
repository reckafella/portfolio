import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectEditorPage } from './ProjectEditorPage';
import { useProjectBySlug, useUpdateProject } from '@/hooks/queries/projectQueries';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { ForbiddenPage, ServerErrorPage } from '@/pages/errors';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { tabSyncService } from '@/services/tabSyncService';
import { ProjectFormData } from './types';
import { createDataForSubmission } from './utils';

export const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { canEditProjects } = useStaffPermissions();
  const { user } = useAuth();
  const { data: project, isLoading, error } = useProjectBySlug(slug || '');
  const updateProjectMutation = useUpdateProject();
  const [submitError, setSubmitError] = useState<string>();

  usePageTitle(`Edit: ${project?.title || 'Project'}`);

  if (!canEditProjects) {
    return <ForbiddenPage />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !project) {
    return <ServerErrorPage />;
  }

  const handleSubmit = async (data: ProjectFormData) => {
    setSubmitError(undefined);
    try {
      const result = await updateProjectMutation.mutateAsync({
        slug: slug!,
        data: createDataForSubmission(data)
      });

      tabSyncService.broadcastContentUpdate('project', slug);

      // Navigate to project detail (use original slug if result doesn't have one)
      const projectSlug = result?.slug || slug;
      if (projectSlug) {
        navigate(`/projects/${projectSlug}`);
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update project';
      setSubmitError(errorMsg);
      throw error;
    }
  };

  const handleNavigateBack = () => {
    navigate('/projects');
  };

  return (
    <ProjectEditorPage
      mode="edit"
      slug={slug}
      initialProject={project}
      onSubmit={handleSubmit}
      isSubmitting={updateProjectMutation.isPending}
      submitError={submitError}
      user={user || undefined}
      onNavigateBack={handleNavigateBack}
    />
  );
};
