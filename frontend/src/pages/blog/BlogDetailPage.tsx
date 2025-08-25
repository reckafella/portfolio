import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPost, useCreateBlogComment, useDeleteBlogPost } from '../../hooks/queries/blogQueries';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';

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

  const {
    data: post,
    isLoading,
    error,
  } = useBlogPost(slug!);

  const createCommentMutation = useCreateBlogComment();
  const deleteBlogPostMutation = useDeleteBlogPost();

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Navigation */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/blog">Blog</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Post Header */}
          <div className="mb-4">
            <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
            
            <div className="d-flex align-items-center text-muted mb-3">
              <span className="me-3">
                <i className="bi bi-calendar me-1"></i>
                {formatDate(post.date)}
              </span>
              <span className="me-3">
                <i className="bi bi-clock me-1"></i>
                {formatReadingTime(post.reading_time)}
              </span>
              <span className="me-3">
                <i className="bi bi-eye me-1"></i>
                {post.view_count} views
              </span>
              <span>
                <i className="bi bi-comments me-1"></i>
                {post.comment_count} comments
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-3">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="badge bg-secondary text-decoration-none me-2"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Edit/Delete Buttons */}
            {canEdit && (
              <div className="mb-3">
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/blog/edit/${post.slug}`)}
                  >
                    <i className="bi bi-edit me-1"></i>
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

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-4">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="img-fluid rounded shadow-sm"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Post Content */}
          <div 
            className="mb-5"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{ lineHeight: '1.8' }}
          />

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
                <i className="fab fa-twitter me-1"></i>
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fab fa-facebook me-1"></i>
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <i className="fab fa-linkedin me-1"></i>
                LinkedIn
              </a>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <i className="bi bi-link me-1"></i>
                Copy Link
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>Comments ({post.comment_count})</h4>
              {!showCommentForm && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCommentForm(true)}
                >
                  <i className="bi bi-comment me-1"></i>
                  Add Comment
                </button>
              )}
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
                            <span className="spinner-border spinner-border-sm me-1" />
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
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
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
  );
}
