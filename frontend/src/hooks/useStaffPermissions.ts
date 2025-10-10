import { useAuth } from './useAuth';

/**
 * Custom hook to check if the current user has staff permissions
 */
export const useStaffPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  const isStaff = isAuthenticated && user?.is_staff === true;
  const canCreateProjects = isStaff;
  const canEditProjects = isStaff;
  const canDeleteProjects = isStaff;
  const canCreateBlog = isStaff;
  const canEditBlog = isStaff;
  const canDeleteBlog = isStaff;
  
  return {
    isStaff,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canCreateBlog,
    canEditBlog,
    canDeleteBlog,
    isAuthenticated
  };
};
