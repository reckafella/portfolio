import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
  url: string;
  type: 'blog_post' | 'project' | 'action';
  action_type?: string;
  icon?: string;
  tags?: string[];
  category?: string;
  created_at?: string;
  first_published_at?: string;
  view_count?: number;
}

interface SearchResultsData {
  posts: SearchResult[];
  projects: SearchResult[];
  actions: SearchResult[];
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'relevance';
  
  const [results, setResults] = useState<SearchResultsData>({
    posts: [],
    projects: [],
    actions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query, category, sort);
    }
  }, [query, category, sort]);

  const performSearch = async (searchQuery: string, searchCategory: string, searchSort: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: searchCategory,
        sort: searchSort,
        page_size: '20'
      });

      const response = await fetch(`/api/v1/search/?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setTotalResults(data.total_results);
      } else {
        setError(data.message || 'Search failed');
        setResults({ posts: [], projects: [], actions: [] });
        setTotalResults(0);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while searching');
      setResults({ posts: [], projects: [], actions: [] });
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = (result: SearchResult) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'blog_post':
          return 'bi-file-earmark-text';
        case 'project':
          return 'bi-folder';
        case 'action':
          return result.icon || 'bi-lightning';
        default:
          return 'bi-file';
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'blog_post':
          return 'Blog Post';
        case 'project':
          return 'Project';
        case 'action':
          return 'Action';
        default:
          return 'Result';
      }
    };

    return (
      <div key={`${result.type}-${result.id}`} className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0 d-flex align-items-center">
              <i className={`bi ${getTypeIcon(result.type)} me-2 text-primary`}></i>
              <Link to={result.url} className="text-decoration-none">
                {result.title}
              </Link>
            </h5>
            <span className={`badge ${
              result.type === 'blog_post' ? 'bg-info' : 
              result.type === 'project' ? 'bg-success' : 'bg-warning'
            }`}>
              {getTypeLabel(result.type)}
            </span>
          </div>
          
          {result.description && (
            <p className="card-text text-muted">{result.description}</p>
          )}
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2 flex-wrap">
              {result.tags && result.tags.length > 0 && (
                <div className="d-flex gap-1">
                  {result.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="badge bg-secondary">{tag}</span>
                  ))}
                  {result.tags.length > 3 && (
                    <span className="badge bg-light text-dark">+{result.tags.length - 3} more</span>
                  )}
                </div>
              )}
              
              {result.category && (
                <span className="badge bg-outline-secondary">{result.category}</span>
              )}
              
              {result.view_count && (
                <small className="text-muted">
                  <i className="bi bi-eye me-1"></i>
                  {result.view_count} views
                </small>
              )}
            </div>
            
            <Link to={result.url} className="btn btn-outline-primary btn-sm">
              {result.type === 'action' ? 'Go to Action' : 'View Details'}
              <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100">
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="text-center mb-5">
                <h1 className="display-6 mb-3">Search Results</h1>
                {query && (
                  <p className="text-muted">
                    Results for "<strong>{query}</strong>"
                    {totalResults > 0 && ` (${totalResults} found)`}
                  </p>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Searching...</span>
                  </div>
                  <p className="mt-3 text-muted">Searching for "{query}"...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger text-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-search display-1 text-muted mb-3"></i>
                  <h4>No results found</h4>
                  <p className="text-muted">
                    No results found for "<strong>{query}</strong>". 
                    Try different keywords or check your spelling.
                  </p>
                  <div className="mt-4">
                    <Link to="/blog" className="btn btn-outline-primary me-2">
                      Browse Blog Posts
                    </Link>
                    <Link to="/projects" className="btn btn-outline-success">
                      Browse Projects
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Actions Section */}
                  {results.actions.length > 0 && (
                    <div className="mb-5">
                      <h3 className="h5 mb-3">
                        <i className="bi bi-lightning me-2"></i>
                        Quick Actions ({results.actions.length})
                      </h3>
                      <div className="row">
                        {results.actions.map(renderResultItem)}
                      </div>
                    </div>
                  )}

                  {/* Blog Posts Section */}
                  {results.posts.length > 0 && (
                    <div className="mb-5">
                      <h3 className="h5 mb-3">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Blog Posts ({results.posts.length})
                      </h3>
                      <div className="row">
                        {results.posts.map(renderResultItem)}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {results.projects.length > 0 && (
                    <div className="mb-5">
                      <h3 className="h5 mb-3">
                        <i className="bi bi-folder me-2"></i>
                        Projects ({results.projects.length})
                      </h3>
                      <div className="row">
                        {results.projects.map(renderResultItem)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchResults;
