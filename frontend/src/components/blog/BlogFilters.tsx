import { useState } from 'react';
import { BlogFilters } from '@/hooks/queries/blogQueries';

interface BlogFiltersProps {
    filters: BlogFilters;
    onFiltersChange: (filters: BlogFilters) => void;
    tags: Array<{ name: string; count: number }>;
    totalCount: number;
}

export function BlogFiltersComponent({ filters, onFiltersChange, tags, totalCount }: BlogFiltersProps) {
  const [expandFilters, setExpandFilters] = useState(false);

  const handleFilterChange = (key: keyof BlogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      page_size: filters.page_size,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

    return (
        <div className="p-3 rounded mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 d-flex">Filter Posts (
                    <p className="text-muted mb-0">
                        {totalCount > 0 && `${totalCount} post${totalCount !== 1 ? 's' : ''} found`}
                    </p>)
                </h6>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setExpandFilters(!expandFilters)}
                    aria-expanded={expandFilters}
                >
                    {expandFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>
            <form action="" className='card form-control' method="get">
                <div className="card-body">
                    {/* Search Input - Always Visible */}
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search blog posts..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                        />
                    </div>
                </div>
                <div className="card-footer">
                    {/* Collapsible Filters */}
                    <div className={`collapse ${expandFilters ? 'show' : ''}`}>
                        <div className="row g-3">
                        {/* Tags Filter */}
                        <div className="col-md-6">
                            <label className="form-label">Filter by Tag</label>
                            <select
                            className="form-select"
                            value={filters.tag || ''}
                            onChange={(e) => handleFilterChange('tag', e.target.value || undefined)}
                            >
                            <option value="">All Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.name} value={tag.name}>
                                {tag.name} ({tag.count})
                                </option>
                            ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="col-md-3">
                            <label className="form-label">Year</label>
                            <select
                            className="form-select"
                            value={filters.year || ''}
                            onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                            >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                {year}
                                </option>
                            ))}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div className="col-md-3">
                            <label className="form-label">Month</label>
                            <select
                            className="form-select"
                            value={filters.month || ''}
                            onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : undefined)}
                            >
                            <option value="">All Months</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                {month.label}
                                </option>
                            ))}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div className="col-md-6">
                            <label className="form-label">Sort By</label>
                            <select
                            className="form-select"
                            value={filters.ordering || '-first_published_at'}
                            onChange={(e) => handleFilterChange('ordering', e.target.value)}
                            >
                            <option value="-first_published_at">Newest First</option>
                            <option value="first_published_at">Oldest First</option>
                            <option value="-view_count">Most Popular</option>
                            <option value="title">Title A-Z</option>
                            <option value="-title">Title Z-A</option>
                            </select>
                        </div>

                        {/* Posts Per Page */}
                        <div className="col-md-3">
                            <label className="form-label">Posts Per Page</label>
                            <select
                            className="form-select"
                            value={filters.page_size || 6}
                            onChange={(e) => handleFilterChange('page_size', parseInt(e.target.value))}
                            >
                            <option value={6}>6 posts</option>
                            <option value={12}>12 posts</option>
                            <option value={18}>18 posts</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="col-md-3 d-flex align-items-end">
                            <button
                            className="btn btn-outline-secondary w-100"
                            onClick={clearFilters}
                            >
                            Clear Filters
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </form>
    </div>
  );
}
