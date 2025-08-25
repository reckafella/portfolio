import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBlogPost } from '../../hooks/queries/blogQueries';
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

export function BlogAddPage() {
  const navigate = useNavigate();
  const { canCreateProjects: canCreateBlog } = useStaffPermissions();
  const createBlogPostMutation = useCreateBlogPost();
  
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    tags: '',
    published: false
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user doesn't have permission
  if (!canCreateBlog) {
    return (
      <div className="container my-5">
        <AlertMessage 
          type="danger" 
          message="You don't have permission to create blog posts." 
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

      const newPost = await createBlogPostMutation.mutateAsync(formDataToSubmit);
      
      // Navigate to the new post or blog list
      if (formData.published) {
        navigate(`/blog/${newPost.slug}`);
      } else {
        navigate('/blog');
      }
    } catch (error: unknown) {
      const errorData = error as { status?: number; data?: Record<string, string[]> };
      if (errorData.status === 400 && errorData.data) {
        setErrors(errorData.data);
      } else {
        setErrors({ general: ['Failed to create blog post. Please try again.'] });
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
              <h2 className="mb-0">Create New Blog Post</h2>
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

                {/* Cover Image */}
                <div className="mb-3">
                  <label htmlFor="cover_image" className="form-label">
                    Cover Image
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
                    Upload a cover image for your blog post (optional).
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
                      Publish immediately
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
                        {formData.published ? 'Publishing...' : 'Saving...'}
                      </>
                    ) : (
                      formData.published ? 'Publish Post' : 'Save as Draft'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/blog')}
                    disabled={isSubmitting}
                  >
                    Cancel
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
