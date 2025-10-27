import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaTags } from '@/hooks/useMetaTags';
import { useBlogPosts, useBlogStats, BlogFilters, BlogPost } from '@/hooks/queries/blogQueries';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFiltersComponent } from '@/components/blog/BlogFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import '@/styles/blog.css';
import { SearchWidget } from '@/components/blog/SearchWidget';

export function BlogListPage() {
  usePageTitle('Blog');
  const { canCreateProjects: canCreateBlog } = useStaffPermissions();

  // Configure meta tags for the blog list page
  useMetaTags({
    title: 'Blog',
    description: 'Explore my latest thoughts, tutorials, and insights on software development, web technologies, and more.',
    ogTitle: 'Blog Articles | Ethan Wanyoike',
    ogDescription: 'Discover articles about software development, web technologies, and programming insights.',
    ogType: 'blog',
    ogUrl: `${window.location.origin}/blog`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Blog Articles | Ethan Wanyoike',
    twitterDescription: 'Discover articles about software development, web technologies, and programming insights.',
    canonical: `${window.location.origin}/blog${window.location.search}`
  });
  const [filters, setFilters] = useState<BlogFilters>({ page: 1, page_size: 6 });
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

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

  if (postsLoading) {
    <div className='row justify-content-center align-items-center'>
      return <LoadingSpinner text="Loading blog articles..." />;
    </div>
  }

  if (postsError && !posts.length) {
    return (
      <AlertMessage
        type="danger"
        message={"Failed to load blog posts. Please try again later."}
        dismissible={true}
        onDismiss={() => {}}
        className="my-5"
      />
    );
  }

  return (
    <>
      <div className="page-title">
        <div className="container d-lg-flex justify-content-between">
          <nav className="breadcrumbs">
            <ol>
              <li><Link to={`/`}>Home</Link></li>
              <li>Blog Articles</li>
            </ol>
          </nav>
        </div>
      </div>
      <section className="section blog">
        <div className="container my-2 my-lg-3">
          <div className="row">
            <div className="text-center section-title mb-2 mb-lg-3">
              <h1>Blog Articles</h1>
            </div>
            <div className="entries col-12 col-lg-8">
              
              {/* Header */}
              {canCreateBlog && (
                <div className="d-flex justify-content-between align-items-center mb-3 mb-lg-5">
                  <div className="btn-group">
                    <Link to="/blog/new" className="btn btn-primary">
                      <i className="bi bi-plus me-2"></i>
                      New Post
                    </Link>
                  </div>
                </div>
              )}
              {/* Filters */}
              <BlogFiltersComponent filters={filters}
                onFiltersChange={handleFiltersChange}
                tags={popularTags} totalCount={totalCount}
              />

            {/* Loading State */}
            {postsLoading && !posts.length && (
              <div className="text-center my-4">
                  <LoadingSpinner
                    size='sm'
                    text="Loading blog articles..."
                />
              </div>
            )}
              
            {/* Blog Posts */}
              {!postsLoading && posts.length > 0 && (
                <>
                  <div className="row g-4">
                    {posts.map((post: BlogPost) => (
                      <div key={post.id} className="col-md-5 col-lg-12">
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
                                onClick={() => handlePageChange(page)}>
                                {page}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!nextPage}>
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
              
              {/* No Blog Posts Found */}
              {!postsLoading && !posts.length && (
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
                    <Link to="/blog/new" className="btn btn-primary">
                      Create First Post
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="sidebar col-lg-4">
              <div className="widget-items-container" style={{ top: '2rem' }}>
                {/* Blog Stats - hidden for now */}
                {!statsLoading && statsData && (
                  <div className="d-none widget-item recent-posts-widget mb-4">
                    <div className="widget-title">
                      <h2 className="mb-0">Blog Statistics</h2>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="fw-bold text-primary">{statsData.total_posts}</div>
                          <small className="text-muted">Posts</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold text-success">
                            {statsData.total_views}
                          </div>
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

                {/* Recent Posts */}
                {statsData?.recent_posts && statsData.recent_posts.length > 0 && (
                  <div className="widget-item recent-posts-widget">
                    <div className="widget-title">
                      <h3 className="mb-0">Recent Posts</h3>
                    </div>
                      {statsData.recent_posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="post-item">
                          {post.featured_image_url ? (
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ): (
                          <div className="bg-light-dark d-flex align-items-center justify-content-center"
                            style={{height: '50px', width: '50px', marginRight: '1rem'}}>
                            <div className="d-flex flex-column justify-content-between align-items-center">
                              <i className="bi bi-image text-muted" style={{fontSize: '3rem'}}></i>
                            </div>
                          </div>
                          )}
                          <div className="flex-grow-1">
                            <h4>
                              <Link
                                to={`/blog/article/${post.slug}`}
                                className="text-decoration-none fw-medium"
                              >
                                {post.title}
                              </Link>
                            </h4>
                            <time dateTime={formatDate(post.first_published_at)} className="small text-muted">
                              {formatDate(post.first_published_at)}
                            </time>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <SearchWidget
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  tags={popularTags}
                />

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <div className="widget-item tags-widget mb-4">
                    <div className="widget-title">
                      <h3 className="mb-0">Tags</h3>
                    </div>
                    <ul className="d-flex flex-wrap gap-2">
                      {popularTags.slice(0, 10).map((tag) => (
                        <li>
                          <button
                            key={tag.name}
                            className={`btn btn-sm ${filters.tag === tag.name ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleFiltersChange({ ...filters, tag: tag.name, page: 1 })}
                          >
                            {tag.name} ({tag.count})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
