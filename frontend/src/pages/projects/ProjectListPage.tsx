import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectFilters } from '../../components/projects/ProjectFilters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';
import { useProjectsWithFallback, Project } from '../../hooks/useProjects';

interface ProjectFiltersState {
  search: string;
  category: string;
  project_type: string;
  client: string;
  ordering: string;
}

export const ProjectListPage: React.FC = () => {
  const { canCreateProjects } = useStaffPermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProjectFiltersState>({
    search: '',
    category: '',
    project_type: '',
    client: '',
    ordering: '-created_at'
  });

  // Convert filters to API format
  const apiFilters = useMemo(() => ({
    ...filters,
    page: currentPage,
    page_size: 12
  }), [filters, currentPage]);

  // Use the enhanced hook with fallback handling
  const { 
    data, 
    loading, 
    error, 
    isOfflineMode, 
    isOnline, 
    refresh 
  } = useProjectsWithFallback(apiFilters);

  const projects = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const handleFilterChange = (newFilters: Partial<ProjectFiltersState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      project_type: '',
      client: '',
      ordering: '-created_at'
    });
    setCurrentPage(1);
  };

  // Show loading state only for initial load
  if (loading && projects.length === 0) {
    return (
      <div className="container py-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Offline/Error Banner */}
      {!isOnline && (
        <div className="row mb-4">
          <div className="col-12">
            <AlertMessage 
              type="warning" 
              message="You're currently offline. Some features may not be available." 
            />
          </div>
        </div>
      )}

      {isOfflineMode && error && (
        <div className="row mb-4">
          <div className="col-12">
            <AlertMessage 
              type="warning" 
              message={`Server temporarily unavailable: ${error}. Showing cached data.`} 
            />
            {refresh && (
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={refresh}>
                <i className="fas fa-sync-alt me-2"></i>
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 fw-bold">Projects</h1>
              <p className="lead text-muted">
                Browse through our portfolio of {totalCount} project{totalCount !== 1 ? 's' : ''}
                {isOfflineMode && ' (offline mode)'}
              </p>
            </div>
            {canCreateProjects && (
              <Link to="/projects/add" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>
                Add Project
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <ProjectFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            totalCount={totalCount}
          />
        </div>
      </div>

      {/* Error Message (for non-offline errors) */}
      {error && !isOfflineMode && (
        <div className="row mb-4">
          <div className="col-12">
            <AlertMessage type="danger" message={error} />
            {refresh && (
              <button className="btn btn-outline-primary mt-2" onClick={refresh}>
                <i className="fas fa-sync-alt me-2"></i>
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="row">
          <div className="col-12 text-center">
            <LoadingSpinner text="Loading more projects..." />
          </div>
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="row g-4">
            {projects.map((project: Project) => (
              <div key={project.id} className="col-lg-4 col-md-6">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalCount > 12 && (
            <div className="row mt-5">
              <div className="col-12">
                <nav aria-label="Projects pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!hasPrevious ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevious}
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>
                    </li>
                    
                    <li className="page-item active">
                      <span className="page-link">
                        Page {currentPage}
                      </span>
                    </li>
                    
                    <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="row">
          <div className="col-12 text-center py-5">
            <div className="text-muted">
              <i className="fas fa-folder-open fa-3x mb-3"></i>
              <h3>No projects found</h3>
              <p>
                {Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search filters.'
                  : canCreateProjects 
                    ? 'Start by adding your first project.'
                    : isOfflineMode 
                      ? 'No projects available offline.'
                      : 'No projects available at the moment.'
                }
              </p>
              {Object.values(filters).some(Boolean) && (
                <button className="btn btn-outline-primary me-2" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
              {canCreateProjects && !isOfflineMode && (
                <Link to="/projects/add" className="btn btn-primary">
                  Add Project
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
