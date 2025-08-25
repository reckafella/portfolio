import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogPost, useUpdateBlogPost } from '../../hooks/queries/blogQueries';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';

interface BlogPostFormData {
  title: string;
  content: string;
  tags: string;
  published: boolean;
  cover_image?: File;
}

export function BlogEditPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { canEditProjects: canEditBlog } = useStaffPermissions();
  
  const { data: post, isLoading: isLoadingPost, error: postError } = useBlogPost(slug!);
  const updateBlogPostMutation = useUpdateBlogPost();
  
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    tags: '',
    published: false
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Populate form with existing post data
  useEffect(() => {
    if (post && !initialDataLoaded) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        tags: post.tags_list?.join(', ') || '',
        published: post.published || false
      });
      setInitialDataLoaded(true);
    }
  }, [post, initialDataLoaded]);

  // Redirect if user doesn't have permission
  if (!canEditBlog) {
    return (
      <div className="container my-5">
        <AlertMessage 
          type="danger" 
          message="You don't have permission to edit blog posts." 
        />
      </div>
    );
  }

  if (isLoadingPost) {
    return <LoadingSpinner />;
  }

  if (postError || !post) {
    return (
      <div className="container my-5">
        <AlertMessage 
          type="danger" 
          message="Blog post not found or you don't have permission to edit it." 
        />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('tags', formData.tags);
      formDataToSubmit.append('published', formData.published.toString());
      
      if (formData.cover_image) {
        formDataToSubmit.append('cover_image', formData.cover_image);
      }

      const updatedPost = await updateBlogPostMutation.mutateAsync({
        slug: slug!,
        data: formDataToSubmit
      });
      
      // Navigate to the updated post
      navigate(`/blog/${updatedPost.slug}`);
    } catch (error: unknown) {
      const errorData = error as { status?: number; data?: Record<string, string[]> };
      if (errorData.status === 400 && errorData.data) {
        setErrors(errorData.data);
      } else {
        setErrors({ general: ['Failed to update blog post. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Edit Blog Post</h2>
              <small className="text-muted">
                Editing: {post.title}
              </small>
            </div>
            <div className="card-body">
              {errors.general && (
                <AlertMessage 
                  type="danger" 
                  message={errors.general.join(', ')} 
                  className="mb-4"
                />
              )}

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter blog post title"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">
                      {errors.title.join(', ')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">
                    Content <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    rows={12}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Write your blog post content here..."
                  />
                  {errors.content && (
                    <div className="invalid-feedback">
                      {errors.content.join(', ')}
                    </div>
                  )}
                  <div className="form-text">
                    You can use HTML formatting in your content.
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.tags ? 'is-invalid' : ''}`}
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="technology, programming, web development"
                  />
                  {errors.tags && (
                    <div className="invalid-feedback">
                      {errors.tags.join(', ')}
                    </div>
                  )}
                  <div className="form-text">
                    Separate tags with commas.
                  </div>
                </div>

                {/* Current Cover Image */}
                {post.featured_image_url && (
                  <div className="mb-3">
                    <label className="form-label">Current Cover Image</label>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={post.featured_image_url}
                        alt="Current cover"
                        className="rounded"
                        style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                      />
                      <small className="text-muted">
                        Upload a new image below to replace this one.
                      </small>
                    </div>
                  </div>
                )}

                {/* Cover Image */}
                <div className="mb-3">
                  <label htmlFor="cover_image" className="form-label">
                    {post.featured_image_url ? 'New Cover Image' : 'Cover Image'}
                  </label>
                  <input
                    type="file"
                    className={`form-control ${errors.cover_image ? 'is-invalid' : ''}`}
                    id="cover_image"
                    name="cover_image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {errors.cover_image && (
                    <div className="invalid-feedback">
                      {errors.cover_image.join(', ')}
                    </div>
                  )}
                  <div className="form-text">
                    Upload a new cover image to replace the current one (optional).
                  </div>
                </div>

                {/* Published */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="published"
                      name="published"
                      checked={formData.published}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="published">
                      Published
                    </label>
                  </div>
                  <div className="form-text">
                    Uncheck to save as draft.
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Post'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    disabled={isSubmitting}
                  >
                    View Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
