import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogPost, useUpdateBlogPost, useCreateBlogPost } from '@/hooks/queries/blogQueries';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface BlogPostFormData {
  title: string;
  content: string;
  tags: string;
  published: boolean;
  cover_image?: File;
}

interface AutoSaveState {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function BlogEditorPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { canEditProjects: canEditBlog } = useStaffPermissions();
  const isEditing = !!slug;
  
  const { data: post, isLoading: isLoadingPost, error: postError } = useBlogPost(slug || '');
  const updateBlogPostMutation = useUpdateBlogPost();
  const createBlogPostMutation = useCreateBlogPost();
  
  usePageTitle(isEditing ? `Edit: ${post?.title || 'Blog Post'}` : 'Create New Blog Post');
  
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    tags: '',
    published: false
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [autoSave, setAutoSave] = useState<AutoSaveState>({
    isAutoSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });
  const [showPreview, setShowPreview] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');

  // Populate form with existing post data
  useEffect(() => {
    if (post && !initialDataLoaded && isEditing) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        tags: post.tags_list?.join(', ') || '',
        published: post.published || false
      });
      lastSavedContentRef.current = post.content || '';
      setInitialDataLoaded(true);
    }
  }, [post, initialDataLoaded, isEditing]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (formData.content && formData.content !== lastSavedContentRef.current) {
      setAutoSave(prev => ({ ...prev, hasUnsavedChanges: true }));
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (isEditing && formData.title && formData.content) {
          setAutoSave(prev => ({ ...prev, isAutoSaving: true }));
          
          try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('title', formData.title);
            formDataToSubmit.append('content', formData.content);
            formDataToSubmit.append('tags', formData.tags);
            formDataToSubmit.append('published', 'false'); // Auto-save as draft

            await updateBlogPostMutation.mutateAsync({
              slug: slug!,
              data: formDataToSubmit
            });
            
            lastSavedContentRef.current = formData.content;
            setAutoSave({
              isAutoSaving: false,
              lastSaved: new Date(),
              hasUnsavedChanges: false
            });
          } catch (error) {
            setAutoSave(prev => ({ ...prev, isAutoSaving: false }));
            // eslint-disable-next-line no-console
            console.warn('Auto-save failed:', error);
            // Don't show user-facing errors for auto-save failures
          }
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData.content, formData.title, formData.tags, isEditing, slug, updateBlogPostMutation]);

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

  if (isLoadingPost && isEditing) {
    return <LoadingSpinner />;
  }

  if (postError && isEditing) {
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

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
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

      let result;
      if (isEditing) {
        result = await updateBlogPostMutation.mutateAsync({
          slug: slug!,
          data: formDataToSubmit
        });
      } else {
        result = await createBlogPostMutation.mutateAsync(formDataToSubmit);
      }
      
      // Navigate to the post only if we have a valid result with post data
      if (result?.post?.slug) {
        navigate(`/blog/article/${result.post.slug}`);
      } else if (result?.slug) {
        // Fallback in case the API response structure is different
        navigate(`/blog/article/${result.slug}`);
      } else {
        // If no slug is available, show success message but don't redirect
        setErrors({ general: [`${isEditing ? 'Updated' : 'Created'} successfully, but unable to navigate to post.`] });
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Blog post submission error:', error);
      
      // Handle different types of errors
      if (error && typeof error === 'object') {
        const errorObj = error as {
          status?: number;
          data?: Record<string, string[]>;
          response?: {
            data?: {
              error?: string;
            };
          };
          message?: string;
        };
        
        // Check for validation errors (400 status with field-specific errors)
        if (errorObj.status === 400 && errorObj.data && typeof errorObj.data === 'object') {
          setErrors(errorObj.data);
        }
        // Check for API response errors
        else if (errorObj.response && errorObj.response.data) {
          if (typeof errorObj.response.data === 'object' && errorObj.response.data.error) {
            setErrors({ general: [errorObj.response.data.error] });
          } else {
            setErrors({ general: [`Failed to ${isEditing ? 'update' : 'create'} blog post. Please try again.`] });
          }
        }
        // Check for network or other errors
        else if (errorObj.message) {
          setErrors({ general: [errorObj.message] });
        }
        else {
          setErrors({ general: [`Failed to ${isEditing ? 'update' : 'create'} blog post. Please try again.`] });
        }
      } else {
        setErrors({ general: [`Failed to ${isEditing ? 'update' : 'create'} blog post. Please try again.`] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const PreviewModal = ({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: string }) => {
    if (!isOpen) return null;

    return (
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-backdrop fade show" onClick={onClose}></div>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Preview: {title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="preview-content">
                <h1 className="mb-4">{title}</h1>
                <div className="content" dangerouslySetInnerHTML={{ __html: content }}></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="blog-editor-page">
      {/* Header */}
      <div className="editor-header border-bottom sticky-top">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/blog')}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Blog
                </button>
                <div>
                  <h1 className="h4 mb-0">
                    {isEditing ? `Edit: ${post?.title || 'Blog Post'}` : 'Create New Blog Post'}
                  </h1>
                  <div className="d-flex align-items-center gap-3 text-muted small">
                    {autoSave.isAutoSaving && (
                      <span className="text-warning">
                        <i className="bi bi-clock me-1"></i>
                        Auto-saving...
                      </span>
                    )}
                    {autoSave.lastSaved && !autoSave.hasUnsavedChanges && (
                      <span className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Saved {autoSave.lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                    {autoSave.hasUnsavedChanges && (
                      <span className="text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Unsaved changes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.title || !formData.content}
                >
                  <i className="bi bi-eye me-1"></i>
                  Preview
                </button>
                <button
                  type="submit"
                  form="blog-form"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting || !formData.title || !formData.content}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="me-1" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Editor Column */}
          <div className="col-lg-8">
            <div className="editor-main">
              {errors.general && (
                <AlertMessage 
                  type="danger" 
                  message={errors.general.join(', ')} 
                  className="mb-4"
                />
              )}

              <form id="blog-form" onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <input
                    type="text"
                    className={`form-control form-control-lg border-0 shadow-none ${errors.title ? 'is-invalid' : ''}`}
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your blog post title..."
                    style={{ fontSize: '2rem', fontWeight: '600' }}
                    required
                  />
                  {errors.title && (
                    <div className="invalid-feedback">
                      {errors.title.join(', ')}
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                <div className="mb-4">
                  <RichTextEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog post content..."
                    error={!!errors.content}
                  />
                  {errors.content && (
                    <div className="text-danger small mt-2">
                      {errors.content.join(', ')}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="editor-sidebar">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Post Settings</h5>
                </div>
                <div className="card-body">
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
                  {isEditing && post?.featured_image_url && (
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

                  <div className="mb-3">
                    <label htmlFor="cover_image" className="form-label">
                      {isEditing && post?.featured_image_url ? 'New Cover Image' : 'Cover Image'}
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

                  {/* Published Status */}
                  <div className="mb-3">
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
                        Publish this post
                      </label>
                    </div>
                    <div className="form-text">
                      {formData.published 
                        ? 'This post will be visible to all visitors.' 
                        : 'This post will be saved as a draft.'
                      }
                    </div>
                  </div>

                  {/* Post Stats */}
                  {formData.content && (
                    <div className="border-top pt-3">
                      <h6 className="text-muted mb-2">Post Statistics</h6>
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="fw-bold">{formData.content.length}</div>
                          <small className="text-muted">Characters</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold">{formData.content.split(' ').length}</div>
                          <small className="text-muted">Words</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold">{Math.ceil(formData.content.split(' ').length / 200)}</div>
                          <small className="text-muted">Min Read</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title}
        content={formData.content}
      />
    </div>
  );
}
