import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPost, useCreateBlogComment, useDeleteBlogPost } from '@/hooks/queries/blogQueries';
import '@/styles/toast.css';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { usePageTitle } from '@/hooks/usePageTitle';

interface CommentFormData {
  author_name: string;
  author_email: string;
  content: string;
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { canCreateProjects: canEdit } = useStaffPermissions();
  
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    data: post,
    isLoading,
    error,
  } = useBlogPost(slug!);
  usePageTitle(`Blog - ${post?.title || 'Loading...'}`);

  const createCommentMutation = useCreateBlogComment();
  const deleteBlogPostMutation = useDeleteBlogPost();

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }, []);

  const handleDelete = async () => {
    if (!post) return;
    
    try {
      await deleteBlogPostMutation.mutateAsync(post.slug);
      navigate('/blog');
    } catch {
      // Error is handled by the mutation's error state
    }
  };

  if (!slug) {
    return (
      <AlertMessage
        type="danger"
        message="Invalid blog post URL. Please check the address and try again."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="container my-5">
        <AlertMessage
          type="danger"
          message="Blog post not found. It may have been moved or deleted."
        />
        <div className="text-center mt-4">
          <Link to="/blog" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        post_id: post.id,
        ...commentForm,
      });
      
      setCommentForm({ author_name: '', author_email: '', content: '' });
      setShowCommentForm(false);
    } catch {
      // Error is handled by the mutation's error state
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (!slug) {
    return (
      <AlertMessage
        type="danger"
        message="Invalid blog post URL. Please check the address and try again."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="container my-5">
        <AlertMessage
          type="danger"
          message="Blog post not found. It may have been moved or deleted."
        />
        <div className="text-center mt-4">
          <Link to="/blog" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className='blog'>
      {/* Toast Notification */}
      <div className="position-fixed top-0 end-50 p-3" style={{ zIndex: 1050 }}>
        <div className={`toast ${showToast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body d-flex bg-success justify-content-between">
            <span><i className="bi bi-check-circle-fill me-2"></i>Link copied to clipboard!</span>
            <button type="button" className="btn-close" onClick={() => setShowToast(false)}></button>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="entry entry-single col-lg-8">

            {/* Post Header */}
            <h2 className="entry-title">{post.title}</h2>
            <div className="entry-meta">
              <ul>
                <li>
                  <i className="bi bi-person"></i>
                  <Link to={`#`}>{post.author}</Link>
                </li>
                <li>
                  <i className="bi bi-calendar"></i>
                  <Link to={`/blog/date/${formatDate(post.first_published_at)}`}>{formatDate(post.first_published_at)}</Link>
                </li>
                <li>
                  <i className="bi bi-clock"></i>
                  <Link to={`#`} className='text-decoration-none'>{post?.reading_time}</Link>
                </li>
                <li>
                  <i className="bi bi-eye"></i>
                  <Link to={`#`} className='text-decoration-none'>
                    {post?.view_count ? post?.view_count === 1 ? `${post?.view_count} view` : `${post?.view_count} views` : 0}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-4">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="img-fluid entry-img rounded shadow-sm"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
              </div>
            )}
            <div className="d-flex justify-content-start align-items-center text-muted mb-3">

              {/* {post.comments_count && (
                <span>
                  <i className="bi bi-comments me-1"></i>
                  {post.comments_count ? `${post.comments_count > 0 ? post.comments_count : 0} comments` : 'No comments'}
                </span>
              )} */}


              {/* Edit/Delete Buttons */}
              {canEdit && (
                <div className="mb-2 entry-meta">
                  <div className="btn-group gap-3 gap-lg-5" role="group">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/blog/edit/${post.slug}`)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit Post
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete Post
                    </button>
                  </div>
                </div>
              )}
              </div>

            {/* Post Content */}
            <div 
              className="mb-3 entry-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
              
            />

              {/* Tags */}
            <div className="entry-footer d-flex">
              <i className="bi bi-tags"></i>
              {post.tags_list && post.tags_list.length > 0 && (
                <ul className="tags mx-0">
                  {post.tags_list.map((tag) => (
                    <li>
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-decoration-none me-0"
                    >
                      {tag}
                    </Link></li>
                  ))}
                </ul>
              )}
            </div>

            {/* Share Buttons */}
            <div className="border-top border-bottom py-4 mb-5">
              <h6 className="mb-3">Share this post</h6>
              <div className="d-flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-twitter-x me-1"></i>
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-facebook me-1"></i>
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-linkedin me-1"></i>
                  LinkedIn
                </a>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCopyLink}
                >
                  <i className="bi bi-link me-1"></i>
                  Copy Link
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <div className="d-flex justify-content-around align-items-center mb-2 mb-lg-3">
                <h4>Comments ({post.comments_count || 0})</h4>
                {!showCommentForm && (
                  <button
                    className="btn btn-primary"
                    disabled={true} /* {createCommentMutation.isPending} */
                    onClick={() => setShowCommentForm(true)}
                  >
                    Add Comment 
                    <i className="bi bi-pencil mx-1"></i>
                  </button>
                )}
              </div>
            </div>

              {/* Comment Form */}
              {showCommentForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Leave a Comment</h6>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleCommentSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="author_name" className="form-label">
                            Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="author_name"
                            value={commentForm.author_name}
                            onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="author_email" className="form-label">
                            Email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="author_email"
                            value={commentForm.author_email}
                            onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">
                          Comment *
                        </label>
                        <textarea
                          className="form-control"
                          id="content"
                          rows={4}
                          value={commentForm.content}
                          onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                          required
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={createCommentMutation.isPending}
                        >
                          {createCommentMutation.isPending ? (
                            <>
                              <span className="spinner-grow spinner-grow-sm me-1" />
                              Posting...
                            </>
                          ) : (
                            'Post Comment'
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowCommentForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                    
                    {createCommentMutation.isError && (
                      <AlertMessage
                        type="danger"
                        message="Failed to post comment. Please try again."
                        className="mt-3"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">{comment.author_name}</h6>
                            <small className="text-muted">
                              {formatDate(comment.created_at)}
                            </small>
                          </div>
                        </div>
                        <p className="mb-0">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-comments fa-2x mb-2"></i>
                  <p>No comments yet. Commenting Coming Soon!</p>
                </div>
              )}
            </div>
          </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this blog post?</p>
                  <p className="text-muted">
                    <strong>"{post?.title}"</strong>
                  </p>
                  <p className="text-danger">
                    <small>This action cannot be undone.</small>
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteBlogPostMutation.isPending}
                  >
                    {deleteBlogPostMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="me-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Post'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && <div className="modal-backdrop show"></div>}
      </div>
    </section>
  );
}
