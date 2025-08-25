import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts, useBlogStats, BlogFilters } from '../../hooks/queries/blogQueries';
import { BlogCard } from '../../components/blog/BlogCard';
import { BlogFiltersComponent } from '../../components/blog/BlogFilters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';

export function BlogListPage() {
  const { canCreateProjects: canCreateBlog } = useStaffPermissions();
  const [filters, setFilters] = useState<BlogFilters>({ page: 1, page_size: 6 });
  
  // Get URL search params to set initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: BlogFilters = { page: 1, page_size: 6 };
    
    if (urlParams.get('tag')) initialFilters.tag = urlParams.get('tag')!;
    if (urlParams.get('search')) initialFilters.search = urlParams.get('search')!;
    
    setFilters(initialFilters);
  }, []);

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = useBlogPosts(filters);

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useBlogStats();

  const posts = postsData?.results || [];
  const totalCount = postsData?.count || 0;
  const nextPage = postsData?.next;
  const previousPage = postsData?.previous;

  const popularTags = statsData?.popular_tags || [];

  const totalPages = Math.ceil(totalCount / (filters.page_size || 6));
  const currentPage = filters.page || 1;

  const handleFiltersChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
    
    // Update URL without causing navigation
    const url = new URL(window.location.href);
    url.search = '';
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      }
    });
    
    window.history.replaceState({}, '', url.toString());
  };

  const handlePageChange = (page: number) => {
    handleFiltersChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (postsLoading && !posts.length) {
    return <LoadingSpinner />;
  }

  if (postsError && !posts.length) {
    return (
      <AlertMessage
        type="danger"
        message="Unable to load blog posts. Please try again later."
      />
    );
  }

    return (
        <section className="section blog">
        <div className="container my-5">
            <div className="row">
                <div className="text-center section-title mb-3 mb-lg-4">
                  <h2>Blog</h2>
              </div>
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {canCreateBlog && (
              <Link to="/blog/add" className="btn btn-primary">
                <i className="bi bi-plus me-2"></i>
                New Post
              </Link>
            )}
          </div>

          {/* Filters */}
          <BlogFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            tags={popularTags}
            totalCount={totalCount}
          />

          {/* Loading State */}
          {postsLoading && (
            <div className="text-center my-4">
              <LoadingSpinner />
            </div>
          )}

          {/* Blog Posts */}
          {posts.length > 0 ? (
            <>
              <div className="row g-4 mb-5">
                {posts.map((post) => (
                  <div key={post.id} className="col-md-6 col-lg-12">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Blog pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!previousPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!previousPage}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!nextPage}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-blog fa-3x text-muted mb-3"></i>
              <h3>No Blog Posts Found</h3>
              <p className="text-muted">
                {Object.keys(filters).length > 2 
                  ? "Try adjusting your filters to find more posts."
                  : canCreateBlog
                    ? "Start by creating your first blog post."
                    : "Check back later for new content!"
                }
              </p>
              
              {canCreateBlog && (
                <Link to="/blog/add" className="btn btn-primary">
                  Create First Post
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="" style={{ top: '2rem' }}>
            {/* Blog Stats - hidden for now */}
            {!statsLoading && statsData && (
              <div className="d-none card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Blog Statistics</h6>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="fw-bold text-primary">{statsData.total_posts}</div>
                      <small className="text-muted">Posts</small>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold text-success">{statsData.total_views}</div>
                      <small className="text-muted">Views</small>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold text-info">{statsData.total_comments}</div>
                      <small className="text-muted">Comments</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Popular Tags</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.name}
                        className={`btn btn-sm ${
                          filters.tag === tag.name ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleFiltersChange({ ...filters, tag: tag.name, page: 1 })}
                      >
                        {tag.name} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {statsData?.recent_posts && statsData.recent_posts.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Recent Posts</h6>
                </div>
                <div className="card-body">
                  {statsData.recent_posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="d-flex align-items-center mb-3">
                      {post.featured_image_url && (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="rounded me-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="flex-grow-1">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-decoration-none fw-medium"
                        >
                          {post.title}
                        </Link>
                        <div className="small text-muted">
                          {new Date(post.first_published_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div></section>
  );
}
