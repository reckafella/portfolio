import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogPost, useUpdateBlogPost, useCreateBlogPost } from '@/hooks/queries/blogQueries';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { PreviewModal } from './PreviewModal';

import {
    ForbiddenPage,
    ServerErrorPage
} from '@/pages/errors'

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
  const {canCreateBlog, canEditBlog } = useStaffPermissions();
  const isEditing = !!slug;

  const { data: post, isLoading: isLoadingPost, error: postError } = useBlogPost(slug || '');
  const updateBlogPostMutation = useUpdateBlogPost();
  const createBlogPostMutation = useCreateBlogPost();

  usePageTitle(isEditing ? `Edit: ${post?.title || 'Blog Post'}` : `${post?.title || 'New Blog Post'}`);

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    tags: '',
    published: false
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [autoSave, setAutoSave] = useState<AutoSaveState>({
    isAutoSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>('');

  // Helper function to check if form data meets auto-save criteria
  const shouldAutoSave = (data: BlogPostFormData): boolean => {
    return (
      data.content.length > 25 &&
      data.title.length > 3 &&
      data.tags.trim().length > 0
    );
  };

  // Helper function to create FormData for submission
  const createFormDataForSubmission = (data: BlogPostFormData): FormData => {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', data.title);
    formDataToSubmit.append('content', data.content);
    formDataToSubmit.append('tags', data.tags);
    formDataToSubmit.append('published', data.published.toString());

    if (data.cover_image) {
      formDataToSubmit.append('cover_image', data.cover_image);
    }

    return formDataToSubmit;
  };

  // Auto-save function
  const performAutoSave = useCallback(async (data: BlogPostFormData) => {
    if (!shouldAutoSave(data)) {
      return;
    }

    setAutoSave(prev => ({ ...prev, isAutoSaving: true }));

    try {
      const formDataToSubmit = createFormDataForSubmission(data);

      if (isEditing && slug) {
        await updateBlogPostMutation.mutateAsync({
          slug: slug,
          data: formDataToSubmit
        });
      } else {
        // For new posts, auto-save creates a draft
        await createBlogPostMutation.mutateAsync(formDataToSubmit);
      }

      lastSavedContentRef.current = data.content;
      setAutoSave({
        isAutoSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      });
    } catch (error) {
      setAutoSave(prev => ({ ...prev, isAutoSaving: false }));
      setErrors({ general: [`Auto-save failed. Please try again. ${error}`] });
    }
  }, [isEditing, slug, updateBlogPostMutation, createBlogPostMutation]);

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

    // Check if content has changed and meets auto-save criteria
    if (formData.content && formData.content !== lastSavedContentRef.current) {
      setAutoSave(prev => ({ ...prev, hasUnsavedChanges: true }));

      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave(formData);
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, performAutoSave]);

  // Redirect if user doesn't have permission
  if (!canCreateBlog && !isEditing) {
    return <ForbiddenPage />;
  }

  if (!canEditBlog && isEditing) {
    return <ForbiddenPage />;
  }

  if (isLoadingPost && isEditing) {
    return <LoadingSpinner />;
  }

  if (postError && isEditing) {
    return (
      <ServerErrorPage />
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

    // Clear error for content field
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: [] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, cover_image: undefined }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSubmit = createFormDataForSubmission(formData);

      let result;
      if (isEditing) {
        result = await updateBlogPostMutation.mutateAsync({
          slug: slug!,
          data: formDataToSubmit
        });
      } else {
        result = await createBlogPostMutation.mutateAsync(formDataToSubmit);
      }

      // Navigate to the post
      const postSlug = result?.post?.slug;
      if (formData.published && postSlug) {
        navigate(`/blog/article/${postSlug}`);
      } else {
        navigate('/blog');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Blog post creation error:', error);

      if (error && typeof error === 'object') {
        const errorObj = error as {
          status?: number;
          data?: Record<string, string[]>;
          response?: {
            data?: {
              error?: string;
              non_field_errors?: string[];
            };
          };
          message?: string;
        };

        // Check for validation errors (400 status with field-specific errors)
        if (errorObj.status === 400 && errorObj.data && typeof errorObj.data === 'object') {
          // Handle validation errors from the backend
          const validationErrors: Record<string, string[]> = {};
          Object.keys(errorObj.data).forEach(key => {
            const value = errorObj?.data?.[key];
            if (Array.isArray(value)) {
              validationErrors[key] = value;
            } else if (typeof value === 'string') {
              validationErrors[key] = [value];
            }
          });
          setErrors(validationErrors);
        }
        // Check for duplicate title error or other API response errors
        else if (errorObj.response?.data) {
          if (errorObj.response.data.error) {
            // Check if it's a duplicate title error
            if (errorObj.response.data.error.includes('title') || errorObj.response.data.error.includes('slug')) {
              setErrors({ title: ['A blog post with this title already exists. Please choose a different title.'] });
            } else {
              setErrors({ general: [errorObj.response.data.error] });
            }
          } else if (errorObj.response.data.non_field_errors) {
            setErrors({ general: errorObj.response.data.non_field_errors });
          } else {
            setErrors({ general: ['Failed to create blog post. Please try again.'] });
          }
        }
        // Check for network or other errors
        else if (errorObj.message) {
          setErrors({ general: [errorObj.message] });
        }
        else {
          setErrors({ general: ['Failed to create blog post. Please try again.'] });
        }
      } else {
        setErrors({ general: ['Failed to create blog post. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <section className="section blog blog-editor-page">
      <div className="container-fluid my-1 mx-auto px-auto px-lg-1">
        {/* Header */}
        <div className="editor-header border-bottom border-lg">
          <div className="container-fluid py-3">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded"
                    onClick={() => navigate('/blog')}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Blog
                  </button>
                  <div>
                    <h1 className="h4 mb-0">
                      {isEditing ? `Edit: ${post?.title || 'Blog Post'}` : 'New Blog Post'}
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
                      {!shouldAutoSave(formData) && formData.content && (
                        <span className="text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          Auto-save requires: title (4+ chars), content (26+ chars), and tags
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
                    className="btn btn-secondary btn-sm rounded"
                    onClick={() => setShowPreview(true)}
                    disabled={!shouldAutoSave(formData)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    Preview
                  </button>
                  <button
                    type="submit"
                    form="blog-form"
                    className="btn btn-success btn-sm rounded"
                    disabled={isSubmitting || !shouldAutoSave(formData)}
                  >
                    {isSubmitting ? (
                      <div className='d-flex justify-content-around align-items-center'>
                        <LoadingSpinner size="sm" className="me-1" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className='d-flex justify-content-around align-items-center'>
                        <i className="bi bi-check-circle me-1"></i>
                        {isEditing ? 'Update Post' : 'Create Post'}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-fluid py-3 py-lg-4">
          <div className="row editor-main">
            {/* Editor Column */}
            <div className="col-lg-8">
              <div className="">
                {errors.general && errors.general.map((msg, idx) => (
                <AlertMessage
                    key={idx}
                    type="danger"
                    message={msg}
                    className="mb-4"
                  />
                ))}

                <form id="blog-form" onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Title<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-0 shadow-none ${errors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your blog post title..."
                      style={{ fontSize: '2rem', fontWeight: '600' }}
                    />
                    {errors.title && (
                      <div className="invalid-feedback">
                        {errors.title.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Content Editor */}
                  <div className="mb-4">
                    <label htmlFor="content" className="form-label fw-semibold">
                      Content<span className="text-danger ms-1">*</span>
                    </label>
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
            <div className="row col-lg-4 justify-content-center align-items-start">
              <div className="editor-sidebar">
                <div className="card-card">
                  <div className="card-body">
                    {/* Tags */}
                    <div className="mb-3">
                      <label htmlFor="tags" className="fw-bold form-label">
                        Tags <span className="text-danger">*</span>
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
                    {isEditing && post?.featured_image_url && !imagePreview && (
                      <div className="mb-3">
                        <label className="fw-bold form-label">Current Cover Image</label>
                        <div className="row align-items-center gap-3">
                          <img
                            src={post.featured_image_url}
                            alt="Current cover"
                            className="rounded"
                            style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
                          />
                          <small className="text-muted">
                            Upload a new image below to replace this one.
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Cover Image */}
                    <div className="mb-3">
                      <label htmlFor="cover_image" className="fw-bold form-label">
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
                      <small className="text-muted">
                        {isEditing && post?.featured_image_url ? 'Upload a new image below to replace this one.' : 'Upload a cover image for your blog post (optional).'}
                      </small>
                    </div>

                    {/* New Image Preview */}
                    {imagePreview && (
                      <div className="mb-3">
                        <label className="form-label">New Cover Preview</label>
                        <div className="position-relative">
                          <img
                            src={imagePreview}
                            alt="New cover preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, cover_image: undefined }));
                              const fileInput = document.getElementById('cover_image') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      </div>
                    )}

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
                          Publish this article
                        </label>
                      </div>
                      <div className="form-text">
                        {formData.published
                          ? 'This article will be visible to all visitors.'
                          : 'This article will be saved as a draft.'
                        }
                      </div>
                    </div>

                    {/* Article Stats */}
                    {formData.content && (
                      <div className="border-top pt-3">
                        <h6 className="text-muted mb-2">Article Statistics</h6>
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
      </div>
    </section>

    {/* Preview Modal */}
    <PreviewModal
      isOpen={showPreview}
      onClose={() => setShowPreview(false)}
      title={formData.title}
      content={formData.content}
    />
    </>
  );
}
