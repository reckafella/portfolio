import React, { useState, useEffect } from 'react';

interface ProjectFiltersState {
  search: string;
  category: string;
  project_type: string;
  client: string;
  ordering: string;
}

interface ProjectFiltersProps {
  filters: ProjectFiltersState;
  onFilterChange: (_filters: Partial<ProjectFiltersState>) => void;
  onClearFilters: () => void;
  totalCount: number;
}

interface FilterOptions {
  categories: string[];
  project_types: string[];
  clients: string[];
}

interface FormField {
  name: string;
  choices?: Array<[string, string]>;
}

interface FormConfig {
  fields: FormField[];
}

interface Project {
  client?: string;
}

interface ProjectsResponse {
  results?: Project[];
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalCount
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    project_types: [],
    clients: []
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/v1/projects/form-config/');
      if (response.ok) {
        const config: FormConfig = await response.json();
        
        // Extract options from form config
        const categories: string[] = [];
        const projectTypes: string[] = [];
        
        config.fields.forEach((field: FormField) => {
          if (field.name === 'category' && field.choices) {
            categories.push(...field.choices.map((choice: [string, string]) => choice[0]));
          }
          if (field.name === 'project_type' && field.choices) {
            projectTypes.push(...field.choices.map((choice: [string, string]) => choice[0]));
          }
        });
        
        // Fetch unique clients from projects (you might want to create a separate endpoint for this)
        const clientsResponse = await fetch('/api/v1/projects/list/?page_size=50');
        const clientsData: ProjectsResponse = await clientsResponse.json();
        const uniqueClients = [...new Set(
          clientsData.results
            ?.map((project: Project) => project.client)
            ?.filter((client: string | undefined): client is string => Boolean(client?.trim()))
        )] as string[];
        
        setFilterOptions({
          categories,
          project_types: projectTypes,
          clients: uniqueClients
        });
      }
    } catch {
      // Handle error silently or with a toast notification in production
    }
  };

  const handleInputChange = (name: keyof ProjectFiltersState, value: string) => {
    onFilterChange({ [name]: value });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'ordering' && value
  );

  const orderingOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: '-title', label: 'Title Z-A' },
    { value: 'project_type', label: 'Type A-Z' },
    { value: 'category', label: 'Category A-Z' }
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.ordering}
              onChange={(e) => handleInputChange('ordering', e.target.value)}
            >
              {orderingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-end">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowFilters(!showFilters)}
              type="button"
            >
              <i className={`fas fa-filter me-1 ${showFilters ? 'text-primary' : ''}`}></i>
              Filters
              {hasActiveFilters && (
                <span className="badge bg-primary ms-1">
                  {Object.values(filters).filter(v => v && v !== '-created_at').length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                className="btn btn-outline-warning"
                onClick={onClearFilters}
                type="button"
                title="Clear all filters"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="categoryFilter" className="form-label">
                <i className="fas fa-tags me-1"></i>
                Category
              </label>
              <select
                id="categoryFilter"
                className="form-select"
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="typeFilter" className="form-label">
                <i className="fas fa-code me-1"></i>
                Project Type
              </label>
              <select
                id="typeFilter"
                className="form-select"
                value={filters.project_type}
                onChange={(e) => handleInputChange('project_type', e.target.value)}
              >
                <option value="">All Types</option>
                {filterOptions.project_types.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="clientFilter" className="form-label">
                <i className="fas fa-user me-1"></i>
                Client
              </label>
              <select
                id="clientFilter"
                className="form-select"
                value={filters.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
              >
                <option value="">All Clients</option>
                {filterOptions.clients.map(client => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="card-footer">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Showing {totalCount} project{totalCount !== 1 ? 's' : ''}
            {hasActiveFilters && ' (filtered)'}
          </small>
          
          {hasActiveFilters && (
            <div className="text-end">
              <small className="text-muted me-2">Active filters:</small>
              {filters.search && (
                <span className="badge bg-info me-1">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="badge bg-success me-1">
                  {filters.category}
                </span>
              )}
              {filters.project_type && (
                <span className="badge bg-primary me-1">
                  {filters.project_type}
                </span>
              )}
              {filters.client && (
                <span className="badge bg-warning me-1">
                  {filters.client}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
