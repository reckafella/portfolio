import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Mock search results - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResults = [
        {
          id: 1,
          type: 'project',
          title: 'Portfolio Website',
          description: 'Personal portfolio built with React and FastAPI',
          url: '/projects'
        },
        {
          id: 2,
          type: 'blog',
          title: 'Getting Started with FastAPI',
          description: 'A comprehensive guide to building APIs with FastAPI',
          url: '/blog/fastapi-guide'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
    } catch (error) {
      const noot = () => { }
      if (error instanceof Error) noot();
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100">
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="h2 fw-bold mb-4">Search Results</h1>
              
              {query && (
                <p className="text-muted mb-4">
                  Showing results for: <strong>"{query}"</strong>
                </p>
              )}

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Searching...</span>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="row">
                  {results.map((result) => (
                    <div key={result.id} className="col-12 mb-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-2">
                            <span className={`badge ${result.type === 'project' ? 'bg-primary' : 'bg-success'} me-2`}>
                              {result.type}
                            </span>
                          </div>
                          <h3 className="h5 fw-bold">
                            <a href={result.url} className="text-decoration-none">
                              {result.title}
                            </a>
                          </h3>
                          <p className="text-muted mb-0">{result.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-5">
                  <div className="text-muted display-1 mb-4">🔍</div>
                  <h3 className="fw-semibold text-muted mb-2">No results found</h3>
                  <p className="text-muted">
                    Try adjusting your search terms or browse our projects and blog posts.
                  </p>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="text-muted display-1 mb-4">🔍</div>
                  <h3 className="fw-semibold text-muted mb-2">Start Searching</h3>
                  <p className="text-muted">
                    Enter a search term to find projects, blog posts, and more.
                  </p>
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
