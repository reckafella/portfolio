import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectFilters } from '../../components/projects/ProjectFilters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';
import { useProjects } from '../../hooks/queries/projectQueries';

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  featured_image?: string;
  image?: string;
  github_url?: string;
  demo_url?: string;
  category: string;
  project_type: string;
  client?: string;
  created_at: string;
  updated_at: string;
  technologies: string[];
  status: string;
  live: boolean;
  first_image?: {
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
  };
  images: Array<{
    id: number;
    cloudinary_image_url: string;
    optimized_image_url: string;
    live: boolean;
  }>;
}

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
    page: currentPage.toString(),
    page_size: '12'
  }), [filters, currentPage]);

  // Use TanStack Query for projects
  const { 
    data, 
    isLoading: loading, 
    error,
    refetch
  } = useProjects(apiFilters);

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
      <div className="section-title">
        <h2 className="fw-bold">Projects</h2>
      </div>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="lead text-muted">
                Browse through our portfolio of {totalCount} project{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
            {canCreateProjects && (
              <Link to="/projects/add" className="btn btn-primary btn-lg">
                <i className="bi bi-plus me-2"></i>
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

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <AlertMessage type="danger" message={error.message} />
            <button className="btn btn-outline-primary mt-2" onClick={() => refetch()}>
              <i className="bi bi-sync-alt me-2"></i>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="row">
          <div className="col-12 text-center">
            <LoadingSpinner text="Loading projects..." />
          </div>
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className="row g-4">
            {projects.map((project: Project) => (
              <div key={project.slug} className="col-lg-4 col-md-6">
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
                        <i className="bi bi-chevron-left me-1"></i>
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
                        <i className="bi bi-chevron-right ms-1"></i>
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
              <i className="bi bi-folder-open fa-3x mb-3"></i>
              <h3>No projects found</h3>
              <p>
                {Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search filters.'
                  : canCreateProjects 
                    ? 'Start by adding your first project.'
                    : 'No projects available at the moment.'
                }
              </p>
              {Object.values(filters).some(Boolean) && (
                <button className="btn btn-outline-primary me-2" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
              {canCreateProjects && (
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
